import React from 'react';
import {
  Link as LinkIcon,
  Sparkles,
  ArrowRight,
  Zap,
} from 'lucide-react';

export const UrlInputSection = ({
  url,
  setUrl,
  guardarSnapshot,
  setGuardarSnapshot,
  generarDocumentos,
  setGenerarDocumentos,
  onAnalyze,
  onLoadSample,
  isLoading,
}) => {

  const presetUrls = [
    { label: 'RPP Noticias', url: 'https://rpp.pe/politica-y-economia' },
    { label: 'El Comercio Economía', url: 'https://elcomercio.pe/economia' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (url.trim() && !isLoading) {
      onAnalyze();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Hero headline */}
      <div className="text-center space-y-2 pt-2 pb-1">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 dark:bg-brand-950/80 text-brand-700 dark:text-brand-300 border border-brand-200/80 dark:border-brand-800 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
          <span>Scraping Universal + Detección Temporal + Ollama Llama 3.1</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Inteligencia Web y Detección de Cambios
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Monitorea cualquier portal, extrae novedades críticas en segundos, sintetiza con IA local y
          descarga informes ejecutivos automáticos.
        </p>
      </div>

      {/* Main Input Form */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex flex-col sm:flex-row items-center p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-2xl focus-within:border-brand-500 dark:focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/10 transition-all">
          <div className="relative flex-1 w-full flex items-center pl-3 pr-2 py-1">
            <LinkIcon className="w-5 h-5 text-slate-400 shrink-0 mr-2" />
            <input
              type="url"
              required
              disabled={isLoading}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Pega cualquier URL pública (ej. https://rpp.pe/politica-y-economia)..."
              className="w-full text-sm sm:text-base bg-transparent border-0 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-0"
            />
          </div>

          <div className="w-full sm:w-auto mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
            <button
              type="submit"
              disabled={isLoading || !url.trim()}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-brand-600 via-indigo-600 to-brand-700 hover:from-brand-500 hover:to-indigo-500 shadow-md hover:shadow-glow-indigo transition-all disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
            >
              <Zap className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>Auditar con Inteligencia Artificial</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </form>

      {/* Preset Suggestion Chips & Demo Load Button */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <span className="font-medium mr-1">Portales Sugeridos:</span>
          {presetUrls.map((preset) => (
            <button
              key={preset.url}
              type="button"
              onClick={() => setUrl(preset.url)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-brand-50 dark:hover:bg-brand-950/60 hover:text-brand-600 dark:hover:text-brand-400 border border-slate-200/80 dark:border-slate-700/80 transition-all font-medium text-[11px]"
            >
              {preset.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onLoadSample}
          className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center space-x-1"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Ver Ejemplo de Auditoría Completa</span>
        </button>
      </div>
    </div>
  );
};
