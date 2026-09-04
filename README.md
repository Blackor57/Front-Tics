# 🕷️ SIMAP Frontend — Universal Web Scraper & Intelligence Platform

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.17-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Multi--Stage-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![Nginx](https://img.shields.io/badge/Nginx-Alpine-009639?logo=nginx&logoColor=white)](https://nginx.org/)
[![GitHub Actions](https://img.shields.io/badge/CI%2FCD-Pipeline%20Activo-2088FF?logo=github-actions&logoColor=white)](https://github.com/Blackor57/Front-Tics/actions)

---

## 📖 Tabla de Contenidos
1. [Visión General del Proyecto](#-visión-general-del-proyecto)
2. [Arquitectura del Sistema y Comunicación con el Backend](#-arquitectura-del-sistema-y-comunicación-con-el-backend)
3. [Flujo Operativo y Funcionamiento del Aplicativo (End-to-End)](#-flujo-operativo-y-funcionamiento-del-aplicativo-end-to-end)
4. [Desglose Detallado de Módulos y Funciones](#-desglose-detallado-de-módulos-y-funciones)
   - [Núcleo y Orquestación (App & Contexts)](#1-núcleo-y-orquestación-app--contexts)
   - [Capa de Conectividad y Servicios (API Client)](#2-capa-de-conectividad-y-servicios-api-client)
   - [Módulo de Análisis e Inteligencia (Analyzer)](#3-módulo-de-análisis-e-inteligencia-analyzer)
   - [Módulo de Monitoreo Continuo (Tracking)](#4-módulo-de-monitoreo-continuo-tracking)
   - [Módulo de Historial y Reportes (Reports)](#5-módulo-de-historial-y-reportes-reports)
   - [Módulo de Autenticación y Verificación (Auth)](#6-módulo-de-autenticación-y-verificación-auth)
5. [Pila Tecnológica (Tech Stack)](#-pila-tecnológica-tech-stack)
6. [Instalación y Ejecución Local](#-instalación-y-ejecución-local)
7. [Despliegue con Docker y Nginx](#-despliegue-con-docker-y-nginx)
8. [Pipeline de Integración y Entrega Continua (CI/CD)](#-pipeline-de-integración-y-entrega-continua-cicd)
9. [Seguridad y Rendimiento](#-seguridad-y-rendimiento)

---

## 🌟 Visión General del Proyecto

**SIMAP (Sistema Inteligente de Monitoreo, Auditoría y Procesamiento)** es una plataforma integral de **inteligencia web, scraping automatizado y detección de cambios temporales**. Su cliente frontend ha sido diseñado como una **Single Page Application (SPA)** moderna, de alto rendimiento y grado empresarial, utilizando **React 18**, **Vite** y **TailwindCSS**.

El aplicativo permite a analistas e investigadores:
- Monitorear cualquier portal web público en tiempo real eludiendo barreras dinámicas y renderizando contenido interactivo (con backend Playwright).
- Contrastar el contenido del portal frente a snapshots históricos mediante un **Motor de Cálculo Delta** (identificando novedades entrantes, contenidos salientes y tasa de rotación).
- Sintetizar automáticamente el contenido mediante **Inteligencia Artificial Local (Ollama Llama 3.1)**: extrayendo resúmenes ejecutivos, matrices estructuradas de entidades (empresas, instituciones, figuras públicas y normas legales), termómetros de sentimiento y niveles de criticidad/alerta.
- Programar seguimientos periódicos continuos con alertas automáticas por correo electrónico.
- Generar y descargar al instante informes ejecutivos en formato **Word (`.docx`)** y libros analíticos en **Excel (`.xlsx`)**.
- Operar en **Modo Backend en Vivo** o de forma autónoma mediante un **Modo Demostración Interactivo** con fallbacks automáticos.

---

## 🏛️ Arquitectura del Sistema y Comunicación con el Backend

El ecosistema SIMAP está fundamentado en una arquitectura desacoplada cliente-servidor, donde el frontend React se comunica de manera asíncrona y segura con una API REST construida sobre **FastAPI (Python)**.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (React 18 SPA)                           │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                     Interfaz de Usuario & Vistas                      │  │
│  │   [Navbar]  [UrlInputSection]  [LoadingPipeline]  [PreviewDashboard]  │  │
│  │         [TrackingView / Modal]      [ReportsHistoryView]              │  │
│  │         [AuthModal]  [VerificationBanner]  [VerificationModal]        │  │
│  └──────────────────────────────────┬────────────────────────────────────┘  │
│                                     │                                       │
│  ┌──────────────────────────────────┴────────────────────────────────────┐  │
│  │                       Gestión de Estado & Contexto                    │  │
│  │        AuthContext (JWT, usuario, rol) │ ThemeContext (Dark/Light)    │  │
│  └──────────────────────────────────┬────────────────────────────────────┘  │
│                                     │                                       │
│  ┌──────────────────────────────────┴────────────────────────────────────┐  │
│  │                   Cliente HTTP Axios & Capa de Servicio               │  │
│  │    - Interceptor JWT (Bearer Token)                                   │  │
│  │    - Interceptor 401 (Auto-logout en expiración)                      │  │
│  │    - Timeout 180s (Procesamiento pesado Playwright + Ollama)          │  │
│  │    - Motor de Mock Fallback (Modo Demo Offline)                       │  │
│  └──────────────────────────────────┬────────────────────────────────────┘  │
└─────────────────────────────────────┼───────────────────────────────────────┘
                                      │ HTTP REST / JSON / Blobs
                                      │ Base URL: http://localhost:8000
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           BACKEND (FastAPI - Python)                        │
│                                                                             │
│  ┌───────────────┬──────────────────┬──────────────────┬─────────────────┐  │
│  │  /api/v1/auth │ /api/v1/intel... │ /api/v1/tracking │ /api/v1/reports │  │
│  │  Login/Reg/Me │ Analyze Pipeline │ Cron / Objetivos │ List / Download │  │
│  └───────┬───────┴─────────┬────────┴────────┬─────────┴────────┬────────┘  │
│          │                 │                 │                  │           │
│  ┌───────▼───────┐ ┌───────▼────────┐ ┌──────▼─────────┐ ┌──────▼────────┐  │
│  │ Base de Datos │ │   Playwright   │ │  Motor Delta   │ │ Ollama LLM    │  │
│  │ SQLite / Postg│ │ Headless Scrap │ │ Comparación    │ │ Llama 3.1     │  │
│  └───────────────┘ └────────────────┘ └────────────────┘ └───────────────┘  │
│                                      │                                      │
│                                      ▼                                      │
│                        Generadores Word (.docx) & Excel (.xlsx)             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 📡 Protocolo y Mecanismos de Comunicación

1. **Configuración de Endpoint Base (`VITE_API_URL`)**:
   - Resuelto dinámicamente mediante `import.meta.env.VITE_API_URL`.
   - Por defecto apunta a `http://localhost:8000`.
   - Puede sobreescribirse en desarrollo creando un archivo `.env` o en producción mediante build-args de Docker.

2. **Autenticación Basada en Tokens JWT**:
   - Al autenticarse (`/api/v1/auth/login` o `/api/v1/auth/register`), el backend emite un `access_token` JWT.
   - El token se resguarda en `localStorage` (`simap_token`) junto a la estructura de usuario (`simap_user`).
   - Un **Interceptor de Solicitud de Axios** inyecta automáticamente la cabecera `Authorization: Bearer <token>` en todas las peticiones salientes.

3. **Manejo de Expiración de Sesión (Interceptor 401)**:
   - Si el backend devuelve un código HTTP `401 Unauthorized`, un interceptor de respuesta limpia inmediatamente las claves de autenticación en `localStorage` y restablece el estado global a usuario no autenticado.

4. **Timeouts Extendidos para Inteligencia Artificial (180 segundos)**:
   - A diferencia de peticiones CRUD convencionales, el análisis de portales web involucra:
     1. Despliegue de un navegador headless con Playwright.
     2. Navegación, espera de carga de scripts y extracción del DOM.
     3. Comparación y serialización contra el snapshot previo en base de datos.
     4. Inferencia local mediante el LLM Ollama (Llama 3.1) para clasificación, síntesis semántica y extracción de entidades.
     5. Generación de informes Word y libros Excel en disco.
   - La instancia de Axios cuenta con un `timeout: 180000` (3 minutos) evitando desconexiones prematuras del socket.

5. **Healthcheck y Resiliencia con Fallback a Modo Demo**:
   - En el arranque (`App.jsx`), se ejecuta una sonda de conectividad (`checkBackendHealth`) consultando `${API_BASE_URL}/docs`.
   - Si el backend responde positivamente, la plataforma opera en **Modo en Vivo**.
   - Si el servidor está apagado o inalcanzable, la aplicación notifica amigablemente al usuario y activa de forma automática el **Modo Demostración**, utilizando generadores de datos enriquecidos (`getMockAnalyzeResponse`, `getMockTargets`, `getMockReports`). Esto permite presentar, auditar la interfaz y navegar todas las capacidades del sistema sin dependencias de infraestructura local.

6. **Descarga de Reportes Binarios**:
   - Para la exportación de documentos ejecutivos, el frontend construye URLs firmadas directas:
     - Word: `/api/v1/reports/download/word/{reportId}`
     - Excel: `/api/v1/reports/download/excel/{reportId}`
   - Las descargas se abren de forma nativa en nuevas pestañas transmitiendo streams binarios directos generados por `python-docx` y `openpyxl`.

---

## 🔄 Flujo Operativo y Funcionamiento del Aplicativo (End-to-End)

El ciclo de vida de interacción del usuario se divide en 4 trayectorias clave:

### 1. Auditoría Inmediata con Inteligencia Artificial
```
[Ingreso de URL o Preset]
        │
        ▼
[Validación de Parámetros] ─── (Guardar Snapshot / Generar Documentos)
        │
        ▼
[Ejecución de Pipeline] ──────► Despliegue de "LoadingPipeline"
        │                       Fase 1: Navegación con Playwright
        │                       Fase 2: Extracción DOM y cálculo Delta
        │                       Fase 3: Análisis con Ollama Llama 3.1
        │                       Fase 4: Síntesis y compilación de documentos
        ▼
[PreviewDashboard Renderizado]
  ├── KPIs: Total extraídos, Novedades (+N), Rotación (%), Nivel de Alerta
  ├── Puntos de Atención Urgentes (Alertas de alto impacto)
  ├── Resumen Ejecutivo & Evolución temporal redactado por IA
  ├── Recomendaciones Estratégicas
  ├── Gráfico de Barras: Distribución Temática (Recharts)
  ├── Gráfico Donut: Termómetro de Sentimiento (Positivo/Neutro/Negativo)
  ├── Matriz Estructurada: Instituciones, Personas y Normas Legales
  ├── Tabla Filtrable de Contenidos: Novedades entrantes vs Artículos salientes
  └── Barra Flotante: Descarga de Word (.docx), Excel (.xlsx) y Programación
```

### 2. Monitoreo Periódico Continuo (Continuous Tracking)
- El usuario hace clic en **"Programar Seguimiento"** desde el dashboard o desde la barra superior.
- **Validación de Seguridad**: Requiere autenticación y confirmación de correo electrónico. Si el usuario no ha verificado su cuenta, se levanta `VerificationRequiredModal`.
- En `TrackingModal`, el usuario configura:
  - Duración del seguimiento: 3, 7, 15 o 30 días.
  - Frecuencia de chequeo: Cada 6 horas (noticias de alto impacto), 12 horas (recomendado) o 24 horas (institucional).
  - Notificaciones automáticas por correo electrónico ante cambios críticos.
- El objetivo queda registrado en el panel `TrackingView`, donde el usuario puede pausar, reactivar o eliminar la tarea supervisada por el background worker.

### 3. Repositorio e Historial de Auditorías
- Vista `ReportsHistoryView`: Lista cronológica de reportes históricos.
- Permite buscar por URL o por palabras clave del resumen ejecutivo.
- Acceso con un solo clic a la descarga de informes de auditoría en Word y Excel.

### 4. Ciclo de Autenticación y Verificación de Cuenta
- Modal de acceso unificado `AuthModal`: Inicio de sesión, registro y acceso rápido de demostración con 1 clic ("Investigador Senior").
- `VerificationBanner`: Alerta visual superior en caso de que el usuario no haya confirmado su email, con temporizador anti-spam (cooldown de 60 segundos) para reenvío del correo.
- Detección de token en URL (`?token=...`): Al hacer clic en el enlace del correo electrónico, `App.jsx` captura el parámetro, invoca `authAPI.verifyEmail(token)`, actualiza el estado de verificación y limpia la URL automáticamente.

---

## 🧩 Desglose Detallado de Módulos y Funciones

### 1. Núcleo y Orquestación (App & Contexts)

| Archivo | Responsabilidad Principal | Funciones y Mecanismos Clave |
| :--- | :--- | :--- |
| [`src/main.jsx`](file:///c:/Users/jhoel/Downloads/Proyecto-Scraping/Fronted/src/main.jsx) | Punto de entrada del cliente React | Inicializa el árbol DOM en `#root`, envuelve la aplicación en `React.StrictMode`, `ThemeProvider` y `AuthProvider`. |
| [`src/App.jsx`](file:///c:/Users/jhoel/Downloads/Proyecto-Scraping/Fronted/src/App.jsx) | Componente raíz y orquestador maestro | Gestiona el estado de pestañas activas (`currentTab`: `analyzer`, `tracking`, `reports`), monitorea la conectividad del backend con `checkBackendHealth`, procesa tokens de activación en URL, y coordina la apertura de modales de autenticación, verificación y seguimiento. |
| [`src/context/AuthContext.jsx`](file:///c:/Users/jhoel/Downloads/Proyecto-Scraping/Fronted/src/context/AuthContext.jsx) | Proveedor de estado de autenticación global | Maneja inicio de sesión (`login`), registro (`register`), cierre de sesión (`logout`), persistencia en `localStorage`, consulta de usuario autenticado (`authAPI.getMe`), verificación de email (`markUserAsVerified`) y cuenta de prueba inmediata (`setDemoUser`). |
| [`src/context/ThemeContext.jsx`](file:///c:/Users/jhoel/Downloads/Proyecto-Scraping/Fronted/src/context/ThemeContext.jsx) | Proveedor de temas (Dark/Light) | Detecta la preferencia del sistema operativo (`prefers-color-scheme`), almacena la elección en `localStorage`, y conmuta dinámicamente la clase `.dark` en el elemento raíz `<html>`. |

---

### 2. Capa de Conectividad y Servicios (API Client)

| Archivo | Servicio / Objeto | Descripción de Endpoints y Métodos |
| :--- | :--- | :--- |
| [`src/services/api.js`](file:///c:/Users/jhoel/Downloads/Proyecto-Scraping/Fronted/src/services/api.js) | `authAPI` | `login()` (`POST /api/v1/auth/login`), `register()` (`POST /api/v1/auth/register`), `getMe()` (`GET /api/v1/auth/me`), `resendVerification()` (`POST /api/v1/auth/resend-verification`), `verifyEmail()` (`GET /api/v1/auth/verify?token=`). |
| [`src/services/api.js`](file:///c:/Users/jhoel/Downloads/Proyecto-Scraping/Fronted/src/services/api.js) | `intelligenceAPI` | `analyze(payload)` (`POST /api/v1/intelligence/analyze`): Inicia el pipeline completo de navegación Playwright, extracción, cálculo delta, análisis Ollama y estructuración de reportes. |
| [`src/services/api.js`](file:///c:/Users/jhoel/Downloads/Proyecto-Scraping/Fronted/src/services/api.js) | `trackingAPI` | `create()` (`POST /api/v1/tracking/start`), `getMyTargets()` (`GET /api/v1/tracking/my-targets`), `toggle()` (`PATCH /api/v1/tracking/:id/toggle`), `delete()` (`DELETE /api/v1/tracking/:id`). |
| [`src/services/api.js`](file:///c:/Users/jhoel/Downloads/Proyecto-Scraping/Fronted/src/services/api.js) | `reportsAPI` | `list(limit, soloMisReportes)` (`GET /api/v1/reports/list`), `getWordDownloadUrl(id)` y `getExcelDownloadUrl(id)`. |
| [`src/services/api.js`](file:///c:/Users/jhoel/Downloads/Proyecto-Scraping/Fronted/src/services/api.js) | `checkBackendHealth` | Sonda HTTP a `${API_BASE_URL}/docs` con timeout de 3000 ms para determinar el estado en vivo del backend. |
| [`src/services/api.js`](file:///c:/Users/jhoel/Downloads/Proyecto-Scraping/Fronted/src/services/api.js) | Motores Mock Offline | `getMockAnalyzeResponse()`, `getMockTargets()`, `getMockReports()`: Datos realistas con taxonomías políticas y económicas para pruebas de rendimiento y demostraciones sin servidor. |

---

### 3. Módulo de Análisis e Inteligencia (Analyzer)

- [`UrlInputSection.jsx`](file:///c:/Users/jhoel/Downloads/Proyecto-Scraping/Fronted/src/components/analyzer/UrlInputSection.jsx):
  - Formulario ergonómico con input estilizado y validación de URLs.
  - Opciones rápidas de portales populares predefinidos (RPP Noticias, El Comercio).
  - Botón de **"Ver Ejemplo de Auditoría Completa"** para carga instantánea de demostración sin consumir créditos ni esperar al backend.
- [`LoadingPipeline.jsx`](file:///c:/Users/jhoel/Downloads/Proyecto-Scraping/Fronted/src/components/analyzer/LoadingPipeline.jsx):
  - Indicador visual interactivo de 4 fases que ilustra el avance en tiempo real:
    1. *Navegación Headless con Playwright* (elusión de protecciones y renderizado completo).
    2. *Extracción semántica y cálculo Delta* (contraste de snapshots).
    3. *Inferencia de Inteligencia Artificial con Ollama Llama 3.1* (extracción de entidades y tono discursivo).
    4. *Compilación y síntesis de documentos ejecutivos* (Word y Excel).
  - Esqueleto animado (skeleton shimmer) que previene saltos abruptos de diseño (CLS).
- [`PreviewDashboard.jsx`](file:///c:/Users/jhoel/Downloads/Proyecto-Scraping/Fronted/src/components/analyzer/PreviewDashboard.jsx):
  - **Encabezado Inteligente**: Muestra el título del portal, fecha y hora de la auditoría, enlace externo directo y badge de estado (Línea Base Inicial vs Delta Comparativo Activo).
  - **Cuadrícula de KPIs**: Total de ítems extraídos, novedades detectadas (`+N`), artículos salientes (`-N`), tasa de rotación temporal (`%`) y nivel de alerta semántico (`BAJO`, `MEDIO`, `ALTO`, `CRÍTICO`) con código de color condicional.
  - **Banner de Puntos de Atención Urgentes**: Destaca hallazgos críticos detectados por el modelo de lenguaje.
  - **Resumen Ejecutivo & Análisis de Evolución**: Redacción técnica generada por el LLM explicando las variaciones respecto al snapshot previo.
  - **Visualizaciones con Recharts**:
    - *Distribución Temática*: Gráfico de barras horizontales con tooltips interactivos y conteo porcentual por categoría.
    - *Termómetro de Sentimiento*: Gráfico tipo Donut que cuantifica el porcentaje de discurso Positivo, Neutro y Negativo.
  - **Matriz Estructurada de Entidades y Actores**: Agrupación automática en tres cuadrantes de alta relevancia:
    - *Instituciones y Empresas* (Ministerios, bancos, organismos reguladores).
    - *Personas Relevantes* (Ministros, congresistas, directores).
    - *Marcos Legales o Normas* (Leyes promulgadas, decretos de urgencia, resoluciones).
  - **Tabla Filtrable de Artículos**: Navegación con pestañas entre *Solo Novedades*, *Artículos Salientes* y *Todos los Registrados*, con barra de búsqueda instantánea por titular y enlaces directos al portal original.
  - **Barra de Acciones Flotante**: Acceso fijo a la descarga directa del informe Word (`.docx`), el libro Excel (`.xlsx`) y la programación del monitoreo recurrente.

---

### 4. Módulo de Monitoreo Continuo (Tracking)

- [`TrackingView.jsx`](file:///c:/Users/jhoel/Downloads/Proyecto-Scraping/Fronted/src/components/tracking/TrackingView.jsx):
  - Panel de control de objetivos en supervisión continua.
  - Visualización del estado del objetivo (Activo / Pausado con indicadores de pulso).
  - Frecuencia horaria, duración total en días, timestamp del último chequeo y estado de notificaciones por email.
  - Acciones rápidas en un clic: Pausar/Reanudar monitoreo y eliminación definitiva del target.
- [`TrackingModal.jsx`](file:///c:/Users/jhoel/Downloads/Proyecto-Scraping/Fronted/src/components/tracking/TrackingModal.jsx):
  - Modal de configuración de nuevos seguimientos.
  - Selector de duración (3, 7, 15 o 30 días).
  - Selector de frecuencia horaria (6h, 12h, 24h).
  - Switch interactivo para habilitar o deshabilitar alertas por correo electrónico ante novedades de criticidad ALTA o CRÍTICA.

---

### 5. Módulo de Historial y Reportes (Reports)

- [`ReportsHistoryView.jsx`](file:///c:/Users/jhoel/Downloads/Proyecto-Scraping/Fronted/src/components/reports/ReportsHistoryView.jsx):
  - Tabla de auditorías almacenadas en base de datos.
  - Motor de búsqueda instantáneo por URL del portal o fragmentos del resumen ejecutivo.
  - Nivel de alerta asignado a cada informe histórico.
  - Botones dedicados de descarga inmediata para documentos Word (`.docx`) y libros analíticos Excel (`.xlsx`).

---

### 6. Módulo de Autenticación y Verificación (Auth)

- [`AuthModal.jsx`](file:///c:/Users/jhoel/Downloads/Proyecto-Scraping/Fronted/src/components/auth/AuthModal.jsx):
  - Modal conmutador con transiciones suaves entre *Iniciar Sesión* y *Crear Cuenta*.
  - Validación de email y longitud mínima de contraseña (6 caracteres).
  - Botón de **"Acceder con Cuenta de Prueba (Demo 1-Clic)"** para ingresar de inmediato como Analista de Inteligencia.
- [`VerificationBanner.jsx`](file:///c:/Users/jhoel/Downloads/Proyecto-Scraping/Fronted/src/components/auth/VerificationBanner.jsx):
  - Barra persistente en la parte superior de la aplicación visible cuando un usuario autenticado aún no ha verificado su dirección de correo.
  - Incluye botón de reenvío de email de activación con temporizador inteligente de cooldown (60 segundos) resguardado en `localStorage` para prevenir abusos de envío.
- [`VerificationRequiredModal.jsx`](file:///c:/Users/jhoel/Downloads/Proyecto-Scraping/Fronted/src/components/auth/VerificationRequiredModal.jsx):
  - Modal de advertencia que se dispara si un usuario no verificado intenta activar tareas automáticas de monitoreo continuo. Explica el requerimiento y permite reenviar el enlace de confirmación.

---

### 7. Barra de Navegación y Estructura (Layout)

- [`Navbar.jsx`](file:///c:/Users/jhoel/Downloads/Proyecto-Scraping/Fronted/src/components/layout/Navbar.jsx):
  - Marca e isotipo con radar pulsante interactivo.
  - Navegación fluida por pestañas (*Analizador & Preview*, *Monitoreo Continuo*, *Historial de Reportes*).
  - **Badge de Estado de Conectividad**: Informa visualmente si el sistema está conectado a `API 8000`, en `Modo Demo` o `Desconectado`, permitiendo alternar el modo manualmente con un solo clic.
  - Conmutador de tema claro/oscuro (Sun / Moon).
  - Menú desplegable de usuario autenticado con información de correo, estado de verificación y botón de cierre de sesión.
  - Cajón de navegación móvil adaptable para smartphones y tablets.

---

## 🛠️ Pila Tecnológica (Tech Stack)

| Capa / Función | Tecnología Seleccionada | Versión | Justificación Técnica |
| :--- | :--- | :--- | :--- |
| **Framework Base** | React | `^18.3.1` | Renderizado declarativo por componentes, concurrencia y reconciliación eficiente. |
| **Herramienta de Build** | Vite | `^6.2.0` | Hot Module Replacement (HMR) ultrarrápido y compilación optimizada con Rollup. |
| **Estilizado & Diseño** | TailwindCSS | `^3.4.17` | Sistema de diseño de clases utilitarias, paleta curada con modo oscuro integrado. |
| **Visualización Gráfica** | Recharts | `^2.15.1` | Gráficos SVG interactivos, ligeros, responsivos y altamente personalizables. |
| **Iconografía** | Lucide React | `^1.16.0` | Conjunto consistente de más de 1000 iconos vectoriales legibles y modernos. |
| **Notificaciones Toast** | Sonner | `^2.0.1` | Sistema de notificaciones elegante, con soporte automático para modo oscuro y apilamiento. |
| **Cliente HTTP** | Axios | `^1.7.9` | Soporte nativo para interceptores de solicitud/respuesta, timeout granular y blobs. |
| **Servidor de Producción** | Nginx Alpine | `alpine` | Servidor web HTTP ligero (<25MB de huella), compresión Gzip y proxying SPA. |
| **Contenedorización** | Docker | Multi-Stage | Separación entre la etapa pesada de compilación Node y la etapa mínima de ejecución Nginx. |
| **Automatización CI/CD** | GitHub Actions | Workflows v4 | Pipeline automatizado de linting, compilación, dockerización y smoke testing. |

---

## 🚀 Instalación y Ejecución Local

### Requisitos Previos
- **Node.js**: v18.0 o superior (recomendado v20 LTS).
- **npm**: v9 o superior.

### 1. Clonar el repositorio e instalar dependencias
```bash
# Navegar al directorio del frontend
cd Fronted

# Instalar dependencias deterministas
npm install
```

### 2. Configurar Variables de Entorno (Opcional)
Crea un archivo `.env` en la raíz del frontend si deseas apuntar a un servidor FastAPI en una dirección o puerto específico:
```env
VITE_API_URL=http://localhost:8000
```
> *Nota:* Si este archivo no se define, el frontend se conectará por defecto a `http://localhost:8000`. Si el backend no está disponible, activará automáticamente el Modo Demostración.

### 3. Iniciar el Servidor de Desarrollo
```bash
npm run dev
```
Abre tu navegador en: **`http://localhost:5173`**

### 4. Compilar para Producción
```bash
npm run build
```
Los archivos minificados y empaquetados se generarán en la carpeta `dist/`. Para validar la compilación localmente:
```bash
npm run preview
```

---

## 🐳 Despliegue con Docker y Nginx

La aplicación utiliza un [`Dockerfile`](file:///c:/Users/jhoel/Downloads/Proyecto-Scraping/Fronted/Dockerfile) optimizado con arquitectura **Multi-Stage Build**:
1. **Etapa de Construcción (`node:20-alpine`)**: Descarga dependencias mediante `npm ci` y compila los estáticos optimizados con Vite.
2. **Etapa de Servidor (`nginx:alpine`)**: Desecha el entorno de Node.js y copia únicamente el directorio `dist/` a `/usr/share/nginx/html`, servido por Nginx con configuración para Single Page Applications ([`nginx.conf`](file:///c:/Users/jhoel/Downloads/Proyecto-Scraping/Fronted/nginx.conf)).

### Construir la imagen Docker:
```bash
docker build -t front-tics:latest .
```

Si deseas inyectar la URL del backend durante la construcción de la imagen:
```bash
docker build -t front-tics:latest --build-arg VITE_API_URL="http://mi-servidor-backend:8000" .
```

### Ejecutar el contenedor:
```bash
docker run -d --name front-tics-app -p 80:80 front-tics:latest
```
Accede desde tu navegador a: **`http://localhost`**

---

## 🔄 Pipeline de Integración y Entrega Continua (CI/CD)

El flujo de trabajo automatizado se encuentra configurado en [`.github/workflows/frontend-pipeline.yml`](file:///c:/Users/jhoel/Downloads/Proyecto-Scraping/Fronted/.github/workflows/frontend-pipeline.yml).

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Actions CI/CD                     │
│                                                             │
│   Disparadores: push (main), pull_request, manual trigger   │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                  FASE 1: CI (Continuous Integration)        │
│                                                             │
│  1. actions/checkout@v4                                     │
│  2. Configuración de Node.js 20 con caché inteligente de npm│
│  3. npm ci (Instalación limpia y reproducible)              │
│  4. Validación de Linter / Tipos (npm run lint --if-present)│
│  5. npm run build (Compilación con Vite)                    │
│  6. Construcción de Imagen Docker Multi-Stage               │
│  7. Smoke Test: Despliegue temporal de Nginx y verificación │
│     de código HTTP 200 mediante curl                        │
└──────────────────────────────┬──────────────────────────────┘
                               │ (Solo en rama 'main' tras éxito)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                  FASE 2: CD (Continuous Deployment)         │
│                                                             │
│  1. Despliegue de la imagen Docker validada                 │
│  2. Registro del SHA de commit y artefactos de entrega      │
│  3. Emisión de Resumen visual en GitHub Step Summary        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔒 Seguridad y Rendimiento

El servidor web [`nginx.conf`](file:///c:/Users/jhoel/Downloads/Proyecto-Scraping/Fronted/nginx.conf) implementa los estándares recomendados por OWASP y las guías de optimización web moderna:

- **Cabeceras de Seguridad HTTP**:
  - `X-Frame-Options "SAMEORIGIN"`: Protección contra ataques de Clickjacking.
  - `X-Content-Type-Options "nosniff"`: Previene la interpretación indebida de tipos MIME.
  - `X-XSS-Protection "1; mode=block"`: Filtro activo contra cross-site scripting.
  - `Referrer-Policy "strict-origin-when-cross-origin"`: Control estricto de referencias cruzadas.
- **Compresión Gzip**: Habilitada en nivel 6 para ficheros HTML, CSS, JavaScript, JSON, XML y SVG, reduciendo el consumo de ancho de banda hasta en un 70%.
- **Políticas de Caché Inteligente**:
  - Assets estáticos versionados (`/assets/` con hash único generado por Vite): Caché inmutable por 1 año (`max-age=31536000, immutable`).
  - `index.html`: `no-cache, no-store, must-revalidate` para garantizar que los usuarios reciban actualizaciones inmediatamente tras cada despliegue sin problemas de caché residual.
- **Enrutamiento SPA**: Directiva `try_files $uri $uri/ /index.html` para resolver de forma transparente las rutas dinámicas de cliente sin generar errores 404 en el servidor web.

---

<div align="center">
  <sub>SIMAP Universal Web Scraper & Intelligence Platform • Diseñado con React 18, Vite, TailwindCSS y FastAPI</sub>
</div>
