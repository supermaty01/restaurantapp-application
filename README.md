# RestaurantApp 🍔

Aplicación móvil para gestionar restaurantes, platos y visitas. Permite llevar un registro personal de experiencias gastronómicas con fotos, valoraciones, etiquetas y ubicaciones en mapa.

Desarrollada con [Expo](https://expo.dev) y React Native.

## Características

- **Restaurantes** — Crear, editar y eliminar restaurantes con nombre, dirección, comentarios, etiquetas, imágenes y ubicación en mapa.
- **Platos** — Registrar platos asociados a restaurantes con valoración por estrellas, comentarios, etiquetas e imágenes.
- **Visitas** — Registrar visitas a restaurantes con fecha, comentarios e imágenes.
- **Mapa** — Vista global de todos los restaurantes con marcadores en Google Maps.
- **Búsqueda y filtros** — Barra de búsqueda por nombre y modal de filtros avanzados (etiquetas, valoración mínima, restaurante, ordenamiento).
- **Vista de cuadrícula** — Alternar entre vista de lista y cuadrícula responsiva (2 columnas en móvil, 3 en pantallas grandes).
- **Previsualización rápida** — Mantener presionado un elemento para ver una previsualización sin navegar.
- **Etiquetas** — Sistema de etiquetas con colores personalizables para organizar restaurantes y platos.
- **Google Places** — Autocompletado de direcciones al crear o editar restaurantes.
- **Exportar / Importar** — Compartir datos mediante archivos `.restoshare` entre dispositivos.
- **Modo oscuro** — Soporte completo de tema claro y oscuro.
- **Modo offline** — Funciona sin conexión a internet utilizando base de datos local (SQLite).

## Requisitos previos

- [Node.js](https://nodejs.org/) (v18 o superior)
- [EAS CLI](https://docs.expo.dev/eas/) instalado globalmente: `npm install -g eas-cli`
- Cuenta en [Expo](https://expo.dev) (para compilar y publicar)

## Variables de entorno

Crear un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
GOOGLE_MAPS_API_KEY=tu_api_key_de_google_maps
OFFLINE_MODE=false
```

## Instalación

```bash
npm install
```

## Desarrollo

Iniciar el servidor de desarrollo:

```bash
npx expo start
```

Opciones disponibles tras iniciar:

- Abrir en [build de desarrollo](https://docs.expo.dev/develop/development-builds/introduction/)
- Abrir en [emulador Android](https://docs.expo.dev/workflow/android-studio-emulator/)
- Abrir en [simulador iOS](https://docs.expo.dev/workflow/ios-simulator/)

## Compilación y publicación

### Generar APK de prueba (preview)

```bash
eas build -p android --profile preview
```

Esto genera un archivo `.apk` para distribución interna, ideal para pruebas en dispositivos físicos.

### Generar build de producción

```bash
eas build -p android --profile production
```

### Enviar a Google Play Store

```bash
eas submit -p android --profile production
```

## Estructura del proyecto

```
app/                  # Pantallas (file-based routing)
├── (main)/           # Pantallas principales (autenticadas)
│   ├── restaurants/  # CRUD de restaurantes
│   ├── dishes/       # CRUD de platos
│   ├── visits/       # CRUD de visitas
│   ├── tags/         # Gestión de etiquetas
│   ├── settings/     # Configuración
│   └── map.tsx       # Mapa global
├── login.tsx         # Inicio de sesión
└── import.tsx        # Importación de archivos .restoshare
components/           # Componentes reutilizables
features/             # Lógica de negocio por dominio (hooks, componentes, tipos)
lib/                  # Contextos, helpers, base de datos
services/             # Servicios (API, exportación, importación)
```

## Tecnologías

- **React Native** + **Expo** (SDK)
- **Expo Router** — Navegación basada en archivos
- **Drizzle ORM** + **SQLite** — Base de datos local
- **NativeWind** — Estilos con Tailwind CSS
- **React Native Maps** — Visualización de mapas
- **Google Places API** — Autocompletado de direcciones
- **EAS Build** — Compilación en la nube
