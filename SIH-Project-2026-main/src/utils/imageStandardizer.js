/**
 * Conservative preprocessing for both reference and farmer crop photos.
 * It intentionally avoids beauty filters or strong colour adjustments so
 * visible crop damage, discoloration, and foreign matter stay visible.
 */
const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.88;

export class ImageQualityError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ImageQualityError';
  }
}

export async function standardizeImage(file) {
  const supportedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!(file instanceof File) || !supportedTypes.includes(file.type)) {
    throw new ImageQualityError('Please choose a JPG, JPEG, PNG, or WEBP image file.');
  }

  const source = await loadImage(file);

  const scale = Math.min(1, MAX_DIMENSION / Math.max(source.width, source.height));
  const width = Math.round(source.width * scale);
  const height = Math.round(source.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) throw new ImageQualityError('Your browser could not prepare this image.');

  context.drawImage(source, 0, 0, width, height);
  const imageData = context.getImageData(0, 0, width, height);
  const imageStats = inspectImage(imageData, width, height);

  // Every readable image is accepted. These bounded corrections create a
  // common baseline without treating darkness, blur, or size as an error.
  normalizeLight(imageData, imageStats);
  context.putImageData(imageData, 0, 0);

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY));
  if (!blob) throw new ImageQualityError('Could not compress the prepared image. Please try another photo.');
  const name = file.name.replace(/\.[^.]+$/, '') || 'crop-image';
  return new File([blob], `${name}-standardized.jpg`, { type: 'image/jpeg', lastModified: Date.now() });
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);
    image.onload = () => { URL.revokeObjectURL(url); resolve(image); };
    image.onerror = () => { URL.revokeObjectURL(url); reject(new ImageQualityError('This image could not be read.')); };
    image.src = url;
  });
}

function inspectImage(imageData, width, height) {
  const { data } = imageData;
  let total = 0; let redTotal = 0; let greenTotal = 0; let blueTotal = 0; let count = 0;
  const step = Math.max(1, Math.floor(Math.max(width, height) / 400));
  for (let y = 0; y < height; y += step) for (let x = 0; x < width; x += step) {
    const index = (y * width + x) * 4;
    total += 0.2126 * data[index] + 0.7152 * data[index + 1] + 0.0722 * data[index + 2];
    redTotal += data[index]; greenTotal += data[index + 1]; blueTotal += data[index + 2];
    count += 1;
  }
  return { brightness: total / count, red: redTotal / count, green: greenTotal / count, blue: blueTotal / count };
}

function normalizeLight(imageData, quality) {
  const { data } = imageData;
  const brightnessGain = Math.max(0.9, Math.min(1.1, 138 / quality.brightness));
  const neutral = (quality.red + quality.green + quality.blue) / 3;
  // Tiny, capped colour-balance correction for uneven lighting. It does not
  // change saturation or remove naturally occurring crop colour variation.
  const channelGains = [quality.red, quality.green, quality.blue].map((value) => {
    const proposedGain = value > 0 ? neutral / value : 1;
    return Math.max(0.96, Math.min(1.04, proposedGain));
  });
  // Slight contrast normalization around middle grey. No saturation adjustment.
  const contrast = 1.03;
  for (let index = 0; index < data.length; index += 4) {
    for (let channel = 0; channel < 3; channel += 1) {
      const corrected = ((data[index + channel] * brightnessGain * channelGains[channel] - 128) * contrast) + 128;
      data[index + channel] = Math.max(0, Math.min(255, corrected));
    }
  }
}
