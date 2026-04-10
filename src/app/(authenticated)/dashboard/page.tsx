"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../../hooks/useAuth";
import { getUserNotes, createNote, deleteNote } from "../../../lib/firestore";
import { Note } from "../../../types";
import NoteCard from "../../../components/NoteCard";
import Skeleton from "../../../components/Skeleton";
import toast, { Toaster } from "react-hot-toast";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const fetchNotes = async () => {
      if (user) {
        try {
          const userNotes = await getUserNotes(user.uid);
          setNotes(userNotes);
        } catch (err) {
          console.error("Failed to load notes:", err);
          toast.error("Failed to load notes");
        } finally {
          setLoadingNotes(false);
        }
      }
    };
    if (user) fetchNotes();
  }, [user]);

  useEffect(() => {
    const action = searchParams.get("action");
    if (action === "new" && user && !creating) {
      handleCreateNote();
      // Clean up the URL only after creation triggered
      router.replace("/dashboard");
    }
  }, [searchParams, user, creating]);

  const handleCreateNote = async () => {
    if (!user) return;
    setCreating(true);
    try {
      const noteId = await createNote(user.uid);
      router.push(`/notes/${noteId}`);
    } catch (err) {
      toast.error("Failed to create note");
      setCreating(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!user) return;
    try {
      const success = await deleteNote(noteId, user.uid);
      if (success) {
        setNotes((prev) => prev.filter((n) => n.id !== noteId));
        toast.success("Note deleted");
      } else {
        toast.error("You can only delete your own notes");
      }
    } catch (err) {
      toast.error("Failed to delete note");
    }
  };

  if (!user && !authLoading) return null;

  // For the dashboard main area, we only show recent notes
  const recentNotes = notes.slice(0, 8);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--background)" }}>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "var(--card)",
            color: "var(--foreground)",
            border: "1px solid var(--card-border)",
            borderRadius: "12px",
          },
        }}
      />

      {/* Top bar */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "72px",
          padding: "0 28px",
          borderBottom: "1px solid var(--sidebar-border)",
          background: "var(--background)",
          backdropFilter: "blur(20px)",
        }}
      >
        <h1 style={{ fontSize: "20px", fontWeight: 700, color: "var(--foreground)", margin: 0 }}>Dashboard</h1>

        <button
          onClick={handleCreateNote}
          disabled={creating}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "10px 22px",
            borderRadius: "14px",
            background: "var(--foreground)",
            border: "none",
            color: "var(--background)",
            fontSize: "14px",
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
            opacity: creating ? 0.6 : 1,
            transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
            letterSpacing: "0.02em",
          }}
          onMouseEnter={(e) => {
            if (!creating) {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 15px 35px rgba(0,0,0,0.25)";
            }
          }}
          onMouseLeave={(e) => {
            if (!creating) {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 10px 25px rgba(0,0,0,0.15)";
            }
          }}
        >
          {creating ? (
            <div style={{ width: "20px", height: "20px", border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 16, height: 16 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              New Note
            </>
          )}
        </button>
      </header>

      {/* Hero / Welcome Section */}
      <div style={{ padding: "32px 28px" }}>
        {/* Section title */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-muted)" }}>Recent Notes</h3>
          {notes.length > 8 && (
            <span style={{ fontSize: "13px", color: "var(--text-muted)", opacity: 0.7 }}>Showing 8 of {notes.length} notes</span>
          )}
        </div>

        {/* Notes grid */}
        {loadingNotes ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "20px",
            }}
          >
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={{ height: "190px", borderRadius: "16px", background: "var(--card)", border: "1px solid var(--card-border)", padding: "24px", display: "flex", flexDirection: "column" }}>
                <Skeleton width="40%" height="20px" style={{ marginBottom: "20px" }} />
                <Skeleton width="90%" height="14px" style={{ marginBottom: "10px" }} />
                <Skeleton width="80%" height="14px" style={{ marginBottom: "10px" }} />
                <Skeleton width="70%" height="14px" style={{ marginBottom: "10px" }} />
                <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                   <Skeleton width="30%" height="12px" />
                   <Skeleton width="20px" height="20px" borderRadius="6px" />
                </div>
              </div>
            ))}
          </div>
        ) : recentNotes.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "80px 0", textAlign: "center" }}>
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "20px",
                background: "rgba(139,92,246,0.08)",
                border: "1px solid rgba(139,92,246,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "24px",
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 34, height: 34, color: "var(--text-muted)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: 600, color: "var(--foreground)", margin: "0 0 8px 0" }}>Ready for your first note?</h3>
            <p style={{ fontSize: "14px", color: "var(--text-muted)", margin: "0 0 24px 0", maxWidth: "340px" }}>
              Start writing ideas and collaborating with your team instantly.
            </p>
            <button onClick={handleCreateNote} className="btn-primary" style={{ padding: "10px 24px" }}>
              Create a Note
            </button>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "20px",
            }}
          >
            {recentNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onDelete={handleDeleteNote}
                isOwner={note.ownerId === user?.uid}
              />
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
