// Fron-Tics/src/services/chat.js
// Servicio del chatbot RAG de SIMAP (:8501)

export const CHATBOT_URL =
  import.meta.env.VITE_CHATBOT_URL || 'http://localhost:8501';

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Devuelve (o crea) el session_id persistente del usuario en localStorage.
export const getChatSessionId = () => {
  let sid = localStorage.getItem('simap_chat_session');
  if (!sid) {
    sid =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : 'session-' + Date.now() + '-' + Math.random().toString(36).slice(2);
    localStorage.setItem('simap_chat_session', sid);
  }
  return sid;
};

// Genera un nuevo session_id único y lo guarda en localStorage
export const resetChatSessionId = () => {
  const newSid =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : 'session-' + Date.now() + '-' + Math.random().toString(36).slice(2);
  localStorage.setItem('simap_chat_session', newSid);
  return newSid;
};

// Comprueba la salud del microservicio de Chatbot (:8501)
// Usa modo no-cors para evitar bloqueos por políticas del navegador contra Streamlit
export const checkChatbotHealth = async () => {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500);

    await fetch(CHATBOT_URL + '/_stcore/health', {
      method: 'GET',
      mode: 'no-cors',
      signal: controller.signal,
    });
    clearTimeout(timer);
    return {
      healthy: true,
      service: 'simap_chatbot_service',
      port: 8501,
      engine: 'gemini-3.1-flash-lite',
    };
  } catch (err) {
    return { healthy: false, error: err.message };
  }
};

// Sincroniza el resultado del scraping activo con el Backend para que el Chatbot lo use de inmediato
export const syncActiveContext = async (sessionId, analysisData) => {
  if (!sessionId || !analysisData) return null;
  try {
    const payload = {
      session_id: sessionId,
      url: analysisData.url || '',
      site_title: analysisData.sitio_titulo || analysisData.site_title || 'Página Web',
      total_items: analysisData.total_items || (Array.isArray(analysisData.data) ? analysisData.data.length : 0),
      items: analysisData.data || [],
      analisis_ia: analysisData.analisis_ia || {},
      delta: analysisData.delta || {},
      created_at: analysisData.created_at || null,
    };
    const res = await fetch(API_BASE_URL + '/api/v1/chat/active-context', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (err) {
    console.warn('Error sincronizando contexto activo con el chatbot:', err);
    return null;
  }
};

// Limpia el contexto activo de la sesión al reiniciar
export const clearActiveContext = async (sessionId) => {
  if (!sessionId) return;
  try {
    await fetch(API_BASE_URL + '/api/v1/chat/active-context/' + encodeURIComponent(sessionId), {
      method: 'DELETE',
    });
  } catch (err) {
    console.warn('Error limpiando contexto activo:', err);
  }
};

// Limpia el historial de memoria
export const clearChatSession = async (sessionId) => {
  await clearActiveContext(sessionId);
  return { ok: true };
};

export default {
  CHATBOT_URL,
  API_BASE_URL,
  getChatSessionId,
  resetChatSessionId,
  checkChatbotHealth,
  syncActiveContext,
  clearActiveContext,
  clearChatSession,
};
