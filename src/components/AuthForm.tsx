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
    padding: "16px 18px",
    borderRadius: "14px",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#fff",
    fontSize: "14px",
    outline: "none",
    transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
  };

  return (
    <div style={{ width: "100%", maxWidth: "440px" }}>
      {/* Card */}
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          borderRadius: "32px",
          background: "rgba(10,10,10,0.7)",
          border: "1px solid rgba(255,255,255,0.08)",
          padding: "48px 40px",
          boxShadow: "0 40px 100px rgba(0,0,0,0.8)",
          backdropFilter: "blur(60px)",
        }}
      >
        <div style={{ position: "relative", zIndex: 10 }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <h1 style={{ fontSize: "32px", fontWeight: 800, color: "#fff", margin: "0 0 8px 0", letterSpacing: "-0.03em" }}>
              {mode === "login" ? "Sign In" : "Register"}
            </h1>
            <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.5)", margin: 0, fontWeight: 400 }}>
              {mode === "login" ? "Enter your credentials to access RealNote" : "Create an account to start collaborating"}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div
              style={{
                padding: "14px 18px",
                borderRadius: "14px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#ff5555",
                fontSize: "13px",
                marginBottom: "24px",
                textAlign: "center",
              }}
            >
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {mode === "signup" && (
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.4)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                    style={inputStyle}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
                    required
                  />
                </div>
              )}

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.4)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  style={inputStyle}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.4)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={inputStyle}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
                  required
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "16px",
                  borderRadius: "14px",
                  background: "#fff",
                  border: "none",
                  color: "#000",
                  fontSize: "15px",
                  fontWeight: 700,
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.7 : 1,
                  transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                  marginTop: "8px",
                }}
                onMouseEnter={(e) => { if(!loading) e.currentTarget.style.transform = "scale(1.02)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
              >
                {loading ? <LoadingSpinner size="sm" /> : mode === "login" ? "Sign In" : "Create Account"}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: "20px", margin: "32px 0" }}>
            <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.08)" }} />
            <span style={{ fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", letterSpacing: "2px" }}>OR</span>
            <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.08)" }} />
          </div>

          {/* Google */}
          <GoogleSignInButton onClick={handleGoogleSignIn} disabled={loading} />

          {/* Toggle */}
          <p style={{ textAlign: "center", fontSize: "14px", color: "rgba(255,255,255,0.4)", marginTop: "32px" }}>
            {mode === "login" ? (
              <>
                New to RealNote?{" "}
                <Link href="/signup" style={{ color: "#fff", fontWeight: 600, textDecoration: "none", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                  Create an account
                </Link>
              </>
            ) : (
              <>
                Have an account?{" "}
                <Link href="/login" style={{ color: "#fff", fontWeight: 600, textDecoration: "none", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
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
