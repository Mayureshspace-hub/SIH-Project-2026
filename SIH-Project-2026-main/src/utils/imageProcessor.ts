/**
 * Enhanced Image Processor with OpenCV.js for crop image standardization
 * Frontend-only preprocessing for Kisan Marg farmer crop images
 */

// OpenCV.js will be loaded globally via script tag
declare global {
  const cv: any;
}

export class ImageProcessingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ImageProcessingError';
  }
}

export interface ProcessingOptions {
  maxDimension?: number;
  jpegQuality?: number;
  enableEdgeDetection?: boolean;
  enablePerspectiveCorrection?: boolean;
  preserveColors?: boolean;
}

export interface ProcessingResult {
  processedFile: File;
  processedDataUrl: string;
  originalDataUrl: string;
  processingApplied: string[];
}

const DEFAULT_OPTIONS: ProcessingOptions = {
  maxDimension: 1600,
  jpegQuality: 0.88,
  enableEdgeDetection: true,
  enablePerspectiveCorrection: true,
  preserveColors: true,
};

/**
 * Main processing function - handles the complete image preprocessing pipeline
 */
export async function processImage(
  file: File,
  options: ProcessingOptions = {}
): Promise<ProcessingResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const processingApplied: string[] = [];

  // Validate file
  const supportedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!(file instanceof File) || !supportedTypes.includes(file.type)) {
    throw new ImageProcessingError('Please choose a JPG, PNG, or WEBP image file.');
  }

  try {
    // Load original image
    const originalDataUrl = await loadImageAsDataUrl(file);
    const img = await loadImageElement(file);

    // Process with OpenCV.js or fallback to Canvas
    let canvas: HTMLCanvasElement;
    let applied: string[];

    try {
      // Try OpenCV first
      const result = await processWithOpenCV(img, opts);
      canvas = result.canvas;
      applied = result.applied;
    } catch (err) {
      console.warn('OpenCV processing failed, using Canvas fallback:', err);
      // Fallback to simple canvas processing
      canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
      }
      applied = ['Canvas fallback processing'];
    }

    processingApplied.push(...applied);

    // Apply final Canvas API adjustments
    const finalCanvas = applyCanvasEnhancements(canvas, opts);
    processingApplied.push('Canvas normalization');

    // Convert to File
    const processedBlob = await canvasToBlob(finalCanvas, 'image/jpeg', opts.jpegQuality);
    const processedFile = new File(
      [processedBlob],
      `${file.name.replace(/\.[^.]+$/, '')}-processed.jpg`,
      { type: 'image/jpeg', lastModified: Date.now() }
    );

    const processedDataUrl = await blobToDataUrl(processedBlob);

    return {
      processedFile,
      processedDataUrl,
      originalDataUrl,
      processingApplied,
    };
  } catch (err: any) {
    console.error('Image processing error:', err);
    throw new ImageProcessingError(
      err.message || 'Could not process the image. Please try another photo.'
    );
  }
}

/**
 * Process image with OpenCV.js - includes edge detection, perspective correction, etc.
 */
async function processWithOpenCV(
  img: HTMLImageElement,
  options: ProcessingOptions
): Promise<{ canvas: HTMLCanvasElement; applied: string[] }> {
  const applied: string[] = [];

  // Check if OpenCV is available
  if (typeof cv === 'undefined' || !cv.Mat) {
    throw new Error('OpenCV.js not available');
  }

  // Create source mat from image
  const src = cv.imread(img);
  applied.push('OpenCV loaded');

  // Resize if needed for performance
  let mat = src.clone();
  const maxDim = options.maxDimension || 1600;
  const scale = Math.min(1, maxDim / Math.max(mat.rows, mat.cols));

  if (scale < 1) {
    const dsize = new cv.Size(Math.round(mat.cols * scale), Math.round(mat.rows * scale));
    cv.resize(mat, mat, dsize, 0, 0, cv.INTER_AREA);
    applied.push('Resized for processing');
  }

  // Try edge detection and perspective correction if enabled
  if (options.enableEdgeDetection && options.enablePerspectiveCorrection) {
    const corrected = attemptPerspectiveCorrection(mat);
    if (corrected) {
      mat.delete();
      mat = corrected;
      applied.push('Perspective correction');
    }
  }

  // Enhance image quality
  mat = enhanceImageQuality(mat, options.preserveColors || true);
  applied.push('Quality enhancement');

  // Convert back to canvas
  const canvas = document.createElement('canvas');
  cv.imshow(canvas, mat);

  // Cleanup
  src.delete();
  mat.delete();

  return { canvas, applied };
}

/**
 * Attempt perspective correction using edge detection
 * Returns corrected mat if successful, null if detection fails
 */
function attemptPerspectiveCorrection(src: any): any | null {
  try {
    const gray = new cv.Mat();
    const edges = new cv.Mat();
    const contours = new cv.MatVector();
    const hierarchy = new cv.Mat();

    // Convert to grayscale
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);

    // Apply Gaussian blur to reduce noise
    cv.GaussianBlur(gray, gray, new cv.Size(5, 5), 0, 0, cv.BORDER_DEFAULT);

    // Canny edge detection
    cv.Canny(gray, edges, 50, 150, 3, false);

    // Find contours
    cv.findContours(edges, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

    // Find the largest rectangular contour
    let maxArea = 0;
    let bestContour = -1;

    for (let i = 0; i < contours.size(); i++) {
      const contour = contours.get(i);
      const area = cv.contourArea(contour, false);
      const peri = cv.arcLength(contour, true);
      const approx = new cv.Mat();
      cv.approxPolyDP(contour, approx, 0.02 * peri, true);

      // Check if it's a quadrilateral with reasonable area
      if (approx.rows === 4 && area > maxArea && area > (src.rows * src.cols * 0.1)) {
        maxArea = area;
        bestContour = i;
      }

      approx.delete();
    }

    // If we found a good contour, apply perspective transform
    if (bestContour >= 0) {
      const contour = contours.get(bestContour);
      const peri = cv.arcLength(contour, true);
      const approx = new cv.Mat();
      cv.approxPolyDP(contour, approx, 0.02 * peri, true);

      if (approx.rows === 4) {
        // Get corner points
        const srcPoints = cv.Mat.zeros(4, 1, cv.CV_32FC2);
        for (let i = 0; i < 4; i++) {
          srcPoints.data32F[i * 2] = approx.data32S[i * 2];
          srcPoints.data32F[i * 2 + 1] = approx.data32S[i * 2 + 1];
        }

        // Calculate destination dimensions
        const width = Math.max(
          distance(srcPoints.data32F[0], srcPoints.data32F[1], srcPoints.data32F[2], srcPoints.data32F[3]),
          distance(srcPoints.data32F[4], srcPoints.data32F[5], srcPoints.data32F[6], srcPoints.data32F[7])
        );
        const height = Math.max(
          distance(srcPoints.data32F[0], srcPoints.data32F[1], srcPoints.data32F[4], srcPoints.data32F[5]),
          distance(srcPoints.data32F[2], srcPoints.data32F[3], srcPoints.data32F[6], srcPoints.data32F[7])
        );

        const dstPoints = cv.matFromArray(4, 1, cv.CV_32FC2, [
          0, 0,
          width - 1, 0,
          width - 1, height - 1,
          0, height - 1
        ]);

        // Get perspective transform matrix
        const M = cv.getPerspectiveTransform(srcPoints, dstPoints);
        const dst = new cv.Mat();
        const dsize = new cv.Size(width, height);
        cv.warpPerspective(src, dst, M, dsize, cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar());

        // Cleanup
        gray.delete();
        edges.delete();
        contours.delete();
        hierarchy.delete();
        approx.delete();
        srcPoints.delete();
        dstPoints.delete();
        M.delete();

        return dst;
      }

      approx.delete();
    }

    // Cleanup and return null if no correction found
    gray.delete();
    edges.delete();
    contours.delete();
    hierarchy.delete();
    return null;
  } catch (err) {
    console.warn('Perspective correction failed:', err);
    return null;
  }
}

/**
 * Enhance image quality while preserving crop colors
 */
function enhanceImageQuality(src: any, preserveColors: boolean): any {
  try {
    const enhanced = src.clone();

    // Convert to LAB color space for better processing
    if (preserveColors) {
      const lab = new cv.Mat();
      cv.cvtColor(enhanced, lab, cv.COLOR_RGBA2RGB, 0);
      cv.cvtColor(lab, lab, cv.COLOR_RGB2Lab, 0);

      // Split channels
      const channels = new cv.MatVector();
      cv.split(lab, channels);

      // Apply CLAHE (Contrast Limited Adaptive Histogram Equalization) to L channel
      const clahe = new cv.CLAHE(2.0, new cv.Size(8, 8));
      const lChannel = channels.get(0);
      clahe.apply(lChannel, lChannel);

      // Merge channels back
      cv.merge(channels, lab);
      cv.cvtColor(lab, enhanced, cv.COLOR_Lab2RGB, 0);
      cv.cvtColor(enhanced, enhanced, cv.COLOR_RGB2RGBA, 0);

      // Cleanup
      lab.delete();
      channels.delete();
    }

    // Apply mild sharpening
    const sharpened = new cv.Mat();
    const kernel = cv.matFromArray(3, 3, cv.CV_32F, [
      0, -0.5, 0,
      -0.5, 3, -0.5,
      0, -0.5, 0
    ]);
    cv.filter2D(enhanced, sharpened, cv.CV_8U, kernel, new cv.Point(-1, -1), 0, cv.BORDER_DEFAULT);
    kernel.delete();

    enhanced.delete();
    return sharpened;
  } catch (err) {
    console.warn('Quality enhancement failed:', err);
    return src;
  }
}

/**
 * Apply final Canvas API enhancements
 */
function applyCanvasEnhancements(
  inputCanvas: HTMLCanvasElement,
  options: ProcessingOptions
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = inputCanvas.width;
  canvas.height = inputCanvas.height;
  const ctx = canvas.getContext('2d', { willReadFrequently: false });

  if (!ctx) {
    return inputCanvas;
  }

  // Draw input image
  ctx.drawImage(inputCanvas, 0, 0);

  // Get image data
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // Calculate brightness statistics
  let totalBrightness = 0;
  const pixelCount = data.length / 4;

  for (let i = 0; i < data.length; i += 4) {
    totalBrightness += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  }

  const avgBrightness = totalBrightness / pixelCount;

  // Apply brightness normalization (target: 138)
  const brightnessFactor = Math.max(0.9, Math.min(1.1, 138 / avgBrightness));

  // Apply contrast enhancement (subtle)
  const contrastFactor = 1.05;

  for (let i = 0; i < data.length; i += 4) {
    for (let j = 0; j < 3; j++) {
      // Apply brightness and contrast
      let value = data[i + j];
      value = ((value - 128) * contrastFactor + 128) * brightnessFactor;
      data[i + j] = Math.max(0, Math.min(255, value));
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

/**
 * Helper: Calculate distance between two points
 */
function distance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

/**
 * Helper: Load image as data URL
 */
function loadImageAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Helper: Load image as HTMLImageElement
 */
function loadImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not load image'));
    };

    img.src = url;
  });
}

/**
 * Helper: Convert canvas to blob
 */
function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality?: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Could not create blob from canvas'));
        }
      },
      type,
      quality
    );
  });
}

/**
 * Helper: Convert blob to data URL
 */
function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Could not convert blob to data URL'));
    reader.readAsDataURL(blob);
  });
}
