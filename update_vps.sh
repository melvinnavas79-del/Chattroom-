#!/bin/bash
# Script para actualizar Lluvia Live en VPS manualmente
# Ejecuta este script en tu VPS después de copiar los archivos

echo "🚀 Actualizando Lluvia Live..."

# Detener servicios
echo "⏸️  Deteniendo servicios..."
pm2 stop all

# Backend
echo "📦 Actualizando backend..."
cd backend
pip3 install -r requirements.txt
python3 init_owner.py

# Frontend  
echo "🎨 Actualizando frontend..."
cd ../frontend
yarn install
yarn build

# Reiniciar todo
echo "🔄 Reiniciando servicios..."
cd ..
pm2 restart all

echo "✅ ¡Actualización completa!"
echo "🌐 Accede a: http://$(hostname -I | awk '{print $1}'):3000"
echo "👑 Usuario: Melvin"
pm2 logs
