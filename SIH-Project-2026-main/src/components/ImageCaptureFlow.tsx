import React, { useState, useRef, useEffect } from 'react';
import { Camera, Image as ImageIcon, X, RefreshCw, Check, SwitchCamera, AlertCircle } from 'lucide-react';

type CaptureMode = 'selection' | 'camera' | 'preview';

interface ImageCaptureFlowProps {
  onImageSelected: (file: File, previewUrl: string) => void;
  onCancel?: () => void;
  acceptedFormats?: string[];
  title?: string;
  description?: string;
}

export const ImageCaptureFlow: React.FC<ImageCaptureFlowProps> = ({
  onImageSelected,
  onCancel,
  acceptedFormats = ['image/jpeg', 'image/png', 'image/webp'],
  title = 'Upload Image',
  description = 'Choose how you want to provide the image',
}) => {
  const [mode, setMode] = useState<CaptureMode>('selection');
  const [capturedImage, setCapturedImage] = useState<{ file: File; preview: string } | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [cameraSupported, setCameraSupported] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check camera support
  useEffect(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraSupported(false);
    }
  }, []);

  // Cleanup stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
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
    setMode('camera');

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
        videoRef.current.play().catch((err) => {
          console.error('Video play error:', err);
          setError('Could not start camera preview. Please try again.');
          setMode('selection');
          stopCamera();
        });
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Camera permission denied. Please allow camera access in your browser settings and try again.');
      } else if (err.name === 'NotFoundError') {
        setError('No camera found on this device. Please use "Select from Media" instead.');
      } else {
        setError('Could not access camera. Please use "Select from Media" instead.');
      }
      setMode('selection');
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
        videoRef.current.play();
      }
    } catch (err: any) {
      setError('Could not switch camera. Using previous camera.');
      setFacingMode(facingMode === 'user' ? 'environment' : 'user');
      startCamera();
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

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to blob
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
        setCapturedImage({ file, preview: previewUrl });
        setMode('preview');
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
    setCapturedImage({ file, preview: previewUrl });
    setMode('preview');
    setError('');
  };

  const handleRetake = () => {
    if (capturedImage) {
      URL.revokeObjectURL(capturedImage.preview);
      setCapturedImage(null);
    }
    setMode('selection');
    setError('');
  };

  const handleUsePhoto = () => {
    if (capturedImage) {
      onImageSelected(capturedImage.file, capturedImage.preview);
    }
  };

  const handleClose = () => {
    stopCamera();
    if (capturedImage) {
      URL.revokeObjectURL(capturedImage.preview);
    }
    if (onCancel) {
      onCancel();
    }
  };

  // Selection Mode
  if (mode === 'selection') {
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
          {/* Select from Media */}
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

          {/* Take Photo / Camera */}
          <button
            type="button"
            onClick={startCamera}
            disabled={!cameraSupported}
            className="flex flex-col items-center gap-3 rounded-2xl border-2 border-stone-200 bg-white p-6 transition hover:border-emerald-600 hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed"
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

        {/* Hidden file input */}
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
  if (mode === 'camera') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-stone-900">Take Photo</h3>
          <button
            type="button"
            onClick={() => {
              stopCamera();
              setMode('selection');
            }}
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

        {/* Live Camera Preview */}
        <div className="relative overflow-hidden rounded-2xl bg-stone-900">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="h-auto w-full"
            style={{ maxHeight: '60vh' }}
          />

          {/* Camera Controls Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
            <div className="flex items-center justify-between">
              {/* Switch Camera */}
              <button
                type="button"
                onClick={switchCamera}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition hover:bg-white/30"
              >
                <SwitchCamera className="h-5 w-5" />
              </button>

              {/* Capture Button */}
              <button
                type="button"
                onClick={capturePhoto}
                className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-white text-emerald-800 shadow-lg transition hover:scale-105"
              >
                <Camera className="h-7 w-7" />
              </button>

              {/* Spacer for alignment */}
              <div className="h-12 w-12" />
            </div>
          </div>
        </div>

        {/* Hidden canvas for capture */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    );
  }

  // Preview Mode
  if (mode === 'preview' && capturedImage) {
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

        {/* Image Preview */}
        <div className="overflow-hidden rounded-2xl border border-stone-200">
          <img
            src={capturedImage.preview}
            alt="Captured preview"
            className="h-auto w-full object-contain"
            style={{ maxHeight: '60vh' }}
          />
        </div>

        <p className="text-xs text-stone-500">
          Check that the image is clear and shows the crop properly.
        </p>

        {/* Action Buttons */}
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
            onClick={handleUsePhoto}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-800 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-900"
          >
            <Check className="h-4 w-4" />
            <span>Use Photo</span>
          </button>
        </div>
      </div>
    );
  }

  return null;
};
