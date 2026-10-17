import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  X,
  RefreshCw,
  Zap,
  ExternalLink,
  AlertCircle,
  Loader2,
  SwitchCamera,
  ImageOff,
  CheckCircle2,
  Search,
} from 'lucide-react';
import { imageSearchAPI } from '../../services/api';

/* ─────────────────────────────────────────────
   CameraSearchModal
   Abre la cámara del navegador, captura una foto
   y la envía al backend para búsqueda visual.
   El backend devuelve la URL más similar.
───────────────────────────────────────────── */
export const CameraSearchModal = ({ isOpen, onClose }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [phase, setPhase] = useState('init'); // init | preview | captured | loading | result | error
  const [capturedDataUrl, setCapturedDataUrl] = useState(null);
  const [resultUrl, setResultUrl] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [facingMode, setFacingMode] = useState('environment'); // environment | user
  const [hasDualCamera, setHasDualCamera] = useState(false);

  /* ── Detect dual camera ── */
  useEffect(() => {
    if (!isOpen) return;
    navigator.mediaDevices?.enumerateDevices().then((devices) => {
      const videoCams = devices.filter((d) => d.kind === 'videoinput');
      setHasDualCamera(videoCams.length > 1);
    });
  }, [isOpen]);

  /* ── Stop stream helper ── */
  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  /* ── Start camera stream ── */
  const startCamera = useCallback(async (facing) => {
    stopStream();
    setPhase('init');
    setErrorMsg('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setPhase('preview');
    } catch (err) {
      setErrorMsg(
        err.name === 'NotAllowedError'
          ? 'Permiso de cámara denegado. Habilítalo en la configuración del navegador.'
          : `No se pudo iniciar la cámara: ${err.message}`
      );
      setPhase('error');
    }
  }, []);

  /* ── Open / close lifecycle ── */
  useEffect(() => {
    if (isOpen) {
      startCamera(facingMode);
    } else {
      stopStream();
      setPhase('init');
      setCapturedDataUrl(null);
      setResultUrl(null);
      setErrorMsg('');
    }
    return () => stopStream();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  /* ── Flip camera ── */
  const handleFlipCamera = () => {
    const next = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(next);
    startCamera(next);
  };

  /* ── Capture photo ── */
  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedDataUrl(dataUrl);
    stopStream();
    setPhase('captured');
  };

  /* ── Retake ── */
  const handleRetake = () => {
    setCapturedDataUrl(null);
    setResultUrl(null);
    startCamera(facingMode);
  };

  /* ── Send to backend ── */
  const handleSearch = async () => {
    if (!capturedDataUrl) return;
    setPhase('loading');
    setErrorMsg('');
    try {
      const res = await fetch(capturedDataUrl);
      const blob = await res.blob();
      const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });

      const data = await imageSearchAPI.searchByImage(file);
      const url = data.url || data.result_url || data.similar_url || data.link || '';
      setResultUrl(url);
      setPhase('result');
    } catch (err) {
      const detail =
        err.response?.data?.detail ||
        err.message ||
        'No se pudo conectar con el backend para buscar el producto.';
      setErrorMsg(detail);
      setPhase('error');
    }
  };

  /* ── Close handler ── */
  const handleClose = () => {
    stopStream();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(2,6,23,0.85)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      {/* Panel */}
      <div
        className="relative w-full max-w-lg bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        style={{ maxHeight: '90vh' }}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/60 bg-slate-900/90 backdrop-blur-sm">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Camera className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Búsqueda Visual por Cámara</h2>
              <p className="text-[11px] text-slate-400 leading-none">
                Captura un producto para encontrar su URL más similar
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700/60 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="flex flex-col flex-1 overflow-auto">

          {/* ── Viewfinder / States ── */}
          <div className="relative bg-slate-950 aspect-video w-full flex items-center justify-center overflow-hidden">

            {/* Live video */}
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                phase === 'preview' ? 'opacity-100' : 'opacity-0 absolute inset-0'
              }`}
            />

            {/* Hidden canvas */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Captured photo */}
            {capturedDataUrl && phase !== 'preview' && (
              <img
                src={capturedDataUrl}
                alt="Foto capturada"
                className="w-full h-full object-cover"
              />
            )}

            {/* Init spinner */}
            {phase === 'init' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 space-y-3">
                <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                <p className="text-slate-400 text-sm">Iniciando cámara…</p>
              </div>
            )}

            {/* Camera error (no photo yet) */}
            {phase === 'error' && !capturedDataUrl && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 space-y-4 px-6 text-center">
                <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center">
                  <ImageOff className="w-7 h-7 text-red-400" />
                </div>
                <p className="text-red-400 text-sm font-medium">{errorMsg}</p>
                <button
                  onClick={() => startCamera(facingMode)}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reintentar</span>
                </button>
              </div>
            )}

            {/* Loading overlay */}
            {phase === 'loading' && (
              <div
                className="absolute inset-0 flex flex-col items-center justify-center space-y-3"
                style={{ background: 'rgba(2,6,23,0.78)' }}
              >
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 animate-spin" />
                  <Search className="w-6 h-6 text-indigo-400 absolute inset-0 m-auto" />
                </div>
                <p className="text-white text-sm font-semibold">Analizando imagen…</p>
                <p className="text-slate-400 text-xs">Buscando el producto más similar</p>
              </div>
            )}

            {/* Result overlay banner */}
            {phase === 'result' && resultUrl && (
              <div
                className="absolute bottom-0 inset-x-0 px-4 py-3 flex items-center space-x-2"
                style={{ background: 'linear-gradient(to top, rgba(2,6,23,0.95), transparent)' }}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <p className="text-emerald-300 text-xs font-semibold truncate flex-1">{resultUrl}</p>
              </div>
            )}

            {/* Viewfinder guides */}
            {phase === 'preview' && (
              <>
                <div className="absolute inset-8 pointer-events-none">
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-indigo-400/70 rounded-tl-sm" />
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-indigo-400/70 rounded-tr-sm" />
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-indigo-400/70 rounded-bl-sm" />
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-indigo-400/70 rounded-br-sm" />
                </div>
                <div
                  className="absolute inset-x-8 h-0.5 pointer-events-none"
                  style={{
                    background:
                      'linear-gradient(to right, transparent, rgba(129,140,248,0.7), transparent)',
                    animation: 'simapScanline 2.2s ease-in-out infinite',
                  }}
                />
              </>
            )}

            {/* Flip camera */}
            {hasDualCamera && phase === 'preview' && (
              <button
                onClick={handleFlipCamera}
                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-slate-800/80 backdrop-blur-sm flex items-center justify-center text-white hover:bg-slate-700 transition-all shadow-lg"
                title="Cambiar cámara"
              >
                <SwitchCamera className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* ── Controls area ── */}
          <div className="px-5 py-4 space-y-4">

            {phase === 'preview' && (
              <p className="text-center text-slate-400 text-xs">
                Enfoca el producto u objeto y pulsa el botón para capturar
              </p>
            )}

            {/* Shutter button */}
            {phase === 'preview' && (
              <div className="flex justify-center">
                <button
                  id="camera-shutter-btn"
                  onClick={handleCapture}
                  className="relative w-16 h-16 rounded-full bg-white hover:bg-slate-100 transition-all shadow-xl group"
                  title="Tomar foto"
                >
                  <span className="absolute inset-1.5 rounded-full border-2 border-indigo-400 group-hover:border-indigo-500 transition-colors" />
                  <Camera className="w-6 h-6 text-slate-800 absolute inset-0 m-auto" />
                </button>
              </div>
            )}

            {/* After capture */}
            {(phase === 'captured' || phase === 'result') && (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleRetake}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold transition-all border border-slate-700/60"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Nueva Foto</span>
                </button>
                {phase === 'captured' && (
                  <button
                    id="camera-search-btn"
                    onClick={handleSearch}
                    className="flex-[2] flex items-center justify-center space-x-2 px-4 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg transition-all group"
                  >
                    <Zap className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span>Buscar Producto Similar</span>
                  </button>
                )}
              </div>
            )}

            {/* Result card */}
            {phase === 'result' && resultUrl && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-emerald-300 text-xs font-bold uppercase tracking-wide">
                    Resultado encontrado
                  </span>
                </div>
                <p className="text-slate-300 text-xs break-all leading-relaxed">{resultUrl}</p>
                <a
                  href={resultUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold transition-all border border-emerald-500/20"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Abrir URL</span>
                </a>
              </div>
            )}

            {/* Backend error (after photo was taken) */}
            {phase === 'error' && capturedDataUrl && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 flex items-start space-x-3">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-red-300 text-xs">{errorMsg}</p>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={handleSearch}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-all"
                    >
                      Reintentar búsqueda
                    </button>
                    <button
                      onClick={handleRetake}
                      className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold transition-all"
                    >
                      Nueva foto
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Scanline animation */}
      <style>{`
        @keyframes simapScanline {
          0%   { top: 2rem;               opacity: 0; }
          8%   { opacity: 1; }
          92%  { opacity: 1; }
          100% { top: calc(100% - 2rem); opacity: 0; }
        }
      `}</style>
    </div>
  );
};
