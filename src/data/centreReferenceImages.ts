export type CentreReferenceImage = {
  centreId: string;
  cropId: string;
  cropName: string;
  imageData: string;
  updatedAt: string;
};

const storageKey = 'Kisan Marg_centre_reference_images';

const read = (): CentreReferenceImage[] => {
  try { return JSON.parse(localStorage.getItem(storageKey) || '[]'); } catch { return []; }
};

const write = (images: CentreReferenceImage[]) => localStorage.setItem(storageKey, JSON.stringify(images));

export const getCentreReferenceImage = (centreId: string, cropId: string) =>
  read().find((image) => image.centreId === centreId && image.cropId === cropId) || null;

export const saveCentreReferenceImage = (image: CentreReferenceImage) => {
  const images = read();
  const existingIndex = images.findIndex((item) => item.centreId === image.centreId && item.cropId === image.cropId);
  if (existingIndex >= 0) images[existingIndex] = image;
  else images.push(image);
  write(images);
};
