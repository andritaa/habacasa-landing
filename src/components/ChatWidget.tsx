"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "@/lib/auth-client";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatWidget() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! I'm Andrita, the HabaCasa assistant ✨ Ask me anything about making your space smarter — pricing, features, how it works, or anything else! 🏠" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => "hc-" + Math.random().toString(36).slice(2, 10));
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setLoading(true);
    setMessages((prev) => [...prev, { role: "user", content: text }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, sessionId, site: "habacasa" }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply || "Sorry, something went wrong." }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Connection error. Please try again! 🙏" }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const userName = session?.user?.name?.split(" ")[0] || null;

  return (
    <>
      {/* Chat bubble button */}
      {!open && (
        <button
          className="hc-chat-btn"
          onClick={() => setOpen(true)}
          aria-label="Open chat with Andrita"
          style={{
            position: "fixed", bottom: "24px", right: "24px", zIndex: 9999,
            width: "60px", height: "60px", borderRadius: "50%", border: "none",
            background: "linear-gradient(135deg, var(--orange), var(--orange-light))",
            color: "#fff", fontSize: "28px", cursor: "pointer",
            boxShadow: "0 4px 24px rgba(255,107,53,0.4)",
            transition: "transform 0.2s, box-shadow 0.2s",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          💬
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div
          style={{
            position: "fixed", bottom: "24px", right: "24px", zIndex: 9999,
            width: "380px", maxWidth: "calc(100vw - 32px)",
            height: "520px", maxHeight: "calc(100vh - 48px)",
            borderRadius: "var(--radius)", overflow: "hidden",
            background: "var(--glass-bg, rgba(11,11,26,0.95))",
            backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
            border: "1px solid var(--glass-border, rgba(255,255,255,0.08))",
            boxShadow: "0 16px 64px rgba(0,0,0,0.5)",
            display: "flex", flexDirection: "column",
            fontFamily: "var(--font)",
          }}
        >
          {/* Header */}
          <div style={{
            padding: "16px 20px", display: "flex", alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid var(--glass-border, rgba(255,255,255,0.08))",
            background: "rgba(255,107,53,0.06)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {/* Andrita avatar */}
              <div style={{
                width: "36px", height: "36px", borderRadius: "50%",
                background: "linear-gradient(135deg, var(--orange), var(--orange-light))",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "18px", flexShrink: 0,
              }}>
                ✨
              </div>
              <div>
                <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--text, #fff)" }}>
                  Andrita{userName ? ` · Hi, ${userName}!` : ""}
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-2, rgba(255,255,255,0.5))", display: "flex", alignItems: "center", gap: "4px" }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#34D399", display: "inline-block" }} />
                  HabaCasa AI
                </div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: "none", border: "none",
                color: "var(--text-2, rgba(255,255,255,0.5))",
                fontSize: "20px", cursor: "pointer", padding: "4px 8px",
                borderRadius: "8px", transition: "background 0.15s",
              }}
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, overflowY: "auto", padding: "16px 16px 8px",
            display: "flex", flexDirection: "column", gap: "10px",
          }}>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  maxWidth: "85%", padding: "10px 14px", borderRadius: "16px",
                  fontSize: "14px", lineHeight: 1.5,
                  alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                  background: msg.role === "user"
                    ? "linear-gradient(135deg, var(--orange), var(--orange-light))"
                    : "var(--glass-bg, rgba(255,255,255,0.06))",
                  color: msg.role === "user" ? "#fff" : "var(--text, #fff)",
                  border: msg.role === "user" ? "none" : "1px solid var(--glass-border, rgba(255,255,255,0.08))",
                  borderBottomRightRadius: msg.role === "user" ? "4px" : "16px",
                  borderBottomLeftRadius: msg.role === "assistant" ? "4px" : "16px",
                  animation: "hc-fade 0.2s ease",
                  whiteSpace: "pre-wrap",
                }}
              >
                {msg.content}
              </div>
            ))}
            {loading && (
              <div style={{
                maxWidth: "85%", padding: "10px 14px", borderRadius: "16px",
                fontSize: "14px", alignSelf: "flex-start",
                background: "var(--glass-bg, rgba(255,255,255,0.06))",
                border: "1px solid var(--glass-border, rgba(255,255,255,0.08))",
                color: "var(--text-2, rgba(255,255,255,0.5))", fontStyle: "italic",
                borderBottomLeftRadius: "4px",
              }}>
                Thinking…
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input row */}
          <div style={{
            padding: "12px 16px", display: "flex", gap: "8px",
            borderTop: "1px solid var(--glass-border, rgba(255,255,255,0.08))",
            background: "rgba(0,0,0,0.2)",
          }}>
            <input
              ref={inputRef}
              type="text"
              placeholder="Ask Andrita anything…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              autoComplete="off"
              style={{
                flex: 1, background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "var(--radius-sm)", padding: "10px 14px",
                fontSize: "14px", color: "var(--text, #fff)", outline: "none",
                fontFamily: "var(--font)", transition: "border 0.15s",
              }}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              style={{
                background: "linear-gradient(135deg, var(--orange), var(--orange-light))",
                border: "none", borderRadius: "var(--radius-sm)",
                padding: "10px 16px", color: "#fff", fontSize: "16px",
                cursor: "pointer", transition: "opacity 0.15s",
                opacity: loading || !input.trim() ? 0.4 : 1,
              }}
              aria-label="Send message"
            >
              ➤
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes hc-fade {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
