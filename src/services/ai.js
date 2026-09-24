import api from './api';

// --- SIMAP AI: RAG, Transcripción y Agente de Monitoreo Autónomo ---
export const aiAPI = {
  // Asistente RAG: responder preguntas sobre datos scrapeados
  ask: async (payload) => {
    const response = await api.post('/api/v1/ai/ask', {
      question: payload.question,
      url: payload.url || null,
      top_k: payload.top_k ?? 5,
      dias: payload.dias ?? 30,
      contexto_extra: payload.contexto_extra || null,
      temperatura: payload.temperatura ?? 0.2,
    }, { timeout: 180000 });
    return response.data;
  },

  // Transcripción de medios (faster-whisper + Ollama)
  transcribe: async (payload) => {
    const response = await api.post('/api/v1/ai/transcribe', {
      media_url: payload.media_url || null,
      pagina_origen: payload.pagina_origen || null,
      idioma: payload.idioma || 'es',
      resumir: payload.resumir ?? true,
      incluir_segmentos: payload.incluir_segmentos ?? false,
      modelo_whisper: payload.modelo_whisper || null,
    }, { timeout: 600000 });
    return response.data;
  },

  // Detección de URLs de audio/video en datos scrapeados
  detectMedia: async (datos, maxResultados = 10) => {
    const response = await api.post('/api/v1/ai/media/detect', {
      datos,
      max_resultados: maxResultados,
    }, { timeout: 60000 });
    return response.data;
  },

  // Agente: procesar contexto de novedades ya detectadas
  agentProcess: async (payload) => {
    const response = await api.post('/api/v1/ai/agent/process', {
      contexto: payload.contexto,
      instrucciones: payload.instrucciones || null,
      url_fuente: payload.url_fuente || null,
      destinatario: payload.destinatario || null,
    }, { timeout: 300000 });
    return response.data;
  },

  // Agente: ciclo completo scrape + delta + decisión autónoma
  agentRunOnUrl: async (payload) => {
    const response = await api.post('/api/v1/ai/agent/run-on-url', {
      url: payload.url,
      instrucciones: payload.instrucciones || null,
      destinatario: payload.destinatario || null,
    }, { timeout: 300000 });
    return response.data;
  },

  // Historial de eventos del agente
  agentEvents: async (limit = 30, canal = null) => {
    const params = { limit };
    if (canal) params.canal = canal;
    const response = await api.get('/api/v1/ai/agent/events', { params });
    return response.data;
  },
};

export default aiAPI;