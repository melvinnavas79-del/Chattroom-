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
    
    # Verificar si el Dueño ya existe
    existing_owner = await db.users.find_one({"username": "Melvin"}, {"_id": 0})
    
    if existing_owner:
        print("✅ Usuario Dueño 'Melvin' ya existe en la base de datos")
        print(f"📊 Datos: Level {existing_owner['level']}, Coins {existing_owner['coins']}, Aristocrat {existing_owner['aristocrat_level']}")
        return
    
    # Crear usuario Dueño
    owner_data = {
        "id": "owner-melvin-supreme",
        "username": "Melvin",
        "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Melvin",
        "level": 99,
        "coins": 999999,
        "diamonds": 50000,
        "vip_level": "aristocrat",
        "aristocrat_level": 9,
        "role": "admin",
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
            "⭐ Admin",
            "🏆 VIP",
            "💎 Aristocrat IX"
        ],
        "created_at": "2026-04-11T12:00:00.000000+00:00"
    }
    
    await db.users.insert_one(owner_data)
    print("🎉 ¡Usuario DUEÑO creado exitosamente!")
    print(f"👑 Username: Melvin")
    print(f"⭐ Level: 99")
    print(f"💰 Coins: 999,999")
    print(f"💎 Aristocrat Level: IX")
    print(f"🔑 Role: admin (Dueño)")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(init_owner())
