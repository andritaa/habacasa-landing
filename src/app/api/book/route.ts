import { NextRequest, NextResponse } from "next/server";

interface BookingRequest {
  name: string;
  email: string;
  company: string;
  phone?: string;
  message?: string;
  datetime: string;
  date_display: string;
  time_display: string;
}

async function sendTelegramAlert(booking: BookingRequest): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID || "168204171";
  if (!token) return;

  const text =
    `📅 *New Discovery Call Booking*\n\n` +
    `*Name:* ${booking.name}\n` +
    `*Email:* ${booking.email}\n` +
    `*Company:* ${booking.company}\n` +
    `*Phone:* ${booking.phone || "N/A"}\n` +
    `*When:* ${booking.date_display} at ${booking.time_display} UK\n` +
    `*Message:* ${booking.message || "N/A"}`;

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "Markdown" }),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body: BookingRequest = await req.json();

    // Validate required fields
    if (!body.name || !body.email || !body.company || !body.datetime) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    // Email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      return NextResponse.json({ success: false, error: "Invalid email address" }, { status: 400 });
    }

    // Send Telegram notification (non-blocking — don't fail booking if this errors)
    try {
      await sendTelegramAlert(body);
    } catch (e) {
      console.error("Telegram alert failed:", e);
    }

    // Log booking server-side
    console.log("[BOOKING]", JSON.stringify({
      ...body,
      booked_at: new Date().toISOString(),
    }));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Booking API error:", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
