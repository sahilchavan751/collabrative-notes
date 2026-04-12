import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  deleteDoc
} from 'firebase/firestore';
import { db } from './firebase';
import { Note, User } from '../types';

// Create a new note
export const createNote = async (ownerId: string, title: string = "Untitled Note"): Promise<string> => {
  const noteRef = doc(collection(db, 'notes'));
  const now = Date.now();
  
  const newNote: Note = {
    id: noteRef.id,
    title,
    content: "",
    ownerId,
    collaborators: [],
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(noteRef, newNote);
  return noteRef.id;
};

// Get a single note
export const getNote = async (noteId: string): Promise<Note | null> => {
  const noteRef = doc(db, 'notes', noteId);
  const noteSnap = await getDoc(noteRef);
  
  if (noteSnap.exists()) {
    return noteSnap.data() as Note;
  }
  return null;
};

// Get all notes for a user (either owner or collaborator)
export const getUserNotes = async (userId: string): Promise<Note[]> => {
  const notesRef = collection(db, 'notes');
  const q = query(
    notesRef, 
    where('ownerId', '==', userId)
  );

  const querySnapshot = await getDocs(q);
  const notes: Note[] = [];
  querySnapshot.forEach((docSnap) => {
    notes.push(docSnap.data() as Note);
  });
  
  // Sort by updatedAt descending
  return notes.sort((a, b) => b.updatedAt - a.updatedAt);
};

// Update note snapshot (e.g. periodically while editing)
export const updateNoteSnapshot = async (noteId: string, content: string, title?: string): Promise<void> => {
  const noteRef = doc(db, 'notes', noteId);
  const updates: any = {
    content,
    updatedAt: Date.now()
  };
  if (title !== undefined) {
    updates.title = title;
  }
  await setDoc(noteRef, updates, { merge: true });
};

// Update note metadata (e.g., pinned or starred)
export const updateNoteMetadata = async (noteId: string, updates: Partial<Note>): Promise<void> => {
  const noteRef = doc(db, 'notes', noteId);
  await setDoc(noteRef, updates, { merge: true });
};

// Delete a note (owner only)
export const deleteNote = async (noteId: string, userId: string): Promise<boolean> => {
  const noteRef = doc(db, 'notes', noteId);
  const noteSnap = await getDoc(noteRef);
  
  if (noteSnap.exists() && noteSnap.data().ownerId === userId) {
    await deleteDoc(noteRef);
    return true;
  }
  return false;
};

// User helpers
export const createUserProfile = async (uid: string, data: Partial<User>): Promise<void> => {
  const userRef = doc(db, 'users', uid);
  await setDoc(userRef, {
    ...data,
    uid,
    createdAt: Date.now()
  }, { merge: true });
};

export const getUserProfile = async (uid: string): Promise<User | null> => {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    return userSnap.data() as User;
  }
  return null;
};
