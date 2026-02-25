"use client";

import { useState } from "react";
import Link from "next/link";

const LogoSvg = () => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-9 h-9">
    <rect width="40" height="40" rx="10" fill="url(#book-logo-gradient)" />
    <path d="M20 10L10 18V28C10 28.55 10.45 29 11 29H17V23H23V29H29C29.55 29 30 28.55 30 28V18L20 10Z" fill="white" opacity="0.95" />
    <path d="M25 14.5C26.5 16 27.5 18 27.5 20.2" stroke="white" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.6" />
    <path d="M28 12C30.2 14.2 31.5 17 31.5 20.2" stroke="white" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.35" />
    <defs>
      <linearGradient id="book-logo-gradient" x1="0" y1="0" x2="40" y2="40">
        <stop stopColor="#FF6B35" />
        <stop offset="1" stopColor="#FF8A5B" />
      </linearGradient>
    </defs>
  </svg>
);

const DAYS_AHEAD = 14;
const SLOT_START = 9;
const SLOT_END = 17;
const SLOT_INTERVAL = 30;

function getAvailableDays(): Date[] {
  const days: Date[] = [];
  const now = new Date();
  let d = new Date(now);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 1); // start tomorrow
  while (days.length < DAYS_AHEAD) {
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) days.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return days;
}

function getSlots(day: Date): { label: string; iso: string }[] {
  const slots: { label: string; iso: string }[] = [];
  for (let h = SLOT_START; h < SLOT_END; h++) {
    for (let m = 0; m < 60; m += SLOT_INTERVAL) {
      const d = new Date(day);
      d.setHours(h, m, 0, 0);
      const label = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: true }).toUpperCase();
      slots.push({ label, iso: d.toISOString() });
    }
  }
  return slots;
}

function fmtDay(d: Date): string {
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

function fmtDayFull(d: Date): string {
  return d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

type Step = "calendar" | "form" | "confirm";

interface FormData {
  name: string;
  email: string;
  company: string;
  phone: string;
  message: string;
}

export default function BookPage() {
  const days = getAvailableDays();
  const [step, setStep] = useState<Step>("calendar");
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ label: string; iso: string } | null>(null);
  const [form, setForm] = useState<FormData>({ name: "", email: "", company: "", phone: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const slots = selectedDay ? getSlots(selectedDay) : [];

  const handleSlotSelect = (slot: { label: string; iso: string }) => {
    setSelectedSlot(slot);
  };

  const handleDaySelect = (day: Date) => {
    setSelectedDay(day);
    setSelectedSlot(null);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot || !selectedDay) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          datetime: selectedSlot.iso,
          date_display: fmtDayFull(selectedDay),
          time_display: selectedSlot.label,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStep("confirm");
      } else {
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080e1a] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0f1a2e]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <LogoSvg />
            <span className="text-xl font-semibold">HabaCasa</span>
          </Link>
          <span className="text-white/40 text-sm hidden sm:block">Book a Discovery Call</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10">

        {/* Step: Calendar */}
        {step === "calendar" && (
          <div className="animate-fade-in">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">
                Schedule a <span className="text-[#f97316]">Discovery Call</span>
              </h1>
              <p className="text-white/50">30 minutes with Stephen · UK Time (GMT/BST)</p>
            </div>

            {/* Day picker */}
            <div className="bg-[#0f1a2e] border border-white/10 rounded-2xl p-6 mb-6">
              <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Select a Date</h2>
              <div className="grid grid-cols-5 sm:grid-cols-7 gap-2">
                {days.map((day, i) => {
                  const isSelected = selectedDay?.toDateString() === day.toDateString();
                  return (
                    <button
                      key={i}
                      onClick={() => handleDaySelect(day)}
                      className={`flex flex-col items-center py-3 px-1 rounded-xl border text-sm font-medium transition-all ${
                        isSelected
                          ? "bg-[#f97316] border-[#f97316] text-white"
                          : "border-white/10 text-white/70 hover:border-[#f97316]/50 hover:text-white"
                      }`}
                    >
                      <span className="text-xs opacity-70">{day.toLocaleDateString("en-GB", { weekday: "short" })}</span>
                      <span className="text-lg font-bold">{day.getDate()}</span>
                      <span className="text-xs opacity-70">{day.toLocaleDateString("en-GB", { month: "short" })}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time slots */}
            {selectedDay && (
              <div className="bg-[#0f1a2e] border border-white/10 rounded-2xl p-6 mb-6">
                <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">
                  Available Times — {fmtDay(selectedDay)}
                </h2>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {slots.map((slot, i) => {
                    const isSelected = selectedSlot?.iso === slot.iso;
                    return (
                      <button
                        key={i}
                        onClick={() => handleSlotSelect(slot)}
                        className={`py-2 px-3 rounded-lg border text-sm font-medium transition-all ${
                          isSelected
                            ? "bg-[#f97316] border-[#f97316] text-white"
                            : "border-white/10 text-white/70 hover:border-[#f97316]/50 hover:text-white"
                        }`}
                      >
                        {slot.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {selectedSlot && (
              <div className="flex justify-center">
                <button
                  onClick={() => setStep("form")}
                  className="bg-[#f97316] hover:bg-[#ea580c] text-white font-semibold px-8 py-3 rounded-xl transition-all hover:-translate-y-0.5"
                >
                  Continue →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step: Form */}
        {step === "form" && (
          <div className="animate-fade-in max-w-xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Your <span className="text-[#f97316]">Details</span></h1>
              <p className="text-white/50">
                {selectedDay && fmtDayFull(selectedDay)} at {selectedSlot?.label}
                <button onClick={() => setStep("calendar")} className="ml-2 text-[#f97316] text-xs underline">change</button>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="bg-[#0f1a2e] border border-white/10 rounded-2xl p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">Full Name *</label>
                <input
                  name="name" required value={form.name} onChange={handleFormChange}
                  placeholder="Jane Smith"
                  className="w-full bg-[#1a2744] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-[#f97316] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">Email Address *</label>
                <input
                  name="email" type="email" required value={form.email} onChange={handleFormChange}
                  placeholder="jane@company.com"
                  className="w-full bg-[#1a2744] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-[#f97316] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">Company / Organisation *</label>
                <input
                  name="company" required value={form.company} onChange={handleFormChange}
                  placeholder="Acme Ltd"
                  className="w-full bg-[#1a2744] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-[#f97316] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">Phone <span className="text-white/30">(optional)</span></label>
                <input
                  name="phone" value={form.phone} onChange={handleFormChange}
                  placeholder="+44 7700 900000"
                  className="w-full bg-[#1a2744] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-[#f97316] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">What would you like to discuss? <span className="text-white/30">(optional)</span></label>
                <textarea
                  name="message" value={form.message} onChange={handleFormChange}
                  rows={3}
                  placeholder="Tell us a bit about your building or use case..."
                  className="w-full bg-[#1a2744] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-[#f97316] transition-colors resize-none"
                />
              </div>

              {error && (
                <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-3 text-red-300 text-sm">{error}</div>
              )}

              <button
                type="submit" disabled={submitting}
                className="w-full bg-[#f97316] hover:bg-[#ea580c] disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all hover:-translate-y-0.5 disabled:hover:translate-y-0"
              >
                {submitting ? "Booking..." : "Book My Discovery Call →"}
              </button>
            </form>
          </div>
        )}

        {/* Step: Confirm */}
        {step === "confirm" && (
          <div className="animate-fade-in max-w-lg mx-auto text-center py-8">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-3">You&apos;re <span className="text-[#f97316]">Booked!</span></h1>
            <p className="text-white/60 mb-2">
              Your discovery call with Stephen is confirmed for:
            </p>
            <p className="text-xl font-semibold text-white mb-1">{selectedDay && fmtDayFull(selectedDay)}</p>
            <p className="text-2xl font-bold text-[#f97316] mb-6">{selectedSlot?.label} UK</p>
            <p className="text-white/50 text-sm mb-8">
              We&apos;ve received your booking. Stephen will be in touch shortly with a meeting link.
            </p>
            <Link
              href="/"
              className="inline-block bg-white/10 hover:bg-white/20 text-white font-medium px-6 py-2.5 rounded-xl transition-colors"
            >
              ← Back to HabaCasa
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
