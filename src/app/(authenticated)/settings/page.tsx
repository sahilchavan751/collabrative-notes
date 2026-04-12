"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor, Check, LogOut, Palette, User as UserIcon, ChevronLeft } from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";
import { useRouter } from "next/navigation";
import { useMediaQuery } from "../../../hooks/useMediaQuery";

export default function SettingsPage() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { logout } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"personalize" | "account">("personalize");
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    setMounted(true);
    // On desktop, always show content
    if (typeof window !== "undefined" && window.innerWidth > 768) {
      setShowContent(true);
    }
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const handleTabSelect = (tab: "personalize" | "account") => {
    setActiveTab(tab);
    if (isMobile) {
      setShowContent(true);
    }
  };

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

  // Mobile: show either sidebar or content
  if (isMobile) {
    if (showContent) {
      return (
        <div style={{ flex: 1, height: "100%", overflowY: "auto", background: "var(--background)" }}>
          {/* Mobile Content Header with Back */}
          <header style={{ 
            height: "56px", 
            borderBottom: "1px solid var(--sidebar-border)", 
            display: "flex", 
            alignItems: "center", 
            padding: "0 16px",
            gap: "12px",
            background: "var(--background)",
            position: "sticky",
            top: 0,
            zIndex: 10
          }}>
            <button
              onClick={() => setShowContent(false)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "transparent",
                border: "none",
                color: "var(--foreground)",
                cursor: "pointer",
                padding: "4px",
              }}
            >
              <ChevronLeft size={24} />
            </button>
            <h2 style={{ fontSize: "20px", fontWeight: 700, color: "var(--foreground)", textTransform: "capitalize" }}>
              {activeTab}
            </h2>
          </header>

          <div style={{ padding: "24px 16px" }}>
            {activeTab === "personalize" && (
              <div style={{ animation: "fadeIn 0.3s ease" }}>
                <section style={{ marginBottom: "32px" }}>
                  <h3 style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "16px" }}>
                    Appearance
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {themeOptions.map((option) => {
                      const isActive = mounted && theme === option.id;
                      return (
                        <button
                          key={option.id}
                          onClick={() => setTheme(option.id)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "14px",
                            padding: "16px",
                            borderRadius: "14px",
                            background: isActive ? "var(--foreground)" : "var(--card)",
                            border: isActive ? "2px solid var(--foreground)" : "2px solid var(--card-border)",
                            cursor: "pointer",
                            textAlign: "left",
                            transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                          }}
                        >
                          <div style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "10px",
                            background: isActive ? "var(--background)" : "var(--sidebar-bg)",
                            color: isActive ? "var(--foreground)" : "var(--text-muted)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}>
                            {option.icon}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2px" }}>
                              <span style={{ fontWeight: 600, color: isActive ? "var(--background)" : "var(--foreground)", fontSize: "15px" }}>{option.name}</span>
                              {isActive && <Check size={16} color="var(--background)" />}
                            </div>
                            <p style={{ fontSize: "13px", color: isActive ? "var(--background)" : "var(--text-muted)", opacity: isActive ? 0.8 : 1, margin: 0 }}>
                              {option.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </section>

                <section style={{ padding: "20px", borderRadius: "16px", background: "var(--card)", border: "1px solid var(--card-border)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "10px",
                      background: "var(--foreground)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--background)",
                      flexShrink: 0,
                    }}>
                      <Monitor size={20} />
                    </div>
                    <div>
                      <h3 style={{ fontWeight: 600, color: "var(--foreground)", marginBottom: "2px", fontSize: "14px" }}>Current Theme</h3>
                      <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: 0 }}>
                        Using <strong style={{ color: "var(--foreground)" }}>{mounted ? resolvedTheme : "..."}</strong> theme
                      </p>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {activeTab === "account" && (
              <div style={{ animation: "fadeIn 0.3s ease" }}>
                <section>
                  <h3 style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "16px" }}>
                    Session Management
                  </h3>
                  <div style={{ background: "var(--card)", border: "1px solid var(--card-border)", borderRadius: "16px", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div>
                      <h4 style={{ fontWeight: 600, color: "var(--foreground)", marginBottom: "6px", fontSize: "15px" }}>Sign Out</h4>
                      <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: 0, lineHeight: 1.5 }}>
                        You will be logged out of your RealNote account on this device.
                      </p>
                    </div>
                    <button
                      onClick={handleLogout}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "14px 20px",
                        borderRadius: "14px",
                        background: "rgba(239, 68, 68, 0.08)",
                        border: "1px solid rgba(239, 68, 68, 0.2)",
                        color: "#ef4444",
                        fontWeight: 700,
                        fontSize: "14px",
                        cursor: "pointer",
                        transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                        width: "100%",
                        justifyContent: "center",
                      }}
                    >
                      <LogOut size={18} />
                      Sign Out
                    </button>
                  </div>
                </section>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Mobile sidebar (tab selector)
    return (
      <div style={{ flex: 1, height: "100%", overflowY: "auto", background: "var(--background)" }}>
        <div style={{ padding: "20px 16px 8px 16px" }}>
          <h1 style={{ fontSize: "20px", fontWeight: 700, color: "var(--foreground)", margin: 0 }}>Settings</h1>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "2px", padding: "12px" }}>
          <button
            onClick={() => handleTabSelect("personalize")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "14px 16px",
              borderRadius: "12px",
              background: activeTab === "personalize" ? "var(--foreground)" : "transparent",
              color: activeTab === "personalize" ? "var(--background)" : "var(--text-muted)",
              border: "none",
              fontWeight: 600,
              fontSize: "15px",
              cursor: "pointer",
              transition: "all 0.15s ease",
              textAlign: "left",
              width: "100%",
            }}
          >
            <Palette size={18} />
            Personalize
          </button>
          <button
            onClick={() => handleTabSelect("account")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "14px 16px",
              borderRadius: "12px",
              background: activeTab === "account" ? "var(--foreground)" : "transparent",
              color: activeTab === "account" ? "var(--background)" : "var(--text-muted)",
              border: "none",
              fontWeight: 600,
              fontSize: "15px",
              cursor: "pointer",
              transition: "all 0.15s ease",
              textAlign: "left",
              width: "100%",
            }}
          >
            <UserIcon size={18} />
            Account
          </button>
        </div>
      </div>
    );
  }

  // Desktop layout (unchanged)
  return (
    <div style={{ flex: 1, display: "flex", height: "100vh", overflow: "hidden", background: "var(--background)" }}>
      {/* Inner Sidebar for Settings */}
      <aside style={{ 
        width: "280px", 
        borderRight: "1px solid var(--sidebar-border)", 
        background: "var(--card)", 
        display: "flex", 
        flexDirection: "column",
        flexShrink: 0
      }}>
        <div style={{ 
          height: "72px", 
          borderBottom: "1px solid var(--sidebar-border)", 
          display: "flex", 
          alignItems: "center", 
          padding: "0 28px",
          background: "var(--card)"
        }}>
          <h1 style={{ fontSize: "20px", fontWeight: 700, color: "var(--foreground)", margin: 0 }}>Settings</h1>
        </div>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "2px", padding: "12px" }}>
          <button
            onClick={() => setActiveTab("personalize")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "10px 20px",
              borderRadius: "10px",
              background: activeTab === "personalize" ? "var(--foreground)" : "transparent",
              color: activeTab === "personalize" ? "var(--background)" : "var(--text-muted)",
              border: "none",
              fontWeight: 600,
              fontSize: "13px",
              cursor: "pointer",
              transition: "all 0.15s ease",
              textAlign: "left"
            }}
          >
            <Palette size={16} />
            Personalize
          </button>
          
          <button
            onClick={() => setActiveTab("account")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "10px 20px",
              borderRadius: "10px",
              background: activeTab === "account" ? "var(--foreground)" : "transparent",
              color: activeTab === "account" ? "var(--background)" : "var(--text-muted)",
              border: "none",
              fontWeight: 600,
              fontSize: "13px",
              cursor: "pointer",
              transition: "all 0.15s ease",
              textAlign: "left"
            }}
          >
            <UserIcon size={16} />
            Account
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, overflowY: "auto", position: "relative", background: "var(--background)" }}>
        <header style={{ height: "72px", borderBottom: "1px solid var(--sidebar-border)", display: "flex", alignItems: "center", padding: "0 28px", background: "var(--background)", backdropFilter: "blur(20px)", position: "sticky", top: 0, zIndex: 10 }}>
          <h2 style={{ fontSize: "20px", fontWeight: 700, color: "var(--foreground)", textTransform: "capitalize" }}>
            {activeTab}
          </h2>
        </header>

        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "60px 40px" }}>
          
          {/* PERSONALIZE TAB */}
          {activeTab === "personalize" && (
            <div style={{ animation: "fadeIn 0.3s ease" }}>
              <section style={{ marginBottom: "48px" }}>
                <h3 style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "24px" }}>
                  Appearance
                </h3>

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
                    background: isActive ? "var(--foreground)" : "var(--card)",
                    border: isActive ? "2px solid var(--foreground)" : "2px solid var(--card-border)",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                >
                  <div style={{ 
                    width: "40px", 
                    height: "40px", 
                    borderRadius: "10px", 
                    background: isActive ? "var(--background)" : "var(--sidebar-bg)", 
                    color: isActive ? "var(--foreground)" : "var(--text-muted)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "16px"
                  }}>
                    {option.icon}
                  </div>
                  
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", marginBottom: "4px" }}>
                    <span style={{ fontWeight: 600, color: isActive ? "var(--background)" : "var(--foreground)" }}>{option.name}</span>
                    {isActive && <Check size={16} color="var(--background)" />}
                  </div>
                  
                  <p style={{ fontSize: "13px", color: isActive ? "var(--background)" : "var(--text-muted)", opacity: isActive ? 0.8 : 1, margin: 0 }}>
                    {option.description}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        <section style={{ padding: "32px", borderRadius: "20px", background: "var(--card)", border: "1px solid var(--card-border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ 
              width: "48px", 
              height: "48px", 
              borderRadius: "12px", 
              background: "var(--foreground)", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              color: "var(--background)"
            }}>
              <Monitor size={24} />
            </div>
            <div>
              <h3 style={{ fontWeight: 600, color: "var(--foreground)", marginBottom: "4px" }}>Current Theme</h3>
              <p style={{ fontSize: "14px", color: "var(--text-muted)", margin: 0 }}>
                The application is currently using the <strong style={{ color: "var(--foreground)" }}>{mounted ? resolvedTheme : "..."}</strong> theme.
              </p>
            </div>
          </div>
        </section>
      </div>
    )}

          {/* ACCOUNT TAB */}
          {activeTab === "account" && (
            <div style={{ animation: "fadeIn 0.3s ease" }}>
              <section>
                <h3 style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "24px" }}>
                  Session Management
                </h3>
                
                <div style={{ background: "var(--card)", border: "1px solid var(--card-border)", borderRadius: "20px", padding: "32px", display: "flex", flexDirection: "column", gap: "24px" }}>
                  <div>
                    <h4 style={{ fontWeight: 600, color: "var(--foreground)", marginBottom: "8px" }}>Sign Out</h4>
                    <p style={{ fontSize: "14px", color: "var(--text-muted)", margin: 0, lineHeight: 1.5 }}>
                      You will be logged out of your RealNote account on this device. You will need to authenticate again to access your collaborative notes.
                    </p>
                  </div>

                  <button
                    onClick={handleLogout}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "16px 24px",
                      borderRadius: "16px",
                      background: "rgba(239, 68, 68, 0.08)",
                      border: "1px solid rgba(239, 68, 68, 0.2)",
                      color: "#ef4444",
                      fontWeight: 700,
                      fontSize: "15px",
                      cursor: "pointer",
                      transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                      width: "max-content",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#ef4444";
                      e.currentTarget.style.color = "#fff";
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 10px 20px rgba(239, 68, 68, 0.2)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(239, 68, 68, 0.08)";
                      e.currentTarget.style.color = "#ef4444";
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <LogOut size={20} />
                    Sign Out from RealNote
                  </button>
                </div>
              </section>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
