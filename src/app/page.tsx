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
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    }
  }, [user, loading, router]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.2) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

      <div className="relative z-10 text-center">
        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-[0_0_50px_rgba(255,255,255,0.1)]">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </div>
        <h1 className="mb-2 text-4xl font-black tracking-tighter text-white uppercase">REALNO</h1>
        <p className="mb-10 font-medium tracking-widest text-white/30 uppercase text-[10px]">Initializing Workspace</p>
        <LoadingSpinner size="lg" />
        
        {/* SEO Semantic Content (visually hidden) */}
        <div className="sr-only">
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
    </div>
  );
}
