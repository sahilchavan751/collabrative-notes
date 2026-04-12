"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../hooks/useAuth";
import LoadingSpinner from "../components/LoadingSpinner";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace("/dashboard");
      } else {
        router.replace("/login");
      }
    }
  }, [user, loading, router]);

  return (
    <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", background: "var(--background, #0a0a0f)" }}>
      <LoadingSpinner size="lg" />
        
      {/* SEO Semantic Content (visually hidden) */}
      <div className="sr-only">
        <h1>REALNO — Real-time Collaborative Notes</h1>
        <h2>Ultimate Online Notes Editor</h2>
        <p>
          REALNO is a professional platform for realtime notes and collaberative notes. 
          Create, share, and edit notes with your team in real-time with integrated voice chat.
          The fastest collaborative notes solution for modern teams.
        </p>
        <ul>
          <li>Real-time synchronization</li>
          <li>Collaborative notes editor</li>
          <li>Voice-integrated note taking</li>
          <li>Professional dark-mode aesthetics</li>
        </ul>
      </div>
    </div>
  );
}
