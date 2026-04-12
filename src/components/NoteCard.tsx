"use client";

import React from "react";
import Link from "next/link";
import { Note } from "../types";

interface NoteCardProps {
  note: Note;
  onDelete: (noteId: string) => void;
  isOwner: boolean;
}

export default function NoteCard({ note, onDelete, isOwner }: NoteCardProps) {

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getPreview = (html: string) => {
    if (!html) return "Empty note — click to start writing...";
    const text = html.replace(/<[^>]*>/g, "").trim();
    return text.length > 120 ? text.slice(0, 120) + "..." : text || "Empty note — click to start writing...";
  };

  return (
    <Link
      href={`/notes/${note.id}`}
      prefetch={true}
      style={{
        textDecoration: "none",
        padding: "20px",
        borderRadius: "16px",
        background: "var(--card)",
        border: "1px solid var(--card-border)",
        cursor: "pointer",
        transition: "all 0.3s ease",
        position: "relative",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--foreground)";
        e.currentTarget.style.boxShadow = "0 8px 30px rgba(0,0,0,0.1)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--card-border)";
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* Title */}
      <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--foreground)", margin: "0 0 8px 0" }}>
        {note.title || "Untitled Note"}
      </h3>

      {/* Preview */}
      <p
        style={{
          fontSize: "13px",
          color: "var(--text-muted)",
          lineHeight: "1.6",
          margin: "0 0 16px 0",
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {getPreview(note.content)}
      </p>

      {/* Footer */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: "12px", color: "var(--text-muted)", opacity: 0.8 }}>{formatDate(note.updatedAt)}</span>

        {isOwner && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (confirm("Are you sure you want to delete this note?")) {
                onDelete(note.id);
              }
            }}
            style={{
              padding: "6px",
              borderRadius: "8px",
              background: "transparent",
              border: "none",
              color: "var(--text-muted)",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(239,68,68,0.1)";
              e.currentTarget.style.color = "#ef4444";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "var(--text-muted)";
            }}
            title="Delete note"
          >
            <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 14, height: 14 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>
    </Link>
  );
}
