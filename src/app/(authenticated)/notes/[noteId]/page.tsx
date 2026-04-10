"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../../../hooks/useAuth";
import { getNote, updateNoteSnapshot } from "../../../../lib/firestore";
import { Note } from "../../../../types";
import Editor from "../../../../components/Editor";
import Skeleton from "../../../../components/Skeleton";
import CollaborationSidebar from "../../../../components/CollaborationSidebar";
import AudioModal from "../../../../components/AudioModal";
import { AudioProvider, useAudio } from "../../../../contexts/AudioContext";
import { useMediaQuery } from "../../../../hooks/useMediaQuery";

function NoteContent() {
  const params = useParams();
  const noteId = params.noteId as string;
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { inCall, joinCall, participants } = useAudio();
  
  const [note, setNote] = useState<Note | null>(null);
  const [loadingNote, setLoadingNote] = useState(true);
  const [title, setTitle] = useState("");
  const [titleSaveTimeout, setTitleSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const [audioModalOpen, setAudioModalOpen] = useState(false);
  const [awareness, setAwareness] = useState<any>(null);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [isSynced, setIsSynced] = useState(false);
  const [saving, setSaving] = useState(false);
  const isMobile = useMediaQuery("(max-width: 1024px)");

  useEffect(() => {
    const fetchNote = async () => {
      if (noteId) {
        try {
          const noteData = await getNote(noteId);
          if (noteData) {
            setNote(noteData);
            setTitle(noteData.title);
          } else {
            router.push("/dashboard");
          }
        } catch (err) {
          console.error("Failed to fetch note:", err);
          router.push("/dashboard");
        } finally {
          setLoadingNote(false);
        }
      }
    };
    if (user) fetchNote();
  }, [noteId, user, router]);

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (titleSaveTimeout) clearTimeout(titleSaveTimeout);
    const timeout = setTimeout(async () => {
      try {
        await updateNoteSnapshot(noteId, note?.content || "", newTitle);
      } catch (err) {
        console.error("Failed to save title:", err);
      }
    }, 1000);
    setTitleSaveTimeout(timeout);
  };

  if (loadingNote) {
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100vh", background: "var(--background)" }}>
        <header style={{ height: "72px", borderBottom: "1px solid var(--card-border)", display: "flex", alignItems: "center", padding: "0 28px" }}>
          <Skeleton width="200px" height="24px" />
        </header>
        <div style={{ padding: "40px", flex: 1 }}>
          <Skeleton width="100%" height="400px" borderRadius="16px" />
        </div>
      </div>
    );
  }

  if (!user || !note) return null;

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", position: "relative", zIndex: 10, background: "var(--background)" }}>
      {/* Background glow cues */}
      <div style={{ position: "fixed", top: 0, left: 0, width: "400px", height: "400px", background: "radial-gradient(circle, rgba(139,92,246,0.04) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

      {/* Header */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: isMobile ? "auto" : "72px",
          minHeight: "72px",
          padding: isMobile ? "12px 20px" : "0 28px",
          borderBottom: "1px solid var(--card-border)",
          background: "var(--background)",
          backdropFilter: "blur(20px)",
          flexWrap: isMobile ? "wrap" : "nowrap",
          gap: isMobile ? "12px" : "0",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "8px" : "16px", flex: isMobile ? "1 1 100%" : "auto" }}>
          {/* Back button */}
          <button
            onClick={() => router.push(isMobile ? "/notes" : "/dashboard")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 12px",
              borderRadius: "10px",
              background: "var(--input-bg)",
              border: "1px solid var(--card-border)",
              color: "var(--text-muted)",
              fontSize: "13px",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 14, height: 14 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {!isMobile && (isMobile ? "Notes" : "Dashboard")}
          </button>

          {!isMobile && <div style={{ width: "1px", height: "24px", background: "var(--card-border)", margin: "0 4px" }} />}

          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Untitled Note"
            style={{
              background: "transparent",
              border: "none",
              outline: "none",
              fontSize: isMobile ? "18px" : "20px",
              fontWeight: 700,
              color: "var(--foreground)",
              width: "100%",
              maxWidth: isMobile ? "130px" : "300px",
            }}
          />

          {/* Connection Indicator (Mobile Top Right) */}
          {isMobile && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "auto" }}>
              {saving ? (
                <span style={{ fontSize: "11px", color: "var(--accent-purple)", animation: "pulse 1.5s infinite" }}>
                  Saving...
                </span>
              ) : (
                <div
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    background: isSynced ? "#22c55e" : "#eab308",
                    boxShadow: isSynced ? "0 0 8px rgba(34,197,94,0.5)" : "none",
                    animation: isSynced ? "none" : "pulse 1.5s infinite",
                  }}
                />
              )}
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Connection & Save Status (Desktop) */}
          {!isMobile && (
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginRight: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: isSynced ? "#22c55e" : "#eab308",
                    boxShadow: isSynced ? "0 0 8px rgba(34,197,94,0.5)" : "none",
                    animation: isSynced ? "none" : "pulse 1.5s infinite",
                  }}
                />
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  {isSynced ? "Connected" : "Syncing..."}
                </span>
              </div>
              {saving && (
                <span style={{ fontSize: "12px", color: "var(--accent-purple)", animation: "pulse 1.5s infinite" }}>
                  Saving...
                </span>
              )}
            </div>
          )}

          {/* Audio Call Button */}
          {!inCall ? (
            <button
              onClick={joinCall}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 12px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #16a34a, #059669)",
                border: "none",
                color: "#fff",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "0 4px 15px rgba(22,163,74,0.2)",
              }}
            >
              🎙️ <span style={{ display: isMobile ? "none" : "inline" }}>Join Voice</span>
            </button>
          ) : (
            <button
              onClick={() => setAudioModalOpen(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 12px",
                borderRadius: "10px",
                background: "rgba(34, 197, 94, 0.1)",
                border: "1px solid rgba(34, 197, 94, 0.3)",
                color: "#4ade80",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                animation: "pulseShadow 2s infinite",
              }}
            >
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#22c55e" }} />
              <span style={{ display: isMobile ? "none" : "inline" }}>In Call ({participants.length})</span>
            </button>
          )}

          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              alert("Link copied! Share it with collaborators.");
            }}
            style={{
              padding: "8px 12px",
              borderRadius: "10px",
              background: "rgba(139,92,246,0.1)",
              border: "1px solid rgba(139,92,246,0.3)",
              color: "var(--accent-purple)",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Share
          </button>

          {/* Active Users Toggle Button (Mobile Only) */}
          {isMobile && (
            <button
              onClick={() => setShowMobileSidebar(!showMobileSidebar)}
              style={{
                padding: "8px 12px",
                borderRadius: "10px",
                background: showMobileSidebar ? "var(--accent-purple)" : "var(--input-bg)",
                border: "1px solid var(--card-border)",
                color: showMobileSidebar ? "#fff" : "var(--text-muted)",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
              }}
              title="Active Users"
            >
              <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 16, height: 16 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </button>
          )}
        </div>
      </header>

      {/* Content area */}
      <div style={{ 
        display: "flex", 
        flex: 1, 
        padding: isMobile ? "12px" : "24px 28px", 
        gap: isMobile ? "0" : "24px", 
        overflow: "hidden",
        flexDirection: isMobile ? "column" : "row",
        position: "relative"
      }}>
        
        {/* Main Editor */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", overflowY: "auto" }}>
          <Editor 
            noteId={noteId} 
            initialTitle={title} 
            onTitleChange={handleTitleChange} 
            onAwarenessUpdate={setAwareness}
            onSyncChange={setIsSynced}
            onSaveStatusChange={setSaving}
          />
        </div>

        {/* Collaboration Sidebar */}
        {!isMobile ? (
          <aside style={{ width: "280px", flexShrink: 0 }}>
            <CollaborationSidebar awareness={awareness} />
          </aside>
        ) : showMobileSidebar ? (
          <aside
            style={{
              position: "absolute",
              top: "12px",
              right: "12px",
              bottom: "80px",
              width: "280px",
              zIndex: 150,
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.5)",
              borderRadius: "16px",
              overflow: "hidden"
            }}
          >
            <CollaborationSidebar awareness={awareness} />
          </aside>
        ) : null}
      </div>

      <AudioModal isOpen={audioModalOpen} onClose={() => setAudioModalOpen(false)} />

      <style jsx global>{`
        @keyframes pulseShadow {
          0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(34, 197, 94, 0); }
          100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
        }
      `}</style>
    </div>
  );
}

export default function NotePage() {
  const params = useParams();
  const noteId = params.noteId as string;
  
  return (
    <AudioProvider noteId={noteId}>
      <NoteContent />
    </AudioProvider>
  );
}
