"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signUp, signIn } from "@/lib/auth-client";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signUp.email({
        name,
        email,
        password,
        callbackURL: "/dashboard",
      });

      if (result.error) {
        setError(result.error.message || "Could not create account. Please try again.");
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      await signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
      });
    } catch {
      setError("Google sign-in failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <>
      <div className="orbs" aria-hidden="true">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      <nav className="nav scrolled">
        <div className="container nav-inner">
          <a href="/" className="nav-logo" aria-label="HabaCasa home">
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "40px", height: "40px" }}>
              <rect width="40" height="40" rx="10" fill="url(#signup-logo)" />
              <path d="M20 10L10 18V28C10 28.55 10.45 29 11 29H17V23H23V29H29C29.55 29 30 28.55 30 28V18L20 10Z" fill="white" opacity="0.95" />
              <defs>
                <linearGradient id="signup-logo" x1="0" y1="0" x2="40" y2="40">
                  <stop stopColor="#FF6B35" />
                  <stop offset="1" stopColor="#FF8A5B" />
                </linearGradient>
              </defs>
            </svg>
            <span>HabaCasa</span>
          </a>
        </div>
      </nav>

      <div className="auth-page">
        <div className="glass auth-card">
          <h1>Create your account</h1>
          <p className="subtitle">Start making your space truly smart.</p>

          <button className="btn btn-google btn-sm" onClick={handleGoogle} disabled={loading} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          <div className="auth-divider">or</div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                className="form-input"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="form-input"
                placeholder="Choose a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                minLength={8}
              />
            </div>
            {error && <p className="form-error">{error}</p>}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: "100%", justifyContent: "center", marginTop: "8px" }}
            >
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </form>

          <div className="auth-footer">
            Already have an account? <a href="/login">Sign in →</a>
          </div>
        </div>
      </div>
    </>
  );
}
