# 📋 INSTRUCCIONES PARA COPIAR CÓDIGO MANUALMENTE A TU VPS

## 🎯 ARCHIVOS QUE NECESITAS ACTUALIZAR

Voy a darte el contenido completo de cada archivo. Cópialos uno por uno en tu VPS.

---

## 📁 ARCHIVO 1: backend/init_owner.py (NUEVO - YA TE LO DI ARRIBA)

---

## 📁 ARCHIVO 2: frontend/src/hooks/useWebRTC.js (NUEVO)

Ubicación en tu VPS: `lluvia-live/frontend/src/hooks/useWebRTC.js`

```bash
# Crear carpeta hooks si no existe
mkdir -p frontend/src/hooks

# Crear archivo
nano frontend/src/hooks/useWebRTC.js
```

VER CONTENIDO EN EL SIGUIENTE MENSAJE (es muy largo)

---

## 📁 ARCHIVO 3: frontend/src/components/tabs/MensajesTab.js (NUEVO)

Ubicación: `lluvia-live/frontend/src/components/tabs/MensajesTab.js`

```bash
nano frontend/src/components/tabs/MensajesTab.js
```

VER CONTENIDO EN EL SIGUIENTE MENSAJE

---

## 📁 ARCHIVO 4: frontend/src/components/tabs/MomentoTab.js (NUEVO)

Ubicación: `lluvia-live/frontend/src/components/tabs/MomentoTab.js`

```bash
nano frontend/src/components/tabs/MomentoTab.js
```

VER CONTENIDO EN EL SIGUIENTE MENSAJE

---

## 🔄 ARCHIVOS A MODIFICAR (PARCIALMENTE)

Para estos archivos, solo necesitas MODIFICAR ciertas líneas:

### 1. frontend/src/components/tabs/PerfilTab.js
**Línea 119 - Cambiar:**
```javascript
// ANTES:
{userInfo.role === 'admin' && 'Administrador'}

// DESPUÉS:
{userInfo.role === 'admin' && '👑 Dueño'}
```

### 2. backend/server.py
**Necesitas agregar WebSocket imports y endpoints**
- Esto es MÁS COMPLEJO
- Te daré las secciones específicas a agregar

---

## ⚡ OPCIÓN RÁPIDA: DESCARGA DESDE GITHUB

Si ya conectaste tu GitHub antes, el código debería estar ahí actualizado. Solo haz:

```bash
cd lluvia-live
git pull origin main
```

Si eso no funciona, seguimos con el método manual.

---

## 📞 SIGUIENTE PASO

Dime si:
a) Quieres que te dé TODOS los archivos completos uno por uno
b) Prefieres solo las modificaciones puntuales
c) Quieres intentar `git pull` primero

¿Qué prefieres?
