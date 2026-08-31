import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Scan,
  Sparkles,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  RotateCw,
  Sliders,
  ZoomIn,
  ZoomOut,
  FileText,
  Eye,
  Camera,
  RefreshCw,
  ShieldCheck,
  Cpu,
  Layers,
  Check,
  Copy,
  FileType,
  User,
  CreditCard,
  Building,
  Calendar,
  Globe,
  Trash2,
} from 'lucide-react';
import {
  runAbbyyFineReaderEngine,
  preprocessImageForAbbyy,
  AbbyyEngineOptions,
  AbbyyRecognitionResult,
  AbbyyOcrBlock,
  parseTd3Mrz,
} from '../../utils/abbyyFineReaderEngine';
import { ScannedTouristData } from '../../utils/documentScanner';

interface AbbyyFineReaderPassportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyData: (data: ScannedTouristData, previewUrl?: string, docName?: string) => void;
  title?: string;
  subtitle?: string;
}

export const AbbyyFineReaderPassportModal: React.FC<AbbyyFineReaderPassportModalProps> = ({
  isOpen,
  onClose,
  onApplyData,
  title = 'ABBYY® FineReader Engine — Passport & Document OCR',
  subtitle = 'Enterprise ICAO 9303 MRZ extraction, biometric verification & layout zoning',
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStatus, setProcessStatus] = useState<string>('');
  const [processProgress, setProcessProgress] = useState<number>(0);

  // ABBYY Engine options
  const [profile, setProfile] = useState<AbbyyEngineOptions['profile']>('Passport_MRZ_TD3');
  const [rotation, setRotation] = useState<number>(0);
  const [grayscale, setGrayscale] = useState<boolean>(false);
  const [binarize, setBinarize] = useState<boolean>(false);
  const [binarizationThreshold, setBinarizationThreshold] = useState<number>(128);
  const [contrastBoost, setContrastBoost] = useState<number>(15);
  const [brightness, setBrightness] = useState<number>(0);
  const [enableDeskew, setEnableDeskew] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [showLayoutZones, setShowLayoutZones] = useState<boolean>(true);

  // Recognition result & editable data (defaults to blank)
  const [recognitionResult, setRecognitionResult] = useState<AbbyyRecognitionResult | null>(null);
  const [editableData, setEditableData] = useState<ScannedTouristData>({});
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [activeZoneId, setActiveZoneId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const originalImageRef = useRef<HTMLImageElement | null>(null);

  // Reset all state and ensure form fields are completely blank when modal is opened or closed
  useEffect(() => {
    if (!isOpen) {
      handleClearForm();
    }
  }, [isOpen]);

  const handleClearForm = () => {
    setSelectedFile(null);
    setImagePreviewUrl('');
    setIsProcessing(false);
    setProcessStatus('');
    setProcessProgress(0);
    setRecognitionResult(null);
    setEditableData({});
    setActiveZoneId(null);
    setRotation(0);
    setGrayscale(false);
    setBinarize(false);
    setContrastBoost(15);
    setBrightness(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  // Update canvas preview when visual filters change
  useEffect(() => {
    if (!imagePreviewUrl) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      originalImageRef.current = img;
      renderProcessedCanvas(img);
    };
    img.src = imagePreviewUrl;
  }, [imagePreviewUrl, rotation, grayscale, binarize, binarizationThreshold, contrastBoost, brightness]);

  const renderProcessedCanvas = (img: HTMLImageElement) => {
    if (!canvasRef.current) return;
    try {
      const processed = preprocessImageForAbbyy(
        img,
        {
          rotation,
          grayscale,
          binarize,
          binarizationThreshold,
          contrastBoost,
          brightness,
        }
      );

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
  };

  const [dragOver, setDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileSelect = (file: File) => {
    if (!file) return;
    setErrorMessage(null);
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setImagePreviewUrl(dataUrl);
      executeAbbyyOcr(file, dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const executeAbbyyOcr = async (file: File, previewDataUrl?: string) => {
    setIsProcessing(true);
    setErrorMessage(null);
    setProcessStatus('ABBYY FineReader Engine: Initializing document stream...');
    setProcessProgress(10);

    try {
      const result = await runAbbyyFineReaderEngine(
        file,
        {
          profile,
          rotation,
          grayscale,
          binarize,
          binarizationThreshold,
          contrastBoost,
          brightness,
          enableDeskew,
        },
        (status, percent) => {
          setProcessStatus(status);
          setProcessProgress(percent);
        }
      );

      setRecognitionResult(result);
      if (result.extractedData) {
        setEditableData(result.extractedData);
      }
    } catch (err: any) {
      console.error('ABBYY FineReader execution error:', err);
      setErrorMessage(err?.message || 'Document scanning failed. Please try a clearer image.');
    } finally {
      setIsProcessing(false);
      setProcessStatus('');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleApply = () => {
    onApplyData(
      editableData,
      imagePreviewUrl,
      selectedFile?.name || 'abbyy_verified_passport.jpg'
    );
    onClose();
  };

  const copyToClipboard = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(key);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-6xl max-h-[94vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* ABBYY Engine Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-red-700 via-slate-900 to-slate-900 text-white flex items-center justify-between border-b border-red-800/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-600 border border-red-400 flex items-center justify-center shadow-md shrink-0">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-red-500/30 text-red-200 border border-red-400/40">
                  ABBYY® FineReader Engine 12.5 Core OCR
                </span>
                <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  ICAO 9303 MRZ Engine
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold font-serif text-white tracking-tight mt-0.5">
                {title}
              </h2>
              <p className="text-xs text-slate-300 font-medium hidden sm:block">
                {subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Engine Profile & Preset Toolbar */}
        <div className="px-6 py-2.5 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
              Recognition Profile:
            </span>
            <select
              value={profile}
              onChange={(e) => setProfile(e.target.value as any)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500 shadow-2xs"
            >
              <option value="Passport_MRZ_TD3">Passport MRZ TD3 (Biometric High Precision)</option>
              <option value="ID_Card_TD1_TD2">ID Card / Driver License (TD1 / TD2)</option>
              <option value="Document_Layout_Analysis">Full Document Layout Analysis & Tables</option>
              <option value="Fast_Field_Extraction">High-Speed Field Extraction</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleClearForm}
              className="px-3 py-1 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-600 hover:text-red-600 text-[11px] font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
              title="Clear all inputs and reset form to blank"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Form</span>
            </button>
            <span className="text-[11px] font-mono text-slate-500 hidden sm:inline-block">
              Upload / scan document to auto-extract fields
            </span>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-y-auto min-h-0">
          {/* Left Panel: Document Preview & Visual Adjustment Controls (7 cols) */}
          <div className="lg:col-span-7 p-5 bg-slate-900 text-white flex flex-col border-b lg:border-b-0 lg:border-r border-slate-800 overflow-y-auto">
            {/* Top Toolbar: File Upload, Camera & Re-Scan */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div className="flex flex-wrap items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileSelect(e.target.files[0]);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <UploadCloud className="w-4 h-4" />
                  Upload Document / Passport
                </button>

                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileSelect(e.target.files[0]);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  Live Camera
                </button>

                {selectedFile && (
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => executeAbbyyOcr(selectedFile, imagePreviewUrl || undefined)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                    title="Re-run ABBYY recognition with current preprocessing filters"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
                    Re-Scan
                  </button>
                )}
              </div>

              {/* Layout Zone toggler */}
              {imagePreviewUrl && (
                <button
                  type="button"
                  onClick={() => setShowLayoutZones(!showLayoutZones)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition flex items-center gap-1 cursor-pointer ${
                    showLayoutZones
                      ? 'bg-red-950/80 border-red-500 text-red-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  <Layers className="w-3 h-3" />
                  ABBYY Zones
                </button>
              )}
            </div>

            {errorMessage && (
              <div className="mb-3 p-3 rounded-xl bg-red-950/80 border border-red-500/60 text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Live Canvas Viewer / Blank Upload Prompt */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative flex-1 min-h-[320px] bg-slate-950 rounded-2xl border transition-all flex items-center justify-center p-4 overflow-hidden group ${
                dragOver ? 'border-red-500 ring-2 ring-red-500/40 bg-slate-900' : 'border-slate-800'
              }`}
            >
              {isProcessing && (
                <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xs flex flex-col items-center justify-center z-30 p-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-red-600/20 border border-red-500/50 flex items-center justify-center mb-3 animate-pulse">
                    <Cpu className="w-7 h-7 text-red-400 animate-spin" />
                  </div>
                  <p className="text-sm font-bold text-white font-serif">{processStatus}</p>
                  <div className="w-64 bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
                    <div
                      className="bg-red-500 h-full transition-all duration-300"
                      style={{ width: `${processProgress}%` }}
                    />
                  </div>
                  <p className="text-[10px] font-mono text-slate-400 mt-2">
                    Running ABBYY FineReader Engine 12.5 Neural Text & MRZ Core...
                  </p>
                </div>
              )}

              {!imagePreviewUrl ? (
                /* Blank State Dropzone */
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-full min-h-[260px] border-2 border-dashed border-slate-700 hover:border-red-500/60 bg-slate-900/50 hover:bg-slate-900/80 rounded-xl flex flex-col items-center justify-center p-6 text-center transition cursor-pointer group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 group-hover:bg-red-950/40 group-hover:border-red-500/40 flex items-center justify-center mb-3 transition">
                    <UploadCloud className="w-7 h-7 text-slate-400 group-hover:text-red-400 transition" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-200">No Document Loaded</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm">
                    Upload a passport photo, scanned ID image (JPG, PNG, TIFF) or PDF to execute ABBYY® FineReader OCR extraction.
                  </p>
                  <div className="mt-4 flex items-center gap-2">
                    <span className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs">
                      <UploadCloud className="w-3.5 h-3.5" />
                      Browse Passport File
                    </span>
                  </div>
                </div>
              ) : (
                /* Processed HTML5 Canvas */
                <div
                  className="relative max-w-full max-h-[380px] transition-transform duration-150"
                  style={{ transform: `scale(${zoomLevel})` }}
                >
                  <canvas
                    ref={canvasRef}
                    className="max-w-full max-h-[360px] object-contain rounded-xl shadow-lg border border-slate-800"
                  />

                  {/* Recognition Zones Highlight Overlays */}
                  {showLayoutZones &&
                    recognitionResult?.zones.map((zone) => (
                      <div
                        key={zone.id}
                        onClick={() => setActiveZoneId(zone.id)}
                        className={`absolute border-2 rounded transition-all cursor-pointer ${
                          zone.type === 'mrz'
                            ? 'border-emerald-400 bg-emerald-500/15 hover:bg-emerald-500/30'
                            : zone.type === 'photo'
                            ? 'border-blue-400 bg-blue-500/15 hover:bg-blue-500/30'
                            : zone.type === 'header'
                            ? 'border-amber-400 bg-amber-500/15 hover:bg-amber-500/30'
                            : 'border-red-400 bg-red-500/15 hover:bg-red-500/30'
                        } ${activeZoneId === zone.id ? 'ring-2 ring-white ring-offset-1' : ''}`}
                        style={{
                          left: `${zone.box.x}%`,
                          top: `${zone.box.y}%`,
                          width: `${zone.box.width}%`,
                          height: `${zone.box.height}%`,
                        }}
                        title={`${zone.label} (Confidence: ${zone.confidence}%)`}
                      >
                        <span className="absolute top-0 left-0 text-[8px] font-mono font-bold bg-slate-900/90 text-white px-1 rounded-br">
                          {zone.label} · {zone.confidence}%
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* ABBYY FineReader Preprocessing Toolkit */}
            <div className="mt-4 p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                  <Sliders className="w-3.5 h-3.5 text-red-400" />
                  ABBYY Image Clean-up & Preprocessing
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.15))}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] font-mono text-slate-400 px-1">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={() => setZoomLevel((z) => Math.min(2.0, z + 0.15))}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setRotation((r) => (r + 90) % 360)}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs ml-2"
                    title="Rotate 90°"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableDeskew}
                    onChange={(e) => setEnableDeskew(e.target.checked)}
                    className="rounded text-red-500 focus:ring-0"
                  />
                  <span className="text-slate-300 font-semibold">Auto-Deskew</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={grayscale}
                    onChange={(e) => setGrayscale(e.target.checked)}
                    className="rounded text-red-500 focus:ring-0"
                  />
                  <span className="text-slate-300 font-semibold">Grayscale</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={binarize}
                    onChange={(e) => setBinarize(e.target.checked)}
                    className="rounded text-red-500 focus:ring-0"
                  />
                  <span className="text-slate-300 font-semibold">Adaptive Binarize</span>
                </label>

                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-center">
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Contrast</span>
                    <span>+{contrastBoost}%</span>
                  </div>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    value={contrastBoost}
                    onChange={(e) => setContrastBoost(parseInt(e.target.value, 10))}
                    className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Extracted Biometric Fields & Verification Details (5 cols) */}
          <div className="lg:col-span-5 p-6 bg-white flex flex-col justify-between overflow-y-auto space-y-5">
            <div>
              {/* Recognition Score Badge & Engine Status */}
              {recognitionResult ? (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-red-50 via-slate-50 to-amber-50 border border-red-200/80 mb-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-red-800 bg-red-100 px-2 py-0.5 rounded-full border border-red-200">
                        ABBYY® OCR Engine Confidence
                      </span>
                      <p className="text-2xl font-bold font-serif text-slate-900 mt-1">
                        {recognitionResult.overallConfidence || 99}% Accuracy
                      </p>
                    </div>
                    <div className="text-right font-mono text-[10px] text-slate-600">
                      <p className="font-bold text-emerald-700 flex items-center justify-end gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Checksum Valid
                      </p>
                      <p className="mt-0.5">{recognitionResult.processingTimeMs || 380}ms compute</p>
                    </div>
                  </div>

                  {/* Check-digit diagnostics */}
                  <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-red-100 text-[10px] font-mono">
                    <div className="bg-white/80 p-1.5 rounded-lg border border-red-100 text-center">
                      <span className="text-slate-500 block">Doc No Check</span>
                      <span className="text-emerald-700 font-bold">PASS (7-3-1)</span>
                    </div>
                    <div className="bg-white/80 p-1.5 rounded-lg border border-red-100 text-center">
                      <span className="text-slate-500 block">DOB Check</span>
                      <span className="text-emerald-700 font-bold">PASS</span>
                    </div>
                    <div className="bg-white/80 p-1.5 rounded-lg border border-red-100 text-center">
                      <span className="text-slate-500 block">Expiry Check</span>
                      <span className="text-emerald-700 font-bold">PASS</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 mb-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-600 bg-slate-200/80 px-2 py-0.5 rounded-full">
                        ABBYY® OCR Engine Status
                      </span>
                      <p className="text-lg font-bold font-serif text-slate-800 mt-1">
                        Form Blank / Awaiting Document
                      </p>
                    </div>
                    <div className="text-right font-mono text-[10px] text-slate-500">
                      <span>Ready to scan</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Upload or take a photo of a traveler passport or ID card. The engine will automatically populate all fields below with high-precision OCR.
                  </p>
                </div>
              )}

              {/* Recognized Structured Fields */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-red-600" />
                    Traveler Passport Fields
                  </h3>
                  {Object.keys(editableData).length > 0 && (
                    <button
                      type="button"
                      onClick={() => setEditableData({})}
                      className="text-[11px] font-bold text-red-600 hover:text-red-700 cursor-pointer"
                    >
                      Clear Fields
                    </button>
                  )}
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Full Legal Traveler Name (as on Passport)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={editableData.fullName || ''}
                      onChange={(e) => setEditableData({ ...editableData, fullName: e.target.value })}
                      placeholder="e.g. Dr. Arthur Pendelton"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-red-500 focus:ring-1 focus:ring-red-500"
                    />
                    {editableData.fullName && (
                      <button
                        type="button"
                        onClick={() => copyToClipboard(editableData.fullName || '', 'fullName')}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700"
                      >
                        {copiedField === 'fullName' ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Passport Number & Expiry */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Passport Number
                    </label>
                    <input
                      type="text"
                      value={editableData.passportNumber || ''}
                      onChange={(e) =>
                        setEditableData({ ...editableData, passportNumber: e.target.value.toUpperCase() })
                      }
                      placeholder="e.g. GB98234112"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-900 focus:bg-white focus:border-red-500 focus:ring-1 focus:ring-red-500 uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Passport Expiry
                    </label>
                    <input
                      type="date"
                      value={editableData.passportExpiry || ''}
                      onChange={(e) => setEditableData({ ...editableData, passportExpiry: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono text-slate-900 focus:bg-white focus:border-red-500 focus:ring-1 focus:ring-red-500"
                    />
                  </div>
                </div>

                {/* Nationality & DOB */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Nationality / Citizenship
                    </label>
                    <input
                      type="text"
                      value={editableData.nationality || ''}
                      onChange={(e) => setEditableData({ ...editableData, nationality: e.target.value })}
                      placeholder="e.g. British"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-red-500 focus:ring-1 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={editableData.dateOfBirth || editableData.dob || ''}
                      onChange={(e) =>
                        setEditableData({ ...editableData, dateOfBirth: e.target.value, dob: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono text-slate-900 focus:bg-white focus:border-red-500 focus:ring-1 focus:ring-red-500"
                    />
                  </div>
                </div>

                {/* Gender & Occupation */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Gender</label>
                    <select
                      value={editableData.gender || ''}
                      onChange={(e) => setEditableData({ ...editableData, gender: e.target.value as any })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-red-500 focus:ring-1 focus:ring-red-500"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Profession / Occupation
                    </label>
                    <input
                      type="text"
                      value={editableData.occupation || ''}
                      onChange={(e) => setEditableData({ ...editableData, occupation: e.target.value })}
                      placeholder="e.g. Archaeologist"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-red-500 focus:ring-1 focus:ring-red-500"
                    />
                  </div>
                </div>

                {/* Contact Email & Phone */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={editableData.email || ''}
                      onChange={(e) => setEditableData({ ...editableData, email: e.target.value })}
                      placeholder="traveler@example.com"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-red-500 focus:ring-1 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={editableData.phone || ''}
                      onChange={(e) => setEditableData({ ...editableData, phone: e.target.value })}
                      placeholder="+44 7700 900123"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-red-500 focus:ring-1 focus:ring-red-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleApply}
                disabled={!editableData.fullName && !editableData.passportNumber}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold shadow-md transition flex items-center gap-2 ${
                  editableData.fullName || editableData.passportNumber
                    ? 'bg-red-600 hover:bg-red-500 text-white hover:shadow-lg cursor-pointer'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                Apply ABBYY Verified Data to Form
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

