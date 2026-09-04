import React, { useState, useEffect } from 'react';
import { X, Mail, ShieldAlert, RefreshCw, CheckCircle2 } from 'lucide-react';
import { authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

export const VerificationRequiredModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [enviando, setEnviando] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [enviadoExito, setEnviadoExito] = useState(false);

  useEffect(() => {
    const checkCooldown = () => {
      const until = localStorage.getItem('simap_resend_cooldown_until');
      if (until) {
        const remaining = Math.ceil((parseInt(until, 10) - Date.now()) / 1000);
        if (remaining > 0) {
          setCooldown(remaining);
        } else {
          localStorage.removeItem('simap_resend_cooldown_until');
          setCooldown(0);
        }
      }
    };

    checkCooldown();
    const interval = setInterval(checkCooldown, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!isOpen || !user) return null;

  const handleReenviar = async () => {
    if (cooldown > 0 || enviando) return;

    setEnviando(true);
    try {
      await authAPI.resendVerification(user.email);
      setEnviadoExito(true);
      toast.success('Correo de verificación enviado', {
        description: `Enviamos un nuevo enlace a ${user.email}. Por favor revisa tu bandeja principal y spam.`,
      });

      const cooldownUntil = Date.now() + 60 * 1000;
      localStorage.setItem('simap_resend_cooldown_until', cooldownUntil.toString());
      setCooldown(60);
    } catch (err) {
      const errorMsg =
        err.response?.data?.detail || 'No se pudo enviar el correo de activación.';
      toast.error('Error al enviar', { description: errorMsg });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 space-y-5 animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2 pt-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto border border-amber-500/20">
            <ShieldAlert className="w-6 h-6 animate-bounce" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Confirmación de Cuenta Requerida
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
            Para activar el <strong>monitoreo continuo</strong> y recibir alertas periódicas en tu
            correo, primero debes verificar la propiedad de tu cuenta.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center space-x-3">
          <Mail className="w-5 h-5 text-brand-500 shrink-0" />
          <div className="overflow-hidden text-left">
            <div className="text-[11px] text-slate-400 uppercase font-semibold">
              Correo registrado
            </div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
              {user.email}
            </div>
          </div>
        </div>

        {enviadoExito && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center space-x-2 text-xs text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>Enlace reenviado. Revisa tu bandeja de entrada o spam.</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Entendido, lo haré luego
          </button>

          <button
            type="button"
            onClick={handleReenviar}
            disabled={enviando || cooldown > 0}
            className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-md hover:shadow-glow-amber transition-all flex items-center justify-center space-x-1.5 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${enviando ? 'animate-spin' : ''}`} />
            <span>
              {enviando
                ? 'Enviando...'
                : cooldown > 0
                ? `Reintentar en ${cooldown}s`
                : 'Reenviar confirmación'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
