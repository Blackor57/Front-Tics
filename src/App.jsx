import React, { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { UrlInputSection } from './components/analyzer/UrlInputSection';
import { LoadingPipeline } from './components/analyzer/LoadingPipeline';
import { PreviewDashboard } from './components/analyzer/PreviewDashboard';
import { TrackingView } from './components/tracking/TrackingView';
import { TrackingModal } from './components/tracking/TrackingModal';
import { ReportsHistoryView } from './components/reports/ReportsHistoryView';
import { AuthModal } from './components/auth/AuthModal';
import { intelligenceAPI, checkBackendHealth, getMockAnalyzeResponse } from './services/api';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import { Toaster, toast } from 'sonner';

export const App = () => {
  const { isAuthenticated } = useAuth();
  const { theme } = useTheme();

  // Navigation State
  const [currentTab, setCurrentTab] = useState('analyzer');

  // Backend connection & Demo mode state
  const [backendOnline, setBackendOnline] = useState(null);
  const [demoModeActive, setDemoActive] = useState(false);

  // Analyzer Form & Result State
  const [url, setUrl] = useState('https://rpp.pe/politica-y-economia');
  const [guardarSnapshot, setGuardarSnapshot] = useState(true);
  const [generarDocumentos, setGenerarDocumentos] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeResult, setAnalyzeResult] = useState(null);

  // Modals State
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');
  const [trackingModalOpen, setTrackingModalOpen] = useState(false);
  const [trackingModalUrl, setTrackingModalUrl] = useState('');

  // Initial Backend Health Ping
  useEffect(() => {
    const ping = async () => {
      const isUp = await checkBackendHealth();
      setBackendOnline(isUp);
      if (!isUp) {
        setDemoActive(true);
      }
    };
    ping();
  }, []);

  // Execute Analysis Pipeline
  const handleAnalyze = async () => {
    if (!url.trim()) return;

    setIsAnalyzing(true);
    setAnalyzeResult(null);

    try {
      if (demoModeActive || !backendOnline) {
        await new Promise((resolve) => setTimeout(resolve, 3800));
        const sample = getMockAnalyzeResponse(url.trim());
        setAnalyzeResult(sample);
        toast.success('Auditoría completada exitosamente', {
          description: `Se procesaron ${sample.total_items} publicaciones y se calculó el delta temporal.`,
        });
      } else {
        const response = await intelligenceAPI.analyze({
          url: url.trim(),
          guardar_snapshot: guardarSnapshot,
          generar_documentos: generarDocumentos,
        });
        setAnalyzeResult(response);
        toast.success('Auditoría en vivo finalizada', {
          description: `Análisis procesado con Ollama Llama 3.1 para ${response.sitio_titulo || url}`,
        });
      }
    } catch (error) {
      console.error('Error during analysis:', error);
      const detail =
        error.response?.data?.detail ||
        'No se pudo conectar con el backend en localhost:8000. Activando vista con datos de muestra demostrativos.';
      toast.error('Aviso de conexión API', { description: detail });

      const sample = getMockAnalyzeResponse(url.trim());
      setAnalyzeResult(sample);
      setDemoActive(true);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Load sample immediately
  const handleLoadSample = () => {
    const sample = getMockAnalyzeResponse('https://rpp.pe/politica-y-economia');
    setUrl('https://rpp.pe/politica-y-economia');
    setAnalyzeResult(sample);
    toast.info('Auditoría de muestra cargada', {
      description: 'Explora todos los gráficos, KPIs y la matriz estructurada de entidades.',
    });
  };

  // Trigger continuous tracking modal
  const handleOpenTracking = (targetUrl) => {
    if (!isAuthenticated) {
      toast.warning('Autenticación Requerida', {
        description: 'Inicia sesión o crea una cuenta para activar el monitoreo periódico.',
      });
      setAuthModalMode('login');
      setAuthModalOpen(true);
      return;
    }

    setTrackingModalUrl(targetUrl || url);
    setTrackingModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-200">
      <Toaster position="top-right" richColors theme={theme} closeButton />

      {/* Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        onOpenAuth={(mode) => {
          setAuthModalMode(mode || 'login');
          setAuthModalOpen(true);
        }}
        backendOnline={backendOnline}
        demoModeActive={demoModeActive}
        onToggleDemoMode={() => {
          const next = !demoModeActive;
          setDemoActive(next);
          toast.info(next ? 'Modo Demostración Activado' : 'Modo Backend en Vivo Activado');
        }}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* TAB 1: ANALYZER & PREVIEW */}
        {currentTab === 'analyzer' && (
          <div className="space-y-8">
            <UrlInputSection
              url={url}
              setUrl={setUrl}
              guardarSnapshot={guardarSnapshot}
              setGuardarSnapshot={setGuardarSnapshot}
              generarDocumentos={generarDocumentos}
              setGenerarDocumentos={setGenerarDocumentos}
              onAnalyze={handleAnalyze}
              onLoadSample={handleLoadSample}
              isLoading={isAnalyzing}
            />

            {/* Dynamic Loading Pipeline */}
            {isAnalyzing && <LoadingPipeline url={url} />}

            {/* Dashboard Preview Result */}
            {!isAnalyzing && analyzeResult && (
              <PreviewDashboard
                data={analyzeResult}
                onOpenTracking={handleOpenTracking}
              />
            )}
          </div>
        )}

        {/* TAB 2: CONTINUOUS TRACKING PANEL */}
        {currentTab === 'tracking' && (
          <TrackingView
            onOpenNewTarget={() => {
              setTrackingModalUrl('');
              setTrackingModalOpen(true);
            }}
            demoMode={demoModeActive}
          />
        )}

        {/* TAB 3: REPORT HISTORY */}
        {currentTab === 'reports' && (
          <ReportsHistoryView demoMode={demoModeActive} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-800 dark:text-slate-200">SIMAP Platform</span>
            <span>• Universal Web Scraper & Intelligence</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>Playwright + Ollama Llama 3.1 + FastAPI</span>
            <span>v2.5 Production</span>
          </div>
        </div>
      </footer>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
      />

      {/* Continuous Tracking Schedule Modal */}
      <TrackingModal
        isOpen={trackingModalOpen}
        onClose={() => setTrackingModalOpen(false)}
        initialUrl={trackingModalUrl}
        onSuccess={() => {
          if (currentTab !== 'tracking') {
            setCurrentTab('tracking');
          }
        }}
        demoMode={demoModeActive}
      />
    </div>
  );
};
