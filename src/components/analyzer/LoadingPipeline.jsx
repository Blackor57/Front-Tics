import React, { useEffect, useState } from 'react';
import { Globe, Cpu, Layers, FileCheck, CheckCircle2, Loader2 } from 'lucide-react';

export const LoadingPipeline = ({ url }) => {
  const steps = [
    {
      id: 1,
      title: 'Navegando con Playwright...',
      detail: 'Iniciando browser headless, eludiendo captchas y renderizando DOM completo.',
      icon: Globe,
      color: 'text-blue-500',
    },
    {
      id: 2,
      title: 'Extrayendo DOM y calculando Delta...',
      detail: 'Filtrando selectores semánticos y contrastando con el snapshot temporal previo.',
      icon: Layers,
      color: 'text-amber-500',
    },
    {
      id: 3,
      title: 'Analizando contenido con Ollama (Llama 3.1)...',
      detail: 'Extrayendo entidades (instituciones, personas, normas), sentimientos y puntos urgentes.',
      icon: Cpu,
      color: 'text-purple-500',
    },
    {
      id: 4,
      title: 'Sintetizando matriz y generando reportes...',
      detail: 'Compilando gráficos de rotación y estructurando documentos Word (.docx) y Excel (.xlsx).',
      icon: FileCheck,
      color: 'text-emerald-500',
    },
  ];

  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStepIndex((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 3800);
    return () => clearInterval(timer);
  }, [steps.length]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="p-6 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <span>Ejecutando Pipeline de Inteligencia Web</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
                  En progreso
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate max-w-md">
                {url}
              </p>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <span className="text-xs font-semibold text-brand-600 dark:text-brand-400">
              Fase {currentStepIndex + 1} de {steps.length}
            </span>
          </div>
        </div>

        {/* Multi-step progress list */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = idx < currentStepIndex;
            const isActive = idx === currentStepIndex;

            return (
              <div
                key={step.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  isActive
                    ? 'border-brand-500/50 bg-brand-50/40 dark:bg-brand-950/40 shadow-sm ring-1 ring-brand-500/30'
                    : isCompleted
                    ? 'border-emerald-500/30 bg-emerald-50/30 dark:bg-emerald-950/20'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      isActive
                        ? 'bg-brand-600 text-white shadow-sm'
                        : isCompleted
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : isActive ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>
                  <span className="text-[11px] font-mono font-bold text-slate-400">
                    0{step.id}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                  {step.title}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {step.detail}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Skeleton Shimmer Layout */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-24 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 animate-shimmer"
            >
              <div className="w-16 h-3 bg-slate-200 dark:bg-slate-800 rounded mb-3"></div>
              <div className="w-24 h-6 bg-slate-200 dark:bg-slate-800 rounded"></div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 animate-shimmer">
            <div className="w-32 h-4 bg-slate-200 dark:bg-slate-800 rounded mb-4"></div>
            <div className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded mb-2"></div>
            <div className="w-5/6 h-3 bg-slate-200 dark:bg-slate-800 rounded mb-2"></div>
            <div className="w-4/6 h-3 bg-slate-200 dark:bg-slate-800 rounded mb-4"></div>
            <div className="w-full h-24 bg-slate-100 dark:bg-slate-800/60 rounded-xl"></div>
          </div>
          <div className="h-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 animate-shimmer">
            <div className="w-32 h-4 bg-slate-200 dark:bg-slate-800 rounded mb-4"></div>
            <div className="flex items-center justify-center h-40">
              <div className="w-32 h-32 rounded-full border-4 border-slate-200 dark:border-slate-800"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
