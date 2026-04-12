"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useParams, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../hooks/useAuth";
import { useNotes } from "../contexts/NotesContext";
import { Note } from "../types";
import Skeleton from "./Skeleton";
import { useMediaQuery } from "../hooks/useMediaQuery";
import toast from "react-hot-toast";

export default function SecondarySidebar() {
  const { user } = useAuth();
  const { notes, loading, deleteNote, togglePin, toggleStar } = useNotes();
  const params = useParams();
  const activeNoteId = params.noteId as string;
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  const [searchQuery, setSearchQuery] = useState("");
  
  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{ noteId: string; x: number; y: number } | null>(null);
  
  // Draggable sidebar state
  const [isResizing, setIsResizing] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(300);

  // Touch timer for mobile long press
  const touchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const preventClickRef = useRef(false);

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

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (contextMenu) setContextMenu(null);
    };
    window.addEventListener("click", handleClickOutside);
    // On scroll, optionally close
    window.addEventListener("scroll", handleClickOutside, { passive: true });
    
    return () => {
      window.removeEventListener("click", handleClickOutside);
      window.removeEventListener("scroll", handleClickOutside);
    };
  }, [contextMenu]);

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
      const PrimarySidebarWidth = 72;
      const newWidth = event.clientX - PrimarySidebarWidth;
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

  const filteredNotes = notes.filter((note) =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Sort pinned to top
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return 0; // Assuming notes are already sorted descending by date from context
  });

  // Long press handling
  const handleTouchStart = (e: React.TouchEvent, noteId: string) => {
    const touch = e.touches[0];
    preventClickRef.current = false;
    touchTimerRef.current = setTimeout(() => {
      preventClickRef.current = true; // prevent the ensuing onClick from navigating
      setContextMenu({
        noteId,
        x: touch.clientX,
        y: Math.max(100, touch.clientY - 50) // Adjust slightly to not be under finger
      });
      // Vibrate if supported
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, 600);
  };

  const clearTouchTimer = () => {
    if (touchTimerRef.current) {
      clearTimeout(touchTimerRef.current);
      touchTimerRef.current = null;
    }
  };

  const handleContextMenu = (e: React.MouseEvent, noteId: string) => {
    e.preventDefault(); // Prevents default browser right menu
    preventClickRef.current = true;
    setContextMenu({
      noteId,
      x: e.clientX,
      y: e.clientY
    });
  };

  const handleMenuAction = async (e: React.MouseEvent, action: 'pin'|'star'|'delete', note: Note) => {
    e.stopPropagation();
    e.preventDefault();
    setContextMenu(null);
    
    if (action === 'pin') {
      try {
        await togglePin(note.id, note.isPinned || false);
        toast.success(note.isPinned ? "Note unpinned" : "Note pinned");
      } catch (err) { toast.error("Failed to pin note"); }
    } else if (action === 'star') {
      try {
        await toggleStar(note.id, note.isStarred || false);
        toast.success(note.isStarred ? "Removed star" : "Starred note");
      } catch (err) { toast.error("Failed to star note"); }
    } else if (action === 'delete') {
      if (confirm("Are you sure you want to delete this note?")) {
        try {
          const success = await deleteNote(note.id);
          if (success) toast.success("Note deleted");
          else toast.error("You can only delete your own notes");
        } catch (err) { toast.error("Failed to delete note"); }
      }
    }
  };

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
          <h2 style={{ fontSize: "20px", fontWeight: 700, color: "var(--foreground)" }}>My Notes</h2>
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
      <div style={{ flex: 1, overflowY: "auto", padding: "12px", position: "relative" }}>
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} style={{ padding: "14px", borderRadius: "12px", background: "var(--card)", border: "1px solid var(--card-border)", marginBottom: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                   <Skeleton width="12px" height="12px" borderRadius="4px" />
                   <Skeleton width="50%" height="14px" />
                </div>
                <Skeleton width="85%" height="11px" />
              </div>
            ))}
          </div>
        ) : sortedNotes.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>No notes found</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {sortedNotes.map((note) => {
              const isActive = activeNoteId === note.id;
              const snippet = note.content.replace(/<[^>]*>/g, "").substring(0, 60);
              
              return (
                <Link
                  key={note.id}
                  href={`/notes/${note.id}`}
                  prefetch={true}
                  onClick={(e) => {
                    if (preventClickRef.current) {
                      e.preventDefault();
                      preventClickRef.current = false;
                    }
                  }}
                  onContextMenu={(e) => handleContextMenu(e, note.id)}
                  onTouchStart={(e) => handleTouchStart(e, note.id)}
                  onTouchEnd={clearTouchTimer}
                  onTouchMove={clearTouchTimer}
                  style={{
                    padding: "14px",
                    borderRadius: "12px",
                    background: isActive ? "var(--foreground)" : "transparent",
                    border: isActive ? "1px solid var(--foreground)" : "1px solid transparent",
                    cursor: "pointer",
                    transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                    textDecoration: "none",
                    display: "block",
                    userSelect: "none", 
                    WebkitUserSelect: "none"
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive && !isMobile) e.currentTarget.style.background = "var(--input-bg)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive && !isMobile) e.currentTarget.style.background = "transparent";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    {note.isPinned && (
                       <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 12, height: 12, color: isActive ? "var(--background)" : "var(--foreground)" }} fill="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2M8 4V2m8 2V2M8 12h8m-8 4h8" />
                       </svg> // Actually a calendar icon logic-wise, let's use a real pin:
                    )}
                    {note.isPinned && (
                       <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 12, height: 12, transform: 'rotate(45deg)', color: isActive ? "var(--background)" : "var(--foreground)", marginLeft: -20 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                         <path strokeLinecap="round" strokeLinejoin="round" d="M15 3h6v6M9 21v-9M21 3l-7 7M21 3l-7 7" />
                       </svg> // Pushpin
                    )}
                    <h4 style={{ fontSize: "14px", fontWeight: 700, color: isActive ? "var(--background)" : "var(--foreground)", margin: 0, flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {note.title || "Untitled Note"}
                    </h4>
                    {note.isStarred && (
                      <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 14, height: 14, color: isActive ? "var(--background)" : "#eab308", minWidth: 14 }} viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    )}
                  </div>
                  
                  <p style={{ fontSize: "12px", color: isActive ? "var(--background)" : "var(--text-muted)", opacity: isActive ? 0.7 : 1, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {snippet || "No content..."}
                  </p>
                </Link>
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
            background: isResizing ? "var(--foreground)" : "transparent",
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) => {
            if (!isResizing) e.currentTarget.style.background = "var(--input-border)";
          }}
          onMouseLeave={(e) => {
            if (!isResizing) e.currentTarget.style.background = "transparent";
          }}
        />
      )}

      {/* Context Menu Portal */}
      {contextMenu && (
        <div
          style={{
            position: "fixed",
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`,
            background: "var(--card)",
            border: "1px solid var(--card-border)",
            borderRadius: "12px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
            padding: "8px",
            zIndex: 9999,
            minWidth: "160px",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            // Keep menu in viewport bounds roughly
            transform: `translate(${contextMenu.x > window.innerWidth - 180 ? '-100%' : '0'}, ${contextMenu.y > window.innerHeight - 150 ? '-100%' : '0'})`
          }}
          onClick={(e) => e.stopPropagation()} // don't trigger the click-outside close
        >
          {(() => {
            const contextNote = notes.find(n => n.id === contextMenu.noteId);
            if (!contextNote) return null;

            return (
              <>
                <button
                  className="menu-btn"
                  onClick={(e) => handleMenuAction(e, 'pin', contextNote)}
                  style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", background: "transparent", border: "none", color: "var(--foreground)", width: "100%", textAlign: "left", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: 500 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 14, height: 14, transform: 'rotate(45deg)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 3h6v6M9 21v-9M21 3l-7 7M21 3l-7 7" />
                  </svg>
                  {contextNote.isPinned ? "Unpin Note" : "Pin Note"}
                </button>
                <button
                  className="menu-btn"
                  onClick={(e) => handleMenuAction(e, 'star', contextNote)}
                  style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", background: "transparent", border: "none", color: "var(--foreground)", width: "100%", textAlign: "left", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: 500 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 14, height: 14 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  {contextNote.isStarred ? "Remove Star" : "Star Note"}
                </button>
                <hr style={{ border: "none", borderTop: "1px solid var(--card-border)", margin: "4px 0" }} />
                <button
                  className="menu-btn"
                  onClick={(e) => handleMenuAction(e, 'delete', contextNote)}
                  style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", background: "transparent", border: "none", color: "#ef4444", width: "100%", textAlign: "left", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: 500 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 14, height: 14 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Note
                </button>
              </>
            );
          })()}
        </div>
      )}

      {/* Basic hover effects for menu buttons */}
      <style jsx>{`
        .menu-btn:hover {
          background: var(--input-bg) !important;
        }
      `}</style>
    </aside>
  );
}
