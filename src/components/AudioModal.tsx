"use client";

import React from "react";
import { useAudio } from "../contexts/AudioContext";
import { useAuth } from "../hooks/useAuth";

interface AudioModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AudioModal({ isOpen, onClose }: AudioModalProps) {
  const { participants, isMuted, toggleMute, leaveCall } = useAudio();
  const { user } = useAuth();

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0, 0, 0, 0.4)",
          backdropFilter: "blur(8px)",
        }}
      />

      {/* Modal Content */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "400px",
          background: "var(--card)",
          borderRadius: "32px",
          border: "1px solid var(--card-border)",
          boxShadow: "0 40px 100px rgba(0, 0, 0, 0.3)",
          backdropFilter: "blur(60px)",
          overflow: "hidden",
          animation: "modalFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <div style={{ padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--foreground)", margin: 0 }}>Voice Chat</h3>
            <button
              onClick={onClose}
              style={{
                background: "var(--input-bg)",
                border: "none",
                borderRadius: "50%",
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-muted)",
                cursor: "pointer",
              }}
            >
              ✕
            </button>
          </div>

          {/* Participants */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "32px" }}>
            {participants.map((p) => (
              <div
                key={p.uid}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "8px",
                  width: "calc(33.33% - 8px)",
                }}
              >
                <div
                  style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    background: "var(--foreground)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "20px",
                    fontWeight: 800,
                    color: "var(--background)",
                    boxShadow: "0 4px 15px var(--card-border)",
                    position: "relative",
                  }}
                >
                  {p.username[0]?.toUpperCase()}
                  {/* Activity Indicator (Static for now, but glows) */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: "2px",
                      right: "2px",
                      width: "14px",
                      height: "14px",
                      borderRadius: "50%",
                      background: "#22c55e",
                      border: "3px solid var(--card)",
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: "12px",
                    color: "var(--text-muted)",
                    textAlign: "center",
                    width: "100%",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {p.username}
                  {p.uid === user?.uid && " (You)"}
                </span>
              </div>
            ))}
          </div>

          {/* Controls */}
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={toggleMute}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                padding: "12px",
                borderRadius: "14px",
                background: isMuted ? "rgba(239, 68, 68, 0.1)" : "var(--input-bg)",
                border: "1px solid",
                borderColor: isMuted ? "rgba(239, 68, 68, 0.2)" : "var(--input-border)",
                color: isMuted ? "#ef4444" : "var(--foreground)",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {isMuted ? "🔇 Unmute" : "🎤 Mute"}
            </button>
            <button
              onClick={async () => {
                await leaveCall();
                onClose();
              }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                padding: "12px 24px",
                borderRadius: "14px",
                background: "rgba(239, 68, 68, 0.15)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                color: "#f87171",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              📵 Leave
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div
          style={{
            background: "var(--input-bg)",
            padding: "12px 24px",
            borderTop: "1px solid var(--card-border)",
            textAlign: "center",
          }}
        >
          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
            Peer-to-peer encrypted connection
          </span>
        </div>
      </div>
      
      <style jsx global>{`
        @keyframes modalFadeIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
