// Fron-Tics/src/components/chat/ChatWidget.jsx
// Widget de chat flotante para SIMAP: conecta al chatbot RAG vía SSE.
import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Bot,
  Send,
  X,
  Loader2,
  MessageCircleQuestion,
  Eraser,
} from 'lucide-react';
import { chatStream, getChatSessionId, resetChatSessionId } from '../../services/chat';

const INTENT_LABELS = {
  factual: 'Datos',
  busqueda: 'Búsqueda semántica',
  comparacion: 'Comparación',
  resumen: 'Resumen',
  estado: 'Estado',
  accion: 'Acción',
};

export const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [intent, setIntent] = useState(null);
  const [error, setError] = useState(null);
  const controllerRef = useRef(null);
  const listRef = useRef(null);

  const appendMessage = (msg) =>
    setMessages((prev) => [...prev, msg]);

  const updateAssistant = (updater) =>
    setMessages((prev) => {
      const next = [...prev];
      const last = next[next.length - 1];
      if (last && last.role === 'assistant') {
        next[next.length - 1] = { ...last, ...updater(last) };
      } else {
        next.push({ role: 'assistant', content: '', ...updater });
      }
      return next;
    });

  // Auto-scroll al último mensaje
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, busy]);

  const stopStream = () => {
    if (controllerRef.current) controllerRef.current.abort();
    setBusy(false);
    setIntent(null);
  };

  const sendMessage = async (text) => {
    const content = (text ?? input).trim();
    if (!content || busy) return;
    setInput('');
    setError(null);
    setIntent(null);

    appendMessage({ role: 'user', content });
    appendMessage({ role: 'assistant', content: '', streaming: true });
    setBusy(true);

    const controller = new AbortController();
    controllerRef.current = controller;
    let accumulated = '';

    try {
      const sessionId = getChatSessionId();
      for await (const { event, data } of chatStream(sessionId, content, {
        signal: controller.signal,
      })) {
        if (event === 'intent' && data.intent) {
          setIntent(data.intent);
        }
        if (event === 'source') {
          /* diagnóstico opcional: data.kind / data.filas */
        }
        if (event === 'token' && typeof data.content === 'string') {
          accumulated += data.content;
          updateAssistant(() => ({ content: accumulated }));
        }
        if (event === 'done') {
          updateAssistant(() => ({ content: accumulated, streaming: false }));
          setBusy(false);
        }
        if (event === 'error') {
          setError(data.message || 'Error del servidor.');
          updateAssistant(() => ({
            content: data.message || 'Error procesando tu consulta.',
            streaming: false,
          }));
          setBusy(false);
        }
      }
    } catch (e) {
      if (e.name !== 'AbortError') {
        setError(e.message || 'No se pudo conectar con el chatbot.');
        updateAssistant(() => ({
          content: `⚠️ **Error:** ${e.message || 'Sin conexión con el chatbot en :8501'}`,
          streaming: false,
        }));
      }
    } finally {
      controllerRef.current = null;
      // Si el stream terminó sin evento done, cerrar el estado streaming.
      setBusy((prev) => {
        if (prev) {
          updateAssistant(() => ({ content: accumulated, streaming: false }));
        }
        return false;
      });
      setIntent(null);
    }
  };

  const clearConversation = () => {
    resetChatSessionId();
    setMessages([]);
    setError(null);
    setIntent(null);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {open && (
        <div className="w-[360px] max-w-[calc(100vw-2rem)] h-[480px] mb-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 fade-in">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-brand-600 to-indigo-600 text-white">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold leading-tight">SIMAP Copiloto</p>
                <p className="text-[10px] text-white/80 leading-tight">
                  Consulta los datos monitoreados (PostgreSQL + IA local)
                </p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-white/20" title="Minimizar">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tollbar de contexto */}
          <div className="flex items-center justify-between px-3 py-1.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 dark:text-slate-400">
            {intent ? (
              <span className="flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
                <span>Procesando: {INTENT_LABELS[intent] || intent}</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Motor: Ollama qwen2.5:3b + pgvector</span>
              </span>
            )}
            <button onClick={clearConversation} className="flex items-center space-x-1 hover:text-rose-500 transition-colors" title="Nueva conversación">
              <Eraser className="w-3 h-3" />
              <span>Limpiar</span>
            </button>
          </div>

          {/* Mensajes */}
          <div ref={listRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
            {messages.length === 0 && (
              <div className="text-center text-xs text-slate-400 dark:text-slate-500 mt-8 px-4 space-y-2">
                <Bot className="w-10 h-10 mx-auto text-brand-400" />
                <p className="font-semibold text-slate-600 dark:text-slate-300">
                  Hola, soy tu copiloto de monitoreo.
                </p>
                <p>Pregúntame sobre los datos que ya se scrappearon:</p>
                <div className="space-y-1.5 pt-1">
                  {[
                    '¿Qué cambios hubo esta semana?',
                    '¿Cuál es el estado de las páginas?',
                    'Resume las novedades de la última revisión',
                    '¿Qué alertas graves existen?',
                  ].map((s) => (
                    <button
                      key={s}
                      onClick={() => sendMessage(s)}
                      disabled={busy}
                      className="block w-full text-left px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-brand-400 hover:text-brand-600 dark:hover:text-brand-300 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-[13px] leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white rounded-br-sm'
                      : 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-bl-sm'
                  }`}
                >
                  {m.role === 'assistant' ? (
                    m.content ? (
                      <div className="chat-markdown">
                        <ReactMarkdown>{m.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <span className="inline-flex items-center space-x-1.5 text-slate-400">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>{m.streaming ? 'Pensando…' : ''}</span>
                      </span>
                    )
                  ) : (
                    m.content
                  )}
                </div>
              </div>
            ))}

            {error && (
              <p className="text-[11px] text-rose-500 text-center">
                {error} — el servicio de chat debe estar corriendo en el puerto 8501.
              </p>
            )}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="border-t border-slate-200 dark:border-slate-700 p-2 flex items-center gap-1.5"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu consulta…"
              className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
              disabled={busy}
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              className="p-2 rounded-lg bg-gradient-to-r from-brand-600 to-indigo-600 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:from-brand-500 hover:to-indigo-500 transition-all"
              title="Enviar"
            >
              {busy ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>
        </div>
      )}

      {/* Botón flotante */}
      <button
        onClick={() => (open ? stopStream() : setOpen(true))}
        className="w-14 h-14 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 text-white shadow-lg shadow-brand-600/40 hover:shadow-glow-indigo transition-all flex items-center justify-center"
        title={open ? 'Cerrar chat' : 'Abrir chatbot'}
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircleQuestion className="w-6 h-6" />}
      </button>
    </div>
  );
};