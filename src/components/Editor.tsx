"use client";

import React, { useEffect, useRef, useCallback, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import Superscript from "@tiptap/extension-superscript";
import Subscript from "@tiptap/extension-subscript";
import * as Y from "yjs";
import { FireProvider } from "y-fire";
import { app } from "../lib/firebase";
import { updateNoteSnapshot } from "../lib/firestore";
import EditorToolbar from "./EditorToolbar";
import Skeleton from "./Skeleton";
import { useAuth } from "../hooks/useAuth";

interface EditorProps {
  noteId: string;
  initialTitle: string;
  onTitleChange: (title: string) => void;
  onAwarenessUpdate?: (awareness: any) => void;
  onSyncChange?: (isSynced: boolean) => void;
  onSaveStatusChange?: (saving: boolean) => void;
  onEditorReady?: (editor: any) => void;
}

const COLORS = ["#ffffff", "#e5e5e5", "#a3a3a3", "#737373", "#525252", "#404040"];

import { useMediaQuery } from "../hooks/useMediaQuery";

export default function Editor({ noteId, initialTitle, onTitleChange, onAwarenessUpdate, onSyncChange, onSaveStatusChange, onEditorReady }: EditorProps) {
  const { user, userProfile } = useAuth();
  const isMobile = useMediaQuery("(max-width: 1024px)");
  
  // Use state for ydoc and provider to ensure reactivity for the useEditor hook
  const [ydoc, setYdoc] = useState<Y.Doc | null>(null);
  const [provider, setProvider] = useState<FireProvider | null>(null);
  
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const [isSynced, setIsSynced] = useState(false);
  const [saving, setSaving] = useState(false);
  const currentContentRef = useRef<string>("");

  useEffect(() => {
    const _ydoc = new Y.Doc();
    const _provider = new FireProvider({
      firebaseApp: app,
      ydoc: _ydoc,
      path: `notes/${noteId}/yjs/doc`,
    });

    setYdoc(_ydoc);
    setProvider(_provider);

    const onReady = () => {
      setIsSynced(true);
      if (onSyncChange) onSyncChange(true);
      if (onAwarenessUpdate) onAwarenessUpdate(_provider.awareness);
      
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      _provider.awareness.setLocalStateField("user", {
        uid: user?.uid,
        name: userProfile?.username || user?.displayName || "Anonymous",
        color: color,
      });
    };

    if (_provider.onReady) {
      _provider.onReady = onReady;
    } else {
      setTimeout(onReady, 1000);
    }

    return () => {
      if (currentContentRef.current) {
        // Synchronous final flush on unmount
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        updateNoteSnapshot(noteId, currentContentRef.current).catch(console.error);
      }
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      _provider.destroy();
      _ydoc.destroy();
      setYdoc(null);
      setProvider(null);
    };
  }, [noteId, user, userProfile, onAwarenessUpdate]);

  const debouncedSave = useCallback(
    (html: string) => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(async () => {
        setSaving(true);
        if (onSaveStatusChange) onSaveStatusChange(true);
        try {
          await updateNoteSnapshot(noteId, html);
        } catch (err) {
          console.error("Failed to save snapshot:", err);
        } finally {
          setSaving(false);
          if (onSaveStatusChange) onSaveStatusChange(false);
        }
      }, 3000);
    },
    [noteId]
  );

  const handleTyping = useCallback(() => {
    if (!provider) return;
    
    // Get the current local user state
    const currentState = provider.awareness.getLocalState();
    if (!currentState || !currentState.user) return;

    // Set typing to true within the user object
    provider.awareness.setLocalStateField("user", {
      ...currentState.user,
      typing: true
    });
    
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      if (provider) {
        const latestState = provider.awareness.getLocalState();
        if (latestState && latestState.user) {
          provider.awareness.setLocalStateField("user", {
            ...latestState.user,
            typing: false
          });
        }
      }
    }, 2000);
  }, [provider]);

  const editor = useEditor(
    {
      immediatelyRender: false,
      extensions: [
        (StarterKit as any).configure({
          history: false,
        }),
        Underline,
        Highlight,
        TextAlign.configure({
          types: ["heading", "paragraph"],
        }),
        Link.configure({
          openOnClick: false,
          HTMLAttributes: {
            class: "editor-link",
          },
        }),
        TaskList,
        TaskItem.configure({
          nested: true,
        }),
        TextStyle,
        Color,
        Superscript,
        Subscript,
        ...(ydoc
          ? [
               Collaboration.configure({
                 document: ydoc,
               }),
             ]
          : []),
      ],
      onUpdate: ({ editor }) => {
        const html = editor.getHTML();
        currentContentRef.current = html;

        // Dispatch a local event so the context can know immediately
        window.dispatchEvent(new CustomEvent('note-content-updated', { detail: { id: noteId, content: html } }));
        
        debouncedSave(html);
        handleTyping();
      },
    },
    [ydoc, handleTyping]
  );

  useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor);
    }
  }, [editor, onEditorReady]);

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: "100%" }}>
      {/* Toolbar */}
      <div style={{ marginBottom: isMobile ? "0px" : "16px" }}>
        <EditorToolbar editor={editor} />
      </div>

      {/* Editor content */}
      <div
        style={{
           flex: 1,
           borderRadius: "16px",
           background: "var(--card)",
           border: "1px solid var(--card-border)",
           padding: "24px",
           marginBottom: isMobile ? "80px" : "0",
           minHeight: "400px",
           transition: "all 0.3s ease",
           fontSize: "15px",
           color: "var(--foreground)",
           cursor: "text",
        }}
        onClick={() => {
          if (editor) {
            editor.commands.focus();
          }
        }}
      >
        {editor ? (
          <EditorContent editor={editor} />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <Skeleton width="60%" height="24px" style={{ marginBottom: "16px" }} />
            <Skeleton width="95%" height="16px" />
            <Skeleton width="90%" height="16px" />
            <Skeleton width="92%" height="16px" />
            <Skeleton width="40%" height="16px" />
          </div>
        )}
      </div>
    </div>
  );
}
