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
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "var(--foreground)",
                color: "var(--background)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid var(--background)",
                transform: "translateY(-16px)",
                boxShadow: "0 12px 30px rgba(0, 0, 0, 0.4)",
                cursor: "pointer",
                transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                zIndex: 10,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-20px) scale(1.05)";
                e.currentTarget.style.boxShadow = "0 18px 40px rgba(0, 0, 0, 0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(-16px) scale(1)";
                e.currentTarget.style.boxShadow = "0 12px 30px rgba(0, 0, 0, 0.4)";
              }}
            >
              <Plus size={28} strokeWidth={3} />
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
              color: isActive ? "var(--foreground)" : "var(--text-muted)",
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
