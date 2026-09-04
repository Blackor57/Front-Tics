import React, { useState, useEffect } from 'react';
import { Mail, RefreshCw, CheckCircle2, ShieldAlert } from 'lucide-react';
import { authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

export const VerificationBanner = () => {
  const { user, isAuthenticated } = useAuth();
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [cooldown, setCooldown] = useState(0);

  // Inicializar cooldown si existe en localStorage
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

  // Si no está autenticado o ya está verificado, no mostrar nada
  if (!isAuthenticated || !user || user.is_verified) {
    return null;
  }

  const handleReenviar = async () => {
    if (cooldown > 0 || enviando) return;

    setEnviando(true);
    setMensaje(null);

    try {
      const data = await authAPI.resendVerification(user.email);
      const text = data?.mensaje || 'Correo de verificación reenviado exitosamente.';
      setMensaje(text);
      toast.success('Correo de verificación enviado', {
        description: `Hemos enviado un nuevo enlace de activación a ${user.email}. Revisa tu bandeja de entrada o spam.`,
      });

      // Cooldown de 60 segundos
      const cooldownUntil = Date.now() + 60 * 1000;
      localStorage.setItem('simap_resend_cooldown_until', cooldownUntil.toString());
      setCooldown(60);
    } catch (err) {
      console.error('Error al reenviar verificación:', err);
      const errorMsg =
        err.response?.data?.detail || 'No se pudo enviar el correo. Intenta de nuevo más tarde.';
      setMensaje(errorMsg);
      toast.error('Aviso de envío', { description: errorMsg });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="w-full bg-amber-500/10 dark:bg-amber-950/60 border-b border-amber-500/30 dark:border-amber-500/40 px-4 py-2.5 text-xs text-amber-900 dark:text-amber-200 transition-all shadow-sm z-30">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <div className="flex items-center space-x-2.5 text-center sm:text-left">
          <div className="p-1 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-300 shrink-0">
            <Mail className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <span className="font-bold">Confirma tu correo electrónico:</span>{' '}
            <span>
              Te enviamos un enlace de activación a{' '}
              <strong className="underline decoration-amber-500/50 underline-offset-2">
                {user.email}
              </strong>
              . Revisa tu bandeja de entrada o carpeta de spam para activar alertas automáticas.
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          {mensaje && !enviando && (
            <span className="hidden md:inline-flex items-center space-x-1 text-emerald-700 dark:text-emerald-400 font-semibold text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Enviado</span>
            </span>
          )}

          <button
            type="button"
            onClick={handleReenviar}
            disabled={enviando || cooldown > 0}
            className="px-3 py-1 rounded-lg font-semibold text-xs transition-all flex items-center space-x-1.5 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed bg-amber-500 hover:bg-amber-600 text-white dark:bg-amber-600 dark:hover:bg-amber-500"
          >
            <RefreshCw className={`w-3 h-3 ${enviando ? 'animate-spin' : ''}`} />
            <span>
              {enviando
                ? 'Enviando...'
                : cooldown > 0
                ? `Reenviar en ${cooldown}s`
                : 'Reenviar correo'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
