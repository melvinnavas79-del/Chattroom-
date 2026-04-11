# 🚀 INSTRUCCIONES PARA DESPLEGAR LLUVIA LIVE EN TU VPS

## 📦 ARCHIVOS QUE TIENES

Tu aplicación completa "Lluvia Live" está en el archivo:
**`lluvia-live-completo.tar.gz`** (261 KB)

Este archivo contiene:
- ✅ Backend completo (FastAPI + MongoDB)
- ✅ Frontend completo (React + Tailwind)
- ✅ Todos los componentes (Salas, Audio WebRTC, Regalos, Casino, etc.)
- ✅ Tu cuenta de Dueño "Melvin" configurada
- ✅ Credenciales de PayPal Sandbox ya incluidas

---

## 🖥️ PASO 1: SUBIR A TU VPS

### Opción A: Descargar desde Emergent
1. Haz clic en el ícono de **VS Code** (barra lateral izquierda)
2. Busca el archivo `lluvia-live-completo.tar.gz` en la raíz `/app`
3. Haz clic derecho → **Download**
4. Sube el archivo a tu VPS usando SFTP/SCP

### Opción B: Comando directo en tu VPS
```bash
# Desde tu VPS, ejecuta:
scp root@tu-emergent-url:/app/lluvia-live-completo.tar.gz ~/
```

---

## 🔧 PASO 2: INSTALAR EN TU VPS

```bash
# 1. Descomprimir
cd ~
tar -xzf lluvia-live-completo.tar.gz

# 2. Instalar dependencias del backend
cd backend
pip install -r requirements.txt

# 3. Configurar MongoDB (si no lo tienes instalado)
# Instalar MongoDB en Ubuntu/Debian:
sudo apt update
sudo apt install -y mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb

# 4. Crear cuenta de Dueño en MongoDB
python init_owner.py

# 5. Iniciar backend
uvicorn server:app --host 0.0.0.0 --port 8001

# 6. En otra terminal, instalar frontend
cd ~/frontend
yarn install
yarn build

# 7. Servir frontend con nginx o usar:
yarn start
```

---

## 🌐 PASO 3: CONFIGURAR DOMINIO

Si tienes un dominio (ej: `lluvialive.com`):

1. Apunta tu dominio a la IP de tu VPS
2. Configura nginx para servir el frontend y hacer proxy al backend
3. Usa Let's Encrypt para HTTPS:
   ```bash
   sudo certbot --nginx -d lluvialive.com
   ```

---

## ✅ VERIFICAR QUE FUNCIONA

1. Abre tu navegador en: `http://tu-vps-ip:3000`
2. Haz login con el nombre: **Melvin**
3. Deberías ver:
   - Level 99
   - 999,999 monedas
   - Rol "👑 Dueño"
   - Aristocrat IX

---

## 📝 ARCHIVOS DE CONFIGURACIÓN IMPORTANTES

- **Backend**: `backend/.env` (MongoDB URL, PayPal credentials)
- **Frontend**: `frontend/.env` (URL del backend)
- **Dueño**: `backend/init_owner.py` (crea tu cuenta admin)

---

## 🆘 SOPORTE

Si algo no funciona:
1. Revisa los logs del backend: `tail -f backend_logs.txt`
2. Verifica que MongoDB esté corriendo: `sudo systemctl status mongodb`
3. Asegúrate de que los puertos 3000 y 8001 estén abiertos en tu firewall

---

**¡Tu aplicación está lista para producción!** 🎉
