import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs"; // Use bcryptjs here

export async function POST(request: Request) {
  try {
    const { email, otp, password, confirmPassword } = await request.json();
    const normalizedEmail = email.toLowerCase().trim();

    // 1. Validate the OTP in Postgres
    const validToken = await prisma.verificationToken.findFirst({
      where: { 
        email: normalizedEmail, 
        otp, 
        expiresAt: { gt: new Date() } 
      }
    });

    if (!validToken) {
      return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 });
    }

    // 2. Hash password with bcryptjs
    const hashedPassword = await bcrypt.hash(password, 12);

    // 3. Create the Admin record
    await prisma.admin.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
      }
    });

    // 4. Cleanup the used token
    await prisma.verificationToken.delete({ where: { id: validToken.id } });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}