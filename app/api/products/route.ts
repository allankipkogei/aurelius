// app/api/products/route.ts
import { db } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const client = await db.connect();
  
  try {
    const { name, brand, price, image_url } = await request.json();

    // Standard Next.js server actions / routes expect specific error handling
    if (!name || !brand || !price || !image_url) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await client.sql`
      INSERT INTO watches (name, brand, price, image_url, is_sold_out)
      VALUES (${name}, ${brand}, ${price}, ${image_url}, false);
    `;

    return NextResponse.json({ message: "Watch added to collection" }, { status: 201 });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  } finally {
    client.release();
  }
}

export async function GET() {
  const client = await db.connect();
  try {
    const { rows } = await client.sql`SELECT * FROM watches ORDER BY created_at DESC;`;
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch inventory" }, { status: 500 });
  } finally {
    client.release();
  }
}