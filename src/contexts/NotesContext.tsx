"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { useAuth } from "../hooks/useAuth";
import { getUserNotes, createNote as createNoteFirestore, deleteNote as deleteNoteFirestore } from "../lib/firestore";
import { Note } from "../types";

interface NotesContextType {
  notes: Note[];
  loading: boolean;
  createNote: (title?: string) => Promise<string>;
  deleteNote: (noteId: string) => Promise<boolean>;
  refreshNotes: () => Promise<void>;
  updateNoteLocally: (noteId: string, updates: Partial<Note>) => void;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export function NotesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasFetched, setHasFetched] = useState(false);

  const fetchNotes = useCallback(async () => {
    if (!user) {
      setNotes([]);
      setLoading(false);
      return;
    }
    
    try {
      const userNotes = await getUserNotes(user.uid);
      setNotes(userNotes);
    } catch (err) {
      console.error("Failed to fetch notes:", err);
    } finally {
      setLoading(false);
      setHasFetched(true);
    }
  }, [user]);

  // Fetch notes once when user is available
  useEffect(() => {
    if (user && !hasFetched) {
      fetchNotes();
    }
    if (!user) {
      setNotes([]);
      setHasFetched(false);
      setLoading(true);
    }
  }, [user, hasFetched, fetchNotes]);

  const createNote = useCallback(async (title?: string): Promise<string> => {
    if (!user) throw new Error("No user logged in");
    const noteId = await createNoteFirestore(user.uid, title);
    
    // Optimistically add the new note to state
    const now = Date.now();
    const newNote: Note = {
      id: noteId,
      title: title || "Untitled Note",
      content: "",
      ownerId: user.uid,
      collaborators: [],
      createdAt: now,
      updatedAt: now,
    };
    setNotes(prev => [newNote, ...prev]);
    
    return noteId;
  }, [user]);

  const deleteNote = useCallback(async (noteId: string): Promise<boolean> => {
    if (!user) return false;
    const success = await deleteNoteFirestore(noteId, user.uid);
    if (success) {
      // Optimistically remove from state
      setNotes(prev => prev.filter(n => n.id !== noteId));
    }
    return success;
  }, [user]);

  const refreshNotes = useCallback(async () => {
    setLoading(true);
    await fetchNotes();
  }, [fetchNotes]);

  // Update a note in local state without re-fetching (e.g., after editing title)
  const updateNoteLocally = useCallback((noteId: string, updates: Partial<Note>) => {
    setNotes(prev => prev.map(n => 
      n.id === noteId ? { ...n, ...updates, updatedAt: Date.now() } : n
    ));
  }, []);

  return (
    <NotesContext.Provider value={{ notes, loading, createNote, deleteNote, refreshNotes, updateNoteLocally }}>
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes() {
  const context = useContext(NotesContext);
  if (context === undefined) {
    throw new Error("useNotes must be used within a NotesProvider");
  }
  return context;
}
