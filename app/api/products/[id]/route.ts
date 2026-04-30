// app/api/products/[id]/route.ts
import { db } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const client = await db.connect();
  const id = params.id;

  try {
    const { is_sold_out } = await request.json();

    await client.sql`
      UPDATE watches 
      SET is_sold_out = ${is_sold_out}
      WHERE id = ${id};
    `;

    return NextResponse.json({ message: "Inventory updated" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  } finally {
    client.release();
  }
}