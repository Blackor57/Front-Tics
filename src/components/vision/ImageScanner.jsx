import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { Camera, Upload, X, Loader2, Scan, Sparkles, ExternalLink } from 'lucide-react';
import { visionAPI } from '../../services/api';

export const ImageScanner = () => {
  const [mode, setMode] = useState('upload'); // 'upload' | 'camera'
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      toast.error('Error al acceder a la cámara', {
        description: 'Verifica permisos y asegúrate de usar HTTPS o localhost',
      });
      console.error(err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob(
      (blob) => {
        const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(blob));
        setMode('preview');
        stopCamera();
      },
      'image/jpeg',
      0.9
    );
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setAnalyzing(true);
    setError(null);
    setResult(null);
    try {
      const res = await visionAPI.analyzeImage(selectedFile);
      setResult(res);
      toast.success('Imagen analizada con éxito', {
        description: 'Gemini ha identificado el contenido y sugerido sitios para monitoreo',
      });
    } catch (err) {
      const msg = err.response?.data?.detail || 'Error al analizar imagen';
      setError(msg);
      toast.error('Error al analizar', { description: msg });
    } finally {
      setAnalyzing(false);
    }
  };

  const reset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    if (mode === 'camera') {
      stopCamera();
    }
    setMode('upload');
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  useEffect(() => {
    if (mode === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
  }, [mode]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Scan className="h-6 w-6 text-indigo-500" />
            Escáner de Imágenes con IA (Visión Gemini)
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Captura o sube una imagen para identificar su contenido y obtener sugerencias de sitios web públicos para monitoreo
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => { setMode('upload'); reset(); }}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${
            mode === 'upload'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          <Upload className="h-4 w-4" /> Subir imagen
        </button>
        <button
          onClick={() => setMode('camera')}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${
            mode === 'camera'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          <Camera className="h-4 w-4" /> Usar cámara
        </button>
      </div>

      {mode === 'upload' && !previewUrl && (
        <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-12 text-center hover:border-indigo-400 transition cursor-pointer"
             onClick={() => fileInputRef.current?.click()}>
          <Upload className="h-12 w-12 mx-auto text-slate-400 mb-4" />
          <p className="text-lg font-medium text-slate-700 dark:text-slate-200">
            Arrastra o haz clic para subir una imagen
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            JPG, PNG, WEBP, HEIC • Máx 20MB
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>
      )}

      {mode === 'camera' && (
        <div className="relative bg-black rounded-xl overflow-hidden">
          <video ref={videoRef} className="w-full h-[500px] object-cover" playsInline />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
            <button
              onClick={takePhoto}
              className="bg-white/90 hover:bg-white p-4 rounded-full shadow-lg"
            >
              <Camera className="h-6 w-6" />
            </button>
          </div>
        </div>
      )}

      {previewUrl && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
            <img src={previewUrl} alt="Preview" className="w-full h-auto max-h-[600px] object-contain bg-slate-50 dark:bg-slate-900" />
            <div className="p-4 flex gap-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={handleAnalyze}
                disabled={analyzing}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {analyzing ? 'Analizando...' : 'Analizar con Gemini Vision'}
              </button>
              <button
                onClick={reset}
                className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
                {error}
              </div>
            )}

            {result && (
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                  <h3 className="font-semibold text-lg mb-2 text-slate-900 dark:text-white">Identificación</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                    <strong>Tipo:</strong> {result.identificacion?.tipo || 'N/A'}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                    <strong>Descripción:</strong> {result.identificacion?.descripcion || 'N/A'}
                  </p>
                  {result.identificacion?.marca && (
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      <strong>Marca:</strong> {result.identificacion.marca}
                    </p>
                  )}
                  {result.identificacion?.elementos_clave?.length > 0 && (
                    <div className="mt-2">
                      <strong className="text-sm text-slate-700 dark:text-slate-200">Elementos clave:</strong>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {result.identificacion.elementos_clave.map((el, i) => (
                          <span key={i} className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded text-xs">
                            {el}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {result.sugerencias_monitoreo?.length > 0 && (
                  <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                    <h3 className="font-semibold text-lg mb-3 text-slate-900 dark:text-white flex items-center gap-2">
                      <ExternalLink className="h-5 w-5 text-emerald-500" />
                      Sugerencias para monitoreo
                    </h3>
                    <div className="space-y-3">
                      {result.sugerencias_monitoreo.map((sug, idx) => (
                        <div key={idx} className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <a
                                href={sug.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                              >
                                {sug.nombre}
                                <ExternalLink className="h-3 w-3" />
                              </a>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{sug.url}</p>
                            </div>
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-medium ${
                                sug.nivel_de_prioridad === 'ALTO'
                                  ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'
                                  : sug.nivel_de_prioridad === 'MEDIO'
                                  ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                              }`}
                            >
                              {sug.nivel_de_prioridad}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">{sug.explicacion}</p>
                          {sug.categoria && (
                            <span className="inline-block mt-2 px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 rounded text-xs">
                              {sug.categoria}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {result.contexto && (
                  <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                    <h3 className="font-semibold text-lg mb-2 text-slate-900 dark:text-white">Contexto</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300">{result.contexto}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};
