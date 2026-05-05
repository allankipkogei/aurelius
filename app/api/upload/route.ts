import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename') || "";

  // 1. Verify file extension
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'svg'];
  const fileExtension = filename.split('.').pop()?.toLowerCase();

  // Security check: Ensure filename exists and extension is allowed
  if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
    return NextResponse.json(
      { error: "Invalid file type. Only JPG, PNG, and SVG are allowed." },
      { status: 400 }
    );
  }

  // Ensure there is actually a body to upload
  if (!request.body) {
    return NextResponse.json({ error: "No file body provided" }, { status: 400 });
  }

  // 2. Convert request body to Buffer for Vercel Blob
  try {
    const buffer = await request.arrayBuffer();
    
    // 3. Perform the upload to Vercel Blob
    const blob = await put(filename, buffer, {
      access: 'public',
      // Explicitly setting contentType helps browsers render the images correctly
      contentType: fileExtension === 'svg' ? 'image/svg+xml' : `image/${fileExtension}`,
      // Add random suffix to generate unique filename if blob already exists
      addRandomSuffix: true,
    });

    return NextResponse.json(blob);
  } catch (error: any) {
    console.error("Vercel Blob Error:", error);
    
    // Check if it's a missing token error
    if (error.message?.includes('No token found')) {
      return NextResponse.json(
        { error: "Missing BLOB_READ_WRITE_TOKEN. Get a token from https://vercel.com/account/tokens (Blob scope) and add it to .env.local" }, 
        { status: 500 }
      );
    }
    
    // Return more detailed error for debugging
    return NextResponse.json({ 
      error: error.message || "Upload failed",
      details: error.code || error.status
    }, { status: 500 });
  }
}