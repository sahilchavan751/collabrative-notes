"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  FileText, 
  User, 
  Settings, 
  Plus 
} from "lucide-react";

export default function BottomNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
    { 
      id: "dashboard", 
      icon: <LayoutDashboard size={22} />, 
      label: "Home", 
      path: "/dashboard" 
    },
    { 
      id: "notes", 
      icon: <FileText size={22} />, 
      label: "Notes", 
      path: "/notes" 
    },
    { 
      id: "new", 
      icon: <Plus size={24} />, 
      label: "New", 
      action: () => router.push("/dashboard?action=new") 
    },
    { 
      id: "profile", 
      icon: <User size={22} />, 
      label: "Profile", 
      path: "/profile" 
    },
    { 
      id: "settings", 
      icon: <Settings size={22} />, 
      label: "Settings", 
      path: "/settings" 
    },
  ];

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: "64px",
        background: "var(--background)",
        borderTop: "1px solid var(--sidebar-border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        padding: "0 10px",
        zIndex: 100,
        backdropFilter: "blur(20px)",
      }}
    >
      {menuItems.map((item) => {
        const isActive = item.path && pathname === item.path;
        const isNew = item.id === "new";

        if (isNew) {
          return (
            <button
              key={item.id}
              onClick={item.action}
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "14px",
                background: "linear-gradient(135deg, #8b5cf6, #3b82f6)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "none",
                transform: "translateY(-12px)",
                boxShadow: "0 4px 12px rgba(139, 92, 246, 0.4)",
                cursor: "pointer",
              }}
            >
              {item.icon}
            </button>
          );
        }

        return (
          <button
            key={item.id}
            onClick={() => item.path && router.push(item.path)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px",
              background: "transparent",
              border: "none",
              color: isActive ? "#8b5cf6" : "var(--text-muted)",
              cursor: "pointer",
              padding: "8px",
              transition: "all 0.2s",
            }}
          >
            {item.icon}
            <span style={{ fontSize: "10px", fontWeight: isActive ? 600 : 500 }}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
