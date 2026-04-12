from fastapi import FastAPI, APIRouter, HTTPException, Query, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
import paypalrestsdk
from paypalrestsdk import Payment as PayPalPayment

from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import random
import json

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="Lluvia Live API")
api_router = APIRouter(prefix="/api")

# WebRTC Signaling - Connection Manager

# PayPal Configuration
paypalrestsdk.configure({
    "mode": os.environ.get('PAYPAL_MODE', 'sandbox'),
    "client_id": os.environ.get('PAYPAL_CLIENT_ID'),
    "client_secret": os.environ.get('PAYPAL_SECRET')
})

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, Dict[str, WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket, room_id: str, user_id: str):
        await websocket.accept()
        if room_id not in self.active_connections:
            self.active_connections[room_id] = {}
        self.active_connections[room_id][user_id] = websocket
        logging.info(f"User {user_id} connected to room {room_id}")
    
    def disconnect(self, room_id: str, user_id: str):
        if room_id in self.active_connections:
            if user_id in self.active_connections[room_id]:
                del self.active_connections[room_id][user_id]
                logging.info(f"User {user_id} disconnected from room {room_id}")
            if not self.active_connections[room_id]:
                del self.active_connections[room_id]
    
    async def send_to_user(self, room_id: str, user_id: str, message: dict):
        if room_id in self.active_connections:
            if user_id in self.active_connections[room_id]:
                await self.active_connections[room_id][user_id].send_json(message)
    
    async def broadcast_to_room(self, room_id: str, message: dict, exclude_user: str = None):
        if room_id in self.active_connections:
            for user_id, connection in self.active_connections[room_id].items():
                if user_id != exclude_user:
                    try:
                        await connection.send_json(message)
                    except Exception as e:
                        logging.error(f"Error broadcasting to {user_id}: {e}")
    
    def get_room_users(self, room_id: str) -> List[str]:
        if room_id in self.active_connections:
            return list(self.active_connections[room_id].keys())
        return []

manager = ConnectionManager()

# ==================== MODELS ====================

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    avatar: str = "https://api.dicebear.com/7.x/avataaars/svg?seed=default"
    level: int = 1
    coins: int = 1000
    diamonds: int = 0
    vip_level: str = "normal"  # normal, vip, svip, aristocrat
    aristocrat_level: int = 0  # 0 = no aristocrat, 1-9 = aristocrat levels
    role: str = "user"  # user, moderator, supervisor, admin
    verified: bool = False
    ghost_mode: bool = False
    banned: bool = False
    ban_reason: str = ""
    clan_id: Optional[str] = None
    cp_partner_id: Optional[str] = None
    cp_level: int = 0
    total_spent: int = 0
    total_received: int = 0
    badges: List[str] = []
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class Room(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    owner_id: str
    topic: str = "Chat General"
    background: str = "https://images.unsplash.com/photo-1557683316-973673baf926"
    description: str = ""
    active_users: int = 0
    is_live: bool = False
    seats: List[Optional[Dict[str, Any]]] = Field(default_factory=lambda: [None] * 9)
    password: Optional[str] = None
    max_seats: int = 9
    total_members: int = 0
    is_active: bool = True
    total_gifts_value: int = 0
    baby_robot_threshold: int = 50000000
    baby_robot_prize: int = 15000000
    baby_robot_count: int = 0
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class Message(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    room_id: str
    user_id: str
    username: str
    user_avatar: str
    user_vip: str = "normal"
    message: str
    type: str = "text"  # text, gift, entrance, system
    gift_id: Optional[str] = None
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class Gift(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    emoji: str
    price: int
    animation: str = "bounce"
    rarity: str = "common"

class Clan(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    logo: str
    leader_id: str
    members: List[str] = []
    total_points: int = 0
    weekly_points: int = 0
    monthly_points: int = 0
    level: int = 1
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class Event(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    event_type: str  # daily, weekly, special
    start_date: str
    end_date: str
    rewards: List[Dict[str, Any]] = []
    is_active: bool = True

class Reel(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    username: str
    user_avatar: str
    video_url: str
    thumbnail_url: str
    caption: str = ""
    likes: int = 0
    comments: int = 0
    views: int = 0
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class Photo(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    username: str
    user_avatar: str
    photo_url: str
    caption: str = ""
    likes: int = 0
    comments: int = 0
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class Game(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    icon: str
    description: str
    min_bet: int
    max_bet: int
    is_active: bool = True

# ==================== ENDPOINTS ====================

# Health check
@api_router.get("/")
async def root():
    return {"message": "Lluvia Live API is running", "status": "ok"}

# ==================== USER ENDPOINTS ====================

@api_router.post("/users/login")
async def login_user(username: str = Query(...)):
    """Login or create user"""
    # Limpiar espacios del username
    username = username.strip()
    
    user = await db.users.find_one({"username": username}, {"_id": 0})
    
    if not user:
        # Solo el Dueño (Melvin) puede crear cuenta automáticamente
        # Otros usuarios deben ser creados por el admin
        if username.lower() == "melvin":
            # Crear cuenta del Dueño si no existe
            new_user = User(
                username="Melvin",
                level=99,
                coins=999999,
                diamonds=50000,
                vip_level="aristocrat",
                aristocrat_level=9,
                role="admin",
                verified=True,
                badges=["👑 Fundador", "⭐ Admin", "🏆 VIP", "💎 Aristocrat IX"]
            )
            await db.users.insert_one(new_user.model_dump())
            user = new_user.model_dump()
        else:
            raise HTTPException(status_code=403, detail="Usuario no autorizado. Esta es una aplicación privada.")
    
    # Verificar si el usuario está baneado
    if user.get("banned", False):
        raise HTTPException(status_code=403, detail=f"Usuario baneado. Razón: {user.get('ban_reason', 'No especificada')}")
    
    return user

@api_router.get("/users/{user_id}")
async def get_user(user_id: str):
    """Get user by ID"""
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@api_router.put("/users/{user_id}")
async def update_user(user_id: str, update_data: Dict[str, Any]):
    """Update user data"""
    result = await db.users.update_one(
        {"id": user_id},
        {"$set": update_data}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    return user

# ==================== ROOM ENDPOINTS ====================

@api_router.get("/rooms")
async def get_rooms():
    """Get all active rooms"""
    rooms = await db.rooms.find({"is_active": True}, {"_id": 0}).to_list(100)
    return rooms

@api_router.get("/rooms/{room_id}")
async def get_room(room_id: str):
    """Get room details"""
    room = await db.rooms.find_one({"id": room_id}, {"_id": 0})
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    return room

@api_router.post("/rooms")
async def create_room(room_data: Dict[str, Any]):
    """Create a new room"""
    room = Room(**room_data)
    await db.rooms.insert_one(room.model_dump())
    return room.model_dump()

@api_router.post("/rooms/{room_id}/join")
async def join_room(room_id: str, user_id: str = Query(...), seat_index: Optional[int] = None):
    """Join a room and optionally take a seat"""
    room = await db.rooms.find_one({"id": room_id}, {"_id": 0})
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    
    # Update total members
    await db.rooms.update_one(
        {"id": room_id},
        {"$inc": {"total_members": 1, "active_users": 1}}
    )
    
    # If seat_index provided, try to take seat
    if seat_index is not None:
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if user:
            seats = room.get("seats", [None] * 9)
            
            # ARREGLO: Primero remover usuario de TODOS los asientos
            for i in range(len(seats)):
                if seats[i] and seats[i].get("user_id") == user_id:
                    if i == seat_index:
                        # Ya está en este asiento
                        updated_room = await db.rooms.find_one({"id": room_id}, {"_id": 0})
                        return updated_room
                    # Remover del asiento anterior
                    seats[i] = None
            
            # Verificar que el asiento esté libre
            if seat_index < len(seats) and seats[seat_index] is None:
                seats[seat_index] = {
                    "user_id": user_id,
                    "username": user["username"],
                    "avatar": user["avatar"],
                    "level": user["level"],
                    "is_muted": False
                }
                await db.rooms.update_one(
                    {"id": room_id},
                    {"$set": {"seats": seats}}
                )
    
    updated_room = await db.rooms.find_one({"id": room_id}, {"_id": 0})
    return updated_room

@api_router.post("/rooms/{room_id}/leave")
async def leave_room(room_id: str, user_id: str = Query(...)):
    """Leave a room"""
    room = await db.rooms.find_one({"id": room_id}, {"_id": 0})
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    
    # Remove from seat if sitting
    seats = room.get("seats", [None] * 9)
    for i, seat in enumerate(seats):
        if seat and seat.get("user_id") == user_id:
            seats[i] = None
    
    await db.rooms.update_one(
        {"id": room_id},
        {
            "$set": {"seats": seats},
            "$inc": {"active_users": -1}
        }
    )
    
    updated_room = await db.rooms.find_one({"id": room_id}, {"_id": 0})
    return updated_room

# ==================== MESSAGE ENDPOINTS ====================

@api_router.get("/rooms/{room_id}/messages")
async def get_messages(room_id: str, limit: int = 50):
    """Get recent messages from a room"""
    messages = await db.messages.find(
        {"room_id": room_id},
        {"_id": 0}
    ).sort("timestamp", -1).limit(limit).to_list(limit)
    
    return list(reversed(messages))

@api_router.post("/rooms/{room_id}/messages")
async def send_message(room_id: str, message_data: Dict[str, Any]):
    """Send a message to a room"""
    message = Message(room_id=room_id, **message_data)
    await db.messages.insert_one(message.model_dump())
    return message.model_dump()

# ==================== GIFT ENDPOINTS ====================

@api_router.get("/gifts")
async def get_gifts():
    """Get all available gifts"""
    gifts = await db.gifts.find({}, {"_id": 0}).to_list(100)
    return gifts

@api_router.post("/gifts/send")
async def send_gift(gift_data: Dict[str, Any]):
    """Send a gift in a room"""
    sender_id = gift_data.get("sender_id")
    receiver_id = gift_data.get("receiver_id")
    gift_id = gift_data.get("gift_id")
    room_id = gift_data.get("room_id")
    
    # Get gift details
    gift = await db.gifts.find_one({"id": gift_id}, {"_id": 0})
    if not gift:
        raise HTTPException(status_code=404, detail="Gift not found")
    
    # Deduct coins from sender
    sender = await db.users.find_one({"id": sender_id}, {"_id": 0})
    if not sender or sender["coins"] < gift["price"]:
        raise HTTPException(status_code=400, detail="Insufficient coins")
    
    await db.users.update_one(
        {"id": sender_id},
        {"$inc": {"coins": -gift["price"], "total_spent": gift["price"]}}
    )
    
    # Add coins to receiver (80% of gift value)
    receiver_amount = int(gift["price"] * 0.8)
    await db.users.update_one(
        {"id": receiver_id},
        {"$inc": {"coins": receiver_amount, "total_received": receiver_amount}}
    )
    
    # Update room gift value
    await db.rooms.update_one(
        {"id": room_id},
        {"$inc": {"total_gifts_value": gift["price"]}}
    )
    
    # Create gift message
    message = Message(
        room_id=room_id,
        user_id=sender_id,
        username=sender["username"],
        user_avatar=sender["avatar"],
        user_vip=sender.get("vip_level", "normal"),
        message=f"sent {gift['emoji']} {gift['name']}",
        type="gift",
        gift_id=gift_id
    )
    await db.messages.insert_one(message.model_dump())
    
    return {"success": True, "message": message.model_dump()}

# ==================== CLAN ENDPOINTS ====================

@api_router.get("/clans")
async def get_clans():
    """Get all clans"""
    clans = await db.clans.find({}, {"_id": 0}).to_list(100)
    return clans

@api_router.get("/clans/{clan_id}")
async def get_clan(clan_id: str):
    """Get clan details"""
    clan = await db.clans.find_one({"id": clan_id}, {"_id": 0})
    if not clan:
        raise HTTPException(status_code=404, detail="Clan not found")
    return clan

@api_router.post("/clans")
async def create_clan(clan_data: Dict[str, Any]):
    """Create a new clan"""
    clan = Clan(**clan_data)
    await db.clans.insert_one(clan.model_dump())
    return clan.model_dump()

@api_router.post("/clans/{clan_id}/join")
async def join_clan(clan_id: str, user_id: str = Query(...)):
    """Join a clan"""
    await db.clans.update_one(
        {"id": clan_id},
        {"$addToSet": {"members": user_id}}
    )
    
    await db.users.update_one(
        {"id": user_id},
        {"$set": {"clan_id": clan_id}}
    )
    
    clan = await db.clans.find_one({"id": clan_id}, {"_id": 0})
    return clan

# ==================== EVENT ENDPOINTS ====================

@api_router.get("/events")
async def get_events():
    """Get all active events"""
    events = await db.events.find({"is_active": True}, {"_id": 0}).to_list(100)
    return events

# ==================== REEL ENDPOINTS ====================

@api_router.get("/reels")
async def get_reels():
    """Get all reels"""
    reels = await db.reels.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return reels

@api_router.post("/reels")
async def create_reel(reel_data: Dict[str, Any]):
    """Create a new reel"""
    reel = Reel(**reel_data)
    await db.reels.insert_one(reel.model_dump())
    return reel.model_dump()

@api_router.post("/reels/{reel_id}/like")
async def like_reel(reel_id: str):
    """Like a reel"""
    await db.reels.update_one(
        {"id": reel_id},
        {"$inc": {"likes": 1}}
    )
    reel = await db.reels.find_one({"id": reel_id}, {"_id": 0})
    return reel

# ==================== PHOTO ENDPOINTS ====================

@api_router.get("/photos")
async def get_photos():
    """Get all photos"""
    photos = await db.photos.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return photos

@api_router.post("/photos")
async def create_photo(photo_data: Dict[str, Any]):
    """Upload a new photo"""
    photo = Photo(**photo_data)
    await db.photos.insert_one(photo.model_dump())
    return photo.model_dump()

@api_router.post("/photos/{photo_id}/like")
async def like_photo(photo_id: str):
    """Like a photo"""
    await db.photos.update_one(
        {"id": photo_id},
        {"$inc": {"likes": 1}}
    )
    photo = await db.photos.find_one({"id": photo_id}, {"_id": 0})
    return photo

# ==================== GAME ENDPOINTS ====================

@api_router.get("/games")
async def get_games():
    """Get all available games"""
    games = await db.games.find({"is_active": True}, {"_id": 0}).to_list(100)
    return games

# ==================== RANKING ENDPOINTS ====================

@api_router.get("/rankings/users")
async def get_user_rankings(limit: int = 50):
    """Get top users by level/coins"""
    users = await db.users.find(
        {},
        {"_id": 0}
    ).sort("level", -1).limit(limit).to_list(limit)
    return users

@api_router.get("/rankings/clans")
async def get_clan_rankings(period: str = "total"):
    """Get top clans by points"""
    sort_field = "total_points"
    if period == "weekly":
        sort_field = "weekly_points"
    elif period == "monthly":
        sort_field = "monthly_points"
    
    clans = await db.clans.find(
        {},
        {"_id": 0}
    ).sort(sort_field, -1).limit(50).to_list(50)
    return clans

# ==================== DEMO DATA ENDPOINT ====================

@api_router.post("/init/demo-data")
async def init_demo_data():
    # Create demo users
    demo_users = [
        {"id": "user-1", "username": "Sofia_Glamour", "avatar": "https://static.prod-images.emergentagent.com/jobs/bd5e66d4-900a-4301-b040-8f41267c6377/images/47d256b00df727800ea7e118657bf9e36e1154214e40a6bdf479cd5a63c7aa32.png", "coins": 50000, "vip_level": "aristocrat", "level": 25},
        {"id": "user-2", "username": "Luna_Star", "avatar": "https://static.prod-images.emergentagent.com/jobs/bd5e66d4-900a-4301-b040-8f41267c6377/images/93b309f787e7a09a4fabdce8cfe34a60834a8178eadf4f552aa5bbfd9433bec0.png", "coins": 30000, "vip_level": "svip", "level": 18},
        {"id": "user-3", "username": "Bella_Rose", "avatar": "https://static.prod-images.emergentagent.com/jobs/bd5e66d4-900a-4301-b040-8f41267c6377/images/9d2b609bac2d0901cc2752dbf62fb9b01b365ee0ec25eae1272b11d9ba53e863.png", "coins": 25000, "vip_level": "vip", "level": 15},
    ]
    
    for user_data in demo_users:
        existing = await db.users.find_one({"id": user_data["id"]})
        if not existing:
            user = User(**user_data)
            await db.users.insert_one(user.model_dump())
    
    # Create demo rooms with better data
    demo_rooms = [
        {
            "id": "room-1",
            "name": "The Glam Room✨",
            "topic": "Sala Glamurosa",
            "owner_id": "user-1",
            "background": "https://static.prod-images.emergentagent.com/jobs/bd5e66d4-900a-4301-b040-8f41267c6377/images/02707e35244e966c226ec2ba7a87d449728a15a8c7e63c58c85a8f330e304aec.png",
            "description": "Bienvenidos a The Glam Room✨ Comparte tu voz, disfruta y conecta con gente increíble",
            "active_users": 72,
            "is_live": True
        },
        {
            "id": "room-2",
            "name": "Pink Palace🎀👑",
            "topic": "Palacio Rosa",
            "owner_id": "user-2",
            "background": "https://static.prod-images.emergentagent.com/jobs/bd5e66d4-900a-4301-b040-8f41267c6377/images/02707e35244e966c226ec2ba7a87d449728a15a8c7e63c58c85a8f330e304aec.png",
            "description": "Entra al Pink Palace - brilla✨, habla😘, y todo lo bonito🎀 en vivo",
            "active_users": 97,
            "is_live": True
        },
        {
            "id": "room-3",
            "name": "Moon Lounge🛋️✨",
            "topic": "Lounge Lunar",
            "owner_id": "user-3",
            "background": "https://static.prod-images.emergentagent.com/jobs/bd5e66d4-900a-4301-b040-8f41267c6377/images/02707e35244e966c226ec2ba7a87d449728a15a8c7e63c58c85a8f330e304aec.png",
            "description": "Entra al Moon Lounge - el silencio es dorado aquí🌙",
            "active_users": 89,
            "is_live": True
        },
        {
            "id": "room-4",
            "name": "Fiesta Latina🎉💃",
            "topic": "Música Latina",
            "owner_id": "user-1",
            "background": "https://static.prod-images.emergentagent.com/jobs/bd5e66d4-900a-4301-b040-8f41267c6377/images/02707e35244e966c226ec2ba7a87d449728a15a8c7e63c58c85a8f330e304aec.png",
            "description": "¡Ritmo latino 24/7! Baila, canta y diviértete con nosotros🔥",
            "active_users": 124,
            "is_live": True
        },
    ]
    
    for room_data in demo_rooms:
        existing = await db.rooms.find_one({"id": room_data.get("id")})
        if not existing:
            room_full_data = {
                **room_data,
                "seats": [None] * 9,
                "total_members": room_data.get("active_users", 0),
                "max_seats": 9,
                "is_active": True,
                "total_gifts_value": 0,
                "baby_robot_threshold": 50000000,
                "baby_robot_prize": 15000000,
                "baby_robot_count": 0,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.rooms.insert_one(room_full_data)
    
    # Create demo reels
    demo_reels = [
        {
            "id": "reel-1",
            "user_id": "user-1",
            "username": "Sofia_Glamour",
            "user_avatar": "https://static.prod-images.emergentagent.com/jobs/bd5e66d4-900a-4301-b040-8f41267c6377/images/47d256b00df727800ea7e118657bf9e36e1154214e40a6bdf479cd5a63c7aa32.png",
            "video_url": "https://static.prod-images.emergentagent.com/jobs/bd5e66d4-900a-4301-b040-8f41267c6377/images/02707e35244e966c226ec2ba7a87d449728a15a8c7e63c58c85a8f330e304aec.png",
            "thumbnail_url": "https://static.prod-images.emergentagent.com/jobs/bd5e66d4-900a-4301-b040-8f41267c6377/images/47d256b00df727800ea7e118657bf9e36e1154214e40a6bdf479cd5a63c7aa32.png",
            "caption": "✨ Nuevo look! ¿Les gusta? 💕",
            "likes": 1234,
            "comments": 89,
            "views": 5678
        },
        {
            "id": "reel-2",
            "user_id": "user-2",
            "username": "Luna_Star",
            "user_avatar": "https://static.prod-images.emergentagent.com/jobs/bd5e66d4-900a-4301-b040-8f41267c6377/images/93b309f787e7a09a4fabdce8cfe34a60834a8178eadf4f552aa5bbfd9433bec0.png",
            "video_url": "https://static.prod-images.emergentagent.com/jobs/bd5e66d4-900a-4301-b040-8f41267c6377/images/02707e35244e966c226ec2ba7a87d449728a15a8c7e63c58c85a8f330e304aec.png",
            "thumbnail_url": "https://static.prod-images.emergentagent.com/jobs/bd5e66d4-900a-4301-b040-8f41267c6377/images/93b309f787e7a09a4fabdce8cfe34a60834a8178eadf4f552aa5bbfd9433bec0.png",
            "caption": "🌙 Noche mágica en el stream",
            "likes": 2341,
            "comments": 156,
            "views": 8901
        },
        {
            "id": "reel-3",
            "user_id": "user-3",
            "username": "Bella_Rose",
            "user_avatar": "https://static.prod-images.emergentagent.com/jobs/bd5e66d4-900a-4301-b040-8f41267c6377/images/9d2b609bac2d0901cc2752dbf62fb9b01b365ee0ec25eae1272b11d9ba53e863.png",
            "video_url": "https://static.prod-images.emergentagent.com/jobs/bd5e66d4-900a-4301-b040-8f41267c6377/images/02707e35244e966c226ec2ba7a87d449728a15a8c7e63c58c85a8f330e304aec.png",
            "thumbnail_url": "https://static.prod-images.emergentagent.com/jobs/bd5e66d4-900a-4301-b040-8f41267c6377/images/9d2b609bac2d0901cc2752dbf62fb9b01b365ee0ec25eae1272b11d9ba53e863.png",
            "caption": "🎀 Behind the scenes de mi sala",
            "likes": 987,
            "comments": 45,
            "views": 3456
        }
    ]
    
    for reel_data in demo_reels:
        existing = await db.reels.find_one({"id": reel_data["id"]})
        if not existing:
            reel = Reel(**reel_data)
            await db.reels.insert_one(reel.model_dump())
    
    # Create demo photos
    demo_photos = [
        {
            "id": "photo-1",
            "user_id": "user-1",
            "username": "Sofia_Glamour",
            "user_avatar": "https://static.prod-images.emergentagent.com/jobs/bd5e66d4-900a-4301-b040-8f41267c6377/images/47d256b00df727800ea7e118657bf9e36e1154214e40a6bdf479cd5a63c7aa32.png",
            "photo_url": "https://static.prod-images.emergentagent.com/jobs/bd5e66d4-900a-4301-b040-8f41267c6377/images/47d256b00df727800ea7e118657bf9e36e1154214e40a6bdf479cd5a63c7aa32.png",
            "caption": "Sesión de fotos glamurosa ✨👑",
            "likes": 2156,
            "comments": 234
        },
        {
            "id": "photo-2",
            "user_id": "user-2",
            "username": "Luna_Star",
            "user_avatar": "https://static.prod-images.emergentagent.com/jobs/bd5e66d4-900a-4301-b040-8f41267c6377/images/93b309f787e7a09a4fabdce8cfe34a60834a8178eadf4f552aa5bbfd9433bec0.png",
            "photo_url": "https://static.prod-images.emergentagent.com/jobs/bd5e66d4-900a-4301-b040-8f41267c6377/images/93b309f787e7a09a4fabdce8cfe34a60834a8178eadf4f552aa5bbfd9433bec0.png",
            "caption": "Outfit del día 💙✨",
            "likes": 1876,
            "comments": 178
        },
        {
            "id": "photo-3",
            "user_id": "user-3",
            "username": "Bella_Rose",
            "user_avatar": "https://static.prod-images.emergentagent.com/jobs/bd5e66d4-900a-4301-b040-8f41267c6377/images/9d2b609bac2d0901cc2752dbf62fb9b01b365ee0ec25eae1272b11d9ba53e863.png",
            "photo_url": "https://static.prod-images.emergentagent.com/jobs/bd5e66d4-900a-4301-b040-8f41267c6377/images/9d2b609bac2d0901cc2752dbf62fb9b01b365ee0ec25eae1272b11d9ba53e863.png",
            "caption": "Ready para el stream 🎀💕",
            "likes": 1543,
            "comments": 134
        },
        {
            "id": "photo-4",
            "user_id": "user-1",
            "username": "Sofia_Glamour",
            "user_avatar": "https://static.prod-images.emergentagent.com/jobs/bd5e66d4-900a-4301-b040-8f41267c6377/images/47d256b00df727800ea7e118657bf9e36e1154214e40a6bdf479cd5a63c7aa32.png",
            "photo_url": "https://static.prod-images.emergentagent.com/jobs/bd5e66d4-900a-4301-b040-8f41267c6377/images/02707e35244e966c226ec2ba7a87d449728a15a8c7e63c58c85a8f330e304aec.png",
            "caption": "Ambiente de mi sala VIP 🌟",
            "likes": 3421,
            "comments": 456
        },
        {
            "id": "photo-5",
            "user_id": "user-2",
            "username": "Luna_Star",
            "user_avatar": "https://static.prod-images.emergentagent.com/jobs/bd5e66d4-900a-4301-b040-8f41267c6377/images/93b309f787e7a09a4fabdce8cfe34a60834a8178eadf4f552aa5bbfd9433bec0.png",
            "photo_url": "https://static.prod-images.emergentagent.com/jobs/bd5e66d4-900a-4301-b040-8f41267c6377/images/93b309f787e7a09a4fabdce8cfe34a60834a8178eadf4f552aa5bbfd9433bec0.png",
            "caption": "Selfie time! 📸",
            "likes": 2987,
            "comments": 312
        },
        {
            "id": "photo-6",
            "user_id": "user-3",
            "username": "Bella_Rose",
            "user_avatar": "https://static.prod-images.emergentagent.com/jobs/bd5e66d4-900a-4301-b040-8f41267c6377/images/9d2b609bac2d0901cc2752dbf62fb9b01b365ee0ec25eae1272b11d9ba53e863.png",
            "photo_url": "https://static.prod-images.emergentagent.com/jobs/bd5e66d4-900a-4301-b040-8f41267c6377/images/9d2b609bac2d0901cc2752dbf62fb9b01b365ee0ec25eae1272b11d9ba53e863.png",
            "caption": "Glam mode ON 💄✨",
            "likes": 1654,
            "comments": 187
        }
    ]
    
    for photo_data in demo_photos:
        existing = await db.photos.find_one({"id": photo_data["id"]})
        if not existing:
            photo = Photo(**photo_data)
            await db.photos.insert_one(photo.model_dump())
    
    # Create demo gifts
    demo_gifts = [
        {"id": "gift-1", "name": "Rosa", "emoji": "🌹", "price": 10, "animation": "hearts", "rarity": "common"},
        {"id": "gift-2", "name": "Corazón", "emoji": "❤️", "price": 50, "animation": "hearts", "rarity": "rare"},
        {"id": "gift-3", "name": "Corona", "emoji": "👑", "price": 500, "animation": "fireworks", "rarity": "epic"},
        {"id": "gift-4", "name": "Diamante", "emoji": "💎", "price": 1000, "animation": "fireworks", "rarity": "legendary"},
    ]
    
    for gift_data in demo_gifts:
        existing = await db.gifts.find_one({"id": gift_data["id"]})
        if not existing:
            gift = Gift(**gift_data)
            await db.gifts.insert_one(gift.model_dump())
    
    # Create demo clan
    existing_clan = await db.clans.find_one({"name": "Lluvia Kings"})
    if not existing_clan:
        clan = Clan(
            name="Lluvia Kings",
            logo="👑",
            leader_id="user-1",
            members=["user-1", "user-2", "user-3"],
            total_points=15000,
            weekly_points=4500,
            monthly_points=9000
        )
        await db.clans.insert_one(clan.model_dump())
    
    # Create demo games
    demo_games = [
        {"id": "game-1", "name": "Ruleta", "icon": "🎰", "description": "Gira y gana", "min_bet": 10, "max_bet": 10000, "is_active": True},
        {"id": "game-2", "name": "Dados", "icon": "🎲", "description": "Suerte con los dados", "min_bet": 5, "max_bet": 5000, "is_active": True},
    ]
    
    for game_data in demo_games:
        existing = await db.games.find_one({"id": game_data["id"]})
        if not existing:
            game = Game(**game_data)
            await db.games.insert_one(game.model_dump())
    
    return {"success": True, "message": "Demo data initialized"}

# Include router
app.include_router(api_router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

# ==================== ADMIN ENDPOINTS ====================

@api_router.get("/admin/users")
async def get_all_users_admin(admin_id: str = Query(...)):
    """Get all users for admin panel"""
    admin = await db.users.find_one({"id": admin_id}, {"_id": 0})
    if not admin or admin.get("role") not in ["admin", "supervisor"]:
        raise HTTPException(status_code=403, detail="No tienes permisos de administrador")
    
    users = await db.users.find({}, {"_id": 0}).sort("created_at", -1).limit(100).to_list(100)
    return users

@api_router.post("/admin/users/{user_id}/badges")
async def add_badge_to_user(user_id: str, admin_id: str = Query(...), badge: str = Query(...)):
    """Add badge to user"""
    admin = await db.users.find_one({"id": admin_id}, {"_id": 0})
    if not admin or admin.get("role") not in ["admin", "supervisor"]:
        raise HTTPException(status_code=403, detail="No tienes permisos")
    
    await db.users.update_one(
        {"id": user_id},
        {"$addToSet": {"badges": badge}}
    )
    
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    return user

@api_router.delete("/admin/users/{user_id}/badges")
async def remove_badge_from_user(user_id: str, admin_id: str = Query(...), badge: str = Query(...)):
    """Remove badge from user"""
    admin = await db.users.find_one({"id": admin_id}, {"_id": 0})
    if not admin or admin.get("role") not in ["admin", "supervisor"]:
        raise HTTPException(status_code=403, detail="No tienes permisos")
    
    await db.users.update_one(
        {"id": user_id},
        {"$pull": {"badges": badge}}
    )
    
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    return user

@api_router.post("/admin/users/{user_id}/role")
async def update_user_role(user_id: str, admin_id: str = Query(...), new_role: str = Query(...)):
    """Update user role"""
    admin = await db.users.find_one({"id": admin_id}, {"_id": 0})
    if not admin or admin.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Solo administradores pueden cambiar roles")
    
    if new_role not in ["user", "moderator", "supervisor", "admin"]:
        raise HTTPException(status_code=400, detail="Rol inválido")
    
    await db.users.update_one(
        {"id": user_id},
        {"$set": {"role": new_role}}
    )
    
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    return user

@api_router.post("/admin/users/{user_id}/ban")
async def ban_user(user_id: str, admin_id: str = Query(...), reason: str = Query(...)):
    """Ban a user"""
    admin = await db.users.find_one({"id": admin_id}, {"_id": 0})
    if not admin or admin.get("role") not in ["admin", "supervisor", "moderator"]:
        raise HTTPException(status_code=403, detail="No tienes permisos")
    
    await db.users.update_one(
        {"id": user_id},
        {"$set": {"banned": True, "ban_reason": reason}}
    )
    
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    return user

@api_router.post("/admin/users/{user_id}/unban")
async def unban_user(user_id: str, admin_id: str = Query(...)):
    """Unban a user"""
    admin = await db.users.find_one({"id": admin_id}, {"_id": 0})
    if not admin or admin.get("role") not in ["admin", "supervisor"]:
        raise HTTPException(status_code=403, detail="No tienes permisos")
    
    await db.users.update_one(
        {"id": user_id},
        {"$set": {"banned": False, "ban_reason": ""}}
    )
    
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    return user

@api_router.post("/admin/users/{user_id}/coins")
async def modify_user_coins(user_id: str, admin_id: str = Query(...), amount: int = Query(...)):
    """Add or remove coins"""
    admin = await db.users.find_one({"id": admin_id}, {"_id": 0})
    if not admin or admin.get("role") not in ["admin", "supervisor"]:
        raise HTTPException(status_code=403, detail="No tienes permisos")
    
    await db.users.update_one(
        {"id": user_id},
        {"$inc": {"coins": amount}}
    )
    
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    return user

@api_router.get("/admin/stats")
async def get_admin_stats(admin_id: str = Query(...)):
    """Get statistics"""

# ==================== WEBRTC SIGNALING ENDPOINTS ====================

@app.websocket("/ws/room/{room_id}/{user_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str, user_id: str):
    """WebRTC signaling server for audio communication"""
    await manager.connect(websocket, room_id, user_id)
    
    try:
        # Notify other users that a new user joined
        await manager.broadcast_to_room(
            room_id,
            {
                "type": "user-joined",
                "userId": user_id,
                "timestamp": datetime.now(timezone.utc).isoformat()
            },
            exclude_user=user_id
        )
        
        # Send list of existing users to the new user
        existing_users = manager.get_room_users(room_id)
        await manager.send_to_user(
            room_id,
            user_id,
            {
                "type": "existing-users",
                "users": [u for u in existing_users if u != user_id]
            }
        )
        
        # Handle signaling messages
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            message_type = message.get("type")
            target_user = message.get("targetUser")
            
            if message_type == "offer":
                # Forward WebRTC offer to target user
                await manager.send_to_user(
                    room_id,
                    target_user,
                    {
                        "type": "offer",
                        "offer": message.get("offer"),
                        "fromUser": user_id
                    }
                )
            
            elif message_type == "answer":
                # Forward WebRTC answer to target user
                await manager.send_to_user(
                    room_id,
                    target_user,
                    {
                        "type": "answer",
                        "answer": message.get("answer"),
                        "fromUser": user_id
                    }
                )
            
            elif message_type == "ice-candidate":
                # Forward ICE candidate to target user
                await manager.send_to_user(
                    room_id,
                    target_user,
                    {
                        "type": "ice-candidate",
                        "candidate": message.get("candidate"),
                        "fromUser": user_id
                    }
                )
            
            elif message_type == "mute":
                # Broadcast mute status
                await manager.broadcast_to_room(
                    room_id,
                    {
                        "type": "user-muted",
                        "userId": user_id,
                        "muted": message.get("muted", True)
                    }
                )
    
    except WebSocketDisconnect:
        manager.disconnect(room_id, user_id)
        # Notify others that user left
        await manager.broadcast_to_room(
            room_id,
            {
                "type": "user-left",
                "userId": user_id
            }
        )
    except Exception as e:
        logging.error(f"WebSocket error for user {user_id} in room {room_id}: {e}")
        manager.disconnect(room_id, user_id)
