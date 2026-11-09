/**
 * OpenCV.js Loader Utility
 * Handles loading and initializing OpenCV.js for image processing
 */

let opencvLoaded = false;
let loadPromise: Promise<void> | null = null;

export async function ensureOpenCVLoaded(): Promise<void> {
  if (opencvLoaded) return;

  if (!loadPromise) {
    loadPromise = new Promise((resolve, reject) => {
      // Check if OpenCV is already available
      if (typeof cv !== 'undefined' && cv.Mat) {
        opencvLoaded = true;
        resolve();
        return;
      }

      // OpenCV.js is loaded via NPM package - it should be available
      // but we need to wait for it to initialize
      const checkInterval = setInterval(() => {
        if (typeof cv !== 'undefined' && cv.Mat) {
          clearInterval(checkInterval);
          opencvLoaded = true;
          resolve();
        }
      }, 100);

      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        if (!opencvLoaded) {
          reject(new Error('OpenCV.js failed to load within 10 seconds'));
        }
      }, 10000);
    });
  }

  return loadPromise;
}

export function isOpenCVLoaded(): boolean {
  return opencvLoaded;
}

export function cleanupOpenCV(): void {
  // OpenCV.js doesn't need manual cleanup, but we can reset state
  opencvLoaded = false;
  loadPromise = null;
}
