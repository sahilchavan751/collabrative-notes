"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  User as FirebaseUser,
  updateProfile,
} from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";
import { createUserProfile, getUserProfile } from "../lib/firestore";
import { User } from "../types";

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, username: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfileData: (data: { displayName?: string; username?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const profile = await getUserProfile(firebaseUser.uid);
          setUserProfile(profile);
        } catch (err) {
          console.error("Failed to fetch user profile:", err);
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signup = async (email: string, password: string, username: string) => {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(credential.user, { displayName: username });
    await createUserProfile(credential.user.uid, {
      email: credential.user.email || email,
      username,
      displayName: username,
      photoURL: null,
    });
  };

  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    // Check if profile exists, if not create one
    const existing = await getUserProfile(result.user.uid);
    if (!existing) {
      await createUserProfile(result.user.uid, {
        email: result.user.email || "",
        username: result.user.displayName || result.user.email?.split("@")[0] || "user",
        displayName: result.user.displayName || "",
        photoURL: result.user.photoURL || null,
      });
    }
    const profile = await getUserProfile(result.user.uid);
    setUserProfile(profile);
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setUserProfile(null);
  };

  const updateUserProfileData = async (data: { displayName?: string; username?: string }) => {
    if (!user) throw new Error("No user logged in");

    // 1. Update Firebase Auth displayName
    if (data.displayName) {
      await updateProfile(user, { displayName: data.displayName });
    }

    // 2. Update Firestore profile
    await createUserProfile(user.uid, data);

    // 3. Refresh local userProfile state
    const updatedProfile = await getUserProfile(user.uid);
    setUserProfile(updatedProfile);
  };

  return (
    <AuthContext.Provider
      value={{ user, userProfile, loading, login, signup, loginWithGoogle, logout, updateUserProfileData }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
