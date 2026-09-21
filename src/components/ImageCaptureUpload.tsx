/**
 * Complete Image Capture and Upload Component with OpenCV.js preprocessing
 * Supports both camera capture and media selection with before/after preview
 */
import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Image as ImageIcon,
  X,
  RefreshCw,
  Check,
  SwitchCamera,
  AlertCircle,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { processImage, ProcessingResult } from '../utils/imageProcessor';

type FlowStage =
  | 'selection'
  | 'camera'
  | 'original-preview'
  | 'processing'
  | 'processed-preview';

interface ImageCaptureUploadProps {
  onImageReady: (file: File, dataUrl: string) => void;
  onCancel?: () => void;
  acceptedFormats?: string[];
  title?: string;
  description?: string;
  showBeforeAfter?: boolean;
}

export const ImageCaptureUpload: React.FC<ImageCaptureUploadProps> = ({
  onImageReady,
  onCancel,
  acceptedFormats = ['image/jpeg', 'image/png', 'image/webp'],
  title = 'Upload Crop Image',
  description = 'Choose how you want to provide the image',
  showBeforeAfter = true,
}) => {
  const [stage, setStage] = useState<FlowStage>('selection');
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalPreview, setOriginalPreview] = useState<string>('');
  const [processingResult, setProcessingResult] = useState<ProcessingResult | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [cameraSupported, setCameraSupported] = useState(true);
  const [showComparison, setShowComparison] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check camera support
  useEffect(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraSupported(false);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      if (originalPreview) URL.revokeObjectURL(originalPreview);
    };
  }, []);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const startCamera = async () => {
    setError('');
    setStage('camera');

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError(
          'Camera permission denied. Please allow camera access in your browser settings.'
        );
      } else if (err.name === 'NotFoundError') {
        setError('No camera found. Please use "Select from Media" instead.');
      } else {
        setError('Could not access camera. Please use "Select from Media" instead.');
      }
      setStage('selection');
      stopCamera();
    }
  };

  const switchCamera = async () => {
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newFacingMode);
    stopCamera();

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: newFacingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
    } catch {
      setError('Could not switch camera.');
      setFacingMode(facingMode === 'user' ? 'environment' : 'user');
      await startCamera();
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) {
      setError('Could not prepare canvas for capture.');
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setError('Could not capture photo. Please try again.');
          return;
        }

        const file = new File([blob], `crop-photo-${Date.now()}.jpg`, {
          type: 'image/jpeg',
          lastModified: Date.now(),
        });

        const previewUrl = URL.createObjectURL(blob);
        setOriginalFile(file);
        setOriginalPreview(previewUrl);
        setStage('original-preview');
        stopCamera();
      },
      'image/jpeg',
      0.92
    );
  };

  const handleMediaSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!acceptedFormats.includes(file.type)) {
      setError(`Please select a valid image format: ${acceptedFormats.join(', ')}`);
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setOriginalFile(file);
    setOriginalPreview(previewUrl);
    setStage('original-preview');
    setError('');
  };

  const handleContinueToProcessing = async () => {
    if (!originalFile) return;

    setStage('processing');
    setError('');

    try {
      const result = await processImage(originalFile, {
        maxDimension: 1600,
        jpegQuality: 0.88,
        enableEdgeDetection: true,
        enablePerspectiveCorrection: true,
        preserveColors: true,
      });

      setProcessingResult(result);
      setStage('processed-preview');
    } catch (err: any) {
      setError(err.message || 'Could not process the image. Please try another photo.');
      setStage('original-preview');
    }
  };

  const handleRetake = () => {
    if (originalPreview) {
      URL.revokeObjectURL(originalPreview);
    }
    setOriginalFile(null);
    setOriginalPreview('');
    setProcessingResult(null);
    setError('');
    setStage('selection');
  };

  const handleUpload = () => {
    if (processingResult) {
      onImageReady(processingResult.processedFile, processingResult.processedDataUrl);
    }
  };

  const handleClose = () => {
    stopCamera();
    if (originalPreview) URL.revokeObjectURL(originalPreview);
    if (onCancel) onCancel();
  };

  // Selection Mode
  if (stage === 'selection') {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-bold text-stone-900">{title}</h3>
          <p className="mt-1 text-xs text-stone-500">{description}</p>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center gap-3 rounded-2xl border-2 border-stone-200 bg-white p-6 transition hover:border-emerald-600 hover:bg-emerald-50"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
              <ImageIcon className="h-6 w-6" />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-stone-900">Select from Media</p>
              <p className="mt-1 text-xs text-stone-500">Choose from gallery</p>
            </div>
          </button>

          <button
            type="button"
            onClick={startCamera}
            disabled={!cameraSupported}
            className="flex flex-col items-center gap-3 rounded-2xl border-2 border-stone-200 bg-white p-6 transition hover:border-emerald-600 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
              <Camera className="h-6 w-6" />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-stone-900">Take Photo</p>
              <p className="mt-1 text-xs text-stone-500">
                {cameraSupported ? 'Use camera' : 'Not available'}
              </p>
            </div>
          </button>
        </div>

        {onCancel && (
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100"
            >
              Cancel
            </button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFormats.join(',')}
          onChange={handleMediaSelect}
          className="hidden"
        />
      </div>
    );
  }

  // Camera Mode
  if (stage === 'camera') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-stone-900">Take Photo</h3>
          <button
            type="button"
            onClick={() => {
              stopCamera();
              setStage('selection');
            }}
            className="rounded-lg p-1 text-stone-500 hover:bg-stone-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-stone-900">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="h-auto w-full"
            style={{ maxHeight: '60vh' }}
          />

          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={switchCamera}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition hover:bg-white/30"
              >
                <SwitchCamera className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={capturePhoto}
                className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-white text-emerald-800 shadow-lg transition hover:scale-105"
              >
                <Camera className="h-7 w-7" />
              </button>

              <div className="h-12 w-12" />
            </div>
          </div>
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    );
  }

  // Original Preview Mode
  if (stage === 'original-preview' && originalPreview) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-stone-900">Preview Image</h3>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-1 text-stone-500 hover:bg-stone-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-stone-200">
          <img
            src={originalPreview}
            alt="Original preview"
            className="h-auto w-full object-contain"
            style={{ maxHeight: '60vh' }}
          />
        </div>

        <p className="text-xs text-stone-500">
          Check that the image is clear and shows your crop properly.
        </p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleRetake}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-stone-300 bg-white px-4 py-3 text-sm font-bold text-stone-700 transition hover:bg-stone-50"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Retake / Change Image</span>
          </button>

          <button
            type="button"
            onClick={handleContinueToProcessing}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-800 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-900"
          >
            <Check className="h-4 w-4" />
            <span>OK / Continue</span>
          </button>
        </div>
      </div>
    );
  }

  // Processing Mode
  if (stage === 'processing') {
    return (
      <div className="space-y-4">
        <div className="flex flex-col items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 p-12">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-800" />
          <p className="mt-4 text-sm font-bold text-emerald-900">Processing image...</p>
          <p className="mt-1 text-xs text-emerald-700">
            Applying OpenCV.js enhancement and standardization
          </p>
        </div>
      </div>
    );
  }

  // Processed Preview Mode
  if (stage === 'processed-preview' && processingResult) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-700" />
            <h3 className="text-sm font-bold text-stone-900">Processed Image Ready</h3>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-1 text-stone-500 hover:bg-stone-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {showBeforeAfter && (
          <div className="rounded-xl border border-stone-200 bg-stone-50 p-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-stone-700">
                Processing applied: {processingResult.processingApplied.join(', ')}
              </p>
              <button
                type="button"
                onClick={() => setShowComparison(!showComparison)}
                className="text-xs font-semibold text-emerald-800 hover:underline"
              >
                {showComparison ? 'Hide' : 'Show'} Before/After
              </button>
            </div>
          </div>
        )}

        {showComparison && showBeforeAfter ? (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <p className="text-xs font-bold text-stone-700">Before</p>
              <div className="overflow-hidden rounded-xl border border-stone-200">
                <img
                  src={processingResult.originalDataUrl}
                  alt="Original"
                  className="h-auto w-full object-contain"
                  style={{ maxHeight: '40vh' }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-bold text-emerald-700">After</p>
              <div className="overflow-hidden rounded-xl border border-emerald-200">
                <img
                  src={processingResult.processedDataUrl}
                  alt="Processed"
                  className="h-auto w-full object-contain"
                  style={{ maxHeight: '40vh' }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-emerald-200">
            <img
              src={processingResult.processedDataUrl}
              alt="Processed preview"
              className="h-auto w-full object-contain"
              style={{ maxHeight: '60vh' }}
            />
          </div>
        )}

        <p className="text-xs text-stone-500">
          Image has been enhanced and standardized for better quality analysis.
        </p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleRetake}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-stone-300 bg-white px-4 py-3 text-sm font-bold text-stone-700 transition hover:bg-stone-50"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Retake / Change Image</span>
          </button>

          <button
            type="button"
            onClick={handleUpload}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-800 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-900"
          >
            <Check className="h-4 w-4" />
            <span>Upload Image</span>
          </button>
        </div>
      </div>
    );
  }

  return null;
};
