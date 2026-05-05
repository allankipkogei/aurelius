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
    const brand = searchParams.get('brand')?.toLowerCase() || '';
    const minPrice = searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!) : 0;
    const maxPrice = searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : 10000000;
    const sort = searchParams.get('sort') || 'newest';

    // Fetch all active watches
    const { rows: allWatches } = await client.sql`SELECT * FROM watches WHERE is_sold_out = false ORDER BY created_at DESC`;

    // Filter in memory
    let filtered = allWatches.filter((watch: any) => {
      const matchesSearch = !search || 
        watch.name.toLowerCase().includes(search) || 
        watch.brand.toLowerCase().includes(search);
      
      const matchesBrand = !brand || watch.brand.toLowerCase() === brand;
      
      const matchesPrice = watch.price >= minPrice && watch.price <= maxPrice;

      return matchesSearch && matchesBrand && matchesPrice;
    });

    // Sort
    switch (sort) {
      case 'price-low':
        filtered.sort((a: any, b: any) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a: any, b: any) => b.price - a.price);
        break;
      case 'name':
        filtered.sort((a: any, b: any) => a.name.localeCompare(b.name));
        break;
      default: // 'newest'
        filtered.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    const response = NextResponse.json(filtered);
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    
    return response;
  } catch (error) {
    console.error("Fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch inventory" }, { status: 500 });
  } finally {
    client.release();
  }
}
