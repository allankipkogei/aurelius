import { Resend } from 'resend';
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    // 1. Generate a 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min expiry

    // 2. Save OTP to your VerificationToken table
    await prisma.verificationToken.create({
      data: {
        email: email.toLowerCase().trim(),
        otp,
        expiresAt
      }
    });

    // 3. Send the professional email
    await resend.emails.send({
      from: 'Aurelius Vault <security@aureliuswatches.shop>',
      to: email,
      subject: `${otp} is your Aurelius security code`,
      html: `
        <div style="font-family: serif; background: #000; color: #fff; padding: 40px; text-align: center;">
          <h1 style="color: #d97706; font-style: italic;">Aurelius Timepieces</h1>
          <p style="text-transform: uppercase; letter-spacing: 0.2em; font-size: 12px; color: #666;">Security Verification</p>
          <div style="margin: 40px 0; font-size: 32px; letter-spacing: 0.5em; border: 1px solid #333; padding: 20px; display: inline-block;">
            ${otp}
          </div>
          <p style="font-size: 10px; color: #444;">This code expires in 10 minutes. If you did not request this, please ignore this email.</p>
        </div>
      `
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}