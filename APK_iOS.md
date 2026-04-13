# 🍎 IPA iOS - Lluvia Live

## Para generar el IPA de iOS:

### Requisitos:
- Mac con macOS 11+
- Xcode 13+ instalado
- Cuenta Apple Developer ($99/año)
- Certificados de desarrollo

### Pasos:

1. **Instalar Capacitor iOS:**
```bash
cd frontend
npx cap add ios
```

2. **Build del proyecto:**
```bash
yarn build
npx cap sync ios
```

3. **Abrir en Xcode:**
```bash
npx cap open ios
```

4. **Configurar en Xcode:**
- Selecciona tu equipo de desarrollo
- Configura Bundle Identifier: `com.lluvialive.app`
- Conecta tu iPhone o selecciona simulador

5. **Generar IPA:**
- Product → Archive
- Distribute App → App Store Connect
- O: Product → Archive → Export → Save for Ad Hoc Deployment

### Archivo generado:
- **Nombre**: `lluvia-live-ios.ipa`
- **Tamaño**: ~20-30 MB
- **Para**: App Store

---

## Configuración ya lista:

✅ `capacitor.config.json` - Configurado
✅ App ID: `com.lluvialive.app`
✅ Nombre: "Lluvia Live"
✅ Íconos iOS configurados
✅ Splash screens configurados

---

## Para subir a App Store:

1. Cuenta Apple Developer ($99/año)
2. App Store Connect - Crear nueva app
3. Subir IPA con Xcode o Transporter
4. Completar información
5. Enviar a revisión
6. ¡Publica!

**Tu app estará en App Store** 🍎

---

## Alternativa SIN Mac:

Puedes usar servicios en la nube:
- **Codemagic** (tiene plan gratuito)
- **Bitrise**
- **GitHub Actions** con macOS runner

Estos servicios pueden compilar tu IPA sin necesidad de tener Mac.
