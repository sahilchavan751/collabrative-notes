"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../../hooks/useAuth";
import UserAvatar from "../../../components/UserAvatar";
import Skeleton from "../../../components/Skeleton";
import toast, { Toaster } from "react-hot-toast";

export default function ProfilePage() {
  const { user, userProfile, updateUserProfileData } = useAuth();
  
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

  return (
    <div style={{ flex: 1, height: "100vh", overflowY: "auto", background: "var(--background)" }}>
      <Toaster position="top-right" />
      
      {/* Header */}
      <header style={{ height: "72px", borderBottom: "1px solid var(--sidebar-border)", display: "flex", alignItems: "center", padding: "0 40px", background: "var(--background)", backdropFilter: "blur(20px)", position: "sticky", top: 0, zIndex: 10 }}>
        <h1 style={{ fontSize: "20px", fontWeight: 700, color: "var(--foreground)" }}>Profile Settings</h1>
      </header>

      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "60px 40px" }}>
        
        <div style={{ display: "flex", gap: "60px", alignItems: "flex-start" }}>
          
          {/* Avatar Section */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
            <div style={{ padding: "8px", borderRadius: "50%", background: "rgba(255, 255, 255, 0.05)", border: "2px solid rgba(255, 255, 255, 0.1)" }}>
              <UserAvatar 
                name={userProfile?.displayName || userProfile?.username || "User"} 
                photoURL={user?.photoURL} 
                size="lg" 
              />
            </div>
            <button style={{ fontSize: "13px", color: "var(--foreground)", opacity: 0.6, fontWeight: 600, background: "transparent", border: "none", cursor: "pointer" }}>
              Change Avatar
            </button>
          </div>

          {/* Form Section */}
          {!userProfile ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "32px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}><Skeleton width="100px" height="14px" /><Skeleton width="100%" height="48px" borderRadius="12px" /></div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}><Skeleton width="100px" height="14px" /><Skeleton width="100%" height="48px" borderRadius="12px" /></div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}><Skeleton width="100px" height="14px" /><Skeleton width="100%" height="48px" borderRadius="12px" /></div>
              <Skeleton width="200px" height="48px" borderRadius="14px" />
            </div>
          ) : (
            <form onSubmit={handleSave} style={{ flex: 1, display: "flex", flexDirection: "column", gap: "32px" }}>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <label style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-muted)" }}>Full Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your display name"
                  className="input-field"
                  style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)", borderRadius: "12px", padding: "12px 16px", color: "var(--foreground)", fontSize: "15px", outline: "none" }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <label style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-muted)" }}>Username</label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: "15px" }}>@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="username"
                    className="input-field"
                    style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)", borderRadius: "12px", padding: "12px 16px 12px 34px", color: "var(--foreground)", fontSize: "15px", outline: "none", width: "100%" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <label style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-muted)" }}>Email Address</label>
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  style={{ background: "var(--background)", border: "1px solid var(--input-border)", borderRadius: "12px", padding: "12px 16px", color: "var(--text-muted)", fontSize: "15px", cursor: "not-allowed", opacity: 0.6 }}
                />
                <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: 0 }}>Email cannot be changed directly.</p>
              </div>

              <div style={{ paddingTop: "20px" }}>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary"
                  style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    gap: "10px", 
                    width: "200px", 
                    padding: "14px", 
                    borderRadius: "14px",
                    opacity: saving ? 0.7 : 1
                  }}
                >
                  {saving ? (
                    <div style={{ width: "20px", height: "20px", border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>

            </form>
          )}

        </div>

      </div>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
