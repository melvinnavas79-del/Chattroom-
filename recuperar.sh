#!/bin/bash
# 🔐 SCRIPT DE RECUPERACIÓN RÁPIDA - LLUVIA LIVE
# =============================================

echo "🚀 Iniciando recuperación de Lluvia Live..."
echo ""

# Paso 1: Verificar archivos
echo "📁 Verificando archivos de código..."
if [ -f "/app/backend/server.py" ]; then
    echo "✅ Backend encontrado"
else
    echo "❌ Backend NO encontrado - USAR BACKUP"
fi

if [ -f "/app/frontend/src/App.js" ]; then
    echo "✅ Frontend App.js encontrado"
else
    echo "❌ Frontend App.js NO encontrado - USAR BACKUP"
fi

echo ""
echo "📦 Archivos de backup disponibles:"
ls -lh /app/BACKUP_CODE.md /app/CODIGO_COMPLETO.txt /app/INSTRUCCIONES_RECUPERACION.md 2>/dev/null
echo ""

# Paso 2: Reiniciar servicios
echo "🔄 Reiniciando servicios..."
sudo supervisorctl restart backend
sudo supervisorctl restart frontend
echo ""

# Paso 3: Esperar compilación
echo "⏳ Esperando compilación del frontend (15 segundos)..."
sleep 15
echo ""

# Paso 4: Verificar servicios
echo "🔍 Verificando servicios..."
echo ""
echo "Backend:"
curl -s http://localhost:8001/api/ | head -3
echo ""
echo "Frontend:"
curl -I http://localhost:3000 2>/dev/null | grep HTTP
echo ""

# Paso 5: Estado de servicios
echo "📊 Estado de servicios:"
sudo supervisorctl status | grep -E "backend|frontend|mongodb"
echo ""

# Paso 6: Inicializar datos demo (opcional)
read -p "¿Inicializar datos demo? (s/n): " init_demo
if [ "$init_demo" = "s" ]; then
    echo "💾 Inicializando datos demo..."
    curl -X POST http://localhost:8001/api/init/demo-data
    echo ""
fi

echo ""
echo "✅ PROCESO COMPLETADO"
echo ""
echo "🌐 Accede a tu aplicación en:"
echo "   https://como-vas-app.preview.emergentagent.com"
echo ""
echo "📚 Documentación completa:"
echo "   cat /app/INSTRUCCIONES_RECUPERACION.md"
echo ""
