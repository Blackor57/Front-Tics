import React from 'react';
import {
  Bot,
  CheckCircle2,
  Download,
  ExternalLink,
  FileSpreadsheet,
  Loader2,
  ShieldCheck,
  Table2,
  TriangleAlert,
} from 'lucide-react';
import { rpaAPI } from '../../services/api';

const ETIQUETAS_TIPO = {
  tabla: 'Tabla HTML',
  lista: 'Lista de contenido',
  enlaces: 'Enlaces',
};

const Dato = ({ etiqueta, valor }) => (
  <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5">
    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
      {etiqueta}
    </p>
    <p className="mt-0.5 text-sm font-bold text-slate-800 dark:text-slate-100">{valor}</p>
  </div>
);

export const RpaExportPanel = ({
  url,
  result,
  isLoading,
  error,
  onExtract,
  onUseDemo,
}) => {
  const tieneResultado = Boolean(result?.descargas?.excel);
  const verificacion = result?.verificacion;
  const sinDiferencias = Boolean(
    verificacion &&
      verificacion.diferencias === 0 &&
      (verificacion.no_verificables || 0) === 0
  );
  const columnas = result?.columnas || [];
  const muestra = result?.muestra || [];
  const urlCambiada = Boolean(
    tieneResultado &&
      result?.url &&
      url?.trim() &&
      result.url.replace(/\/+$/, '') !== url.trim().replace(/\/+$/, '')
  );

  const handleDownload = () => {
    const enlace = rpaAPI.getDownloadUrl(result?.descargas?.excel);
    if (enlace) {
      window.open(enlace, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <section className="w-full max-w-4xl mx-auto">
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-11 h-11 shrink-0 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  Automatización RPA · URL a Excel
                </h2>
                {tieneResultado && (
                  <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="w-3 h-3" />
                    Excel listo
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Consulta la URL, detecta tablas o listas, extrae hasta 40 registros,
                verifica una muestra y genera un Excel con encabezados y fuente.
              </p>
            </div>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            {tieneResultado && (
              <button
                type="button"
                onClick={handleDownload}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Descargar Excel
              </button>
            )}
            <button
              type="button"
              onClick={onExtract}
              disabled={isLoading || !url?.trim()}
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${
                tieneResultado
                  ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/60'
                  : 'text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500'
              }`}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileSpreadsheet className="w-4 h-4" />
              )}
              {isLoading
                ? 'Generando Excel...'
                : tieneResultado
                  ? 'Regenerar Excel'
                  : 'Generar Excel RPA'}
            </button>
          </div>
        </div>

        {isLoading && (
          <div className="px-4 sm:px-5 pb-4">
            <div className="rounded-xl bg-brand-50 dark:bg-brand-950/50 border border-brand-100 dark:border-brand-900 px-3 py-2.5 flex items-center gap-2 text-xs text-brand-700 dark:text-brand-300">
              <Loader2 className="w-4 h-4 animate-spin shrink-0" />
              Consultando la página, extrayendo registros y verificando la muestra...
            </div>
          </div>
        )}

        {error && !isLoading && (
          <div className="mx-4 sm:mx-5 mb-4 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/50 px-3 py-2.5 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
            <TriangleAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {tieneResultado && (
          <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/30 p-4 sm:p-5 space-y-4">
            {urlCambiada && (
              <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 px-3 py-2.5 text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2">
                <TriangleAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  El Excel mostrado corresponde a <strong>{result.url}</strong>. Pulsa
                  «Regenerar Excel» para extraer los datos de la URL actual.
                </span>
              </div>
            )}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
              <Dato etiqueta="Registros" valor={result.total_registros} />
              <Dato etiqueta="Páginas" valor={result.total_paginas} />
              <Dato
                etiqueta="Contenido"
                valor={ETIQUETAS_TIPO[result.tipo_contenido] || result.tipo_contenido}
              />
              <Dato
                etiqueta="Coincidencias"
                valor={
                  verificacion
                    ? `${verificacion.coincidencias}/${verificacion.campos_comparados}`
                    : 'No ejecutada'
                }
              />
            </div>

            {verificacion && (
              <div
                className={`rounded-xl border px-3 py-2.5 flex items-start gap-2 text-xs ${
                  sinDiferencias
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                    : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300'
                }`}
              >
                {sinDiferencias ? (
                  <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                ) : (
                  <TriangleAlert className="w-4 h-4 shrink-0 mt-0.5" />
                )}
                <p>
                  Verificación de muestra: <strong>{verificacion.coincidencias}</strong> de{' '}
                  <strong>{verificacion.campos_comparados}</strong> campos coinciden en{' '}
                  <strong>{verificacion.registros_verificados}</strong> registros.
                  {sinDiferencias
                    ? ' Sin diferencias detectadas.'
                    : ` ${verificacion.diferencias} diferencias detectadas${
                        verificacion.no_verificables
                          ? ` y ${verificacion.no_verificables} campos no verificables`
                          : ''
                      }.`}
                </p>
              </div>
            )}

            {muestra.length > 0 && columnas.length > 0 && (
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Vista previa de la muestra
                  </p>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">
                    {result.total_registros} registros · {result.total_paginas} página(s)
                  </span>
                </div>
                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                  <table className="min-w-full text-[11px]">
                    <thead className="bg-slate-100 dark:bg-slate-800">
                      <tr>
                        {columnas.map((columna) => (
                          <th
                            key={columna}
                            className="px-2.5 py-2 text-left font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap"
                          >
                            {columna}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                      {muestra.map((fila, indice) => (
                        <tr key={indice}>
                          {columnas.map((columna) => {
                            const valor = fila[columna];
                            const texto = valor === null || valor === undefined || valor === ''
                              ? '—'
                              : String(valor);
                            return (
                              <td
                                key={columna}
                                title={texto}
                                className="px-2.5 py-2 text-slate-600 dark:text-slate-300 max-w-[220px] truncate"
                              >
                                {texto}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10px] text-slate-500 dark:text-slate-400">
              <span>
                El Excel incluye las hojas Datos, Fuente/Metadatos y Verificación. La URL de
                origen queda registrada en cada fila.
              </span>
              {result.url && (
                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-brand-600 dark:text-brand-400 hover:underline shrink-0"
                >
                  Ver fuente
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        )}

        {!tieneResultado && !isLoading && (
          <div className="border-t border-slate-100 dark:border-slate-800 px-4 sm:px-5 py-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Mínimo 10 registros
            </span>
            <span className="inline-flex items-center gap-1">
              <Table2 className="w-3.5 h-3.5 text-brand-500" />
              Tablas, listas y enlaces
            </span>
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-500" />
              Verificación automática
            </span>
            <button
              type="button"
              onClick={onUseDemo}
              className="ml-auto font-semibold text-brand-600 dark:text-brand-400 hover:underline"
            >
              Probar con sitio demo de hockey
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
