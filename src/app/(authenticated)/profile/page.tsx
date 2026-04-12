"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { useNotes } from "../../../contexts/NotesContext";
import UserAvatar from "../../../components/UserAvatar";
import Skeleton from "../../../components/Skeleton";
import { useMediaQuery } from "../../../hooks/useMediaQuery";
import toast, { Toaster } from "react-hot-toast";
import { 
  User as UserIcon, 
  Mail, 
  AtSign, 
  Calendar, 
  Save, 
  ArrowLeft,
  Camera,
  ShieldCheck,
  Zap,
  Pencil
} from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const { user, userProfile, updateUserProfileData } = useAuth();
  const { notes } = useNotes();
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || "");
      setUsername(userProfile.username || "");
    }
  }, [userProfile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim() || !username.trim()) {
      toast.error("Name and Username cannot be empty");
      return;
    }

    setSaving(true);
    try {
      await updateUserProfileData({
        displayName,
        username
      });
      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error("Update failed:", err);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const formattedDate = user?.metadata.creationTime 
    ? new Date(user.metadata.creationTime).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "Recently";

  const hasChanges = userProfile && (
    displayName !== (userProfile.displayName || "") || 
    username !== (userProfile.username || "")
  );

  return (
    <div style={{ 
      flex: 1, 
      height: "100vh", 
      overflowY: "auto", 
      background: "var(--background)",
      scrollBehavior: "smooth"
    }}>
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: "var(--card)",
            color: "var(--foreground)",
            border: "1px solid var(--card-border)",
            borderRadius: "12px",
          }
        }}
      />
      
      {/* Dynamic Header */}
      <header style={{ 
        height: "72px", 
        borderBottom: "1px solid var(--sidebar-border)", 
        display: "flex", 
        alignItems: "center", 
        padding: isMobile ? "0 16px" : "0 28px", 
        background: "rgba(var(--background-rgb), 0.8)", 
        backdropFilter: "blur(20px)", 
        position: "sticky", 
        top: 0, 
        zIndex: 100,
        justifyContent: "space-between"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {isMobile && (
            <Link href="/dashboard" style={{ color: "var(--foreground)", display: "flex", alignItems: "center" }}>
              <ArrowLeft size={24} />
            </Link>
          )}
          <h1 style={{ fontSize: "20px", fontWeight: 700, color: "var(--foreground)", margin: 0 }}>
            Profile Settings
          </h1>
        </div>
      </header>

      <main style={{ 
        maxWidth: "800px", 
        margin: "0 auto", 
        padding: isMobile ? "20px 16px 40px 16px" : "32px 40px",
        animation: "fadeIn 0.5s ease"
      }}>
        
        {/* Identity Spotlight Card */}
        <section style={{ 
          background: "var(--card)", 
          border: "1px solid var(--card-border)", 
          borderRadius: "20px", 
          padding: isMobile ? "24px 20px" : "28px 32px",
          marginBottom: "24px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          alignItems: "center",
          gap: isMobile ? "20px" : "32px"
        }}>
          {/* Avatar Area */}
          <div style={{ position: "relative" }}>
            <div style={{ 
              padding: "8px", 
              borderRadius: "50%", 
              background: "linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)",
              border: "1px solid var(--card-border)",
              boxShadow: "0 8px 16px rgba(0,0,0,0.05)"
            }}>
              <UserAvatar 
                name={displayName || userProfile?.username || "User"} 
                photoURL={user?.photoURL} 
                size={isMobile ? "lg" : "xl"} 
              />
            </div>
            <div style={{ 
              position: "absolute", 
              bottom: "4px", 
              right: "4px", 
              background: "var(--foreground)", 
              color: "var(--background)", 
              width: "28px", 
              height: "28px", 
              borderRadius: "50%", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              border: "2px solid var(--card)",
              boxShadow: "0 4px 8px rgba(0,0,0,0.2)"
            }}>
              <Camera size={12} strokeWidth={2.5} />
            </div>
          </div>

          <div style={{ flex: 1, textAlign: isMobile ? "center" : "left" }}>
            <h2 style={{ fontSize: isMobile ? "22px" : "28px", fontWeight: 800, color: "var(--foreground)", margin: "0 0 6px 0" }}>
              {displayName || "Set Your Name"}
            </h2>
            <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: isMobile ? "8px" : "16px", alignItems: isMobile ? "center" : "center" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: isMobile ? "center" : "flex-start" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--foreground)", fontSize: "14px", fontWeight: 600, opacity: 0.7 }}>
                   <AtSign size={15} /> @{username || "username"}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontSize: "13px", fontWeight: 500 }}>
                   <Calendar size={14} /> Joined {formattedDate}
                </div>
              </div>

              {isMobile && (
                <div style={{ 
                  display: "flex", 
                  gap: "20px", 
                  paddingTop: "8px", 
                  marginTop: "8px", 
                  borderTop: "1px solid var(--sidebar-border)",
                  width: "100%",
                  justifyContent: "center"
                }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "16px", fontWeight: 800, color: "var(--foreground)" }}>{notes.length}</div>
                    <div style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Notes</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "16px", fontWeight: 800, color: "var(--foreground)" }}>0</div>
                    <div style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Collab</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {!isMobile && (
             <div style={{ display: "flex", gap: "24px", alignItems: "center", paddingLeft: "16px", borderLeft: "1px solid var(--sidebar-border)" }}>
                <div style={{ textAlign: "center" }}>
                   <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--foreground)" }}>{notes.length}</div>
                   <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.02em" }}>Notes</div>
                </div>
                <div style={{ textAlign: "center" }}>
                   <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--foreground)" }}>0</div>
                   <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.02em" }}>Collab</div>
                </div>
             </div>
          )}
        </section>

        {/* Form Content */}
        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Account Details Card */}
          <div className="glass-card" style={{ 
            padding: "24px", 
            borderRadius: "20px", 
            display: "flex", 
            flexDirection: "column", 
            gap: "20px" 
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(139, 92, 246, 0.1)", color: "#8b5cf6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <UserIcon size={16} />
                </div>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--foreground)", margin: 0 }}>Account Details</h3>
              </div>
              
              {(hasChanges || saving) && (
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary"
                  style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    gap: "8px", 
                    padding: isMobile ? "6px 14px" : "8px 16px", 
                    borderRadius: "10px",
                    fontSize: isMobile ? "12px" : "13px",
                    height: isMobile ? "32px" : "36px",
                    animation: "fadeIn 0.2s ease-out"
                  }}
                >
                  {saving ? (
                    <div style={{ width: "16px", height: "16px", border: "2px solid var(--background)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                  ) : (
                    <>
                      <Save size={isMobile ? 12 : 14} />
                      {isMobile ? "Save" : "Save Changes"}
                    </>
                  )}
                </button>
              )}
            </div>

              {!userProfile ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <Skeleton width="100%" height="44px" />
                <Skeleton width="100%" height="44px" />
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "16px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--foreground)", opacity: 0.8, marginLeft: "2px" }}>Full Name</label>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}>
                      <UserIcon size={14} />
                    </span>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Your display name"
                      className="input-field"
                      style={{ paddingLeft: "36px", paddingRight: "36px", color: "var(--foreground)", height: "44px", fontSize: "14px" }}
                    />
                    <span style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", opacity: 0.5 }}>
                      <Pencil size={14} />
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--foreground)", opacity: 0.8, marginLeft: "2px" }}>Username</label>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}>
                      <AtSign size={14} />
                    </span>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="username"
                      className="input-field"
                      style={{ paddingLeft: "36px", paddingRight: "36px", color: "var(--foreground)", height: "44px", fontSize: "14px" }}
                    />
                    <span style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", opacity: 0.5 }}>
                      <Pencil size={14} />
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Contact Card */}
          <div className="glass-card" style={{ 
            padding: "24px", 
            borderRadius: "20px", 
            display: "flex", 
            flexDirection: "column", 
            gap: "16px" 
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(59, 130, 246, 0.1)", color: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Mail size={16} />
              </div>
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--foreground)", margin: 0 }}>Security & Contact</h3>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--foreground)", opacity: 0.8, marginLeft: "2px" }}>Email Address</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", opacity: 0.5 }}>
                  <Mail size={14} />
                </span>
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  style={{ 
                    width: "100%", 
                    padding: "12px 12px 12px 36px", 
                    borderRadius: "10px", 
                    background: "var(--sidebar-bg)", 
                    border: "1px solid var(--sidebar-border)", 
                    color: "var(--text-muted)", 
                    fontSize: "14px", 
                    cursor: "not-allowed",
                    height: "44px"
                  }}
                />
              </div>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "0 4px", display: "flex", alignItems: "center", gap: "5px" }}>
                <ShieldCheck size={12} /> Managed by auth provider.
              </p>
            </div>
          </div>
        </form>

      </main>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
