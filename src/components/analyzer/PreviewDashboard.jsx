import React, { useState, useMemo } from 'react';
import {
  Globe,
  ExternalLink,
  Calendar,
  TrendingUp,
  FileSpreadsheet,
  FileText,
  BellRing,
  Building2,
  Users,
  Scale,
  Search,
  CheckCircle,
  Sparkles,
  ShieldAlert,
  Layers,
  Flame,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { reportsAPI } from '../../services/api';
import { toast } from 'sonner';

export const PreviewDashboard = ({
  data,
  onOpenTracking,
}) => {
  const {
    url,
    sitio_titulo,
    created_at,
    total_items,
    analisis_ia,
    delta,
    descargas,
    snapshot_id,
    es_linea_base,
  } = data;

  const [tableTab, setTableTab] = useState('new');
  const [searchTerm, setSearchTerm] = useState('');

  // Semantic color for alert level
  const alertColorMap = {
    BAJO: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/50',
      text: 'text-emerald-700 dark:text-emerald-400',
      border: 'border-emerald-200 dark:border-emerald-800',
      dot: 'bg-emerald-500',
      badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200',
    },
    MEDIO: {
      bg: 'bg-amber-50 dark:bg-amber-950/50',
      text: 'text-amber-700 dark:text-amber-400',
      border: 'border-amber-200 dark:border-amber-800',
      dot: 'bg-amber-500',
      badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200',
    },
    ALTO: {
      bg: 'bg-orange-50 dark:bg-orange-950/50',
      text: 'text-orange-700 dark:text-orange-400',
      border: 'border-orange-200 dark:border-orange-800',
      dot: 'bg-orange-500',
      badge: 'bg-orange-100 text-orange-800 dark:bg-orange-900/60 dark:text-orange-200',
    },
    CRÍTICO: {
      bg: 'bg-rose-50 dark:bg-rose-950/50',
      text: 'text-rose-700 dark:text-rose-400',
      border: 'border-rose-200 dark:border-rose-800',
      dot: 'bg-rose-500',
      badge: 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200',
    },
  };

  const currentAlertConfig =
    alertColorMap[analisis_ia.nivel_alerta] || alertColorMap.MEDIO;

  // Sentiment chart data
  const sentimentData = [
    { name: 'Positivo', value: analisis_ia.sentimientos.positivo, color: '#10b981' },
    { name: 'Neutro', value: analisis_ia.sentimientos.neutro, color: '#64748b' },
    { name: 'Negativo', value: analisis_ia.sentimientos.negativo, color: '#f43f5e' },
  ];

  // Category chart data sorted descending
  const categoryData = useMemo(() => {
    return [...analisis_ia.categorias]
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 6);
  }, [analisis_ia.categorias]);

  // Bar colors palette for categories
  const barColors = ['#6366f1', '#818cf8', '#3b82f6', '#0ea5e9', '#06b6d4', '#14b8a6'];

  // Table items compilation
  const tableItems = useMemo(() => {
    let items = [];

    if (delta?.nuevos_articulos) {
      items.push(
        ...delta.nuevos_articulos.map((art) => ({
          titulo: art.titulo,
          url: art.url,
          tipo: 'nuevo',
        }))
      );
    }

    if (delta?.articulos_salientes) {
      items.push(
        ...delta.articulos_salientes.map((art) => ({
          titulo: art.titulo,
          url: art.url,
          tipo: 'saliente',
        }))
      );
    }

    // Filter by tab
    if (tableTab === 'new') {
      items = items.filter((i) => i.tipo === 'nuevo');
    } else if (tableTab === 'outgoing') {
      items = items.filter((i) => i.tipo === 'saliente');
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      items = items.filter((i) => i.titulo.toLowerCase().includes(term));
    }

    return items;
  }, [delta, tableTab, searchTerm]);

  // Handle downloads
  const handleDownloadWord = () => {
    if (descargas.word) {
      const fullUrl = descargas.word.startsWith('http')
        ? descargas.word
        : reportsAPI.getWordDownloadUrl(snapshot_id || 'latest');
      window.open(fullUrl, '_blank');
      toast.success('Iniciando descarga de Informe Word (.docx)', {
        description: 'El archivo contiene el resumen ejecutivo y matrices estructuradas.',
      });
    } else {
      toast.error('Enlace de descarga de Word no disponible para este análisis.');
    }
  };

  const handleDownloadExcel = () => {
    if (descargas.excel) {
      const fullUrl = descargas.excel.startsWith('http')
        ? descargas.excel
        : reportsAPI.getExcelDownloadUrl(snapshot_id || 'latest');
      window.open(fullUrl, '_blank');
      toast.success('Iniciando descarga de Libro Excel (.xlsx)', {
        description: 'Incluye el desglose de artículos, categorías y métricas delta.',
      });
    } else {
      toast.error('Enlace de descarga de Excel no disponible para este análisis.');
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-24 animate-in fade-in zoom-in-95 duration-300">
      
      {/* 1. Header del Sitio Web Auditado */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
                {analisis_ia.tipo_portal || 'Portal Web'}
              </span>

              {es_linea_base ? (
                <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  Línea Base Inicial
                </span>
              ) : (
                <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center space-x-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Delta Comparativo Activo</span>
                </span>
              )}

              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  {new Date(created_at).toLocaleString('es-ES', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {sitio_titulo || url}
            </h2>

            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1.5 text-xs text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400 font-mono transition-colors"
            >
              <Globe className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate max-w-lg">{url}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Quick Action in Header */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenTracking(url)}
              className="px-4 py-2 text-xs font-bold rounded-xl text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 shadow-sm hover:shadow-glow-indigo transition-all flex items-center space-x-1.5"
            >
              <BellRing className="w-4 h-4" />
              <span>Programar Seguimiento</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Fila de Tarjetas KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Total Extraídos
            </span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
            {total_items}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Artículos / enlaces procesados en DOM
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Novedades Detectadas
            </span>
            <Sparkles className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
              +{delta?.total_nuevos ?? 0}
            </span>
            {delta?.total_salientes ? (
              <span className="text-xs font-medium text-rose-500 font-mono">
                (-{delta.total_salientes})
              </span>
            ) : null}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Nuevas publicaciones identificadas vs snapshot
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Tasa de Rotación
            </span>
            <TrendingUp className="w-4 h-4 text-brand-500" />
          </div>
          <div className="text-3xl font-extrabold text-brand-600 dark:text-brand-400 font-mono">
            {delta?.tasa_rotacion_pct ?? 0}%
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Volatilidad del contenido de portada
          </div>
        </div>

        <div className={`p-5 rounded-2xl border shadow-md ${currentAlertConfig.bg} ${currentAlertConfig.border}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Nivel de Alerta
            </span>
            <ShieldAlert className={`w-4 h-4 ${currentAlertConfig.text}`} />
          </div>
          <div className="flex items-center space-x-2">
            <span className={`w-3 h-3 rounded-full ${currentAlertConfig.dot} animate-pulse`} />
            <span className={`text-2xl font-extrabold tracking-tight ${currentAlertConfig.text}`}>
              {analisis_ia.nivel_alerta}
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] font-medium text-slate-600 dark:text-slate-300">
            <span>Score Relevancia:</span>
            <span className="font-mono font-bold">{analisis_ia.score_relevancia}/100</span>
          </div>
        </div>
      </div>

      {/* 3. Banner de Puntos de Atención Urgentes */}
      {analisis_ia.puntos_atencion_urgentes && analisis_ia.puntos_atencion_urgentes.length > 0 && (
        <div className="p-5 rounded-2xl bg-amber-500/10 border-2 border-amber-500/30 text-slate-900 dark:text-slate-100 shadow-lg relative overflow-hidden">
          <div className="flex items-center space-x-2.5 mb-3 text-amber-700 dark:text-amber-400 font-bold text-sm sm:text-base">
            <Flame className="w-5 h-5 animate-bounce" />
            <span>Puntos de Atención Urgentes y Hallazgos Críticos</span>
          </div>
          <ul className="space-y-2">
            {analisis_ia.puntos_atencion_urgentes.map((punto, idx) => (
              <li key={idx} className="flex items-start space-x-2 text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-2" />
                <span className="leading-relaxed font-medium">{punto}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 4. Resumen Ejecutivo & Análisis de Evolución */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Sparkles className="w-4 h-4 text-brand-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Resumen Ejecutivo Sintetizado por IA
            </h3>
          </div>

          <div className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 font-normal">
            <p className="whitespace-pre-line">{analisis_ia.resumen_ejecutivo}</p>
          </div>

          {analisis_ia.analisis_evolucion && (
            <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1 flex items-center space-x-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
                <span>Análisis de Evolución Temporal</span>
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {analisis_ia.analisis_evolucion}
              </p>
            </div>
          )}
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-3">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Recomendaciones
            </h3>
          </div>

          <div className="space-y-2.5">
            {analisis_ia.recomendaciones_estrategicas?.length > 0 ? (
              analisis_ia.recomendaciones_estrategicas.map((rec, idx) => (
                <div key={idx} className="flex items-start space-x-2 text-xs text-slate-600 dark:text-slate-300">
                  <span className="font-bold text-brand-600 dark:text-brand-400 shrink-0">
                    {idx + 1}.
                  </span>
                  <span className="leading-snug">{rec}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400">Sin recomendaciones adicionales.</p>
            )}
          </div>
        </div>
      </div>

      {/* 5. Sección Gráfica Interactiva (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Distribución Temática y Cobertura
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Categorías detectadas por modelo semántico
              </p>
            </div>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400">
              {analisis_ia.categorias?.length || 0} Categorías
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                <YAxis
                  type="category"
                  dataKey="nombre"
                  stroke="#94a3b8"
                  fontSize={11}
                  width={110}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(value, name, item) => [
                    `${value} ítems (${item.payload.porcentaje}%)`,
                    'Cantidad',
                  ]}
                />
                <Bar dataKey="cantidad" radius={[0, 6, 6, 0]}>
                  {categoryData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={barColors[index % barColors.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Termómetro de Sentimiento
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tono discursivo de los contenidos analizados
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4">
            <div className="h-56 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sentimentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {sentimentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                    formatter={(val) => [`${val}%`, 'Porcentaje']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                    Positivo
                  </span>
                </div>
                <span className="font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {analisis_ia.sentimientos.positivo}%
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Neutro
                  </span>
                </div>
                <span className="font-mono text-sm font-bold text-slate-600 dark:text-slate-300">
                  {analisis_ia.sentimientos.neutro}%
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  <span className="text-xs font-semibold text-rose-800 dark:text-rose-300">
                    Negativo
                  </span>
                </div>
                <span className="font-mono text-sm font-bold text-rose-600 dark:text-rose-400">
                  {analisis_ia.sentimientos.negativo}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Matriz de Entidades y Actores */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
        <div className="pb-2 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Matriz Estructurada de Entidades y Actores
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Extracción de organizaciones, personas y marcos normativos citados en las fuentes
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              <Building2 className="w-4 h-4" />
              <span>Instituciones y Empresas</span>
              <span className="font-mono text-[10px] ml-auto bg-blue-100 dark:bg-blue-950 px-1.5 py-0.5 rounded">
                {analisis_ia.entidades_estructuradas?.instituciones_y_empresas?.length || 0}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {analisis_ia.entidades_estructuradas?.instituciones_y_empresas?.map((inst, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/80 hover:bg-blue-100 transition-colors"
                >
                  {inst}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
              <Users className="w-4 h-4" />
              <span>Personas Relevantes</span>
              <span className="font-mono text-[10px] ml-auto bg-purple-100 dark:bg-purple-950 px-1.5 py-0.5 rounded">
                {analisis_ia.entidades_estructuradas?.personas_relevantes?.length || 0}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {analisis_ia.entidades_estructuradas?.personas_relevantes?.map((per, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/80 hover:bg-purple-100 transition-colors"
                >
                  {per}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              <Scale className="w-4 h-4" />
              <span>Normas y Marcos Legales</span>
              <span className="font-mono text-[10px] ml-auto bg-emerald-100 dark:bg-emerald-950 px-1.5 py-0.5 rounded">
                {analisis_ia.entidades_estructuradas?.marcos_legales_o_normas?.length || 0}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {analisis_ia.entidades_estructuradas?.marcos_legales_o_normas?.map((norm, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 hover:bg-emerald-100 transition-colors"
                >
                  {norm}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 7. Tabla Interactiva de Novedades y Contenidos */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Publicaciones y Desglose Delta
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Inspección de artículos entrantes, salientes y vigentes
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filtrar por titular..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-2">
          <button
            onClick={() => setTableTab('new')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              tableTab === 'new'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Solo Novedades (+{delta?.total_nuevos ?? 0})
          </button>

          <button
            onClick={() => setTableTab('outgoing')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              tableTab === 'outgoing'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Artículos Salientes (-{delta?.total_salientes ?? 0})
          </button>

          <button
            onClick={() => setTableTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              tableTab === 'all'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Todos los Registrados
          </button>
        </div>

        {/* Items List */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-96 overflow-y-auto">
          {tableItems.length > 0 ? (
            tableItems.map((item, idx) => (
              <div
                key={idx}
                className="py-3 px-2 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors group"
              >
                <div className="flex items-center space-x-3 pr-4">
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md shrink-0 ${
                      item.tipo === 'nuevo'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400'
                        : item.tipo === 'saliente'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-400'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {item.tipo}
                  </span>
                  <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 line-clamp-2">
                    {item.titulo}
                  </p>
                </div>

                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
                  title="Abrir URL original"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">
              No se encontraron artículos con los criterios seleccionados.
            </div>
          )}
        </div>
      </div>

      {/* 8. Barra de Acciones Flotante Inferior */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-4xl">
        <div className="p-3 sm:p-4 rounded-2xl glass-dropdown border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="text-xs font-bold text-slate-900 dark:text-white hidden sm:inline">
              Auditoría Completada
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 hidden md:inline">
              | Snapshot #{snapshot_id || 1}
            </span>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleDownloadWord}
              className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm"
            >
              <FileText className="w-4 h-4 text-blue-500" />
              <span>Informe Word (.docx)</span>
            </button>

            <button
              onClick={handleDownloadExcel}
              className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
              <span>Libro Excel (.xlsx)</span>
            </button>

            <button
              onClick={() => onOpenTracking(url)}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 shadow-md hover:shadow-glow-indigo transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <BellRing className="w-4 h-4" />
              <span>Activar Monitoreo</span>
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
