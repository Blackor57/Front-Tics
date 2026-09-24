import React, { useState } from 'react';
import { toast } from 'sonner';
import {
  MessageCircleQuestion,
  Mic,
  Bot,
  Loader2,
  Send,
  FileAudio,
  ListChecks,
  Sparkles,
  ExternalLink,
  RefreshCw,
  ShieldCheck,
  MonitorCog,
} from 'lucide-react';
import aiAPI from '../../services/ai';

const PANELES = [
  { id: 'rag', label: 'Asistente RAG', icon: MessageCircleQuestion },
  { id: 'transcribe', label: 'Transcripción', icon: Mic },
  { id: 'agent', label: 'Agente Autónomo', icon: Bot },
];

const MODOS_AGENTE = [
  { id: 'contexto', label: 'Procesar novedades', icon: ListChecks },
  { id: 'url', label: 'Analizar URL completa', icon: MonitorCog },
];

const inputCls =
  'w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 transition';
const labelCls = 'block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1';

const Card = ({ children, className = '' }) => (
  <div className={`rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm ${className}`}>
    {children}
  </div>
);

const badgePrioridad = (p) => {
  const map = {
    BAJO: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
    MEDIO: 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800',
    ALTO: 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-800',
    'CRÍTICO': 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800',
  };
  return map[p] || map.BAJO;
};

export const AiWorkbench = () => {
  const [panel, setPanel] = useState('rag');

  // RAG state
  const [question, setQuestion] = useState('');
  const [ragUrl, setRagUrl] = useState('');
  const [topK, setTopK] = useState(5);
  const [dias, setDias] = useState(30);
  const [ragResult, setRagResult] = useState(null);
  const [ragLoading, setRagLoading] = useState(false);

  // Transcript state
  const [mediaUrl, setMediaUrl] = useState('');
  const [pageUrl, setPageUrl] = useState('');
  const [idioma, setIdioma] = useState('es');
  const [whisperModel, setWhisperModel] = useState('base');
  const [resumir, setResumir] = useState(true);
  const [transcript, setTranscript] = useState(null);
  const [transcriptLoading, setTranscriptLoading] = useState(false);

  // Agent state
  const [modoAgente, setModoAgente] = useState('contexto');
  const [contexto, setContexto] = useState('');
  const [agentUrl, setAgentUrl] = useState('');
  const [instrucciones, setInstrucciones] = useState('');
  const [destinatario, setDestinatario] = useState('');
  const [agentResult, setAgentResult] = useState(null);
  const [agentLoading, setAgentLoading] = useState(false);
  const [events, setEvents] = useState(null);
  const [eventsLoading, setEventsLoading] = useState(false);

  const handleAsk = async () => {
    if (!question.trim()) {
      toast.warning('Escribe una pregunta para consultar los datos scrapeados.');
      return;
    }
    setRagLoading(true);
    setRagResult(null);
    try {
      const res = await aiAPI.ask({
        question: question.trim(),
        url: ragUrl.trim() || null,
        top_k: topK,
        dias,
      });
      setRagResult(res);
      toast.success('Consulta RAG completada', {
        description: `Se usaron ${res.total_fragmentos} fragmentos del corpus y ${res.fuentes.length} fuentes.`,
      });
    } catch (err) {
      toast.error('Error en la consulta', {
        description: err.response?.data?.detail || 'No se pudo contactar al asistente RAG.',
      });
    } finally {
      setRagLoading(false);
    }
  };

  const handleTranscribe = async () => {
    if (!mediaUrl.trim() && !pageUrl.trim()) {
      toast.warning('Indica una URL de audio/video o una página para detectar medios.');
      return;
    }
    setTranscriptLoading(true);
    setTranscript(null);
    try {
      const res = await aiAPI.transcribe({
        media_url: mediaUrl.trim() || null,
        pagina_origen: pageUrl.trim() || null,
        idioma,
        resumir,
        modelo_whisper: whisperModel === 'base' ? null : whisperModel,
      });
      if (res.error) {
        toast.error('Transcripción falló', { description: res.error });
      } else {
        setTranscript(res);
        toast.success('Transcripción completada', {
          description: `${(res.duracion_segundos || 0).toFixed(1)}s de audio transcritas en local.`,
        });
      }
    } catch (err) {
      toast.error('Error de transcripción', {
        description: err.response?.data?.detail || 'No se pudo transcribir el medio.',
      });
    } finally {
      setTranscriptLoading(false);
    }
  };

  const handleRunAgent = async () => {
    setAgentLoading(true);
    setAgentResult(null);
    try {
      let res;
      if (modoAgente === 'contexto') {
        if (!contexto.trim()) {
          toast.warning('Pega el contexto de novedades detectadas para analizar.');
          setAgentLoading(false);
          return;
        }
        res = await aiAPI.agentProcess({
          contexto: contexto.trim(),
          instrucciones: instrucciones.trim() || null,
          url_fuente: '',
          destinatario: destinatario.trim() || null,
        });
      } else {
        if (!agentUrl.trim()) {
          toast.warning('Ingresa una URL para el ciclo autónomo scrape + delta + agente.');
          setAgentLoading(false);
          return;
        }
        res = await aiAPI.agentRunOnUrl({
          url: agentUrl.trim(),
          instrucciones: instrucciones.trim() || null,
          destinatario: destinatario.trim() || null,
        });
      }
      setAgentResult(res);
      toast.success('Agente ejecutado', {
        description: `${res.acciones?.length || 0} acción(es) de automatización ejecutadas.`,
      });
    } catch (err) {
      toast.error('Error del agente', {
        description: err.response?.data?.detail || 'No se pudo ejecutar el agente autónomo.',
      });
    } finally {
      setAgentLoading(false);
    }
  };

  const handleLoadEvents = async () => {
    setEventsLoading(true);
    try {
      const res = await aiAPI.agentEvents(30);
      setEvents(res);
      toast.success('Historial cargado', { description: `${res.length} evento(s) del agente.` });
    } catch (err) {
      toast.error('No se pudo listar eventos', {
        description: err.response?.data?.detail || 'Error al consultar el historial.',
      });
    } finally {
      setEventsLoading(false);
    }
  };

  const BotonAccion = ({ onClick, loading, icon: Icon, children }) => (
    <button
      onClick={onClick}
      disabled={loading}
      className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm hover:shadow-glow-indigo transition-all"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Icon className="w-4 h-4" />}
      <span>{loading ? 'Procesando…' : children}</span>
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Cabecera del módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Inteligencia Avanzada</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            RAG sobre datos scrapeados, transcripción local de sesiones y agente autónomo (Ollama).
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs">
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            <ShieldCheck className="w-3 h-3" />
            <span>100% Local · Ollama</span>
          </span>
        </div>
      </div>

      {/* Tabs de paneles */}
      <div className="flex space-x-2 overflow-x-auto pb-1">
        {PANELES.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setPanel(id)}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
              panel === id
                ? 'bg-brand-50 dark:bg-brand-950/70 text-brand-600 dark:text-brand-400 border-brand-200 dark:border-brand-800'
                : 'text-slate-600 dark:text-slate-400 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* ------------------------------------------------ */}
      {/* PANEL RAG */}
      {/* ------------------------------------------------ */}
      {panel === 'rag' && (
        <Card className="p-5 space-y-4">
          <div>
            <label className={labelCls}>Pregunta sobre los datos scrapeados</label>
            <textarea
              rows={3}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder='Ej: "¿Qué dijo el alcalde sobre el presupuesto hoy?"'
              className={inputCls}
            />
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className={labelCls}>URL (opcional)</label>
              <input
                type="text"
                value={ragUrl}
                onChange={(e) => setRagUrl(e.target.value)}
                placeholder="https://muni.gob.pe/… (acota la búsqueda)"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Fragmentos (top-k)</label>
              <select value={topK} onChange={(e) => setTopK(Number(e.target.value))} className={inputCls}>
                {[3, 5, 8, 10, 15].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Ventana (días)</label>
              <select value={dias} onChange={(e) => setDias(Number(e.target.value))} className={inputCls}>
                {[7, 15, 30, 60, 90, 180].map((n) => (
                  <option key={n} value={n}>{n} días</option>
                ))}
              </select>
            </div>
          </div>

          <BotonAccion onClick={handleAsk} loading={ragLoading} icon={Send}>
            Consultar con Ollama
          </BotonAccion>

          {ragResult && (
            <div className="pt-2 space-y-4 border-t border-slate-100 dark:border-slate-800">
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4">
                <div className="flex items-center space-x-2 text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wide mb-2">
                  <Sparkles className="w-3.5 h-3.5" /> Respuesta fundamentada en el scrape
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {ragResult.respuesta}
                </p>
              </div>

              {ragResult.fuentes?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                    Fuentes recuperadas ({ragResult.fuentes.length})
                  </p>
                  <div className="space-y-2">
                    {ragResult.fuentes.map((f, i) => (
                      <div key={i} className="flex items-start justify-between gap-3 rounded-lg border border-slate-200 dark:border-slate-800 p-3 text-sm">
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 dark:text-slate-100 truncate">{f.titulo || 'Fragmento'}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">{f.extracto}</p>
                          {f.url && (
                            <a href={f.url} target="_blank" rel="noreferrer" className="inline-flex items-center space-x-1 text-xs text-brand-600 dark:text-brand-400 hover:underline mt-1">
                              <ExternalLink className="w-3 h-3" /> {f.url}
                            </a>
                          )}
                        </div>
                        <span className="shrink-0 text-[10px] font-bold px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {Math.round((f.score || 0) * 100)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      {/* ------------------------------------------------ */}
      {/* PANEL TRANSCRIPCIÓN */}
      {/* ------------------------------------------------ */}
      {panel === 'transcribe' && (
        <Card className="p-5 space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>URL de audio/video directa</label>
              <input
                type="text"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder="https://…/sesion.mp4 · youtube.com/watch?v=…"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>O página del sitio (detección automática)</label>
              <input
                type="text"
                value={pageUrl}
                onChange={(e) => setPageUrl(e.target.value)}
                placeholder="https://muni.gob.pe/sesiones (scraping)"
                className={inputCls}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className={labelCls}>Idioma</label>
              <input type="text" value={idioma} onChange={(e) => setIdioma(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>whisper</label>
              <select value={whisperModel} onChange={(e) => setWhisperModel(e.target.value)} className={inputCls}>
                {['tiny', 'base', 'small', 'medium'].map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center space-x-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                <input type="checkbox" checked={resumir} onChange={(e) => setResumir(e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
                <span>Resumir con Ollama</span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <BotonAccion onClick={handleTranscribe} loading={transcriptLoading} icon={FileAudio}>
              Descargar y transcribir
            </BotonAccion>
            {transcript && !transcript.error && (
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {whisperModel === 'base' ? 'faster-whisper (base)' : `faster-whisper (${whisperModel})`}
              </span>
            )}
          </div>

          {transcript?.error && (
            <div className="rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 p-3 text-sm text-rose-700 dark:text-rose-300">
              {transcript.error}
            </div>
          )}

          {transcript && !transcript.error && (
            <div className="pt-2 space-y-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                  Dur: {(transcript.duracion_segundos || 0).toFixed(1)}s
                </span>
                <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                  Idioma: {transcript.idioma_detectado || idioma}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                  Formato: {transcript.formato || 'desconocido'}
                </span>
              </div>

              {transcript.resumen_ia?.resumen && (
                <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
                  <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wide mb-2">
                    🤖 Resumen IA de la sesión
                  </p>
                  <p className="text-sm text-emerald-900 dark:text-emerald-100 leading-relaxed">{transcript.resumen_ia.resumen}</p>
                  {transcript.resumen_ia.puntos_clave?.length > 0 && (
                    <ul className="mt-3 space-y-1.5">
                      {transcript.resumen_ia.puntos_clave.map((pt, i) => (
                        <li key={i} className="text-sm text-emerald-800 dark:text-emerald-200 flex items-start space-x-2">
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                  Transcripción completa
                </p>
                <pre className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 max-h-72 overflow-y-auto leading-relaxed font-sans">
                  {transcript.transcripcion}
                </pre>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* ------------------------------------------------ */}
      {/* PANEL AGENTE */}
      {/* ------------------------------------------------ */}
      {panel === 'agent' && (
        <div className="space-y-4">
          <div className="flex space-x-2 overflow-x-auto">
            {MODOS_AGENTE.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setModoAgente(id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold border transition-all ${
                  modoAgente === id
                    ? 'bg-brand-50 dark:bg-brand-950/70 text-brand-600 dark:text-brand-400 border-brand-200 dark:border-brand-800'
                    : 'text-slate-600 dark:text-slate-400 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          <Card className="p-5 space-y-4">
            {modoAgente === 'contexto' ? (
              <div>
                <label className={labelCls}>Contexto de novedades detectadas (del delta del scraping)</label>
                <textarea
                  rows={6}
                  value={contexto}
                  onChange={(e) => setContexto(e.target.value)}
                  placeholder="- Nueva licitación: SEACE N° 2026-05 … (URL: https://…)"
                  className={inputCls}
                />
              </div>
            ) : (
              <div>
                <label className={labelCls}>URL a inspeccionar (scrape + delta + agente)</label>
                <input
                  type="text"
                  value={agentUrl}
                  onChange={(e) => setAgentUrl(e.target.value)}
                  placeholder="https://portal.osce.gob.pe/seace/…"
                  className={inputCls}
                />
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Instrucciones de criterio (opcional)</label>
                <input
                  type="text"
                  value={instrucciones}
                  onChange={(e) => setInstrucciones(e.target.value)}
                  placeholder='Ej: "Solo alerta si es licitación, no para notas de rutina"'
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Destinatario de alertas (opcional)</label>
                <input
                  type="email"
                  value={destinatario}
                  onChange={(e) => setDestinatario(e.target.value)}
                  placeholder="admin@empresa.com (default: configurado en .env)"
                  className={inputCls}
                />
              </div>
            </div>

            <BotonAccion onClick={handleRunAgent} loading={agentLoading} icon={Bot}>
              {modoAgente === 'contexto' ? 'Ejecutar agente sobre novedades' : 'Inspección autónoma completa'}
            </BotonAccion>

            {agentResult && (
              <div className="pt-2 space-y-4 border-t border-slate-100 dark:border-slate-800">
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4">
                  <div className="flex items-center space-x-2 text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wide mb-2">
                    <Sparkles className="w-3.5 h-3.5" /> Conclusión del agente (Ollama)
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                    {agentResult.respuesta}
                  </p>
                  {agentResult.sitio_titulo && (
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                      Sitio: {agentResult.sitio_titulo} · Delta nuevos: {agentResult.delta?.total_nuevos ?? 0}
                    </p>
                  )}
                </div>

                {agentResult.acciones?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                      Acciones de automatización ejecutadas ({agentResult.acciones.length})
                    </p>
                    <div className="space-y-2">
                      {agentResult.acciones.map((acc, i) => (
                        <div key={i} className="flex items-start justify-between gap-3 rounded-lg border border-slate-200 dark:border-slate-800 p-3 text-sm">
                          <div className="min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className={`h-2 w-2 rounded-full ${acc.ok ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                              <p className="font-mono text-xs font-bold text-slate-800 dark:text-slate-100">{acc.herramienta}</p>
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase">
                                {acc.canal}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                              {JSON.stringify(acc.resultado || acc.argumentos)}
                            </p>
                          </div>
                          <span className={`shrink-0 text-[10px] font-bold px-2 py-1 rounded-full ${acc.ok ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'}`}>
                            {acc.ok ? 'OK' : 'FALLÓ'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Historial de eventos del agente */}
          <Card className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Historial de eventos del agente</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Correos enviados, registros en sheets y detecciones de media.</p>
              </div>
              <button
                onClick={handleLoadEvents}
                disabled={eventsLoading}
                className="inline-flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                {eventsLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                <span>Cargar</span>
              </button>
            </div>

            {events && (
              <div className="max-h-80 overflow-y-auto space-y-2">
                {events.length === 0 && (
                  <p className="text-sm text-slate-500 dark:text-slate-400">Aún no hay eventos registrados por el agente.</p>
                )}
                {events.map((e) => (
                  <div key={e.id} className="rounded-lg border border-slate-200 dark:border-slate-800 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center space-x-2 min-w-0">
                        <span className="font-mono text-[11px] font-bold text-slate-700 dark:text-slate-200">{e.tipo_evento}</span>
                        {e.canal && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase">{e.canal}</span>
                        )}
                      </div>
                      {e.nivel_prioridad && (
                        <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgePrioridad(e.nivel_prioridad)}`}>
                          {e.nivel_prioridad}
                        </span>
                      )}
                    </div>
                    {e.titulo && <p className="text-sm font-medium text-slate-800 dark:text-slate-100 mt-1">{e.titulo}</p>}
                    {e.url_fuente && (
                      <a href={e.url_fuente} target="_blank" rel="noreferrer" className="inline-flex items-center space-x-1 text-xs text-brand-600 dark:text-brand-400 hover:underline mt-1">
                        <ExternalLink className="w-3 h-3" /> {e.url_fuente}
                      </a>
                    )}
                    {e.created_at && (
                      <p className="mt-1 text-[10px] text-slate-400">{new Date(e.created_at).toLocaleString()}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};

export default AiWorkbench;