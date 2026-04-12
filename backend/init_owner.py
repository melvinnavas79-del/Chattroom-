"""
Script de inicialización para crear el usuario DUEÑO
Ejecutar una sola vez al desplegar la aplicación
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

async def init_owner():
    mongo_url = os.environ['MONGO_URL']
    db_name = os.environ['DB_NAME']
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    # Verificar si el Super Owner ya existe
    existing_owner = await db.users.find_one({"username": "Melvin_Live"}, {"_id": 0})
    
    if existing_owner:
        print("✅ Usuario Super Owner 'Melvin_Live' ya existe en la base de datos")
        print(f"📊 Datos: Level {existing_owner['level']}, Coins {existing_owner['coins']:,}, Aristocrat {existing_owner['aristocrat_level']}")
        print(f"🔒 Protected: {existing_owner.get('protected', False)}")
        return
    
    # Crear usuario Super Owner
    owner_data = {
        "id": "owner-melvin-live-supreme",
        "username": "Melvin_Live",
        "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=MelvinLive",
        "level": 99,
        "coins": 2000000000,  # 2 Mil Millones
        "diamonds": 100000000,  # 100 Millones
        "vip_level": "aristocrat",
        "aristocrat_level": 9,
        "role": "super_owner",  # Rol especial
        "protected": True,  # Protección total
        "verified": True,
        "ghost_mode": False,
        "banned": False,
        "ban_reason": "",
        "clan_id": None,
        "cp_partner_id": None,
        "cp_level": 0,
        "total_spent": 0,
        "total_received": 0,
        "badges": [
            "👑 Fundador",
            "⭐ Super Owner",
            "🏆 VIP",
            "💎 Aristocrat IX",
            "🔒 Protegido"
        ],
        "created_at": "2026-04-11T12:00:00.000000+00:00"
    }
    
    await db.users.insert_one(owner_data)
    print("🎉 ¡Usuario SUPER OWNER creado exitosamente!")
    print(f"👑 Username: Melvin_Live")
    print(f"⭐ Level: 99")
    print(f"💰 Coins: 2,000,000,000")
    print(f"💎 Diamonds: 100,000,000")
    print(f"💎 Aristocrat Level: IX")
    print(f"🔑 Role: super_owner")
    print(f"🔒 Protected: YES (Blindado)")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(init_owner())
