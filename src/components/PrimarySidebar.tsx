"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../hooks/useAuth";
import UserAvatar from "./UserAvatar";

export default function PrimarySidebar() {
  const { user, userProfile, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const menuItems = [
    { 
      id: "dashboard", 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 24, height: 24 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      label: "Dashboard",
      path: "/dashboard"
    },
    { 
      id: "new", 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 24, height: 24 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      ),
      label: "New Note",
      action: () => router.push("/dashboard?action=new")
    },
  ];

  const secondaryItems = [
    { 
      id: "settings", 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 24, height: 24 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      label: "Settings",
      path: "/settings"
    },
    { 
      id: "profile", 
      icon: (
        <UserAvatar 
          name={userProfile?.username || user?.displayName || "User"} 
          photoURL={user?.photoURL} 
          size="xs" 
          style={{ transition: "none" }}
        />
      ),
      label: "Profile",
      path: "/profile"
    },
  ];

  const renderNavItem = (item: any) => {
    const isActive = item.id !== "new" && item.path && pathname === item.path;
    return (
      <button
        key={item.id}
        onClick={item.action || (() => item.path && router.push(item.path))}
        title={item.label}
        style={{
          width: "44px",
          height: "44px",
          borderRadius: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: isActive ? "var(--foreground)" : "transparent",
          color: isActive ? "var(--background)" : "var(--text-muted)",
          border: item.id === "profile" && !isActive ? "2px solid var(--card-border)" : "none",
          cursor: "pointer",
          transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
          overflow: "hidden"
        }}
        onMouseEnter={(e) => {
          if (!isActive) {
            e.currentTarget.style.background = "rgba(0, 0, 0, 0.05)";
            e.currentTarget.style.color = "var(--foreground)";
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "var(--text-muted)";
          }
        }}
      >
        {item.icon}
      </button>
    );
  };

  return (
    <aside
      style={{
        width: "72px",
        height: "100vh",
        background: "var(--sidebar-bg)",
        borderRight: "1px solid var(--sidebar-border)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        transition: "all 0.3s ease",
        paddingBottom: "20px"
      }}
    >
      <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
        {/* Header Alignment Area */}
        <div
          style={{
            height: "72px",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderBottom: "1px solid var(--sidebar-border)",
            marginBottom: "20px",
          }}
        >
          {/* App Logo Icon */}
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              background: "var(--foreground)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--background)",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            }}
            onClick={() => router.push("/dashboard")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 24, height: 24 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
        </div>

        <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
          {menuItems.map(renderNavItem)}
        </div>
      </div>

      <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
        {secondaryItems.map(renderNavItem)}
      </div>
    </aside>
  );
}
