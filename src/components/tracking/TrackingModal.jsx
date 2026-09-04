import React, { useState, useEffect } from 'react';
import { X, BellRing, Clock, Calendar, Mail, Loader2, ArrowRight } from 'lucide-react';
import { trackingAPI } from '../../services/api';
import { toast } from 'sonner';

export const TrackingModal = ({
  isOpen,
  onClose,
  initialUrl = '',
  onSuccess,
  demoMode = false,
}) => {
  const [url, setUrl] = useState(initialUrl);
  const [diasDuracion, setDiasDuracion] = useState(7);
  const [frecuenciaHoras, setFrecuenciaHoras] = useState(12);
  const [notificarEmail, setNotificarEmail] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialUrl) {
      setUrl(initialUrl);
    }
  }, [initialUrl]);

  if (!isOpen) return null;

  const durationOptions = [3, 7, 15, 30];
  const frequencyOptions = [
    { value: 6, label: 'Cada 6 horas', desc: 'Máxima frecuencia (noticias rápidas)' },
    { value: 12, label: 'Cada 12 horas', desc: 'Frecuencia recomendada' },
    { value: 24, label: 'Cada 24 horas', desc: 'Diario (portales institucionales)' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) {
      toast.error('Por favor ingresa la URL a monitorear');
      return;
    }

    setIsSubmitting(true);
    try {
      if (demoMode) {
        await new Promise((res) => setTimeout(res, 600));
        toast.success('Monitoreo Continuo Programado (Modo Demo)', {
          description: `Se auditará ${url} cada ${frecuenciaHoras} horas por ${diasDuracion} días.`,
        });
      } else {
        await trackingAPI.create({
          url: url.trim(),
          dias_duracion: diasDuracion,
          frecuencia_horas: frecuenciaHoras,
          notificar_email: notificarEmail,
        });
        toast.success('Monitoreo Continuo Activado', {
          description: `El motor de IA auditará la web periódicamente y notificará novedades.`,
        });
      }

      onSuccess();
      onClose();
    } catch (error) {
      const msg = error.response?.data?.detail || 'No se pudo programar el monitoreo.';
      toast.error('Error al activar seguimiento', { description: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 pb-4 bg-gradient-to-r from-brand-600/10 to-indigo-600/10 border-b border-slate-100 dark:border-slate-800 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Programar Monitoreo Continuo
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Supervisión periódica con detección de cambios y alertas IA
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              URL del Objetivo Web
            </label>
            <input
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://ejemplo.com/noticias"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-brand-500" />
                <span>Duración del Seguimiento</span>
              </label>
              <span className="text-xs font-mono font-bold text-brand-600 dark:text-brand-400">
                {diasDuracion} días
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {durationOptions.map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => setDiasDuracion(days)}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                    diasDuracion === days
                      ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-brand-400'
                  }`}
                >
                  {days} días
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-indigo-500" />
              <span>Frecuencia de Chequeo</span>
            </label>

            <div className="space-y-2">
              {frequencyOptions.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                    frecuenciaHoras === opt.value
                      ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/40'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <input
                      type="radio"
                      name="frecuencia"
                      value={opt.value}
                      checked={frecuenciaHoras === opt.value}
                      onChange={() => setFrecuenciaHoras(opt.value)}
                      className="text-brand-600 focus:ring-brand-500"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        {opt.label}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {opt.desc}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-semibold text-slate-400">
                    {opt.value}h
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Alertas por Correo Electrónico
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Despachar reporte al detectar cambios de alto impacto
                </div>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notificarEmail}
                onChange={(e) => setNotificarEmail(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 shadow-md hover:shadow-glow-indigo transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Programando Tarea...</span>
              </>
            ) : (
              <>
                <span>Iniciar Seguimiento Automatizado</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
