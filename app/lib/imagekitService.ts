export interface ImageKitUploadResult {
  url: string;
  fileId?: string;
  warning?: string;
  error?: string;
}

/**
 * Uploads an image file or base64 data URL to ImageKit via local API route.
 * Returns the uploaded ImageKit image URL.
 */
export async function uploadImageToImageKit(
  fileData: string,
  fileName: string,
  folder: string = '/products'
): Promise<string> {
  if (!fileData) return '';

  // If already an existing ImageKit URL, return as is
  if ((fileData.startsWith('http://') || fileData.startsWith('https://')) && fileData.includes('ik.imagekit.io')) {
    return fileData;
  }

  try {
    const res = await fetch('/api/upload-imagekit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        file: fileData,
        fileName: fileName,
        folder: folder,
      }),
    });

    if (!res.ok) {
      console.error(`ImageKit upload HTTP error status: ${res.status}`);
      return fileData;
    }

    const data: ImageKitUploadResult = await res.json();
    if (data.url) {
      return data.url;
    }
    return fileData;
  } catch (error) {
    console.error('Failed to upload image to ImageKit:', error);
    return fileData;
  }
}
