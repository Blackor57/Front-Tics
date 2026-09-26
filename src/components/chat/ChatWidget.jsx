// Fron-Tics/src/components/chat/ChatWidget.jsx
// Widget de chat flotante para SIMAP: conecta al microservicio Chatbot (:8501)
import React, { useEffect, useState } from 'react';
import {
  Bot,
  X,
  Maximize2,
  Minimize2,
  RefreshCw,
  Eraser,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  checkChatbotHealth,
  CHATBOT_URL,
  getChatSessionId,
  resetChatSessionId,
  syncActiveContext,
  clearActiveContext,
} from '../../services/chat';
import { useAuth } from '../../context/AuthContext';

const AVAILABLE_MODELS = [
  { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash Lite (Nube)', badge: 'Gemini 3.1', provider: 'gemini' },
  { id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash (Nube)', badge: 'Gemini 3.8', provider: 'gemini' },
  { id: 'llama3.1:latest', name: 'Ollama LLaMA 3.1 (Local 8B)', badge: 'LLaMA 3.1', provider: 'ollama' },
  { id: 'llama3.2:3b', name: 'Ollama LLaMA 3.2 (Local 3B)', badge: 'LLaMA 3.2', provider: 'ollama' },
  { id: 'qwen2.5:3b', name: 'Ollama Qwen 2.5 (Local 3B)', badge: 'Qwen 2.5', provider: 'ollama' },
];

export const ChatWidget = ({ currentAnalysis }) => {
  const { isAuthenticated, user, token } = useAuth();
  const [open, setOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [healthStatus, setHealthStatus] = useState(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [selectedModel, setSelectedModel] = useState('gemini-3.1-flash-lite');
  const [resetCounter, setResetCounter] = useState(0);
  const [sessionId, setSessionId] = useState(getChatSessionId());

  const currentModel = AVAILABLE_MODELS.find((m) => m.id === selectedModel) || AVAILABLE_MODELS[0];

  // Sincronizar contexto activo de scraping en cuanto cambie el analisis en vivo
  useEffect(() => {
    if (currentAnalysis) {
      syncActiveContext(sessionId, currentAnalysis).then(() => {
        setIframeLoaded(false);
        setIframeKey((prev) => prev + 1);
      });
    }
  }, [currentAnalysis, sessionId]);

  // Recargar iframe al cambiar el estado de autenticacion
  useEffect(() => {
    setIframeLoaded(false);
    setIframeKey((prev) => prev + 1);
  }, [isAuthenticated, token]);

  const embedUrl = `${CHATBOT_URL}/?embed=true&model=${encodeURIComponent(
    selectedModel
  )}&provider=${currentModel.provider}&auth=${
    isAuthenticated ? '1' : '0'
  }&token=${encodeURIComponent(token || '')}&sid=${encodeURIComponent(
    sessionId
  )}&user=${encodeURIComponent(
    user?.nombre_completo || user?.email || ''
  )}${resetCounter > 0 ? `&reset=${resetCounter}` : ''}`;

  const verifyHealth = async () => {
    setIsCheckingHealth(true);
    try {
      const res = await checkChatbotHealth();
      setHealthStatus(res);
    } catch {
      setHealthStatus({ healthy: false });
    } finally {
      setIsCheckingHealth(false);
    }
  };

  // Verificar estado de conexion al montar y al abrir
  useEffect(() => {
    verifyHealth();
  }, []);

  useEffect(() => {
    if (open) {
      verifyHealth();
    }
  }, [open]);

  const handleRefresh = () => {
    setIframeLoaded(false);
    setIframeKey((prev) => prev + 1);
    verifyHealth();
  };

  const handleModelChange = (newModelId) => {
    setSelectedModel(newModelId);
    setIframeLoaded(false);
    setIframeKey((prev) => prev + 1);
    const chosen = AVAILABLE_MODELS.find((m) => m.id === newModelId);
    toast.info(`Cambiado a modelo ${chosen?.name || newModelId}`, {
      description: 'El copiloto ahora procesara las consultas con este motor.',
    });
  };

  const handleClearChat = async () => {
    const oldSid = sessionId;
    const newSid = resetChatSessionId();
    setSessionId(newSid);
    await clearActiveContext(oldSid);
    setIframeLoaded(false);
    setResetCounter((prev) => prev + 1);
    setIframeKey((prev) => prev + 1);
    toast.success('Conversacion reiniciada', {
      description: 'El historial del chat y el contexto activo han sido limpiados.',
    });
  };

  const isHealthy = healthStatus?.healthy ?? true;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      {/* Ventana Flotante del Chatbot */}
      {open && (
        <div
          className={`pointer-events-auto mb-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ease-in-out ${
            isExpanded
              ? 'w-[95vw] md:w-[860px] h-[86vh] max-h-[920px]'
              : 'w-[95vw] sm:w-[480px] md:w-[520px] h-[640px] max-h-[82vh]'
          }`}
          style={{
            boxShadow:
              '0 20px 40px -15px rgba(0, 0, 0, 0.3), 0 0 20px 0 rgba(79, 70, 229, 0.15)',
          }}
        >
          {/* Header Superior del Chatbot */}
          <div className="px-4 py-2.5 bg-gradient-to-r from-brand-600 via-indigo-600 to-slate-900 text-white flex items-center justify-between shadow-sm select-none">
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <div className="relative w-8 h-8 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20">
                <Bot className="w-4 h-4 text-white" />
                <span
                  className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-brand-600 ${
                    isHealthy ? 'bg-emerald-400' : 'bg-amber-400'
                  }`}
                />
              </div>

              <div className="min-w-0">
                <div className="flex items-center space-x-1.5">
                  <h3 className="text-sm font-bold leading-tight truncate">SIMAP Copiloto</h3>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-400/30 text-emerald-100 font-semibold border border-emerald-400/40">
                    {isAuthenticated ? 'Cuenta' : 'Invitado'}
                  </span>
                </div>

                {/* Selector de modelos en el header */}
                <div className="flex items-center space-x-1.5 mt-0.5">
                  <span className="text-[10px] text-white/80 shrink-0 font-medium">
                    {isHealthy ? 'En linea :8501' : 'Alerta :8501'}
                  </span>
                  <select
                    value={selectedModel}
                    onChange={(e) => handleModelChange(e.target.value)}
                    className="text-[10px] font-medium bg-black/25 hover:bg-black/35 text-white rounded-md px-1.5 py-0.5 border border-white/25 focus:outline-none focus:ring-1 focus:ring-white/50 cursor-pointer transition-colors max-w-[210px] truncate"
                    title="Alternar motor LLM (Google Gemini / Ollama Local)"
                  >
                    {AVAILABLE_MODELS.map((m) => (
                      <option key={m.id} value={m.id} className="bg-slate-900 text-slate-100 text-xs">
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Acciones del Header: Recargar, Limpiar, Maximizar, Cerrar */}
            <div className="flex items-center space-x-1 text-white/90 shrink-0 ml-2">
              <button
                onClick={handleRefresh}
                disabled={isCheckingHealth}
                className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                title="Recargar copiloto y verificar conexion"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${isCheckingHealth ? 'animate-spin' : ''}`}
                />
              </button>

              {/* Boton Limpiar en lugar de abrir en ventana completa */}
              <button
                onClick={handleClearChat}
                className="p-1.5 rounded-lg hover:bg-white/20 text-white/90 hover:text-white transition-colors"
                title="Limpiar conversacion y reiniciar chat"
              >
                <Eraser className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                title={isExpanded ? 'Restaurar tamano normal' : 'Maximizar ventana'}
              >
                {isExpanded ? (
                  <Minimize2 className="w-3.5 h-3.5" />
                ) : (
                  <Maximize2 className="w-3.5 h-3.5" />
                )}
              </button>

              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                title="Cerrar chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Cuerpo del Chatbot */}
          <div className="relative flex-1 w-full h-full bg-slate-50 dark:bg-slate-950 overflow-hidden flex flex-col">
            {isHealthy ? (
              <>
                {/* Loader mientras carga el iframe */}
                {!iframeLoaded && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-50/95 dark:bg-slate-900/95 p-6 text-center space-y-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center shadow-lg animate-pulse">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        Cargando {currentModel.name}...
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Conectando con el microservicio en puerto 8501
                      </p>
                    </div>
                  </div>
                )}

                {/* Iframe con la interfaz conversacional de Streamlit */}
                <iframe
                  key={iframeKey}
                  src={embedUrl}
                  title="SIMAP Chatbot Copiloto"
                  onLoad={() => setIframeLoaded(true)}
                  className="w-full h-full border-0"
                  allow="microphone; camera; clipboard-write;"
                />
              </>
            ) : (
              /* Fallback en caso de que el puerto 8501 no responda */
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                    Servicio en puerto 8501 no detectado
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[320px]">
                    El microservicio de Chatbot debe estar en ejecucion para procesar consultas inteligentes y de voz.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] text-left font-mono text-slate-700 dark:text-slate-300 w-full max-w-[320px]">
                  python -m streamlit run streamlit_app.py --server.port 8501
                </div>
                <button
                  onClick={verifyHealth}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-brand-600 hover:bg-brand-500 text-white transition flex items-center space-x-1.5 shadow-md shadow-brand-600/20"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isCheckingHealth ? 'animate-spin' : ''}`} />
                  <span>Reintentar conexion</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Boton Flotante Principal */}
      <button
        onClick={() => setOpen(!open)}
        className="pointer-events-auto relative group w-13 h-13 p-3.5 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-purple-600 text-white shadow-xl shadow-indigo-600/30 hover:shadow-glow-indigo hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
        title={open ? 'Cerrar asistente' : `Abrir Copiloto IA (${currentModel.badge})`}
      >
        {open ? (
          <X className="w-6 h-6 transition-transform rotate-0 group-hover:rotate-90" />
        ) : (
          <>
            <Bot className="w-6 h-6 transition-transform group-hover:scale-110" />
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isHealthy ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-3.5 w-3.5 border-2 border-white dark:border-slate-900 ${
                  isHealthy ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
            </span>
          </>
        )}
      </button>
    </div>
  );
};

export default ChatWidget;
