import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Scan,
  Camera,
  Upload,
  RotateCw,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Sliders,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Loader2,
  Layers,
  FileText,
  User,
  Globe,
  Calendar,
  ShieldCheck,
  RefreshCw,
  Eye,
  Crop,
  ArrowRight,
  Sun,
  Contrast,
  CircleDot,
} from 'lucide-react';
import {
  runTesseractOcr,
  preprocessImageForOcr,
  ImageAdjustments,
  ParsedPassportResult,
  OcrProgressInfo,
} from '../../utils/tesseractOcr';
import { ScannedTouristData, SAMPLE_DOCUMENTS } from '../../utils/documentScanner';

interface GImageReaderPassportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyData: (data: ScannedTouristData, previewUrl?: string, docName?: string) => void;
}

const DEFAULT_ADJUSTMENTS: ImageAdjustments = {
  brightness: 0,
  contrast: 0,
  grayscale: true,
  binarize: false,
  threshold: 130,
  invert: false,
  rotation: 0,
};

export const GImageReaderPassportModal: React.FC<GImageReaderPassportModalProps> = ({
  isOpen,
  onClose,
  onApplyData,
}) => {
  if (!isOpen) return null;

  // Source image state
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // gImageReader image adjustments
  const [adjustments, setAdjustments] = useState<ImageAdjustments>(DEFAULT_ADJUSTMENTS);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [showAdjustmentsPanel, setShowAdjustmentsPanel] = useState<boolean>(true);
  const [roiMode, setRoiMode] = useState<'full' | 'mrz' | 'custom'>('full');

  // OCR Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressInfo, setProgressInfo] = useState<OcrProgressInfo>({ status: '', progress: 0 });
  const [ocrResult, setOcrResult] = useState<ParsedPassportResult | null>(null);
  const [showRawText, setShowRawText] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Editable extracted data
  const [editedData, setEditedData] = useState<ScannedTouristData | null>(null);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const originalImageRef = useRef<HTMLImageElement | null>(null);

  // Initialize with sample UK passport if none loaded
  useEffect(() => {
    if (!imageSrc && SAMPLE_DOCUMENTS.length > 0) {
      const sample = SAMPLE_DOCUMENTS[0];
      loadImageFromUrl(sample.thumbnailUrl, 'Sample_UK_Passport.jpg');
    }
  }, []);

  // Update canvas whenever adjustments or source image changes
  useEffect(() => {
    if (!originalImageRef.current || !canvasRef.current) return;
    try {
      const processed = preprocessImageForOcr(originalImageRef.current, adjustments);
      const targetCanvas = canvasRef.current;
      targetCanvas.width = processed.width;
      targetCanvas.height = processed.height;
      const ctx = targetCanvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, targetCanvas.width, targetCanvas.height);
        ctx.drawImage(processed, 0, 0);
      }
    } catch (err) {
      console.warn('Canvas rendering notice:', err);
    }
  }, [imageSrc, adjustments]);

  // Clean up camera stream on unmount or close
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const startCamera = async () => {
    stopCamera();
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      setCameraError(err.message || 'Camera access denied or unavailable.');
      setIsCameraActive(false);
    }
  };

  const captureCameraFrame = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    stopCamera();
    loadImageFromUrl(dataUrl, `Passport_Live_Capture_${Date.now()}.jpg`);
  };

  const loadImageFromUrl = (url: string, name: string) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      originalImageRef.current = img;
      setImageSrc(url);
      setFileName(name);
      setAdjustments(DEFAULT_ADJUSTMENTS);
      setOcrResult(null);
      setEditedData(null);
    };
    img.src = url;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    stopCamera();
    const reader = new FileReader();
    reader.onload = () => {
      loadImageFromUrl(reader.result as string, file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleExecuteOcr = async () => {
    if (!canvasRef.current) return;
    setIsProcessing(true);
    setProgressInfo({ status: 'Starting Tesseract OCR engine...', progress: 0.05 });

    try {
      const result = await runTesseractOcr(canvasRef.current, (info) => {
        setProgressInfo(info);
      });

      setOcrResult(result);
      setEditedData({ ...result.data });
    } catch (err: any) {
      console.error('Tesseract OCR error:', err);
      setProgressInfo({
        status: `OCR Error: ${err?.message || 'Failed to read image'}`,
        progress: 0,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = (text?: string, fieldName?: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    if (fieldName) {
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const handleApply = () => {
    if (!editedData) return;
    onApplyData(editedData, imageSrc || undefined, fileName || 'passport_scan.jpg');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-6xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-100">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Scan className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-serif font-bold text-white tracking-tight">
                  Tesseract OCR + gImageReader
                </h3>
                <span className="text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded-full uppercase">
                  Passport Optical Engine
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Machine-Readable Zone (ICAO 9303) & Biometric Passport Scanner with gImageReader preprocessing.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="px-4 py-2.5 bg-slate-950/40 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          {/* Input Source Buttons */}
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*,application/pdf"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-medium flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <Upload className="w-3.5 h-3.5 text-blue-400" /> Upload Passport Image
            </button>

            <button
              onClick={isCameraActive ? captureCameraFrame : startCamera}
              className={`px-3 py-1.5 rounded-xl border font-medium flex items-center gap-1.5 transition cursor-pointer shadow-xs ${
                isCameraActive
                  ? 'bg-red-600 hover:bg-red-500 text-white border-red-500 animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-white'
              }`}
            >
              <Camera className="w-3.5 h-3.5 text-amber-400" />
              {isCameraActive ? 'Capture Snapshot' : 'Camera Scan'}
            </button>

            {/* Quick Sample Selector */}
            <div className="hidden sm:flex items-center gap-1 pl-2 border-l border-slate-800">
              <span className="text-[11px] text-slate-400">Samples:</span>
              {SAMPLE_DOCUMENTS.slice(0, 3).map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => loadImageFromUrl(sample.thumbnailUrl, sample.title)}
                  className="px-2 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-[11px] text-slate-300 transition cursor-pointer"
                >
                  {sample.countryFlag} {sample.extractedData.nationality || 'Sample'}
                </button>
              ))}
            </div>
          </div>

          {/* Primary Scan Action */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAdjustmentsPanel(!showAdjustmentsPanel)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition cursor-pointer ${
                showAdjustmentsPanel
                  ? 'bg-slate-800 border-blue-500/50 text-blue-300'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" /> gImageReader Tools
            </button>

            <button
              onClick={handleExecuteOcr}
              disabled={isProcessing || !imageSrc}
              className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold flex items-center gap-1.5 transition cursor-pointer shadow-lg shadow-amber-500/20"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Processing OCR...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 fill-slate-950" /> Run Tesseract OCR
                </>
              )}
            </button>
          </div>
        </div>

        {/* Dual-Pane Main Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 flex-1 overflow-hidden min-h-[480px]">
          {/* Left Pane (7 cols): Document Canvas & gImageReader Controls */}
          <div className="lg:col-span-7 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col bg-slate-950 relative overflow-hidden">
            {/* Viewport Control Bar */}
            <div className="p-2.5 bg-slate-900/90 border-b border-slate-800/80 flex items-center justify-between gap-2 text-xs shrink-0">
              <div className="flex items-center gap-1 text-slate-300">
                <button
                  onClick={() => setAdjustments((prev) => ({ ...prev, rotation: (prev.rotation - 90 + 360) % 360 }))}
                  title="Rotate Counter-Clockwise"
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setAdjustments((prev) => ({ ...prev, rotation: (prev.rotation + 90) % 360 }))}
                  title="Rotate Clockwise (90°)"
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] font-mono text-slate-400 px-1">
                  {adjustments.rotation}°
                </span>

                <div className="h-4 w-px bg-slate-700 mx-1" />

                <button
                  onClick={() => setZoomLevel((z) => Math.max(0.4, z - 0.15))}
                  title="Zoom Out"
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] font-mono text-slate-400 px-1">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.15))}
                  title="Zoom In"
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setZoomLevel(1)}
                  title="Fit to Screen (1:1)"
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="text-[11px] text-slate-400 truncate max-w-[200px]">
                {fileName || 'Document Loaded'}
              </div>
            </div>

            {/* Canvas / Live Viewport */}
            <div className="flex-1 overflow-auto flex items-center justify-center p-4 relative bg-dot-pattern">
              {isCameraActive ? (
                <div className="relative w-full max-w-lg aspect-video rounded-2xl overflow-hidden border-2 border-amber-500 shadow-2xl bg-black flex items-center justify-center">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  <div className="absolute inset-0 border-2 border-dashed border-amber-400/60 m-4 rounded-xl pointer-events-none flex flex-col justify-between p-3">
                    <span className="text-[10px] bg-black/70 text-amber-300 font-mono px-2 py-0.5 rounded self-start">
                      ALIGN PASSPORT PHOTO PAGE
                    </span>
                    <span className="text-[10px] bg-black/70 text-amber-300 font-mono px-2 py-0.5 rounded self-end">
                      MACHINE READABLE ZONE (MRZ)
                    </span>
                  </div>
                </div>
              ) : (
                <div
                  style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
                  className="transition-transform duration-100 ease-out max-w-full"
                >
                  <canvas
                    ref={canvasRef}
                    className="max-w-full max-h-[500px] object-contain rounded-xl border border-slate-800 shadow-2xl bg-black/60"
                  />
                </div>
              )}

              {/* Optical Scanning Line Animation */}
              {isProcessing && (
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_15px_#f59e0b] animate-scan pointer-events-none" />
              )}
            </div>

            {/* gImageReader Preprocessing Toolbox Slider Drawer */}
            {showAdjustmentsPanel && !isCameraActive && (
              <div className="p-3 bg-slate-900 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs shrink-0">
                {/* Grayscale Toggle */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-300 text-[11px] font-medium flex items-center gap-1">
                    <CircleDot className="w-3.5 h-3.5 text-blue-400" /> Grayscale
                  </span>
                  <input
                    type="checkbox"
                    checked={adjustments.grayscale}
                    onChange={(e) => setAdjustments({ ...adjustments, grayscale: e.target.checked })}
                    className="rounded text-amber-500 focus:ring-0 cursor-pointer"
                  />
                </div>

                {/* Binarization Toggle */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-300 text-[11px] font-medium flex items-center gap-1">
                    <Contrast className="w-3.5 h-3.5 text-emerald-400" /> Binarize (B&W)
                  </span>
                  <input
                    type="checkbox"
                    checked={adjustments.binarize}
                    onChange={(e) => setAdjustments({ ...adjustments, binarize: e.target.checked })}
                    className="rounded text-amber-500 focus:ring-0 cursor-pointer"
                  />
                </div>

                {/* Invert Colors Toggle */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-300 text-[11px] font-medium flex items-center gap-1">
                    <RefreshCw className="w-3.5 h-3.5 text-purple-400" /> Invert Colors
                  </span>
                  <input
                    type="checkbox"
                    checked={adjustments.invert}
                    onChange={(e) => setAdjustments({ ...adjustments, invert: e.target.checked })}
                    className="rounded text-amber-500 focus:ring-0 cursor-pointer"
                  />
                </div>

                {/* Reset Adjustments */}
                <button
                  onClick={() => setAdjustments(DEFAULT_ADJUSTMENTS)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition cursor-pointer text-center"
                >
                  Reset Image Filters
                </button>
              </div>
            )}
          </div>

          {/* Right Pane (5 cols): OCR Extracted Details & Form Field Verification */}
          <div className="lg:col-span-5 flex flex-col bg-slate-900 overflow-y-auto p-4 sm:p-5 space-y-4">
            {/* Progress Status Bar */}
            {isProcessing && (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold flex items-center gap-1.5">
                    <Loader2 className="w-4 h-4 animate-spin text-amber-400" /> {progressInfo.status}
                  </span>
                  <span className="font-mono font-bold">{Math.round(progressInfo.progress * 100)}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-300"
                    style={{ width: `${progressInfo.progress * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Results Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Extracted Passport Data
                </h4>
                <p className="text-[11px] text-slate-400">
                  Verify extracted biometric fields prior to applying into client directory.
                </p>
              </div>

              {ocrResult && (
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                      (ocrResult.confidence || 0) > 80
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                        : 'bg-amber-500/20 text-amber-300 border-amber-400/30'
                    }`}
                  >
                    {ocrResult.confidence}% OCR Match
                  </span>
                </div>
              )}
            </div>

            {/* Extracted Fields Form */}
            {editedData ? (
              <div className="space-y-3">
                {/* Full Name */}
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold flex items-center gap-1">
                      <User className="w-3 h-3 text-blue-400" /> Full Name (Surname & Given)
                    </label>
                    <button
                      onClick={() => handleCopy(editedData.fullName, 'fullName')}
                      className="text-[10px] text-slate-400 hover:text-white flex items-center gap-0.5 cursor-pointer"
                    >
                      {copiedField === 'fullName' ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                  <input
                    type="text"
                    value={editedData.fullName || ''}
                    onChange={(e) => setEditedData({ ...editedData, fullName: e.target.value })}
                    placeholder="e.g. Dr. Arthur Pendelton"
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-hidden focus:border-amber-400 font-semibold"
                  />
                </div>

                {/* Passport Number & Nationality */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold flex items-center gap-1">
                        <FileText className="w-3 h-3 text-amber-400" /> Passport No.
                      </label>
                      <button
                        onClick={() => handleCopy(editedData.passportNumber, 'passportNumber')}
                        className="text-[10px] text-slate-400 hover:text-white flex items-center gap-0.5 cursor-pointer"
                      >
                        {copiedField === 'passportNumber' ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                    <input
                      type="text"
                      value={editedData.passportNumber || ''}
                      onChange={(e) =>
                        setEditedData({ ...editedData, passportNumber: e.target.value.toUpperCase() })
                      }
                      placeholder="e.g. GB98234112"
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-amber-300 focus:outline-hidden focus:border-amber-400"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold flex items-center gap-1">
                      <Globe className="w-3 h-3 text-emerald-400" /> Nationality
                    </label>
                    <input
                      type="text"
                      value={editedData.nationality || ''}
                      onChange={(e) => setEditedData({ ...editedData, nationality: e.target.value })}
                      placeholder="e.g. British"
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-hidden focus:border-amber-400 font-semibold"
                    />
                  </div>
                </div>

                {/* Dates: DOB & Expiry */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-purple-400" /> Date of Birth
                    </label>
                    <input
                      type="date"
                      value={editedData.dateOfBirth || editedData.dob || ''}
                      onChange={(e) =>
                        setEditedData({ ...editedData, dateOfBirth: e.target.value, dob: e.target.value })
                      }
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-hidden focus:border-amber-400"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-red-400" /> Passport Expiry
                    </label>
                    <input
                      type="date"
                      value={editedData.passportExpiry || ''}
                      onChange={(e) => setEditedData({ ...editedData, passportExpiry: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-hidden focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* Gender / Sex */}
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block">
                    Gender / Sex
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['Male', 'Female', 'Other', 'Prefer not to say'] as const).map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setEditedData({ ...editedData, gender: g })}
                        className={`py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                          editedData.gender === g
                            ? 'bg-amber-500 text-slate-950 border-amber-400'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* MRZ Lines Box (if detected) */}
                {ocrResult?.mrzLines && ocrResult.mrzLines.length > 0 && (
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold block">
                      ICAO Doc 9303 MRZ Lines
                    </span>
                    <div className="font-mono text-[11px] text-amber-200/90 leading-tight tracking-wider bg-black/60 p-2 rounded-lg break-all">
                      {ocrResult.mrzLines.map((line, idx) => (
                        <div key={idx}>{line}</div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Raw OCR Text Toggle */}
                <div className="pt-1">
                  <button
                    onClick={() => setShowRawText(!showRawText)}
                    className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" /> {showRawText ? 'Hide' : 'View'} Raw Recognized OCR Text
                  </button>

                  {showRawText && ocrResult?.rawText && (
                    <div className="mt-2 p-3 rounded-xl bg-black/70 border border-slate-800 text-[11px] font-mono text-slate-300 whitespace-pre-wrap max-h-36 overflow-y-auto">
                      {ocrResult.rawText}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-950/40 rounded-2xl border border-dashed border-slate-800 text-slate-500 my-auto">
                <Scan className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                <p className="text-xs font-medium">Click "Run Tesseract OCR" to parse passport image.</p>
                <p className="text-[11px] text-slate-600 mt-1">
                  Supports ICAO biometric passports, visas, national identity cards, and travel documents.
                </p>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3 mt-auto shrink-0">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={!editedData || (!editedData.fullName && !editedData.passportNumber)}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 disabled:opacity-50 text-slate-950 shadow-lg shadow-amber-500/20 flex items-center gap-1.5 transition cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" /> Auto-fill Client Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
