import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Sparkles,
  RefreshCw,
  ExternalLink,
  Maximize2,
  Minimize2,
  Mic,
  Database,
  Zap,
  ShieldCheck,
  AlertCircle,
  Cpu,
} from 'lucide-react';
import { CHATBOT_URL, checkChatbotHealth } from '../../services/chat';

export const ChatbotAuditor = () => {
  const [iframeKey, setIframeKey] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [healthStatus, setHealthStatus] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const containerRef = useRef(null);

  const embedUrl = `${CHATBOT_URL}/?embed=true`;

  const verifyHealth = async () => {
    setIsChecking(true);
    try {
      const res = await checkChatbotHealth();
      setHealthStatus(res);
    } catch {
      setHealthStatus({ healthy: false });
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    verifyHealth();
    const interval = setInterval(verifyHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setIframeLoaded(false);
    setIframeKey((prev) => prev + 1);
    verifyHealth();
  };

  const isHealthy = healthStatus?.healthy ?? true;

  return (
    <div
      ref={containerRef}
      className={`space-y-4 transition-all duration-300 ${
        isFullScreen
          ? 'fixed inset-0 z-50 bg-slate-50 dark:bg-slate-950 p-4 overflow-hidden flex flex-col'
          : 'w-full max-w-7xl mx-auto'
      }`}
    >
      {/* Header y Control Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-purple-600 text-white shadow-glow-indigo">
            <Bot className="w-6 h-6 animate-pulse-slow" />
            <span
              className={`absolute -top-1 -right-1 flex h-3 w-3 rounded-full border-2 border-white dark:border-slate-900 ${
                isHealthy ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
            />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                SIMAP Chatbot Auditor Gemini
              </h1>
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Google Gemini 3.1 Flash Lite (Activo)</span>
              </span>
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30">
                <Cpu className="w-3 h-3" />
                <span>Ollama (Respaldo Offline)</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Microservicio 5 (:8501) · Auditoría RAG con Text-to-SQL, pgvector y entrada de micrófono por voz
            </p>
          </div>
        </div>

        {/* Acciones y Estado de Conexión */}
        <div className="flex items-center space-x-2 self-end lg:self-auto">
          <div
            className={`hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border ${
              isHealthy
                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isHealthy ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'
              }`}
            />
            <span>{isHealthy ? 'Servicio 8501 Conectado' : 'Sin respuesta en :8501'}</span>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isChecking}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium transition flex items-center space-x-1"
            title="Recargar interfaz del Chatbot"
          >
            <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Recargar</span>
          </button>

          <a
            href={CHATBOT_URL}
            target="_blank"
            rel="noreferrer"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium transition flex items-center space-x-1"
            title="Abrir en pestaña independiente"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="hidden sm:inline">Abrir pestaña</span>
          </a>

          <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium transition flex items-center space-x-1"
            title={isFullScreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
          >
            {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            <span className="hidden sm:inline">{isFullScreen ? 'Reducir' : 'Ampliar'}</span>
          </button>
        </div>
      </div>

      {/* Feature Highlights Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
        <div className="flex items-center space-x-2.5 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Mic className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold block text-slate-900 dark:text-white leading-tight">
              Voz Multimodal Nube
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Nativo con Google Gemini Flash Lite (Multimodal)
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2.5 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold block text-slate-900 dark:text-white leading-tight">
              PostgreSQL + pgvector
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Consulta de snapshots y deltas temporales
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2.5 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300">
          <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold block text-slate-900 dark:text-white leading-tight">
              Seguridad de Credenciales
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Backend administra GEMINI_API_KEY (sin exponer claves)
            </span>
          </div>
        </div>
      </div>

      {/* Contenedor Iframe con Fallback inteligente */}
      <div
        className={`relative w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden transition-all ${
          isFullScreen ? 'flex-1 h-full min-h-0' : 'h-[85vh] min-h-[640px]'
        }`}
      >
        {/* Loading placeholder mientras el iframe se conecta */}
        {!iframeLoaded && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-sm p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center shadow-lg animate-pulse">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-sm text-slate-900 dark:text-white">
                Cargando interfaz de Auditoría Gemini...
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                Conectando con el microservicio en <code className="text-brand-600 font-mono">{embedUrl}</code>
              </p>
            </div>
            {!isHealthy && (
              <div className="mt-4 p-3 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 text-xs max-w-md text-left flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                <div>
                  <p className="font-semibold">¿El microservicio no está activo?</p>
                  <p className="mt-1 text-[11px] leading-relaxed">
                    Asegúrate de iniciar el microservicio 5 en el puerto 8501 ejecutando en tu terminal:
                    <br />
                    <code className="font-mono bg-amber-100 dark:bg-amber-900/60 px-1 py-0.5 rounded text-[10px] mt-1 inline-block">
                      python -m uvicorn app:app --port 8501 --reload
                    </code>
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Iframe Embebido */}
        <iframe
          key={iframeKey}
          src={embedUrl}
          title="SIMAP Chatbot Auditor Gemini"
          onLoad={() => setIframeLoaded(true)}
          allow="microphone; camera; clipboard-write; encrypted-media"
          className="w-full h-full border-0 rounded-2xl"
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    </div>
  );
};

export default ChatbotAuditor;
