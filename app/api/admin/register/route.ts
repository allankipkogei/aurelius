import { Resend } from 'resend';
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  const { email } = await request.json();
  
  // 1. Generate a 6-digit code
  const otp = crypto.randomInt(100000, 999999).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

  // 2. Store OTP in Postgres
  await prisma.verificationToken.create({
    data: { email, otp, expiresAt }
  });

  // 3. Send the Email
  await resend.emails.send({
    from: 'Aurelius Vault <security@yourdomain.com>',
    to: email,
    subject: 'Your Access Code for Aurelius Timepieces',
    html: `<p>Your one-time security code is: <strong>${otp}</strong>. It expires in 10 minutes.</p>`
  });

  return Response.json({ message: "OTP sent to email" });
}