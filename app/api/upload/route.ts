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

  // 2. Perform the upload to Vercel Blob
  try {
    const blob = await put(filename, request.body, {
      access: 'public',
      // Explicitly setting contentType helps browsers render the images correctly
      contentType: fileExtension === 'svg' ? 'image/svg+xml' : `image/${fileExtension}`,
    });

    return NextResponse.json(blob);
  } catch (error) {
    console.error("Vercel Blob Error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}