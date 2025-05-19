/**
 * Utility functions for image handling, especially for HEIC format conversion
 */

// Import heic2any properly with types
// Using dynamic import to prevent requiring it as a direct dependency
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let heic2any: ((options: { blob: Blob, toType?: string, quality?: number }) => Promise<Blob | Blob[]>) | null = null;

// Only import in browser environment
if (typeof window !== 'undefined') {
  // Using dynamic import with try/catch to gracefully handle missing package
  import('heic2any').then(module => {
    heic2any = module.default;
  }).catch(error => {
    console.warn('heic2any library not available. HEIC conversion may be limited.', error);
  });
}

/**
 * Converts any image file to a JPEG base64 string
 * Handles HEIC files using heic2any if available
 * 
 * @param file - The image file to convert
 * @returns Promise resolving to base64 string (without the data:image prefix)
 */
export async function convertToJpegBase64(file: File): Promise<string> {
  try {
    // Special handling for HEIC files
    if (file.type === 'image/heic' || 
        file.name.toLowerCase().endsWith('.heic') || 
        file.name.toLowerCase().endsWith('.heif')) {
      
      console.log('HEIC file detected, attempting conversion...');
      
      // Check if heic2any is available
      if (heic2any) {
        console.log('Converting HEIC using heic2any library');
        // Convert HEIC to JPEG blob using heic2any
        const jpegBlob = await heic2any({
          blob: file,
          toType: 'image/jpeg',
          quality: 0.85
        });
        
        // If multiple blobs were returned (shouldn't happen with single images), take the first one
        const resultBlob = Array.isArray(jpegBlob) ? jpegBlob[0] : jpegBlob;
        
        // Convert the JPEG blob to base64
        return blobToBase64(resultBlob);
      } else {
        console.log('heic2any not available, falling back to canvas conversion');
        // Try canvas-based conversion as fallback
        return canvasConversion(file);
      }
    }
    
    // For JPEG/PNG, use simple method
    if (file.type === 'image/jpeg' || file.type === 'image/png') {
      return fileToBase64(file);
    }
    
    // For other image formats, use canvas conversion
    return canvasConversion(file);
  } catch (error) {
    console.error('Error converting image to JPEG:', error);
    // Last resort: try simple base64 conversion
    try {
      return fileToBase64(file);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      // We intentionally don't use the error object here
      throw new Error('Failed to convert image format. Please try a JPEG or PNG image.');
    }
  }
}

/**
 * Helper function to convert a Blob to base64
 * @param blob - The blob to convert
 * @returns Promise resolving to base64 string (without the data:image prefix)
 */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Remove the data:image/jpeg;base64, prefix
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error('Failed to convert blob to base64'));
      }
    };
    reader.onerror = error => reject(error);
  });
}

/**
 * Canvas-based conversion for image files - fallback method for HEIC
 * @param file - The image file to convert
 * @returns Promise resolving to base64 string
 */
async function canvasConversion(file: File): Promise<string> {
  // Create a URL for the file
  const url = URL.createObjectURL(file);
  
  // Create an image element and load the file
  const img = new Image();
  
  // Wait for the image to load
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
    img.src = url;
  });
  
  // Create a canvas with the image dimensions
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  
  // Draw the image on the canvas
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas context');
  ctx.drawImage(img, 0, 0);
  
  // Convert to JPEG base64 string
  const jpegBase64 = canvas.toDataURL('image/jpeg', 0.85).split(',')[1];
  
  // Clean up
  URL.revokeObjectURL(url);
  
  return jpegBase64;
}

/**
 * Helper function to convert a file to base64
 * @param file - The image file to convert
 * @returns Promise resolving to base64 string (without the data:image prefix)
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Remove the data:image/jpeg;base64, prefix
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = error => reject(error);
  });
} 