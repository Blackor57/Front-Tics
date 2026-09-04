import React, { useState, useEffect } from 'react';
import { reportsAPI, getMockReports } from '../../services/api';
import {
  FileText,
  FileSpreadsheet,
  Calendar,
  ExternalLink,
  Search,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

export const ReportsHistoryView = ({ demoMode }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchReports = async () => {
    setLoading(true);
    try {
      if (demoMode) {
        setReports(getMockReports());
      } else {
        const data = await reportsAPI.list(20, false);
        setReports(data);
      }
    } catch {
      setReports(getMockReports());
      toast.info('Visualizando historial de reportes en modo de demostración.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [demoMode]);

  const filteredReports = reports.filter(
    (rep) =>
      rep.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rep.resumen_ejecutivo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownloadWord = (reportId) => {
    const url = reportsAPI.getWordDownloadUrl(reportId);
    window.open(url, '_blank');
    toast.success(`Descargando informe Word para el reporte #${reportId}`);
  };

  const handleDownloadExcel = (reportId) => {
    const url = reportsAPI.getExcelDownloadUrl(reportId);
    window.open(url, '_blank');
    toast.success(`Descargando libro Excel para el reporte #${reportId}`);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-20 animate-in fade-in duration-300">
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-md bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
              Repositorio de Inteligencia
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            Historial de Reportes Generados
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl">
            Accede a las auditorías previas y descarga los informes en formato Word (.docx) y
            matrices en Excel (.xlsx) generadas automáticamente.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por URL o resumen..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Recuperando historial de reportes...
            </p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400 space-y-2">
            <p>No se encontraron reportes con los criterios solicitados.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Fecha & Hora</th>
                  <th className="py-3.5 px-4">Portal Web</th>
                  <th className="py-3.5 px-4">Resumen Ejecutivo</th>
                  <th className="py-3.5 px-4">Alerta</th>
                  <th className="py-3.5 px-4 text-right">Descargas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredReports.map((report) => (
                  <tr
                    key={report.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="py-4 px-4 whitespace-nowrap font-mono text-slate-500 dark:text-slate-400">
                      <div className="flex items-center space-x-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {new Date(report.created_at).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 pl-5">
                        {new Date(report.created_at).toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </td>

                    <td className="py-4 px-4 max-w-xs truncate">
                      <a
                        href={report.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-slate-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 flex items-center space-x-1.5 group"
                      >
                        <span className="truncate max-w-[200px]">{report.url}</span>
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                      <span className="text-[10px] text-slate-400">
                        {report.tipo_portal || 'Portal Noticioso'}
                      </span>
                    </td>

                    <td className="py-4 px-4 max-w-md">
                      <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed">
                        {report.resumen_ejecutivo}
                      </p>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                          report.nivel_alerta === 'CRÍTICO'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : report.nivel_alerta === 'ALTO'
                            ? 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300'
                            : report.nivel_alerta === 'MEDIO'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}
                      >
                        {report.nivel_alerta || 'MEDIO'}
                      </span>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap text-right space-x-2">
                      <button
                        onClick={() => handleDownloadWord(report.id)}
                        className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 transition-all font-semibold"
                        title="Descargar Informe Word"
                      >
                        <FileText className="w-3.5 h-3.5 text-blue-500" />
                        <span>Word</span>
                      </button>

                      <button
                        onClick={() => handleDownloadExcel(report.id)}
                        className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-300 transition-all font-semibold"
                        title="Descargar Libro Excel"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Excel</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
