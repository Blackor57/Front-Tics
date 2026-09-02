"""
Configuración para desarrollo - Frontend
"""

# Configuración de la API
API_CONFIG = {
    # URL base de la API
    'BASE_URL': 'http://localhost:8000',
    
    # Endpoints disponibles
    'ENDPOINTS': {
        'scrape_index': '/api/v1/scrape/index',
        'scrape_deep': '/api/v1/scrape/deep',
        'full_pipeline': '/api/v1/scrape/full-pipeline',
    },
    
    # Timeouts (en milisegundos)
    'TIMEOUT': 120000,  # 2 minutos
    
    # Reintentos
    'RETRIES': 3,
    'RETRY_DELAY': 1000,  # 1 segundo entre reintentos
}

# URLs de ejemplo para testing
EXAMPLE_URLS = {
    'news_site': 'https://rpp.pe/',
    'article': 'https://rpp.pe/peru/actualidad',
}

# Configuración de interfaz
UI_CONFIG = {
    # Número máximo de URLs en deep scraping
    'MAX_DEEP_URLS': 10,
    
    # Límite máximo de artículos en pipeline
    'MAX_PIPELINE_LIMIT': 20,
    
    # Duración de alertas (ms)
    'ALERT_DURATION': 3000,
    'ERROR_DURATION': 5000,
}

# Configuración de logging
LOGGING_CONFIG = {
    # Habilitar logs en consola del navegador
    'ENABLED': True,
    
    # Nivel de log (DEBUG, INFO, WARN, ERROR)
    'LEVEL': 'DEBUG',
    
    # Mostrar timestamps
    'TIMESTAMPS': True,
}

# Tema y estilos
THEME_CONFIG = {
    # Colores principales
    'PRIMARY_COLOR': '#667eea',
    'SECONDARY_COLOR': '#764ba2',
    
    # Colores de estado
    'SUCCESS_COLOR': '#198754',
    'ERROR_COLOR': '#dc3545',
    'WARNING_COLOR': '#ffc107',
    'INFO_COLOR': '#0d6efd',
}

# Modo desarrollo
DEVELOPMENT_MODE = True

if __name__ == '__main__':
    print("Configuración de Frontend")
    print("=" * 50)
    for key, value in API_CONFIG.items():
        print(f"{key}: {value}")
