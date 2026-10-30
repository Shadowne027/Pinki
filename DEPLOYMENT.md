# 🚀 Guía de Despliegue en Vercel

## Pasos para desplegar tu juego

### Método 1: Despliegue desde GitHub (Recomendado)

1. **Sube tu código a GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/TU-USUARIO/TU-REPO.git
   git push -u origin main
   ```

2. **Conecta con Vercel**
   - Ve a [vercel.com](https://vercel.com)
   - Inicia sesión con GitHub
   - Haz clic en "Add New Project"
   - Selecciona tu repositorio
   - Vercel detectará automáticamente que es un proyecto Vite
   - Haz clic en "Deploy"

3. **¡Listo!** Tu juego estará en línea en `https://tu-proyecto.vercel.app`

### Método 2: Despliegue con Vercel CLI

```bash
# 1. Instala Vercel CLI globalmente
npm i -g vercel

# 2. Inicia sesión
vercel login

# 3. Despliega (primera vez)
vercel

# 4. Despliega a producción
vercel --prod
```

### Método 3: Despliegue desde GitLab/Bitbucket

El proceso es similar a GitHub. Solo necesitas:
1. Subir tu código a GitLab o Bitbucket
2. Conectar tu cuenta en Vercel
3. Importar el repositorio
4. Desplegar

## ⚙️ Configuración Automática

Vercel detectará automáticamente:
- ✅ Framework: Vite
- ✅ Build Command: `npm run build`
- ✅ Output Directory: `dist`
- ✅ Install Command: `npm install`

Esta configuración ya está en `vercel.json`.

## 🌐 Dominio Personalizado

Después del despliegue inicial, puedes:

1. **Agregar dominio personalizado**
   - Ve a Settings → Domains
   - Agrega tu dominio (ej: `mi-juego.com`)
   - Sigue las instrucciones de DNS

2. **Usar subdominio de Vercel**
   - Tu proyecto tendrá automáticamente: `tu-proyecto.vercel.app`

## 🔄 Despliegues Automáticos

Cada vez que hagas push a tu repositorio:
- Vercel creará automáticamente un preview deployment
- Si es a la rama `main`, se desplegará a producción
- Puedes ver el progreso en el dashboard de Vercel

## 📱 Testing en Producción

Después del despliegue, prueba:
- ✅ El juego carga correctamente
- ✅ Los controles funcionan en móvil
- ✅ La música suena
- ✅ El guardado funciona
- ✅ Las gemas se recolectan
- ✅ El final secreto se desbloquea

## 🐛 Solución de Problemas

### El juego no carga
```bash
# Limpia la caché y reconstruye
rm -rf dist node_modules
npm install
npm run build
vercel --prod
```

### Errores de build
```bash
# Verifica que todo compile localmente
npm run build
```

### Problemas de audio
- Asegúrate de que el usuario interactúe primero con la página (los navegadores requieren interacción para reproducir audio)
- El botón de música 🔊 debe funcionar correctamente

## 📊 Analytics (Opcional)

Vercel incluye analytics básicos. Para más detalles:

1. Ve a Analytics en el dashboard
2. Activa Web Analytics si está disponible
3. Monitorea visitas y rendimiento

## 🔒 Variables de Entorno (Si las necesitas)

Si agregas variables de entorno:

1. Ve a Settings → Environment Variables
2. Agrega tus variables
3. Redeploy para que tomen efecto

## 📦 Tamaño del Bundle

El build actual:
- HTML: ~2 KB
- CSS: ~36 KB
- JS: ~234 KB
- **Total: ~272 KB** (68 KB gzipped)

Esto es excelente para rendimiento.

## 🎯 Próximos Pasos

1. ✅ Desplegar a Vercel
2. ✅ Probar en diferentes dispositivos
3. ✅ Compartir el enlace con tu novia
4. ✅ ¡Disfrutar la sorpresa! 🎉

---

**¡Buena suerte con el despliegue! 🚀**
