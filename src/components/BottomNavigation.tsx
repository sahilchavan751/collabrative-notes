"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
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

        return (
          <Link
            key={item.id}
            href={item.path!}
            prefetch={true}
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
              textDecoration: "none",
              flex: 1,
            }}
          >
            {item.icon}
            <span style={{ fontSize: "10px", fontWeight: isActive ? 600 : 500 }}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
