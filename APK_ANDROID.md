# 📱 APK ANDROID - Lluvia Live

## Para generar el APK de Android:

### Requisitos:
- Node.js instalado
- Android Studio o Android SDK
- Java JDK 11+

### Pasos:

1. **Instalar Capacitor:**
```bash
cd frontend
npx cap add android
```

2. **Build del proyecto:**
```bash
yarn build
npx cap sync android
```

3. **Abrir en Android Studio:**
```bash
npx cap open android
```

4. **Generar APK:**
- En Android Studio: Build → Build Bundle(s) / APK(s) → Build APK(s)
- El APK estará en: `android/app/build/outputs/apk/release/app-release.apk`

### Archivo generado:
- **Nombre**: `lluvia-live-android.apk`
- **Tamaño**: ~15-20 MB
- **Para**: Google Play Store

---

## Configuración ya lista:

✅ `capacitor.config.json` - Configurado
✅ App ID: `com.lluvialive.app`
✅ Nombre: "Lluvia Live"
✅ Íconos y splash screens configurados

---

## Para subir a Google Play:

1. Crea cuenta en Google Play Console ($25 USD)
2. Sube el APK
3. Completa la información de la app
4. ¡Publica!

**Tu app estará en Play Store** 🚀
