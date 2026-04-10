"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor, Check } from "lucide-react";

export default function SettingsPage() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const themeOptions = [
    {
      id: "light",
      name: "Light",
      icon: <Sun size={20} />,
      description: "Clean and bright interface",
    },
    {
      id: "dark",
      name: "Dark",
      icon: <Moon size={20} />,
      description: "Easy on the eyes in low light",
    },
    {
      id: "system",
      name: "System Default",
      icon: <Monitor size={20} />,
      description: "Matches your device settings",
    },
  ];

  return (
    <div style={{ flex: 1, height: "100vh", overflowY: "auto", background: "var(--background)" }}>
      {/* Header */}
      <header style={{ height: "72px", borderBottom: "1px solid var(--sidebar-border)", display: "flex", alignItems: "center", padding: "0 40px", background: "var(--background)", backdropFilter: "blur(20px)", position: "sticky", top: 0, zIndex: 10 }}>
        <h1 style={{ fontSize: "20px", fontWeight: 700, color: "var(--foreground)" }}>Settings</h1>
      </header>

      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "60px 40px" }}>
        <section style={{ marginBottom: "48px" }}>
          <h2 style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "24px" }}>
            Appearance
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
            {themeOptions.map((option) => {
              // Only consider active after mounting to avoid hydration mismatch
              const isActive = mounted && theme === option.id;
              
              return (
                <button
                  key={option.id}
                  onClick={() => setTheme(option.id)}
                  className="settings-option-hover"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    padding: "20px",
                    borderRadius: "16px",
                    background: isActive ? "rgba(139, 92, 246, 0.05)" : "var(--card)",
                    border: isActive ? "2px solid #8b5cf6" : "2px solid var(--card-border)",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <div style={{ 
                    width: "40px", 
                    height: "40px", 
                    borderRadius: "10px", 
                    background: isActive ? "#8b5cf6" : "var(--sidebar-bg)", 
                    color: isActive ? "#fff" : "var(--text-muted)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "16px"
                  }}>
                    {option.icon}
                  </div>
                  
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", marginBottom: "4px" }}>
                    <span style={{ fontWeight: 600, color: "var(--foreground)" }}>{option.name}</span>
                    {isActive && <Check size={16} color="#8b5cf6" />}
                  </div>
                  
                  <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: 0 }}>
                    {option.description}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        <section style={{ padding: "32px", borderRadius: "20px", background: "linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.1))", border: "1px solid rgba(139, 92, 246, 0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ 
              width: "48px", 
              height: "48px", 
              borderRadius: "12px", 
              background: "#8b5cf6", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              color: "#fff"
            }}>
              <Monitor size={24} />
            </div>
            <div>
              <h3 style={{ fontWeight: 600, color: "var(--foreground)", marginBottom: "4px" }}>Current Theme</h3>
              <p style={{ fontSize: "14px", color: "var(--text-muted)", margin: 0 }}>
                The application is currently using the <strong style={{ color: "#8b5cf6" }}>{mounted ? resolvedTheme : "..."}</strong> theme.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
