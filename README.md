# 🕷️ Web Scraper API - Frontend

Frontend moderno e interactivo para tu API de Web Scraping. Interfaz completa con soporte para tres modos de operación: extracción de índices, deep scraping y pipeline completo.

## 📋 Características

✅ **Interfaz moderna y responsiva** - Diseño limpio basado en Bootstrap 5
✅ **Tres modos de operación**:
   - Extraer Índice: Obtiene la lista de noticias de una portada
   - Deep Scraping: Extrae contenido completo de artículos individuales
   - Pipeline Completo: Ejecuta ambos procesos automáticamente
   
✅ **Indicador de conexión** - Verifica la disponibilidad de la API en tiempo real
✅ **Visualización intuitiva** - Resultados formateados con colores y estructura clara
✅ **Manejo de errores** - Alertas amigables con mensajes descriptivos
✅ **Validación de URLs** - Verifica que las URLs sean válidas antes de procesar
✅ **Interfaz responsiva** - Funciona en desktop, tablet y móviles

## Instalación y Uso

### 1. Asegúrate de que tu API está ejecutándose

```bash
# En la carpeta del proyecto
python -m uvicorn api:app --reload --host localhost --port 8000
```

La API debe estar disponible en: `http://localhost:8000`

### 2. Abre el frontend

- **Opción A (Recomendado):** Abre el archivo `index.html` directamente en tu navegador
- **Opción B:** Usa un servidor HTTP local (Python):
  ```bash
  cd frontend
  python -m http.server 8080
  ```
  Luego accede a: `http://localhost:8080`

### 3. Comienza a usar

1. **Verifica la conexión** - Deberías ver "Conectado" en la esquina superior derecha
2. **Selecciona una operación** en el panel izquierdo
3. **Ingresa los datos** requeridos
4. **Haz clic en el botón de acción**
5. **Visualiza los resultados** en el panel principal

## Guía de Operaciones

### 🔹 Extraer Índice

Extrae la lista de noticias/artículos de una portada.

**Pasos:**
1. Selecciona la pestaña "Extraer Índice"
2. Ingresa la URL de la portada (ej: `https://rpp.pe/`)
3. Haz clic en "Extraer"

**Resultado:**
- Título del sitio
- Tipo de contenido detectado
- Total de items encontrados
- Datos en formato JSON o texto

### 🔹 Deep Scraping

Extrae el contenido completo de uno o múltiples artículos.

**Pasos:**
1. Selecciona la pestaña "Deep Scraping"
2. Ingresa una o más URLs de artículos
3. Usa el botón "+ Agregar URL" para añadir más artículos
4. Haz clic en "Procesar"

**Resultado:**
- Total de artículos procesados
- Contenido de cada artículo en Markdown
- Cantidad de caracteres por artículo

### 🔹 Pipeline Completo

Ejecuta automáticamente extracción de índice + deep scraping de los artículos principales.

**Pasos:**
1. Selecciona la pestaña "Pipeline Completo"
2. Ingresa la URL de la portada
3. (Opcional) Ajusta el límite de artículos a procesar (1-20)
4. Haz clic en "Ejecutar"

**Resultado:**
- Estadísticas de indexación
- Listado completo de artículos con contenido

## 🔧 Configuración

### Cambiar la URL de la API

Abre `app.js` y modifica la siguiente línea:

```javascript
const API_BASE_URL = 'http://localhost:8000';
```

### CORS en Producción

En el archivo `api.py`, actualiza los orígenes permitidos:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://tudominio.com"],  # Especifica tus dominios
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Estructura de Archivos

```
frontend/
├── index.html          # Estructura HTML principal
├── styles.css          # Estilos y temas
├── app.js              # Lógica y conectividad con API
└── README.md           # Este archivo
```

## Estilos y Temas

El frontend utiliza:
- **Bootstrap 5** para estructura y componentes responsive
- **Font Awesome 6** para iconos
- **Gradiente personalizado** (#667eea a #764ba2) para el tema

### Personalizar colores

En `styles.css`, busca y modifica:
```css
/* Cambiar el gradiente principal */
.btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Cambiar color de acento */
.nav-pills .nav-link.active {
    background: linear-gradient(135deg, TU_COLOR_1 0%, TU_COLOR_2 100%);
}
```

## Solución de Problemas

### "Desconectado" en la esquina superior derecha
- Verifica que `api.py` está ejecutándose en `http://localhost:8000`
- Prueba accediendo a `http://localhost:8000/docs` en tu navegador

### Error CORS
- Asegúrate de tener habilitado el middleware CORS en `api.py`
- Verifica que `allow_origins=["*"]` está configurado (o especifica tu dominio)

### Las URLs no se validan correctamente
- Las URLs deben incluir el protocolo (`https://` o `http://`)
- Ejemplo válido: `https://rpp.pe/`
- Ejemplo inválido: `rpp.pe/`

### El contenido tardó mucho en cargar
- Las operaciones pueden tardar dependiendo del tamaño de la página
- Los timeouts se configuran en `config.py`
- Revisa la consola del navegador (F12) para más detalles

## API Endpoints

El frontend utiliza los siguientes endpoints:

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/v1/scrape/index` | Extraer índice de una portada |
| POST | `/api/v1/scrape/deep` | Deep scraping de artículos |
| POST | `/api/v1/scrape/full-pipeline` | Pipeline completo automático |

## Ejemplo de Respuesta

### Extraer Índice
```json
{
  "url": "https://rpp.pe/",
  "site_title": "RPP Noticias",
  "tipo_contenido": "lista_entidades",
  "total_items": 25,
  "data": [...]
}
```

### Deep Scraping
```json
{
  "total_procesados": 2,
  "articulos": [
    {
      "url": "https://rpp.pe/...",
      "titulo_detalle": "Título del artículo",
      "contenido_markdown": "# Contenido...",
      "caracteres": 1500
    }
  ]
}
```

## Consejos

1. **Usa el Pipeline Completo** para operaciones rápidas y simples
2. **Usa Deep Scraping manual** si necesitas procesar URLs específicas
3. **Ajusta el límite del Pipeline** según el rendimiento de tu máquina
4. **Revisa los logs del servidor** (donde ejecutas `uvicorn`) para diagnosticar problemas

## Contribuciones

Para reportar bugs o sugerir mejoras, contacta al desarrollador.

## Licencia

Mismo proyecto que la API Web Scraper.

---

**¡Disfruta usando tu Web Scraper Frontend!** 🎉
