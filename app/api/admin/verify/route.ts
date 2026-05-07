import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const { email, otp, password } = await req.json();

  const token = await prisma.verificationToken.findFirst({
    where: { email, otp, expiresAt: { gt: new Date() } }
  });

  if (!token) return Response.json({ error: "Invalid or expired code" }, { status: 400 });

  const hashedPassword = await bcrypt.hash(password, 12);
  
  await prisma.admin.create({
    data: { email, password: hashedPassword }
  });

  // Clean up
  await prisma.verificationToken.delete({ where: { id: token.id } });

  return Response.json({ success: true });
}