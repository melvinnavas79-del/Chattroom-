# 🚀 GUÍA DE DEPLOYMENT - LLUVIA LIVE (IMPERIO PRIVADO)

## 📋 REQUISITOS PREVIOS

1. **Cuenta MongoDB Atlas** (Base de datos gratis)
   - Ir a: https://www.mongodb.com/cloud/atlas/register
   - Crear cluster GRATIS (M0)
   - Obtener connection string

2. **Cuenta Render** (Hosting gratis)
   - Ir a: https://render.com/
   - Registrarse con GitHub

---

## 🔐 PASO 1: CONFIGURAR MONGODB ATLAS (GRATIS)

1. Ve a https://cloud.mongodb.com/
2. Crea un nuevo proyecto: **"Lluvia Live"**
3. Crea un cluster GRATIS (M0 Sandbox)
4. En "Database Access":
   - Create Database User
   - Username: `lluvia_admin`
   - Password: `[TU-PASSWORD-SEGURO]` (guárdalo)
5. En "Network Access":
   - Add IP Address
   - Selecciona **"Allow Access from Anywhere"** (0.0.0.0/0)
6. En "Database" → "Connect":
   - Choose "Connect your application"
   - Copia el connection string:
   ```
   mongodb+srv://lluvia_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
   - Reemplaza `<password>` con tu password

---

## 🎯 PASO 2: DEPLOYMENT EN RENDER

### A) BACKEND (API)

1. Ve a https://dashboard.render.com/
2. Click **"New +"** → **"Web Service"**
3. Conecta tu repositorio de GitHub
4. Configuración:
   - **Name:** `lluvia-live-backend`
   - **Region:** Oregon (US West)
   - **Branch:** main
   - **Root Directory:** `backend`
   - **Runtime:** Python 3
   - **Build Command:** 
     ```
     pip install -r requirements.txt && python init_owner.py
     ```
   - **Start Command:**
     ```
     uvicorn server:app --host 0.0.0.0 --port $PORT
     ```
   - **Plan:** Free

5. **Environment Variables** (agregar):
   ```
   MONGO_URL = mongodb+srv://lluvia_admin:TU-PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   DB_NAME = lluvia_live
   CORS_ORIGINS = *
   ```

6. Click **"Create Web Service"**
7. Espera 5-10 minutos (se despliega automáticamente)
8. Copia tu URL del backend (ej: `https://lluvia-live-backend.onrender.com`)

---

### B) FRONTEND (React)

**OPCIÓN 1: Render Static Site (Gratis)**

1. En Render: **"New +"** → **"Static Site"**
2. Conecta el mismo repositorio
3. Configuración:
   - **Name:** `lluvia-live-frontend`
   - **Branch:** main
   - **Root Directory:** `frontend`
   - **Build Command:** 
     ```
     yarn install && yarn build
     ```
   - **Publish Directory:** `build`

4. **Environment Variables**:
   ```
   REACT_APP_BACKEND_URL = https://lluvia-live-backend.onrender.com
   ```

5. Click **"Create Static Site"**
6. Espera 5-10 minutos
7. **¡LISTO!** Tu URL final: `https://lluvia-live-frontend.onrender.com`

---

**OPCIÓN 2: Vercel (Más Rápido - Gratis)**

1. Ve a https://vercel.com/
2. Import proyecto desde GitHub
3. Configuración:
   - **Framework Preset:** Create React App
   - **Root Directory:** `frontend`
   - **Environment Variables:**
     ```
     REACT_APP_BACKEND_URL = https://lluvia-live-backend.onrender.com
     ```
4. Deploy
5. URL final: `https://lluvia-live.vercel.app`

---

## 🔒 PASO 3: PROTEGER TU CUENTA DUEÑO

El script `init_owner.py` se ejecuta automáticamente al desplegar y crea:

- **Username:** Melvin
- **Level:** 99
- **Coins:** 999,999
- **Diamonds:** 50,000
- **Role:** admin (Dueño 👑)
- **Aristocrat Level:** IX
- **Badges:** Fundador, Admin, VIP, Aristocrat IX

**⚠️ IMPORTANTE:** Solo tú conoces que el usuario es "Melvin". Nadie más puede adivinar tu username.

---

## 🎉 PASO 4: ACCEDER A TU IMPERIO

1. Ve a tu URL del frontend (Render o Vercel)
2. Login con: **Melvin**
3. ¡Disfruta tu imperio privado! 👑

---

## 💰 COSTOS MENSUALES

- **MongoDB Atlas M0:** GRATIS ✅
- **Render Backend:** GRATIS ✅ (con limitaciones*)
- **Render/Vercel Frontend:** GRATIS ✅

**Limitaciones del plan gratis:**
- Backend se "duerme" después de 15 min de inactividad
- Primera carga puede tardar 30-60 segundos
- 750 horas/mes de uso

**Para eliminar limitaciones:**
- Render Starter Plan: $7/mes (backend siempre activo)

---

## 🔐 SEGURIDAD ADICIONAL (OPCIONAL)

Si quieres hacer la app 100% privada:

1. En Render → Backend → Settings → Environment Variables:
   - Agrega: `ALLOWED_USERS = Melvin`
   
2. Modifica `server.py` para validar que solo "Melvin" puede hacer login

---

## 📞 SOPORTE

Si algo falla:
1. Revisa los logs en Render Dashboard
2. Verifica que MongoDB permite conexiones (Network Access)
3. Confirma que las variables de entorno están correctas

---

**¡TU IMPERIO PRIVADO ESTÁ LISTO PARA DESPEGAR! 🚀👑**
