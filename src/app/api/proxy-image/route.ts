import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const url = searchParams.get('url');

  try {
    if (id) {
      // Use webContentLink URL structure to download public files without OAuth2 token.
      const driveUrl = `https://drive.google.com/uc?export=download&id=${id}`;
      const response = await fetch(driveUrl);
      
      if (response.ok) {
        const headers = new Headers();
        headers.set('Content-Type', response.headers.get('Content-Type') || 'image/jpeg');
        headers.set('Access-Control-Allow-Origin', '*'); 
        return new NextResponse(response.body, { headers });
      } else {
        console.warn(`Drive API download failed for id ${id}:`, response.statusText);
      }
    }

    if (url) {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }

      const headers = new Headers();
      headers.set('Content-Type', response.headers.get('Content-Type') || 'image/jpeg');
      headers.set('Access-Control-Allow-Origin', '*'); 
      
      return new NextResponse(response.body, { headers });
    }

    return new NextResponse('Missing id or url', { status: 400 });
  } catch (error: any) {
    console.error('Error proxying image:', error);
    return new NextResponse('Error proxying image', { status: 500 });
  }
}
