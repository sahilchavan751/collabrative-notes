"use client";

import React, { useState } from "react";
import Link from "next/link";
import GoogleSignInButton from "./GoogleSignInButton";
import LoadingSpinner from "./LoadingSpinner";

interface AuthFormProps {
  mode: "login" | "signup";
  onSubmit: (email: string, password: string, username?: string) => Promise<void>;
  onGoogleSignIn: () => Promise<void>;
}

export default function AuthForm({ mode, onSubmit, onGoogleSignIn }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "signup") {
        if (!username.trim()) { setError("Username is required"); setLoading(false); return; }
        if (username.trim().length < 3) { setError("Username must be at least 3 characters"); setLoading(false); return; }
        await onSubmit(email, password, username.trim());
      } else {
        await onSubmit(email, password);
      }
    } catch (err: any) {
      setError(err?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      await onGoogleSignIn();
    } catch (err: any) {
      setError(err?.message || "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "12px",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#fff",
    fontSize: "14px",
    outline: "none",
    transition: "all 0.3s",
  };

  return (
    <div style={{ width: "100%", maxWidth: "420px" }}>
      {/* Card */}
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          borderRadius: "24px",
          background: "rgba(20,20,35,0.8)",
          border: "1px solid rgba(255,255,255,0.08)",
          padding: "40px 36px",
          boxShadow: "0 25px 60px rgba(0,0,0,0.5), 0 0 80px rgba(139,92,246,0.06)",
          backdropFilter: "blur(40px)",
        }}
      >
        {/* Glow decorations */}
        <div
          style={{
            position: "absolute",
            top: "-60px",
            right: "-60px",
            width: "160px",
            height: "160px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(139,92,246,0.15), transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-60px",
            left: "-60px",
            width: "160px",
            height: "160px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(59,130,246,0.1), transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative", zIndex: 10 }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "16px",
                background: "linear-gradient(135deg, #8b5cf6, #3b82f6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                boxShadow: "0 8px 25px rgba(139,92,246,0.35)",
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 28, height: 28, color: "#fff" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#fff", margin: "0 0 6px 0" }}>
              {mode === "login" ? "Welcome back" : "Create account"}
            </h1>
            <p style={{ fontSize: "14px", color: "#9ca3af", margin: 0 }}>
              {mode === "login" ? "Sign in to continue to your notes" : "Start collaborating in real-time"}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div
              style={{
                padding: "12px 16px",
                borderRadius: "12px",
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.25)",
                color: "#f87171",
                fontSize: "13px",
                marginBottom: "20px",
              }}
            >
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {mode === "signup" && (
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#d1d5db", marginBottom: "6px" }}>
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Choose a username"
                    style={inputStyle}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(139,92,246,0.5)"; e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(139,92,246,0.1)"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.boxShadow = "none"; }}
                    required
                  />
                </div>
              )}

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#d1d5db", marginBottom: "6px" }}>
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  style={inputStyle}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(139,92,246,0.5)"; e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(139,92,246,0.1)"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.boxShadow = "none"; }}
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#d1d5db", marginBottom: "6px" }}>
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={inputStyle}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(139,92,246,0.5)"; e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(139,92,246,0.1)"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.boxShadow = "none"; }}
                  required
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #8b5cf6, #3b82f6)",
                  border: "none",
                  color: "#fff",
                  fontSize: "15px",
                  fontWeight: 600,
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.6 : 1,
                  boxShadow: "0 4px 20px rgba(139,92,246,0.3)",
                  transition: "all 0.3s",
                  marginTop: "4px",
                }}
              >
                {loading ? <LoadingSpinner size="sm" /> : mode === "login" ? "Sign In" : "Create Account"}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px", margin: "24px 0" }}>
            <div style={{ flex: 1, height: "1px", background: "linear-gradient(to right, transparent, rgba(255,255,255,0.15), transparent)" }} />
            <span style={{ fontSize: "11px", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "1.5px" }}>or</span>
            <div style={{ flex: 1, height: "1px", background: "linear-gradient(to right, transparent, rgba(255,255,255,0.15), transparent)" }} />
          </div>

          {/* Google */}
          <GoogleSignInButton onClick={handleGoogleSignIn} disabled={loading} />

          {/* Toggle */}
          <p style={{ textAlign: "center", fontSize: "14px", color: "#9ca3af", marginTop: "24px" }}>
            {mode === "login" ? (
              <>
                Don&apos;t have an account?{" "}
                <Link href="/signup" style={{ color: "#a78bfa", fontWeight: 500, textDecoration: "none" }}>
                  Sign up
                </Link>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <Link href="/login" style={{ color: "#a78bfa", fontWeight: 500, textDecoration: "none" }}>
                  Sign in
                </Link>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
