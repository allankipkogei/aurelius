import { prisma } from "@/lib/prisma"; // Adjust the path to your prisma instance
import bcrypt from "bcrypt";
export async function POST(request: Request) {
  const { email, otp, password } = await request.json();

  // 1. Find and validate the token
  const validToken = await prisma.verificationToken.findFirst({
    where: { 
      email, 
      otp, 
      expiresAt: { gt: new Date() } 
    }
  });

  if (!validToken) {
    return Response.json({ error: "Invalid or expired code" }, { status: 400 });
  }

  // 2. Create the Admin now that they are verified
  const hashedPassword = await bcrypt.hash(password, 12);
  await prisma.admin.create({
    data: { email, password: hashedPassword }
  });

  // 3. Cleanup: Delete the used token
  await prisma.verificationToken.delete({ where: { id: validToken.id } });

  return Response.json({ success: true });
}