# 🕷️ SIMAP Frontend - Web Scraper & Intelligence Platform

Frontend moderno e interactivo para la plataforma SIMAP (Universal Web Scraper & Intelligence Platform). Desarrollado como una Single Page Application (SPA) de alto rendimiento utilizando **React 18**, **Vite**, **TailwindCSS**, gráficos con **Recharts** e iconos de **Lucide React**.

---

## 📋 Características Principales

- ⚡ **Tecnología Moderna**: React 18 + Vite para una experiencia de desarrollo ultrarrápida y recarga en caliente (HMR).
- 🎨 **Diseño Premium & Temas**: Interfaz basada en TailwindCSS con soporte completo para **Modo Oscuro** y **Modo Claro**.
- 🛠️ **Tres Modos de Operación**:
  - **Extraer Índice**: Obtiene la lista estructurada de noticias/enlaces de una portada.
  - **Deep Scraping**: Extrae el contenido enriquecido en Markdown de uno o múltiples artículos concurrentemente.
  - **Pipeline Completo**: Automatiza la extracción de índice y el scraping en profundidad en un solo flujo.
- 📊 **Panel de Analítica y Vista Previa**: Métricas clave, distribución de artículos, palabras clave y exportación a JSON o Markdown.
- 🐳 **Contenedorización Multi-Stage**: Empaquetado ligero y seguro con Docker y Nginx Alpine.
- 🔄 **Pipeline CI/CD Automatizado**: Integración y despliegue continuo mediante GitHub Actions.

---

## 🚀 Instalación y Uso Local

### Requisitos Previos
- **Node.js**: v18.0 o superior (recomendado v20 LTS)
- **npm**: v9 o superior

### 1. Clonar el repositorio e instalar dependencias
```bash
# Entrar al directorio
cd Front-Tics

# Instalar dependencias
npm install
```

### 2. Variables de Entorno (Opcional)
Crea un archivo `.env` en la raíz si deseas personalizar la URL de la API del backend:
```env
VITE_API_URL=http://localhost:8000
```
*(Por defecto, se conectará a `http://localhost:8000` si no se especifica).*

### 3. Ejecutar en Modo Desarrollo
```bash
npm run dev
```
Accede a la aplicación en: `http://localhost:5173`

### 4. Compilar para Producción
```bash
npm run build
```
Los archivos optimizados y minificados se generarán en la carpeta `dist/`. Para previsualizar el resultado de producción:
```bash
npm run preview
```

---

## 🐳 Despliegue con Docker

El proyecto cuenta con un `Dockerfile` optimizado con **Multi-Stage Build**:
1. **Etapa 1 (Build)**: Usa `node:20-alpine` para instalar dependencias limpias con `npm ci` y compilar los archivos con `npm run build`.
2. **Etapa 2 (Producción)**: Usa `nginx:alpine` para servir los estáticos desde `/usr/share/nginx/html` con compresión Gzip, cabeceras de seguridad y enrutamiento SPA mediante `nginx.conf`.

### Construir la imagen Docker:
```bash
docker build -t front-tics:latest .
```

Si deseas inyectar una URL de API personalizada durante el build:
```bash
docker build -t front-tics:latest --build-arg VITE_API_URL="http://tu-servidor-api:8000" .
```

### Ejecutar el contenedor:
```bash
docker run -d --name front-tics-app -p 80:80 front-tics:latest
```
Accede en tu navegador a: `http://localhost`

---

## 🔄 Pipeline CI/CD (GitHub Actions)

El flujo de integración y entrega continua está definido en `.github/workflows/frontend-pipeline.yml`.

### Disparadores
- `push` a la rama `main`
- `pull_request` a la rama `main`
- `workflow_dispatch` (ejecución manual desde la consola de GitHub)

### Fases del Pipeline
1. **CI (Continuous Integration)**:
   - **Checkout del código**: Descarga el repositorio mediante `actions/checkout@v4`.
   - **Configuración de Node.js**: Activa Node.js 20 con caché inteligente de dependencias npm.
   - **Instalación de Dependencias**: Ejecuta `npm ci` de forma determinista.
   - **Validación de Código y Linter**: Ejecuta `npm run lint --if-present`.
   - **Compilación de Vite**: Ejecuta `npm run build` para garantizar que la aplicación compila sin errores.
   - **Construcción Docker Multi-Stage**: Construye la imagen de producción `front-tics:latest` y la etiqueta con el SHA del commit.
   - **Smoke Test**: Inicia temporalmente el contenedor Nginx en segundo plano y comprueba que responda con código HTTP 200 mediante `curl`.
2. **CD (Continuous Deployment)**:
   - Se ejecuta únicamente en la rama `main` tras el éxito de la fase `ci`.
   - Prepara el registro y despliegue del contenedor hacia el entorno de producción.
   - Genera un resumen visual del despliegue en el GitHub Actions Step Summary.

---

## 📁 Estructura del Proyecto

```
Front-Tics/
├── .github/
│   └── workflows/
│       └── frontend-pipeline.yml   # Definición del flujo CI/CD
├── src/
│   ├── components/                 # Componentes modulares de React
│   │   ├── analyzer/               # Dashboard, inputs y loaders del scraper
│   │   ├── auth/                   # Modal de autenticación
│   │   ├── layout/                 # Barra de navegación y estructura
│   │   ├── reports/                # Historial de reportes y exportación
│   │   └── tracking/               # Monitoreo continuo de sitios
│   ├── context/                    # AuthContext y ThemeContext (Dark/Light)
│   ├── services/                   # Cliente API Axios y endpoints
│   ├── App.jsx                     # Componente raíz
│   ├── index.css                   # TailwindCSS y estilos globales
│   └── main.jsx                    # Punto de entrada de React
├── legacy/                         # Versión anterior (HTML / Vanilla JS)
├── Dockerfile                      # Construcción multi-etapa Docker
├── nginx.conf                      # Configuración de Nginx para SPA
├── package.json                    # Dependencias y scripts
├── tailwind.config.js              # Configuración del diseño
└── vite.config.js                  # Configuración de Vite
```
