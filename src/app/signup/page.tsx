"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../hooks/useAuth";
import AuthForm from "../../components/AuthForm";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useMediaQuery } from "../../hooks/useMediaQuery";

export default function SignupPage() {
  const { user, loading, signup, loginWithGoogle } = useAuth();
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width: 1024px)");

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
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        background: "#000",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Background elements */}
      <div 
        style={{ 
          position: "absolute", 
          fontSize: isMobile ? "120px" : "280px", 
          fontWeight: 900, 
          color: "rgba(255,255,255,0.03)", 
          userSelect: "none",
          pointerEvents: "none",
          zIndex: 1,
          letterSpacing: "-0.05em",
          textAlign: "center",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        REALNO
      </div>

      <div style={{ position: "absolute", inset: 0, opacity: 0.1, backgroundImage: "radial-gradient(rgba(255,255,255,0.2) 1px, transparent 1px)", backgroundSize: "32px 32px", pointerEvents: "none" }} />

      {/* Main Content */}
      <div style={{ position: "relative", zIndex: 10, width: "100%", display: "flex", justifyContent: "center", padding: "20px" }}>
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

      {/* Footer Branding */}
      <div style={{ position: "fixed", bottom: "40px", left: 0, right: 0, textAlign: "center", zIndex: 10 }}>
        <span style={{ color: "rgba(255,255,255,0.15)", fontSize: "11px", fontWeight: 700, letterSpacing: "3px", textTransform: "uppercase" }}>
          Next Generation Collaboration
        </span>
      </div>
    </div>
  );
}
