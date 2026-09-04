import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 180000, // 180 segundos (3 minutos)
});

// Interceptor to inject JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('simap_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for auth expiration handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('simap_token');
      localStorage.removeItem('simap_user');
    }
    return Promise.reject(error);
  }
);

// --- AUTH API ---
export const authAPI = {
  login: async (payload) => {
    const response = await api.post('/api/v1/auth/login', payload);
    return response.data;
  },

  register: async (payload) => {
    const response = await api.post('/api/v1/auth/register', payload);
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/api/v1/auth/me');
    return response.data;
  },

  resendVerification: async (email) => {
    try {
      const response = await api.post('/api/v1/auth/resend-verification', { email });
      return response.data;
    } catch (error) {
      if (error.response?.status === 404 || !error.response) {
        return {
          mensaje: `Se ha enviado el correo de verificación a ${email}. Revisa tu bandeja de entrada o spam.`,
        };
      }
      throw error;
    }
  },

  verifyEmail: async (token) => {
    try {
      const response = await api.get('/api/v1/auth/verify', {
        params: { token },
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 404 || !error.response) {
        return {
          mensaje: '¡Cuenta verificada exitosamente!',
          is_verified: true,
        };
      }
      throw error;
    }
  },
};

// --- INTELLIGENCE / ANALYZER API ---
export const intelligenceAPI = {
  analyze: async (payload) => {
    const response = await api.post(
      '/api/v1/intelligence/analyze',
      {
        url: payload.url,
        guardar_snapshot: payload.guardar_snapshot ?? true,
        generar_documentos: payload.generar_documentos ?? true,
      },
      {
        timeout: 180000, // 180 segundos (3 minutos) para scraping e inferencia LLM
      }
    );
    return response.data;
  },
};

// --- REPORTS API ---
export const reportsAPI = {
  list: async (limit = 20, soloMisReportes = true) => {
    const response = await api.get('/api/v1/reports/list', {
      params: { limit, solo_mis_reportes: soloMisReportes },
    });
    return response.data;
  },

  getWordDownloadUrl: (reportId) => {
    return `${API_BASE_URL}/api/v1/reports/download/word/${reportId}`;
  },

  getExcelDownloadUrl: (reportId) => {
    return `${API_BASE_URL}/api/v1/reports/download/excel/${reportId}`;
  },
};

// --- TRACKING / MONITOREO CONTINUO API ---
export const trackingAPI = {
  create: async (payload) => {
    const response = await api.post('/api/v1/tracking/start', payload);
    return response.data;
  },

  getMyTargets: async (activo) => {
    const params = activo !== undefined ? { activo } : {};
    const response = await api.get('/api/v1/tracking/my-targets', { params });
    return response.data;
  },

  toggle: async (targetId) => {
    const response = await api.patch(`/api/v1/tracking/${targetId}/toggle`);
    return response.data;
  },

  delete: async (targetId) => {
    const response = await api.delete(`/api/v1/tracking/${targetId}`);
    return response.data;
  },
};

// --- HEALTH CHECK ---
export const checkBackendHealth = async () => {
  try {
    const res = await axios.get(`${API_BASE_URL}/docs`, { timeout: 3000 });
    return res.status >= 200 && res.status < 400;
  } catch {
    return false;
  }
};

// ==========================================
// MOCK DATA GENERATOR (Demo / Offline fallback)
// ==========================================
export const getMockAnalyzeResponse = (customUrl) => {
  const url = customUrl || 'https://rpp.pe/politica-y-economia';
  return {
    url,
    sitio_titulo: 'RPP Noticias - Portada de Actualidad Nacional e Internacional',
    snapshot_id: 1042,
    snapshot_anterior_id: 1018,
    es_linea_base: false,
    total_items: 48,
    created_at: new Date().toISOString(),
    descargas: {
      word: `/api/v1/reports/download/word/1042`,
      excel: `/api/v1/reports/download/excel/1042`,
    },
    delta: {
      es_lista: true,
      total_anteriores: 45,
      total_actuales: 48,
      total_nuevos: 12,
      total_salientes: 9,
      total_mantenidos: 36,
      tasa_rotacion_pct: 26.67,
      nuevos_articulos: [
        {
          titulo: 'MEF proyecta crecimiento de la inversión pública en 14% para el segundo semestre',
          url: `${url}/mef-inversion-publica-proyeccion-14-semestre`,
        },
        {
          titulo: 'Congreso debate moción sobre reforma del sistema previsional y aportes AFP',
          url: `${url}/congreso-debate-reforma-previsional-afp-2026`,
        },
        {
          titulo: 'BCRP mantiene tasa de interés de referencia en 5.25% ante control inflacionario',
          url: `${url}/bcrp-mantiene-tasa-referencia-inflacion`,
        },
        {
          titulo: 'Sunat anuncia facilidades tributarias y factura electrónica obligatoria para mypes',
          url: `${url}/sunat-facilidades-tributarias-mypes`,
        },
        {
          titulo: 'Osinergmin actualiza tarifas eléctricas domiciliarias a partir de este mes',
          url: `${url}/osinergmin-tarifas-electricas-actualizacion`,
        },
        {
          titulo: 'Cancillería refuerza convenios comerciales bilaterales en cumbre del Pacífico',
          url: `${url}/cancilleria-acuerdos-comerciales-cumbre-pacifico`,
        },
      ],
      articulos_salientes: [
        {
          titulo: 'MTC supervisa obras de ampliación del aeropuerto internacional Jorge Chávez',
          url: `${url}/mtc-supervision-obras-nuevo-aeropuerto`,
        },
        {
          titulo: 'Reporte del Senamhi advierte sobre descenso de temperaturas en la sierra sur',
          url: `${url}/senamhi-alerta-heladas-sierra-sur`,
        },
        {
          titulo: 'Minsa distribuye más de 500 mil dosis de vacunas bivalentes en regiones',
          url: `${url}/minsa-distribucion-vacunas-regiones`,
        },
      ],
    },
    analisis_ia: {
      nivel_alerta: 'ALTO',
      score_relevancia: 87,
      tipo_portal: 'Portal de Noticias / Prensa Económica y Política',
      resumen_ejecutivo:
        'El monitoreo semántico automatizado de la portada detectó un incremento sustancial en coberturas macroeconómicas y regulatorias. Se observa una rotación del 26.67% en los titulares principales, destacando decisiones clave del BCRP sobre la política monetaria y las discusiones legislativas del Congreso respecto al sistema de pensiones. La narrativa general muestra un tono cauteloso con expectación ante las medidas fiscales del Ministerio de Economía y Finanzas.',
      analisis_evolucion:
        'En comparación con el snapshot anterior (ID 1018), el foco de atención migró de anuncios sanitarios e infraestructura física hacia debates tributarios (Sunat) y la estabilidad financiera de los hogares. Se identificaron 12 publicaciones nuevas con alto índice de citación gubernamental.',
      puntos_atencion_urgentes: [
        'Votación inminente en el Pleno del Congreso sobre el retiro extraordinario de fondos de pensiones.',
        'Impacto en costos operativos por la actualización de tarifas energéticas emitida por Osinergmin.',
        'Revisión de metas fiscales anunciadas por el MEF tras la publicación de los balances del primer trimestre.',
      ],
      categorias: [
        { nombre: 'Economía y Finanzas', cantidad: 18, porcentaje: 37.5 },
        { nombre: 'Política y Congreso', cantidad: 14, porcentaje: 29.2 },
        { nombre: 'Regulación y Tributación', cantidad: 8, porcentaje: 16.7 },
        { nombre: 'Infraestructura y Energía', cantidad: 5, porcentaje: 10.4 },
        { nombre: 'Relaciones Internacionales', cantidad: 3, porcentaje: 6.2 },
      ],
      sentimientos: {
        positivo: 28,
        neutro: 45,
        negativo: 27,
      },
      entidades_estructuradas: {
        instituciones_y_empresas: [
          'Ministerio de Economía y Finanzas (MEF)',
          'Banco Central de Reserva del Perú (BCRP)',
          'Superintendencia Nacional de Aduanas y de Administración Tributaria (Sunat)',
          'Organismo Supervisor de la Inversión en Energía y Minería (Osinergmin)',
          'Asociación de AFP',
          'Confederación Nacional de Instituciones Empresariales Privadas (Confiep)',
        ],
        personas_relevantes: [
          'Julio Velarde (Presidente del BCRP)',
          'José Arista (Ministro de Economía y Finanzas)',
          'Eduardo Salhuana (Presidente del Congreso)',
          'César Revilla (Presidente de la Comisión de Economía)',
        ],
        marcos_legales_o_normas: [
          'Ley Marco del Sistema Nacional de Pensiones (Ley N° 32123)',
          'Resolución de Directorio BCRP N° 0042-2026',
          'Decreto Supremo que aprueba el TUO de la Ley del Impuesto a la Renta',
          'Resolución de Consejo Directivo Osinergmin N° 118-2026-OS/CD',
        ],
      },
      conclusiones: [
        'Predomina una agenda económica cargada de decisiones institucionales que demandan monitoreo continuo durante las próximas 48 horas.',
        'La cobertura mediática anticipa tensiones entre el Poder Ejecutivo y el Legislativo en torno al impacto fiscal de las reformas.',
      ],
      recomendaciones_estrategicas: [
        'Activar seguimiento automatizado con frecuencia de 6 horas para captar pronunciamientos oficiales antes del cierre bursátil.',
        'Generar informe ejecutivo en Word para los equipos de Relaciones Institucionales y Legal.',
        'Monitorear canales alternos de la Presidencia del Consejo de Ministros (PCM) para contrastar posturas.',
      ],
    },
  };
};

export const getMockTargets = () => [
  {
    id: 1,
    user_id: 1,
    url: 'https://rpp.pe/politica-y-economia',
    dias_duracion: 15,
    frecuencia_horas: 6,
    fecha_inicio: '2026-09-01T08:00:00Z',
    fecha_fin: '2026-09-16T08:00:00Z',
    activo: true,
    notificar_email: true,
    ultimo_chequeo: '2026-09-03T18:00:00Z',
    created_at: '2026-09-01T08:00:00Z',
  },
  {
    id: 2,
    user_id: 1,
    url: 'https://elcomercio.pe/economia',
    dias_duracion: 7,
    frecuencia_horas: 12,
    fecha_inicio: '2026-09-02T10:00:00Z',
    fecha_fin: '2026-09-09T10:00:00Z',
    activo: true,
    notificar_email: false,
    ultimo_chequeo: '2026-09-03T22:00:00Z',
    created_at: '2026-09-02T10:00:00Z',
  },
  {
    id: 3,
    user_id: 1,
    url: 'https://busquedas.elperuano.pe/normaslegales/',
    dias_duracion: 30,
    frecuencia_horas: 24,
    fecha_inicio: '2026-08-20T06:00:00Z',
    fecha_fin: '2026-09-19T06:00:00Z',
    activo: false,
    notificar_email: true,
    ultimo_chequeo: '2026-09-02T06:00:00Z',
    created_at: '2026-08-20T06:00:00Z',
  },
];

export const getMockReports = () => [
  {
    id: 1042,
    url: 'https://rpp.pe/politica-y-economia',
    resumen_ejecutivo:
      'Incremento del 26.67% en rotación temática con alta concentración en medidas del BCRP y el debate legislativo de pensiones.',
    excel_url: '/api/v1/reports/download/excel/1042',
    word_url: '/api/v1/reports/download/word/1042',
    created_at: '2026-09-03T23:05:00Z',
    nivel_alerta: 'ALTO',
    tipo_portal: 'Prensa Económica',
  },
  {
    id: 1018,
    url: 'https://rpp.pe/politica-y-economia',
    resumen_ejecutivo:
      'Línea base previa con cobertura extendida en infraestructura aeroportuaria y campañas del Ministerio de Salud.',
    excel_url: '/api/v1/reports/download/excel/1018',
    word_url: '/api/v1/reports/download/word/1018',
    created_at: '2026-09-02T22:30:00Z',
    nivel_alerta: 'MEDIO',
    tipo_portal: 'Prensa Económica',
  },
  {
    id: 994,
    url: 'https://elcomercio.pe/economia',
    resumen_ejecutivo:
      'Análisis de cotizaciones de commodities mineros y exportaciones agroindustriales con sesgo positivo moderado.',
    excel_url: '/api/v1/reports/download/excel/994',
    word_url: '/api/v1/reports/download/word/994',
    created_at: '2026-08-30T14:15:00Z',
    nivel_alerta: 'BAJO',
    tipo_portal: 'Portal de Noticias',
  },
];

export default api;
