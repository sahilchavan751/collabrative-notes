"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter, useParams, usePathname } from "next/navigation";
import { useAuth } from "../hooks/useAuth";
import { getUserNotes } from "../lib/firestore";
import { Note } from "../types";
import Skeleton from "./Skeleton";
import { useMediaQuery } from "../hooks/useMediaQuery";

export default function SecondarySidebar() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const activeNoteId = params.noteId as string;
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Draggable sidebar state
  const [isResizing, setIsResizing] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(300);

  // Load persistent width from localStorage on mount
  useEffect(() => {
    if (!isMobile) {
      const savedWidth = localStorage.getItem("secondarySidebarWidth");
      if (savedWidth) {
        const parsedWidth = parseInt(savedWidth, 10);
        if (parsedWidth >= 200 && parsedWidth <= 600) {
          setSidebarWidth(parsedWidth);
        }
      }
    }
  }, [isMobile]);

  const startResizing = useCallback(() => {
    if (isMobile) return;
    setIsResizing(true);
  }, [isMobile]);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
    if (!isMobile) {
      localStorage.setItem("secondarySidebarWidth", sidebarWidth.toString());
    }
  }, [sidebarWidth, isMobile]);

  const resize = useCallback((event: MouseEvent) => {
    if (isResizing && !isMobile) {
      // Primary sidebar is 72px wide on desktop
      const PrimarySidebarWidth = 72;
      const newWidth = event.clientX - PrimarySidebarWidth;
      
      // Constraints: 200px - 600px
      if (newWidth >= 200 && newWidth <= 600) {
        setSidebarWidth(newWidth);
      }
    }
  }, [isResizing, isMobile]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", resize);
      window.addEventListener("mouseup", stopResizing);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    } else {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
      document.body.style.cursor = "default";
      document.body.style.userSelect = "auto";
    }
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
      document.body.style.cursor = "default";
      document.body.style.userSelect = "auto";
    };
  }, [isResizing, resize, stopResizing]);

  useEffect(() => {
    const fetchNotes = async () => {
      if (user) {
        setLoading(true);
        try {
          const userNotes = await getUserNotes(user.uid);
          setNotes(userNotes);
        } catch (err) {
          console.error("Failed to fetch notes:", err);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchNotes();
  }, [user]);

  const filteredNotes = notes.filter((note) =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside
      style={{
        width: isMobile ? "100%" : `${sidebarWidth}px`,
        height: isMobile ? "calc(100vh - 64px)" : "100vh",
        background: "var(--sidebar-bg)",
        borderRight: isMobile ? "none" : "1px solid var(--sidebar-border)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: "relative",
        transition: isResizing || isMobile ? "none" : "all 0.3s ease",
      }}
    >
      {/* Mobile Header Title */}
      {isMobile && (
        <div style={{ padding: "16px 20px 0 20px" }}>
          <h2 style={{ fontSize: "24px", fontWeight: 800, color: "var(--foreground)" }}>My Notes</h2>
        </div>
      )}

      {/* Header / Search */}
      <div style={{ padding: "20px", borderBottom: "1px solid var(--sidebar-border)", height: "72px", display: "flex", alignItems: "center" }}>
        <div style={{ position: "relative", width: "100%" }}>
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              background: "var(--input-bg)",
              border: "1px solid var(--input-border)",
              borderRadius: "10px",
              padding: "8px 12px 8px 36px",
              color: "var(--foreground)",
              fontSize: "13px",
              outline: "none",
            }}
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", width: "16px", height: "16px", color: "var(--text-muted)" }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Note List */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px" }}>
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} style={{ padding: "12px", borderRadius: "12px", background: "var(--card)", border: "1px solid var(--card-border)" }}>
                <Skeleton width="60%" height="16px" style={{ marginBottom: "8px" }} />
                <Skeleton width="90%" height="12px" />
              </div>
            ))}
          </div>
        ) : filteredNotes.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>No notes found</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {filteredNotes.map((note) => {
              const isActive = activeNoteId === note.id;
              // Simple HTML strip for snippet
              const snippet = note.content.replace(/<[^>]*>/g, "").substring(0, 60);
              
              return (
                <div
                  key={note.id}
                  onClick={() => router.push(`/notes/${note.id}`)}
                  style={{
                    padding: "14px",
                    borderRadius: "12px",
                    background: isActive ? "rgba(139, 92, 246, 0.15)" : "transparent",
                    border: isActive ? "1px solid rgba(139, 92, 246, 0.2)" : "1px solid transparent",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive && !isMobile) e.currentTarget.style.background = "rgba(139, 92, 246, 0.05)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive && !isMobile) e.currentTarget.style.background = "transparent";
                  }}
                >
                  <h4 style={{ fontSize: "14px", fontWeight: 600, color: isActive ? "#8b5cf6" : "var(--foreground)", margin: "0 0 4px 0" }}>
                    {note.title || "Untitled Note"}
                  </h4>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {snippet || "No content..."}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Resize Handle (Desktop Only) */}
      {!isMobile && (
        <div
          onMouseDown={startResizing}
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "4px",
            height: "100%",
            cursor: "col-resize",
            zIndex: 50,
            background: isResizing ? "var(--accent-purple)" : "transparent",
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) => {
            if (!isResizing) e.currentTarget.style.background = "rgba(139, 92, 246, 0.2)";
          }}
          onMouseLeave={(e) => {
            if (!isResizing) e.currentTarget.style.background = "transparent";
          }}
        />
      )}
    </aside>
  );
}
