// app/api/products/[id]/route.ts
import { db } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const client = await db.connect();
  const { id } = await params;

  try {
    const body = await request.json();
    const idNum = parseInt(id);
    
    // Handle sold status update
    if (body.hasOwnProperty('is_sold_out')) {
      await client.sql`
        UPDATE watches 
        SET is_sold_out = ${body.is_sold_out}
        WHERE id = ${idNum};
      `;
      return NextResponse.json({ message: "Inventory updated" });
    }

    // Handle full watch update (name, brand, price, image_url)
    if (body.name || body.brand || body.price !== undefined || body.image_url) {
      const result = await client.sql`
        UPDATE watches 
        SET 
          name = COALESCE(${body.name || null}, name),
          brand = COALESCE(${body.brand || null}, brand),
          price = COALESCE(${body.price || null}, price),
          image_url = COALESCE(${body.image_url || null}, image_url)
        WHERE id = ${idNum}
        RETURNING *;
      `;
      
      return NextResponse.json(result.rows[0]);
    }

    return NextResponse.json({ error: "Invalid update request" }, { status: 400 });
  } catch (error) {
    console.error("PATCH error:", error);
    return NextResponse.json({ error: "Failed to update watch" }, { status: 500 });
  } finally {
    client.release();
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const client = await db.connect();
  const { id } = await params;

  try {
    const idNum = parseInt(id);
    await client.sql`
      DELETE FROM watches 
      WHERE id = ${idNum};
    `;

    return NextResponse.json({ message: "Watch deleted successfully" });
  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete watch" }, { status: 500 });
  } finally {
    client.release();
  }
}