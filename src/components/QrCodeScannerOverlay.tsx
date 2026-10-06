import React, { useState, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import { 
  Camera, 
  Upload, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Scan, 
  Globe2, 
  Server, 
  Cpu, 
  Sparkles,
  Zap
} from 'lucide-react';
import { CompanyInfrastructure } from '../types/security';

interface QrCodeScannerOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (decoded: {
    targetUrl: string;
    companyName: string;
    environment: CompanyInfrastructure['environment'] | 'Development';
    ipAddress?: string;
    techStack?: string[];
  }) => void;
}

export const QrCodeScannerOverlay: React.FC<QrCodeScannerOverlayProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
}) => {
  const [scanMode, setScanMode] = useState<'camera' | 'file' | 'presets'>('camera');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isDecoding, setIsDecoding] = useState<boolean>(false);
  const [decodedResult, setDecodedResult] = useState<string | null>(null);
  const [isApiLoading, setIsApiLoading] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stop camera helper
  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  // Start camera stream
  const startCamera = async () => {
    stopCamera();
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Camera access API is not supported in this browser.');
        setScanMode('file');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        requestAnimationFrame(tickScan);
      }
    } catch (err: any) {
      console.warn('Camera stream error:', err);
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Camera permission was denied. Please allow camera permissions or upload a QR image.'
          : 'Unable to access video stream. Try uploading a QR image file or select a preset.'
      );
      setScanMode('file');
    }
  };

  // Scan frame loop
  const tickScan = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && video.readyState === video.HAVE_ENOUGH_DATA && canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });

        if (code && code.data) {
          handleCodeDetected(code.data);
          return;
        }
      }
    }

    if (isOpen && scanMode === 'camera') {
      animationFrameRef.current = requestAnimationFrame(tickScan);
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (scanMode === 'camera') {
        startCamera();
      }
    } else {
      stopCamera();
      setDecodedResult(null);
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, scanMode]);

  // Process detected QR code payload
  const handleCodeDetected = async (qrData: string) => {
    stopCamera();
    setDecodedResult(qrData);
    setIsApiLoading(true);

    try {
      // 1. Call FastAPI backend to decode topology URL & resolve real DNS/IP
      const res = await fetch('/api/fastapi/topology/decode-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrData }),
      });

      if (res.ok) {
        const data = await res.json();
        onScanSuccess({
          targetUrl: data.targetUrl,
          companyName: data.companyName,
          environment: data.environment,
          ipAddress: data.ipAddress,
          techStack: data.techStack,
        });
      } else {
        fallbackClientParse(qrData);
      }
    } catch (e) {
      fallbackClientParse(qrData);
    } finally {
      setIsApiLoading(false);
      setTimeout(() => {
        onClose();
      }, 700);
    }
  };

  // Fallback client-side parsing if backend is unreachable
  const fallbackClientParse = (qrData: string) => {
    let targetUrl = 'https://api.enterprise.corp';
    let companyName = 'AEGIS ENTERPRISE';
    let environment: 'Production' | 'Staging' | 'Development' = 'Production';
    let ipAddress = '198.51.100.82';

    if (qrData.startsWith('{')) {
      try {
        const parsed = JSON.parse(qrData);
        targetUrl = parsed.targetUrl || targetUrl;
        companyName = parsed.companyName || companyName;
        environment = parsed.environment || environment;
        ipAddress = parsed.ipAddress || ipAddress;
      } catch (err) {}
    } else if (qrData.startsWith('http')) {
      try {
        const u = new URL(qrData);
        targetUrl = `${u.protocol}//${u.host}${u.pathname !== '/' ? u.pathname : ''}`;
        companyName = u.searchParams.get('company') || u.hostname.split('.')[0].toUpperCase();
        ipAddress = u.searchParams.get('ip') || ipAddress;
      } catch (err) {}
    }

    onScanSuccess({
      targetUrl,
      companyName,
      environment,
      ipAddress,
    });
  };

  const [fileError, setFileError] = useState<string | null>(null);

  // Handle uploaded image file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileError(null);
    setIsDecoding(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setIsDecoding(false);
          return;
        }
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        setIsDecoding(false);
        if (code && code.data) {
          handleCodeDetected(code.data);
        } else {
          setFileError('No scannable QR matrix was recognized in this uploaded image. Try taking a closer capture or use one of the enterprise presets below.');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Sample Topology Presets
  const PRESET_CODES = [
    {
      id: 'google-prod',
      name: 'Google LLC (Production Cloud Ingress)',
      url: 'https://www.google.com/?company=Google%20LLC&env=Production&ip=142.250.190.46',
      company: 'Google LLC',
      env: 'Production' as const,
      ip: '142.250.190.46',
    },
    {
      id: 'aegis-bank',
      name: 'Aegis Enterprise Banking API',
      url: 'https://api.enterprise.corp/?company=Aegis%20Banking%20Corp&env=Production&ip=198.51.100.82',
      company: 'Aegis Banking Corp',
      env: 'Production' as const,
      ip: '198.51.100.82',
    },
    {
      id: 'fintech-staging',
      name: 'Fintech Microservices Cluster (Staging)',
      url: 'https://staging.fintech-mesh.internal/?company=Fintech%20Mesh&env=Staging&ip=10.0.4.15',
      company: 'Fintech Mesh',
      env: 'Staging' as const,
      ip: '10.0.4.15',
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-2xl border border-cyan-800/80 bg-slate-900 p-6 space-y-5 shadow-2xl relative overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Scan className="h-5 w-5 text-cyan-400 animate-pulse" />
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Infrastructure Topology QR Scanner
              </h3>
              <p className="text-[11px] text-slate-400">
                Decodes target URLs, corporate assets, and microservice topology in real time
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setScanMode('camera')}
            className={`flex-1 py-1.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-colors ${
              scanMode === 'camera'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Camera className="h-3.5 w-3.5" />
            <span>Live Camera</span>
          </button>

          <button
            onClick={() => setScanMode('file')}
            className={`flex-1 py-1.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-colors ${
              scanMode === 'file'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Upload Image</span>
          </button>

          <button
            onClick={() => setScanMode('presets')}
            className={`flex-1 py-1.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-colors ${
              scanMode === 'presets'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Sample QR Codes</span>
          </button>
        </div>

        {/* View 1: Live Camera Viewfinder */}
        {scanMode === 'camera' && (
          <div className="space-y-3">
            <div className="relative aspect-4/3 w-full max-h-72 rounded-xl overflow-hidden bg-black border border-slate-800 flex items-center justify-center">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                muted
                playsInline
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* HUD Targeting Reticle & Laser Sweep */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-48 h-48 border-2 border-cyan-400/80 rounded-2xl relative shadow-lg shadow-cyan-500/20">
                  {/* Corner Markers */}
                  <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-cyan-300" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-cyan-300" />
                  <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-cyan-300" />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-cyan-300" />

                  {/* Animated laser sweep */}
                  <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent absolute top-1/2 -translate-y-1/2 animate-pulse shadow-md shadow-cyan-400" />
                </div>
              </div>

              {/* Status Pill */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[10px] font-mono text-cyan-300 bg-slate-950/80 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-cyan-800/50">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Scanning Video Frames (jsQR Active)</span>
                </span>
                <span>Port 443 Real-Time</span>
              </div>
            </div>

            {cameraError && (
              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/80 text-amber-300 text-xs flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Camera Access Notice</div>
                  <div className="text-[11px] text-slate-300">{cameraError}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* View 2: File Upload */}
        {scanMode === 'file' && (
          <div className="space-y-4">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700 hover:border-cyan-500 rounded-2xl p-8 text-center cursor-pointer transition-colors bg-slate-950/50 space-y-3"
            >
              <div className="h-12 w-12 rounded-xl bg-cyan-950/60 border border-cyan-800/60 text-cyan-400 flex items-center justify-center mx-auto">
                {isDecoding ? <RefreshCw className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6" />}
              </div>
              <div className="space-y-1">
                <div className="text-xs font-bold text-white">
                  {isDecoding ? 'Decoding QR Code...' : 'Click or Drag & Drop QR Code Image'}
                </div>
                <p className="text-[11px] text-slate-400">
                  Supports PNG, JPG, WebP, SVG with embedded infrastructure topology URLs
                </p>
              </div>
            </div>

            {fileError && (
              <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
                <div>
                  <div className="font-bold">Image QR Decode Notice</div>
                  <div className="text-[11px] text-slate-300">{fileError}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* View 3: Clickable Enterprise Topology QR Presets */}
        {scanMode === 'presets' && (
          <div className="space-y-2">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
              One-Click Enterprise Topology Presets:
            </span>
            <div className="grid grid-cols-1 gap-2">
              {PRESET_CODES.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleCodeDetected(preset.url)}
                  className="p-3 rounded-xl border border-slate-800 bg-slate-950 hover:border-cyan-500 text-left transition-colors flex items-center justify-between group"
                >
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors flex items-center gap-1.5">
                      <Globe2 className="h-3.5 w-3.5 text-cyan-400" />
                      <span>{preset.name}</span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">
                      URL: <span className="text-cyan-400">{preset.url}</span>
                    </div>
                  </div>
                  <span className="px-2 py-1 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800 shrink-0">
                    Load &amp; Decode
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Result & Decoded Feedback */}
        {decodedResult && (
          <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/80 text-emerald-300 text-xs space-y-1 font-mono">
            <div className="flex items-center gap-1.5 font-bold">
              <CheckCircle2 className="h-4 w-4" />
              <span>QR CODE DECODED SUCCESSFULLY</span>
              {isApiLoading && <RefreshCw className="h-3.5 w-3.5 animate-spin ml-2" />}
            </div>
            <div className="text-[11px] text-slate-200 truncate">
              Payload: {decodedResult}
            </div>
            <div className="text-[10px] text-emerald-400">
              Populating company infrastructure state via FastAPI endpoint...
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-slate-800 pt-3 flex items-center justify-between text-xs text-slate-500 font-mono">
          <span>Zero-Trust QR Ingestion Engine</span>
          <span>&copy; 2026 AmanDev</span>
        </div>
      </div>
    </div>
  );
};
