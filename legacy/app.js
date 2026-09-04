// Configuración
const API_BASE_URL = 'http://localhost:8000';

// Estados
const state = {
    isLoading: false,
    apiConnected: false,
};

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    checkAPIConnection();
});

// Verificar conexión con API
async function checkAPIConnection() {
    try {
        const response = await fetch(`${API_BASE_URL}/docs`, { method: 'HEAD' });
        state.apiConnected = response.ok;
        updateAPIStatus();
    } catch (error) {
        state.apiConnected = false;
        updateAPIStatus();
    }
}

// Actualizar estado de la API
function updateAPIStatus() {
    const statusEl = document.getElementById('api-status');
    if (state.apiConnected) {
        statusEl.classList.remove('bg-danger');
        statusEl.classList.add('bg-success');
        statusEl.textContent = 'Conectado';
    } else {
        statusEl.classList.add('bg-danger');
        statusEl.classList.remove('bg-success');
        statusEl.textContent = 'Desconectado';
    }
}

// Inicializar event listeners
function initializeEventListeners() {
    // Formulario de índice
    document.getElementById('form-index').addEventListener('submit', handleScrapeIndex);

    // Formulario de deep scraping
    document.getElementById('form-deep').addEventListener('submit', handleScrapeDeep);
    document.getElementById('btn-add-url').addEventListener('click', addDeepScrapeURL);
    document.addEventListener('click', (e) => {
        if (e.target.closest('.btn-remove-url')) {
            e.target.closest('.input-group').remove();
        }
    });

    // Formulario de pipeline completo
    document.getElementById('form-pipeline').addEventListener('submit', handleFullPipeline);
    
    // Al presionar Enter en el campo URL del pipeline, ejecutar automáticamente
    document.getElementById('url-pipeline').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            document.getElementById('form-pipeline').dispatchEvent(new Event('submit'));
        }
    });

    // Inicializar formulario de deep scraping
    addDeepScrapeURL();
    
    // Enfocar en el campo URL al cargar
    setTimeout(() => {
        document.getElementById('url-pipeline').focus();
    }, 100);
    
    // Botones para aumentar/disminuir límite
    document.getElementById('btn-limit-minus').addEventListener('click', () => {
        const input = document.getElementById('limit-pipeline');
        if (input.value > 1) {
            input.value = parseInt(input.value) - 1;
        }
    });
    
    document.getElementById('btn-limit-plus').addEventListener('click', () => {
        const input = document.getElementById('limit-pipeline');
        if (input.value < 20) {
            input.value = parseInt(input.value) + 1;
        }
    });
}

// ============================================
// Funciones de manejo de formularios
// ============================================

// Manejo: Extraer Índice
async function handleScrapeIndex(e) {
    e.preventDefault();
    const url = document.getElementById('url-index').value;

    if (!validateURL(url)) {
        showError('Por favor ingresa una URL válida');
        return;
    }

    setLoading(true, 'Extrayendo índice...');

    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/scrape/index`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Error en la API');
        }

        const data = await response.json();
        displayIndexResult(data);
        showSuccess('Índice extraído correctamente');
    } catch (error) {
        console.error('Error:', error);
        showError(error.message);
    } finally {
        setLoading(false);
    }
}

// Manejo: Deep Scraping
async function handleScrapeDeep(e) {
    e.preventDefault();

    const urls = Array.from(document.querySelectorAll('.deep-url-input'))
        .map(input => input.value.trim())
        .filter(url => url.length > 0);

    if (urls.length === 0) {
        showError('Por favor ingresa al menos una URL');
        return;
    }

    if (!urls.every(validateURL)) {
        showError('Una o más URLs no son válidas');
        return;
    }

    setLoading(true, 'Procesando deep scraping...');

    try {
        const items = urls.map(url => ({ url, titulo: null }));

        const response = await fetch(`${API_BASE_URL}/api/v1/scrape/deep`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ items }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Error en la API');
        }

        const data = await response.json();
        displayDeepScrapeResult(data);
        showSuccess('Deep scraping completado correctamente');
    } catch (error) {
        console.error('Error:', error);
        showError(error.message);
    } finally {
        setLoading(false);
    }
}

// Manejo: Pipeline Completo
async function handleFullPipeline(e) {
    e.preventDefault();
    const url = document.getElementById('url-pipeline').value;
    const limit = parseInt(document.getElementById('limit-pipeline').value) || 5;

    if (!validateURL(url)) {
        showError('Por favor ingresa una URL válida');
        return;
    }

    setLoading(true, `Extrayendo portada y ${limit} artículos...`);

    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/scrape/full-pipeline`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url, limit }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Error en la API');
        }

        const data = await response.json();
        displayPipelineResult(data);
        showSuccess(`Se extrajeron ${data.total_procesados_profundidad} artículos correctamente`);
    } catch (error) {
        console.error('Error:', error);
        showError(error.message);
    } finally {
        setLoading(false);
    }
}

// ============================================
// Funciones de visualización de resultados
// ============================================

// Mostrar resultado de índice
function displayIndexResult(data) {
    const template = document.getElementById('template-index-result');
    const clone = template.content.cloneNode(true);

    // Rellenar datos
    const linkEl = clone.querySelector('#result-url');
    linkEl.href = data.url;
    linkEl.textContent = data.url;

    clone.querySelector('#result-site-title').textContent = data.site_title;
    clone.querySelector('#result-tipo-contenido').textContent = data.tipo_contenido;
    clone.querySelector('#result-total-items').textContent = data.total_items;

    // Mostrar datos (JSON formateado o texto)
    const dataEl = clone.querySelector('#result-data');
    if (typeof data.data === 'object') {
        dataEl.textContent = JSON.stringify(data.data, null, 2);
    } else {
        dataEl.textContent = data.data;
    }

    // Agregar al contenedor de resultados
    clearResults();
    document.getElementById('results-container').appendChild(clone);
}

// Mostrar resultado de deep scraping
function displayDeepScrapeResult(data) {
    const template = document.getElementById('template-deep-result');
    const clone = template.content.cloneNode(true);

    clone.querySelector('#result-deep-total').textContent = data.total_procesados;

    const articlesContainer = clone.querySelector('#result-articles-container');
    data.articulos.forEach(articulo => {
        const articleEl = createArticleElement(articulo);
        articlesContainer.appendChild(articleEl);
    });

    clearResults();
    document.getElementById('results-container').appendChild(clone);
}

// Mostrar resultado de pipeline completo
function displayPipelineResult(data) {
    const template = document.getElementById('template-pipeline-result');
    const clone = template.content.cloneNode(true);

    const linkEl = clone.querySelector('#pipeline-url');
    linkEl.href = data.url_origen;
    linkEl.textContent = data.url_origen;

    clone.querySelector('#pipeline-site-title').textContent = data.sitio_titulo;
    clone.querySelector('#pipeline-indexed').textContent = data.total_indexados;
    clone.querySelector('#pipeline-processed').textContent = data.total_procesados_profundidad;

    const articlesContainer = clone.querySelector('#pipeline-articles-container');
    data.articulos.forEach(articulo => {
        const articleEl = createArticleElement(articulo);
        articlesContainer.appendChild(articleEl);
    });

    clearResults();
    document.getElementById('results-container').appendChild(clone);
}

// Crear elemento de artículo
function createArticleElement(articulo) {
    const template = document.getElementById('template-article');
    const clone = template.content.cloneNode(true);

    const titleEl = clone.querySelector('#article-title');
    titleEl.textContent = articulo.titulo_detalle || articulo.titulo || 'Sin título';

    const urlEl = clone.querySelector('#article-url');
    const linkEl = document.createElement('a');
    linkEl.href = articulo.url;
    linkEl.target = '_blank';
    linkEl.textContent = articulo.url;
    urlEl.appendChild(linkEl);

    // Renderizar Markdown a HTML sanitizado
    const contentEl = clone.querySelector('#article-content');
    if (articulo.contenido_markdown) {
        const rawHtml = marked.parse(articulo.contenido_markdown);
        contentEl.innerHTML = DOMPurify.sanitize(rawHtml);
    } else {
        contentEl.textContent = 'Sin contenido';
    }

    clone.querySelector('#article-chars').textContent = articulo.caracteres || 0;

    return clone;
}

// ============================================
// Funciones auxiliares
// ============================================

// Validar URL
function validateURL(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

// Mostrar loading
function setLoading(isLoading, message = 'Cargando...') {
    const container = document.getElementById('loading-container');
    const text = document.getElementById('loading-text');

    state.isLoading = isLoading;

    if (isLoading) {
        text.textContent = message;
        container.classList.remove('d-none');
        document.getElementById('error-container').classList.add('d-none');
        document.getElementById('success-container').classList.add('d-none');
    } else {
        container.classList.add('d-none');
    }
}

// Mostrar error
function showError(message) {
    const container = document.getElementById('error-container');
    const text = document.getElementById('error-text');

    text.textContent = message;
    container.classList.remove('d-none', 'fade');
    container.classList.add('show');

    // Auto-desaparecer después de 5 segundos
    setTimeout(() => {
        container.classList.remove('show');
        setTimeout(() => container.classList.add('d-none'), 150);
    }, 5000);
}

// Mostrar éxito
function showSuccess(message) {
    const container = document.getElementById('success-container');
    const text = document.getElementById('success-text');

    text.textContent = message;
    container.classList.remove('d-none', 'fade');
    container.classList.add('show');

    // Auto-desaparecer después de 3 segundos
    setTimeout(() => {
        container.classList.remove('show');
        setTimeout(() => container.classList.add('d-none'), 150);
    }, 3000);
}

// Limpiar resultados
function clearResults() {
    document.getElementById('results-container').innerHTML = '';
}

// ============================================
// Funciones específicas de Deep Scraping
// ============================================

// Agregar URL a deep scraping
function addDeepScrapeURL() {
    const container = document.getElementById('deep-urls-container');

    const inputGroup = document.createElement('div');
    inputGroup.className = 'input-group mb-2';
    inputGroup.innerHTML = `
        <input type="url" class="form-control deep-url-input" placeholder="URL del artículo">
        <button class="btn btn-outline-danger btn-remove-url" type="button">
            <i class="fas fa-trash"></i>
        </button>
    `;

    container.appendChild(inputGroup);
}

// Verificar conexión periódicamente
setInterval(() => {
    checkAPIConnection();
}, 30000); // Cada 30 segundos

// Event listener para CORS
window.addEventListener('error', (event) => {
    if (event.message && event.message.includes('CORS')) {
        showError('Error CORS: Asegúrate de que el servidor tiene CORS habilitado');
    }
});
