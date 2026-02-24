import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { Pool } from "pg";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// In-memory fallback for anonymous users (1 hour TTL)
const conversationHistory = new Map<string, {
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  lastActivity: number;
}>();

const CONVERSATION_TTL = 60 * 60 * 1000;
setInterval(() => {
  const now = Date.now();
  for (const [sessionId, data] of conversationHistory.entries()) {
    if (now - data.lastActivity > CONVERSATION_TTL) {
      conversationHistory.delete(sessionId);
    }
  }
}, 15 * 60 * 1000);

const dbUrl = process.env.DATABASE_URL || "";
const needsSsl = dbUrl.includes("rlwy.net") || (dbUrl.includes("railway") && !dbUrl.includes("railway.internal"));
const pool = new Pool({
  connectionString: dbUrl,
  ssl: needsSsl ? { rejectUnauthorized: false } : false,
});

async function getUserInfo(userId: string): Promise<{ name: string | null; email: string } | null> {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT id, email, name FROM "user" WHERE id = $1', [userId]);
    if (result.rows.length === 0) return null;
    return { name: result.rows[0].name, email: result.rows[0].email };
  } catch {
    return null;
  } finally {
    client.release();
  }
}

// Load cross-site conversation history — loads from ALL sites for cross-site memory
async function loadConversationHistory(userId: string): Promise<Array<{ role: "user" | "assistant"; content: string }>> {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT role, content FROM "conversation_messages"
      WHERE "userId" = $1
      ORDER BY "createdAt" ASC
      LIMIT 20
    `, [userId]);
    return result.rows.map(row => ({ role: row.role as "user" | "assistant", content: row.content }));
  } catch (error) {
    console.error("Error loading conversation history:", error);
    return [];
  } finally {
    client.release();
  }
}

async function saveMessages(
  userId: string,
  sessionId: string,
  messages: Array<{ role: "user" | "assistant"; content: string; site: string }>
): Promise<void> {
  const client = await pool.connect();
  try {
    for (const msg of messages) {
      await client.query(`
        INSERT INTO "conversation_messages" ("userId", "sessionId", "role", "content", "site")
        VALUES ($1, $2, $3, $4, $5)
      `, [userId, sessionId, msg.role, msg.content, msg.site]);
    }
  } catch (error) {
    console.error("Error saving messages:", error);
  } finally {
    client.release();
  }
}

export async function POST(req: NextRequest) {
  try {
    const { message, sessionId, site = "habacasa" } = await req.json();

    if (!message?.trim()) {
      return NextResponse.json({ reply: "Please enter a message." }, { status: 400 });
    }

    const session = await auth.api.getSession({ headers: req.headers });

    let userInfo: { name: string | null; email: string } | null = null;
    let agentSessionId = sessionId || "hc-anon-" + Math.random().toString(36).slice(2, 8);
    let messages: Array<{ role: "user" | "assistant"; content: string }> = [];

    if (session?.user) {
      userInfo = await getUserInfo(session.user.id);
      if (userInfo) {
        agentSessionId = `user-${session.user.id}`;
        // Load cross-site conversation history from DB
        messages = await loadConversationHistory(session.user.id);
      }
    } else {
      // Anonymous: use in-memory
      let conversation = conversationHistory.get(agentSessionId);
      if (!conversation) {
        conversation = { messages: [], lastActivity: Date.now() };
        conversationHistory.set(agentSessionId, conversation);
      }
      messages = conversation.messages;
    }

    const systemPrompt = buildSystemPrompt(userInfo);

    const allMessages: Array<{ role: "user" | "assistant"; content: string }> = [
      ...messages,
      { role: "user", content: message },
    ];

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      temperature: 0.7,
      system: systemPrompt,
      messages: allMessages.map(msg => ({ role: msg.role, content: msg.content })),
    });

    const assistantReply = response.content[0]?.type === "text"
      ? response.content[0].text
      : "I'm sorry, I couldn't generate a response. Please try again!";

    if (session?.user && userInfo) {
      await saveMessages(session.user.id, agentSessionId, [
        { role: "user", content: message, site },
        { role: "assistant", content: assistantReply, site },
      ]);
    } else {
      const conversation = conversationHistory.get(agentSessionId)!;
      conversation.messages.push(
        { role: "user", content: message },
        { role: "assistant", content: assistantReply }
      );
      conversation.lastActivity = Date.now();
      if (conversation.messages.length > 20) {
        conversation.messages = conversation.messages.slice(-20);
      }
    }

    return NextResponse.json({ reply: assistantReply });
  } catch (error) {
    console.error("HabaCasa chat API error:", error);
    return NextResponse.json(
      { reply: "Something went wrong. Please try again or email hello@haba.casa." },
      { status: 500 }
    );
  }
}

function buildSystemPrompt(userInfo: { name: string | null; email: string } | null): string {
  const basePrompt = `You are Andrita, the warm and personal AI assistant for HabaCasa — the smart home platform that keeps all your data private and on-premises.

**Your personality:**
- Warm, friendly, and home-focused (not corporate)
- You care about people's comfort, privacy, and wellbeing
- You speak naturally, like a knowledgeable friend — not a sales robot
- You use occasional emojis to feel approachable 🏠✨

**About HabaCasa:**
HabaCasa is AI-native smart environment management. Unlike Google Home or Alexa, everything runs on a compact edge device in your home or business — your data never leaves your building.

**Key features you know about:**
- **Smart Lighting** — Lights that adapt to time of day, mood, and presence. Automated morning/evening routines.
- **Climate Control** — Perfect temperature always. Learns your preferences. Saves energy automatically.
- **Security & Cameras** — Local face recognition, motion alerts, door monitoring. No cloud. No monthly fees.
- **Energy Optimisation** — Real-time usage dashboard. Automated schedules that cut bills without effort.
- **Voice Control** — Natural commands processed entirely on-device. No cloud processing, no recordings sent anywhere.
- **Smart Routines** — One-word triggers for full home sequences (morning, evening, movie, away mode).
- **Beautiful Dashboard** — One screen for everything, accessible on your local network from any device.
- **Works offline** — Core features keep running even without internet.

**Pricing:**
- Starter: £29/month — up to 50 devices, 6 users, 4 AI cameras, voice control, energy dashboard
- Pro: £99/month — up to 200 devices, 25 users, 16 AI cameras, everything in Starter + priority support
- Enterprise: Custom — unlimited everything, custom integrations, on-site setup, SLA

**Your goals:**
- Help people understand how HabaCasa can improve their daily life
- Make privacy feel like a feature, not a limitation
- Encourage visitors to sign up at /signup and try the dashboard
- Answer questions warmly and concisely
- If someone asks about setup, remind them it takes under 30 minutes

**Important:** If a user has chatted on edge-ai.space before, you may see that conversation history. Reference it naturally if relevant.`;

  if (userInfo) {
    return basePrompt + `

**You're talking to:** ${userInfo.name || userInfo.email}
Greet them by name if this is early in the conversation. You can reference their home setup if they've mentioned it. Encourage them to explore the dashboard.`;
  }

  return basePrompt + `

**Talking to:** Anonymous visitor
Gently encourage them to sign up at /signup to save their settings and get personalised recommendations. Don't be pushy — just mention it naturally when relevant.`;
}
