# 🎈 PINKIE PIE: LA ÚLTIMA FIESTA

Videojuego de terror psicológico en pixel art inspirado en el universo de My Little Pony.

## 🎮 Características

- **6 personajes jugables** con habilidades únicas
- **6 niveles** con atmósferas de terror progresivas
- **Sistema de gemas** coleccionables para desbloquear el final secreto
- **Final especial** de celebración por los 10 meses
- **Sprites pixel art** con animaciones de 4 frames
- **Música procedural** generada con Web Audio API
- **Compatible con móvil y escritorio**
- **Sistema de guardado** automático

## 🚀 Despliegue en Vercel

### Opción 1: Despliegue automático (Recomendado)

1. Sube este repositorio a GitHub, GitLab o Bitbucket
2. Ve a [vercel.com](https://vercel.com)
3. Haz clic en "New Project"
4. Importa tu repositorio
5. Vercel detectará automáticamente que es un proyecto Vite
6. Haz clic en "Deploy"

¡Listo! Tu juego estará en línea en unos minutos.

### Opción 2: Despliegue manual con Vercel CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Iniciar sesión
vercel login

# Desplegar
vercel

# Desplegar a producción
vercel --prod
```

### Opción 3: Despliegue local

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Construir para producción
npm run build

# Vista previa de la build
npm run preview
```

## 🎯 Controles

### Computadora
- **WASD** o **Flechas**: Mover
- **E**: Interactuar
- **Shift**: Correr
- **H**: Esconderse
- **I**: Inventario

### Móvil
- **Joystick virtual**: Mover
- **Botón E**: Interactuar
- **Botón 🏃**: Correr
- **Botón 🫣**: Esconderse
- **Botón 🎒**: Inventario

## 🎨 Personajes

Cada personaje tiene una habilidad única:

- **Pinkie Pie** 🔍: Detecta objetos ocultos a mayor distancia
- **Twilight Sparkle** ⭐: Resuelve acertijos más rápido
- **Rainbow Dash** 🌈: Corre 20% más rápido
- **Fluttershy** 🦋: Los enemigos la detectan menos
- **Rarity** 💎: Encuentra objetos secretos adicionales
- **Applejack** 🍎**: Resiste más persecuciones

## 💎 Sistema de Gemas

Recolecta las 6 gemas (una por nivel) para desbloquear el final secreto:

1. Gema Rosa - Ponyville Abandonado
2. Gema Azul - Sugarcube Corner
3. Gema Verde - Bosque Everfree
4. Gema Violeta - Castillo de Twilight
5. Gema Amarilla - Fábrica de Fiestas
6. Gema Roja - La Última Fiesta

## 🛠️ Tecnologías

- **React 18** - Framework de UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool
- **Tailwind CSS** - Estilos
- **Canvas API** - Renderizado de sprites
- **Web Audio API** - Música y efectos de sonido

## 📁 Estructura del Proyecto

```
src/
├── game/
│   ├── engine.ts       # Motor del juego
│   ├── audio.ts        # Sistema de audio
│   ├── sprites.ts      # Sprites de personajes
│   └── notePhotos.ts   # Fotos de las notas
├── App.tsx             # Componente principal
├── main.tsx            # Punto de entrada
└── index.css           # Estilos globales

config/
└── pony_visual_config.json  # Configuración visual
```

## 🎵 Música

La música es generada proceduralmente usando Web Audio API. Incluye:
- Música ambiental para cada nivel
- Efectos de sonido para acciones
- Música de persecución
- Música de celebración

## 📱 Compatibilidad

- ✅ Chrome/Edge (recomendado)
- ✅ Firefox
- ✅ Safari
- ✅ Móviles iOS y Android
- ✅ Tablets

## 🎮 Desarrollo

```bash
# Clonar repositorio
git clone <tu-repo>

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Construir para producción
npm run build
```

## 📝 Licencia

Este proyecto fue creado como una sorpresa especial.

## 🎉 Créditos

Desarrollado con ❤️ para celebrar 10 meses de aventuras juntos.

---

**¡Gracias por jugar! 🎈**
