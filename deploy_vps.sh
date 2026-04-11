#!/bin/bash
# 🚀 Script automático de despliegue para Lluvia Live en VPS

echo "🎯 Iniciando despliegue de Lluvia Live..."

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Verificar que estamos en el directorio correcto
if [ ! -f "backend/server.py" ]; then
    echo -e "${RED}❌ Error: No se encuentra backend/server.py${NC}"
    echo "Ejecuta este script desde la carpeta raíz de Lluvia Live"
    exit 1
fi

echo -e "${GREEN}✅ Estructura de archivos verificada${NC}"

# 2. Instalar MongoDB si no está instalado
if ! command -v mongod &> /dev/null; then
    echo -e "${BLUE}📦 Instalando MongoDB...${NC}"
    sudo apt update
    sudo apt install -y mongodb
    sudo systemctl start mongodb
    sudo systemctl enable mongodb
    echo -e "${GREEN}✅ MongoDB instalado${NC}"
else
    echo -e "${GREEN}✅ MongoDB ya está instalado${NC}"
fi

# 3. Verificar que MongoDB esté corriendo
if sudo systemctl is-active --quiet mongodb; then
    echo -e "${GREEN}✅ MongoDB está corriendo${NC}"
else
    echo -e "${RED}❌ MongoDB no está corriendo. Iniciando...${NC}"
    sudo systemctl start mongodb
fi

# 4. Instalar Python y dependencias
echo -e "${BLUE}📦 Instalando dependencias de Python...${NC}"
cd backend
pip install -r requirements.txt
echo -e "${GREEN}✅ Dependencias de Python instaladas${NC}"

# 5. Crear cuenta de Dueño
echo -e "${BLUE}👑 Creando cuenta de Dueño (Melvin)...${NC}"
python init_owner.py
echo -e "${GREEN}✅ Cuenta de Dueño creada${NC}"

# 6. Instalar Node.js si no está instalado
if ! command -v node &> /dev/null; then
    echo -e "${BLUE}📦 Instalando Node.js...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt install -y nodejs
    echo -e "${GREEN}✅ Node.js instalado${NC}"
fi

# 7. Instalar Yarn si no está instalado
if ! command -v yarn &> /dev/null; then
    echo -e "${BLUE}📦 Instalando Yarn...${NC}"
    sudo npm install -g yarn
    echo -e "${GREEN}✅ Yarn instalado${NC}"
fi

# 8. Instalar dependencias del frontend
echo -e "${BLUE}📦 Instalando dependencias del frontend...${NC}"
cd ../frontend
yarn install
echo -e "${GREEN}✅ Dependencias del frontend instaladas${NC}"

# 9. Build del frontend
echo -e "${BLUE}🔨 Compilando frontend...${NC}"
yarn build
echo -e "${GREEN}✅ Frontend compilado${NC}"

# 10. Crear scripts de inicio
cd ..
cat > start_backend.sh << 'EOF'
#!/bin/bash
cd backend
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
EOF

cat > start_frontend.sh << 'EOF'
#!/bin/bash
cd frontend
yarn start
EOF

chmod +x start_backend.sh start_frontend.sh

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ ¡DESPLIEGUE COMPLETADO!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}Para iniciar Lluvia Live:${NC}"
echo ""
echo -e "1️⃣  Inicia el backend:"
echo -e "   ${GREEN}./start_backend.sh${NC}"
echo ""
echo -e "2️⃣  En otra terminal, inicia el frontend:"
echo -e "   ${GREEN}./start_frontend.sh${NC}"
echo ""
echo -e "3️⃣  Abre tu navegador en:"
echo -e "   ${GREEN}http://localhost:3000${NC}"
echo ""
echo -e "4️⃣  Haz login con el nombre:"
echo -e "   ${GREEN}Melvin${NC}"
echo ""
echo -e "${BLUE}👑 Tendrás Level 99, 999,999 monedas y rol de Dueño${NC}"
echo ""
