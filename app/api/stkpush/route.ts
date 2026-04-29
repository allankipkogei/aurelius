import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { amount, phone } = await request.json();

    // 1. Generate M-Pesa OAuth Token
    const auth = Buffer.from(
      `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
    ).toString("base64");

    const tokenResponse = await fetch(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      { headers: { Authorization: `Basic ${auth}` } }
    );
    const { access_token } = await tokenResponse.json();

    // 2. Prepare the STK Push request
    const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, "").slice(0, 14);
    const password = Buffer.from(
      `${process.env.MPESA_BUSINESS_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`
    ).toString("base64");

    const stkResponse = await fetch(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/query", // Change to /processrequest for live
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          BusinessShortCode: process.env.MPESA_BUSINESS_SHORTCODE,
          Password: password,
          Timestamp: timestamp,
          TransactionType: "CustomerPayBillOnline",
          Amount: amount,
          PartyA: phone, // User's phone number
          PartyB: process.env.MPESA_BUSINESS_SHORTCODE,
          PhoneNumber: phone,
          CallBackURL: "https://your-domain.com/api/callback", // Use a placeholder for now
          AccountReference: "Aurelius Watches",
          TransactionDesc: "Payment for Watch",
        }),
      }
    );

    const result = await stkResponse.json();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "STK Push failed" }, { status: 500 });
  }
}