#!/bin/bash
# Script para actualizar Lluvia Live con todos los cambios nuevos
# Ejecutar en tu VPS: bash COPIAR_A_VPS.sh

echo "👑 Actualizando Lluvia Live con Imperio Completo..."
echo ""

# Crear carpeta temporal
mkdir -p /tmp/lluvia-update
cd /tmp/lluvia-update

echo "📝 Listado de archivos que se van a actualizar:"
echo "  ✅ backend/init_owner.py (NUEVO - Crea cuenta Dueño)"
echo "  ✅ frontend/src/hooks/useWebRTC.js (NUEVO - Audio WebRTC)"
echo "  ✅ frontend/src/components/tabs/MensajesTab.js (NUEVO)"
echo "  ✅ frontend/src/components/tabs/MomentoTab.js (NUEVO)"  
echo "  🔄 backend/server.py (WebSocket para audio)"
echo "  🔄 frontend/src/pages/RoomView.js (Integración de audio)"
echo "  🔄 frontend/src/components/tabs/JuegosTab.js (Casino funcional)"
echo "  🔄 frontend/src/components/tabs/PerfilTab.js (Cambio a 'Dueño')"
echo "  🔄 frontend/src/pages/Dashboard.js (Nuevas tabs)"
echo ""

read -p "📍 ¿Cuál es la ruta completa de tu proyecto? (ej: /home/usuario/lluvia-live): " PROJECT_PATH

if [ ! -d "$PROJECT_PATH" ]; then
    echo "❌ Error: La carpeta $PROJECT_PATH no existe"
    exit 1
fi

echo "✅ Carpeta encontrada: $PROJECT_PATH"
echo ""
echo "⚠️  IMPORTANTE: Voy a crear un respaldo primero..."

# Crear respaldo
BACKUP_PATH="${PROJECT_PATH}_backup_$(date +%Y%m%d_%H%M%S)"
cp -r "$PROJECT_PATH" "$BACKUP_PATH"
echo "✅ Respaldo creado en: $BACKUP_PATH"
echo ""

echo "🚀 Ahora necesito que copies los archivos manualmente."
echo "📋 Sigue las instrucciones en: INSTRUCCIONES_MANUAL.txt"
echo ""
echo "O mejor aún, usa:"
echo "  cd $PROJECT_PATH"
echo "  git pull origin main"
echo ""
echo "Si git pull no funciona, dame la URL de tu repositorio de GitHub"
echo "y te ayudo a subirlo desde Emergent."

