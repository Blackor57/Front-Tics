import React, { useState, useEffect } from 'react';
import { trackingAPI, getMockTargets } from '../../services/api';
import {
  Activity,
  Plus,
  Play,
  Pause,
  Trash2,
  Calendar,
  Clock,
  Mail,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

export const TrackingView = ({
  onOpenNewTarget,
  demoMode,
}) => {
  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState(null);

  const fetchTargets = async () => {
    setLoading(true);
    try {
      if (demoMode) {
        setTargets(getMockTargets());
      } else {
        const data = await trackingAPI.getMyTargets();
        setTargets(data);
      }
    } catch {
      setTargets(getMockTargets());
      toast.info('Visualizando datos de demostración para monitoreo continuo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTargets();
  }, [demoMode]);

  const handleToggle = async (target) => {
    setActionInProgress(target.id);
    try {
      if (demoMode) {
        setTargets((prev) =>
          prev.map((t) => (t.id === target.id ? { ...t, activo: !t.activo } : t))
        );
        toast.success(
          target.activo
            ? 'Monitoreo pausado temporalmente'
            : 'Monitoreo reanudado con éxito'
        );
      } else {
        const updated = await trackingAPI.toggle(target.id);
        setTargets((prev) =>
          prev.map((t) => (t.id === target.id ? updated : t))
        );
        toast.success(
          updated.activo
            ? 'Monitoreo reanudado'
            : 'Monitoreo pausado'
        );
      }
    } catch (error) {
      toast.error('No se pudo actualizar el estado del monitoreo');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleDelete = async (targetId) => {
    if (!window.confirm('¿Seguro que deseas eliminar este objetivo de monitoreo?')) {
      return;
    }

    setActionInProgress(targetId);
    try {
      if (demoMode) {
        setTargets((prev) => prev.filter((t) => t.id !== targetId));
        toast.success('Objetivo eliminado del panel');
      } else {
        await trackingAPI.delete(targetId);
        setTargets((prev) => prev.filter((t) => t.id !== targetId));
        toast.success('Monitoreo eliminado');
      }
    } catch (error) {
      toast.error('Error al eliminar monitoreo');
    } finally {
      setActionInProgress(null);
    }
  };

  const activeCount = targets.filter((t) => t.activo).length;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-20 animate-in fade-in duration-300">
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-md bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
              Servicio de Detección Temporal
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              • Cron Background Worker
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            Panel de Monitoreo Continuo
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl">
            Tus portales registrados son analizados automáticamente según la frecuencia programada.
            Si Ollama detecta cambios o alertas de alto impacto, recibirás un reporte inmediato.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-center border border-slate-200 dark:border-slate-700">
            <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
              Activos
            </div>
            <div className="text-lg font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
              {activeCount} / {targets.length}
            </div>
          </div>

          <button
            onClick={onOpenNewTarget}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 shadow-md hover:shadow-glow-indigo transition-all flex items-center space-x-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Monitoreo</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Cargando objetivos de supervisión...
          </p>
        </div>
      ) : targets.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-500 flex items-center justify-center mx-auto">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              No tienes seguimientos activos
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
              Programa un nuevo monitoreo para supervisar portales gubernamentales, prensa o competidores.
            </p>
          </div>
          <button
            onClick={onOpenNewTarget}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 inline-flex items-center space-x-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Comenzar Ahora</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {targets.map((target) => {
            const isProcessing = actionInProgress === target.id;
            return (
              <div
                key={target.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-lg transition-all flex flex-col justify-between space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2.5 py-1 text-xs font-bold rounded-full flex items-center space-x-1.5 ${
                      target.activo
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        target.activo ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                      }`}
                    />
                    <span>{target.activo ? 'Activo' : 'Pausado'}</span>
                  </span>

                  <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    Cada {target.frecuencia_horas}h
                  </span>
                </div>

                <div>
                  <a
                    href={target.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center space-x-1.5 text-sm font-bold text-slate-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                  >
                    <span className="truncate max-w-[240px]">{target.url}</span>
                    <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Periodo:</span>
                    </span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">
                      {target.dias_duracion} días
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Último chequeo:</span>
                    </span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">
                      {target.ultimo_chequeo
                        ? new Date(target.ultimo_chequeo).toLocaleTimeString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'Pendiente'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center space-x-1">
                      <Mail className="w-3.5 h-3.5" />
                      <span>Notificaciones email:</span>
                    </span>
                    <span
                      className={`font-semibold ${
                        target.notificar_email ? 'text-emerald-500' : 'text-slate-400'
                      }`}
                    >
                      {target.notificar_email ? 'Habilitadas' : 'Desactivadas'}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center space-x-2">
                  <button
                    onClick={() => handleToggle(target)}
                    disabled={isProcessing}
                    className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                      target.activo
                        ? 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                        : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                    }`}
                  >
                    {isProcessing ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : target.activo ? (
                      <>
                        <Pause className="w-3.5 h-3.5 text-amber-500" />
                        <span>Pausar</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Reanudar</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleDelete(target.id)}
                    disabled={isProcessing}
                    className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-slate-700 transition-colors"
                    title="Eliminar objetivo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
