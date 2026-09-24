// Fron-Tics/src/services/chat.js
// Servicio del chatbot RAG de SIMAP: POST /chat y parseo del stream SSE.

export const CHATBOT_URL =
  import.meta.env.VITE_CHATBOT_URL || 'http://localhost:8501';

// Devuelve (o crea) el session_id persistente del usuario en localStorage.
export const getChatSessionId = () => {
  let sid = localStorage.getItem('simap_chat_session');
  if (!sid) {
    sid =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `session-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem('simap_chat_session', sid);
  }
  return sid;
};

export const resetChatSessionId = () => {
  localStorage.removeItem('simap_chat_session');
  return getChatSessionId();
};

// Parsea un bloque SSE ("event: x\ndata: {...}") en {event, data}.
const parseBlock = (block) => {
  const lines = block.trim().split('\n');
  let event = 'message';
  let raw = '';
  for (const line of lines) {
    if (line.startsWith('event:')) event = line.slice(6).trim();
    if (line.startsWith('data:')) raw = line.slice(5).trim();
  }
  let data = {};
  if (raw) {
    try {
      data = JSON.parse(raw);
    } catch {
      data = { content: raw };
    }
  }
  return { event, data };
};

// Envía un mensaje y devuelve un AsyncGenerator de eventos {event, data}.
export async function* chatStream(sessionId, message, { signal } = {}) {
  const response = await fetch(`${CHATBOT_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId, message }),
    signal,
  });

  if (!response.ok) {
    let detail = `HTTP ${response.status}`;
    try {
      const body = await response.json();
      detail = body.detail || body.message || detail;
    } catch {
      /* respuesta no JSON */
    }
    throw new Error(detail);
  }

  if (!response.body) {
    throw new Error('El navegador no soporta lectura de streams (ReadableStream).');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // Los eventos SSE están separados por doble salto de línea.
    const parts = buffer.split('\n\n');
    buffer = parts.pop() || '';
    for (const part of parts) {
      if (part.trim()) yield parseBlock(part);
    }
  }

  if (buffer.trim()) yield parseBlock(buffer);
}

export default {
  CHATBOT_URL,
  getChatSessionId,
  resetChatSessionId,
  chatStream,
};