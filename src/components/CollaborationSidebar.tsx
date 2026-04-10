"use client";

import React, { useEffect, useState } from "react";
import UserAvatar from "./UserAvatar";

interface PresenceUser {
  uid: string;
  name: string;
  isTyping: boolean;
  color: string;
}

interface CollaborationSidebarProps {
  awareness: any; // Yjs Awareness
}

export default function CollaborationSidebar({ awareness }: CollaborationSidebarProps) {
  const [users, setUsers] = useState<PresenceUser[]>([]);

  useEffect(() => {
    if (!awareness) return;

    const handleUpdate = () => {
      const states = awareness.getStates();
      const userMap = new Map<string, PresenceUser>();

      states.forEach((state: any, clientId: number) => {
        if (state.user) {
          const uid = state.user.uid || clientId.toString();
          const isTyping = !!state.user.typing;
          
          const existing = userMap.get(uid);
          if (existing) {
            // If user has multiple tabs, show as typing if ANY tab is typing
            existing.isTyping = existing.isTyping || isTyping;
          } else {
            userMap.set(uid, {
              uid,
              name: state.user.name || "Anonymous",
              isTyping: isTyping,
              color: state.user.color || "var(--foreground)"
            });
          }
        }
      });

      setUsers(Array.from(userMap.values()));
    };

    awareness.on("change", handleUpdate);
    handleUpdate();

    return () => {
      awareness.off("change", handleUpdate);
    };
  }, [awareness]);

  const typingUsers = users.filter(u => u.isTyping);

  return (
    <div
      style={{
        borderRadius: "16px",
        background: "var(--card)",
        border: "1px solid var(--card-border)",
        padding: "20px",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.3s ease",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <h3 style={{ fontSize: "14px", fontWeight: 600, color: "var(--foreground)", margin: 0 }}>Active Users</h3>
        <div
          style={{
            padding: "4px 10px",
            borderRadius: "20px",
            background: "var(--foreground)",
            color: "var(--background)",
            fontSize: "12px",
            fontWeight: 800,
          }}
        >
          {users.length}
        </div>
      </div>

      {/* User list */}
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px" }}>
        {users.length === 0 ? (
          <p style={{ fontSize: "12px", color: "var(--text-muted)", textAlign: "center", fontStyle: "italic" }}>
            No one else is here...
          </p>
        ) : (
          users.map((u) => (
            <div
              key={u.uid}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "8px",
                borderRadius: "12px",
                background: "var(--input-bg)",
                border: "1px solid var(--card-border)",
              }}
            >
              <UserAvatar name={u.name} size="sm" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "var(--foreground)",
                    margin: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {u.name}
                </p>
                {u.isTyping && (
                  <p style={{ fontSize: "11px", color: "var(--foreground)", opacity: 0.6, margin: 0, animation: "pulse 1.5s infinite" }}>
                    typing...
                  </p>
                )}
              </div>
              <div 
                style={{ 
                  width: "8px", height: "8px", borderRadius: "50%", background: u.color,
                  boxShadow: `0 0 6px ${u.color}80`
                }} 
              />
            </div>
          ))
        )}
      </div>

      {/* Typing indicator summary at bottom */}
      {typingUsers.length > 0 && (
        <div
          style={{
            marginTop: "16px",
            padding: "10px",
            background: "rgba(255, 255, 255, 0.05)",
            borderRadius: "10px",
            border: "1px solid var(--card-border)",
          }}
        >
          <p style={{ fontSize: "12px", color: "var(--foreground)", margin: 0, display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ display: "flex", gap: "2px" }}>
              <span className="dot animate-dot-bounce" style={{ width: "4px", height: "4px", borderRadius: "50%", background: "var(--foreground)" }} />
              <span className="dot animate-dot-bounce" style={{ width: "4px", height: "4px", borderRadius: "50%", background: "var(--foreground)", animationDelay: "0.2s" }} />
              <span className="dot animate-dot-bounce" style={{ width: "4px", height: "4px", borderRadius: "50%", background: "var(--foreground)", animationDelay: "0.4s" }} />
            </span>
            <span style={{ fontWeight: 700, color: "var(--foreground)" }}>
              {typingUsers.length === 1 
                ? `${typingUsers[0].name} is typing...`
                : `${typingUsers.length} users are typing...`}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
