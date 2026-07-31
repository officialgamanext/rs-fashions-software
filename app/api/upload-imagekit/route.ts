import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { file, fileName, folder } = body;

    if (!file || !fileName) {
      return NextResponse.json({ error: 'file and fileName are required' }, { status: 400 });
    }

    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY || process.env.NEXT_PUBLIC_IMAGEKIT_PRIVATE_KEY;

    // Check if real ImageKit private key is set
    if (!privateKey || privateKey.includes('placeholder')) {
      console.warn('ImageKit private key not configured or using placeholder. Returning mock/fallback URL.');
      // If file is already an http(s) URL, return it directly
      if (typeof file === 'string' && (file.startsWith('http://') || file.startsWith('https://'))) {
        return NextResponse.json({ url: file, fileId: 'existing-url' });
      }
      // Return file data URL as fallback if imagekit credentials are not configured
      return NextResponse.json({ 
        url: file, 
        fileId: `mock-id-${Date.now()}`,
        warning: 'ImageKit private key not configured. Using data URL fallback.' 
      });
    }

    // Call ImageKit REST upload API
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', fileName);
    formData.append('useUniqueFileName', 'true');
    if (folder) {
      formData.append('folder', folder);
    }

    const authHeader = 'Basic ' + Buffer.from(privateKey + ':').toString('base64');

    const res = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
      method: 'POST',
      headers: {
        Authorization: authHeader
      },
      body: formData
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('ImageKit upload error response:', errorText);
      // Fallback to data URL / file if upload request fails
      return NextResponse.json({ 
        url: file, 
        fileId: `fallback-id-${Date.now()}`,
        warning: 'ImageKit API request failed. Using fallback data URL.',
        details: errorText 
      });
    }

    const data = await res.json();
    return NextResponse.json({
      url: data.url,
      fileId: data.fileId,
      name: data.name,
      thumbnailUrl: data.thumbnailUrl
    });
  } catch (error: any) {
    console.error('Error in ImageKit upload API:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
