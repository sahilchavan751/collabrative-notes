"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../hooks/useAuth";
import AuthForm from "../../components/AuthForm";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function SignupPage() {
  const { user, loading, signup, loginWithGoogle } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", background: "#0a0a0f" }}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (user) return null;

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        minHeight: "100vh",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0a0f",
        overflow: "hidden",
        padding: "20px",
      }}
    >
      {/* Background glows */}
      <div style={{ position: "absolute", width: "500px", height: "500px", top: "10%", left: "20%", borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", width: "500px", height: "500px", bottom: "10%", right: "20%", borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />

      {/* Grid pattern */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.04,
          backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          pointerEvents: "none",
        }}
      />

      <AuthForm
        mode="signup"
        onSubmit={async (email, password, username) => {
          await signup(email, password, username!);
          router.push("/dashboard");
        }}
        onGoogleSignIn={async () => {
          await loginWithGoogle();
          router.push("/dashboard");
        }}
      />
    </div>
  );
}
