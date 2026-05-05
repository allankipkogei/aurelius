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

export async function GET(request: Request) {
  const client = await db.connect();
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.toLowerCase() || '';
    const brand = searchParams.get('brand') || '';
    const minPrice = searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!) : 0;
    const maxPrice = searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : Infinity;
    const sort = searchParams.get('sort') || 'newest';

    // Build query with filters
    let query = `SELECT * FROM watches WHERE is_sold_out = false`;

    if (search) {
      query += ` AND (LOWER(name) LIKE $1 OR LOWER(brand) LIKE $1)`;
    }
    if (brand) {
      query += search ? ` AND LOWER(brand) = $2` : ` AND LOWER(brand) = $1`;
    }

    // Price filter
    query += search || brand ? ` AND price >= $${search && brand ? 3 : search || brand ? 2 : 1} AND price <= $${search && brand ? 4 : search || brand ? 3 : 2}` : ` AND price >= $1 AND price <= $2`;

    // Add sorting
    switch (sort) {
      case 'price-low':
        query += ' ORDER BY price ASC';
        break;
      case 'price-high':
        query += ' ORDER BY price DESC';
        break;
      case 'name':
        query += ' ORDER BY name ASC';
        break;
      default: // 'newest'
        query += ' ORDER BY created_at DESC';
    }

    // Build parameters array based on what filters are active
    const params: any[] = [];
    if (search) params.push(`%${search}%`);
    if (brand) params.push(brand.toLowerCase());
    params.push(minPrice);
    params.push(maxPrice);

    const { rows } = await client.sql(query, params);

    // Create response with explicit cache control headers
    const response = NextResponse.json(rows);
    response.headers.set('Cache-Control', 'no-store, max-age=0');

    return response;
  } catch (error) {
    console.error("Fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch inventory" }, { status: 500 });
  } finally {
    client.release();
  }
}