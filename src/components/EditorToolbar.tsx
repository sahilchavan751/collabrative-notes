"use client";

import React, { useState } from "react";
import { Editor as TiptapEditor } from "@tiptap/react";
import { useMediaQuery } from "../hooks/useMediaQuery";

interface EditorToolbarProps {
  editor: TiptapEditor | null;
}

interface ToolbarButton {
  label: string;
  icon: React.ReactNode;
  action: () => void;
  isActive: boolean;
}

interface ToolCategory {
  title: string;
  items: ToolbarButton[];
}

export default function EditorToolbar({ editor }: EditorToolbarProps) {
  const isMobile = useMediaQuery("(max-width: 1024px)");
  const [isExpanded, setIsExpanded] = useState(false);

  if (!editor) return null;

  const categories: ToolCategory[] = [
    {
      title: "Typography",
      items: [
        { label: "Bold", icon: <span style={{ fontWeight: 700 }}>B</span>, action: () => editor.chain().focus().toggleBold().run(), isActive: editor.isActive("bold") },
        { label: "Italic", icon: <span style={{ fontStyle: "italic", fontFamily: "serif" }}>I</span>, action: () => editor.chain().focus().toggleItalic().run(), isActive: editor.isActive("italic") },
        { label: "Underline", icon: <span style={{ textDecoration: "underline" }}>U</span>, action: () => editor.chain().focus().toggleUnderline().run(), isActive: editor.isActive("underline") },
        { label: "Strike", icon: <span style={{ textDecoration: "line-through" }}>S</span>, action: () => editor.chain().focus().toggleStrike().run(), isActive: editor.isActive("strike") },
      ]
    },
    {
      title: "Headings",
      items: [
        { label: "H1", icon: <span style={{ fontSize: "13px", fontWeight: 700 }}>H1</span>, action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), isActive: editor.isActive("heading", { level: 1 }) },
        { label: "H2", icon: <span style={{ fontSize: "12px", fontWeight: 700 }}>H2</span>, action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), isActive: editor.isActive("heading", { level: 2 }) },
        { label: "H3", icon: <span style={{ fontSize: "11px", fontWeight: 700 }}>H3</span>, action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), isActive: editor.isActive("heading", { level: 3 }) },
      ]
    },
    {
      title: "Alignment",
      items: [
        { label: "Left", icon: <span style={{ fontSize: "12px", display: "inline-block", textAlign: "left", width: "16px" }}>≡</span>, action: () => editor.chain().focus().setTextAlign('left').run(), isActive: editor.isActive({ textAlign: "left" }) },
        { label: "Center", icon: <span style={{ fontSize: "12px", display: "inline-block", textAlign: "center", width: "16px" }}>≡</span>, action: () => editor.chain().focus().setTextAlign('center').run(), isActive: editor.isActive({ textAlign: "center" }) },
        { label: "Right", icon: <span style={{ fontSize: "12px", display: "inline-block", textAlign: "right", width: "16px" }}>≡</span>, action: () => editor.chain().focus().setTextAlign('right').run(), isActive: editor.isActive({ textAlign: "right" }) },
      ]
    },
    {
      title: "Lists",
      items: [
        { label: "Bullet", icon: <span style={{ fontSize: "14px" }}>• ≡</span>, action: () => editor.chain().focus().toggleBulletList().run(), isActive: editor.isActive("bulletList") },
        { label: "Ordered", icon: <span style={{ fontSize: "13px" }}>1. ≡</span>, action: () => editor.chain().focus().toggleOrderedList().run(), isActive: editor.isActive("orderedList") },
        { label: "Checklist", icon: <span style={{ fontSize: "14px" }}>☑</span>, action: () => editor.chain().focus().toggleTaskList().run(), isActive: editor.isActive("taskList") },
      ]
    },
    {
      title: "Advanced",
      items: [
        { label: "Quote", icon: <span style={{ fontSize: "16px", fontWeight: 700 }}>"</span>, action: () => editor.chain().focus().toggleBlockquote().run(), isActive: editor.isActive("blockquote") },
        { label: "Code", icon: <span style={{ fontFamily: "monospace", fontSize: "13px" }}>&lt;/&gt;</span>, action: () => editor.chain().focus().toggleCode().run(), isActive: editor.isActive("code") },
        { label: "Code Block", icon: <span style={{ fontFamily: "monospace", fontSize: "12px" }}>{"{}"}</span>, action: () => editor.chain().focus().toggleCodeBlock().run(), isActive: editor.isActive("codeBlock") },
        { label: "Link", icon: <span style={{ fontSize: "14px" }}>🔗</span>, action: () => {
            const url = window.prompt('URL', editor.getAttributes('link').href);
            if (url === null) return;
            if (url === '') { editor.chain().focus().extendMarkRange('link').unsetLink().run(); return; }
            editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
          }, isActive: editor.isActive("link") 
        },
        { label: "Highlight", icon: <span style={{ background: "rgba(250,204,21,0.4)", padding: "0 2px" }}>A</span>, action: () => editor.chain().focus().toggleHighlight().run(), isActive: editor.isActive("highlight") },
      ]
    },
    {
      title: "Color",
      items: [
        { label: "Red", icon: <div style={{ width: '12px', height: '12px', background: '#ef4444', borderRadius: '2px' }} />, action: () => editor.chain().focus().setColor('#ef4444').run(), isActive: editor.isActive('textStyle', { color: '#ef4444' }) },
        { label: "Blue", icon: <div style={{ width: '12px', height: '12px', background: '#3b82f6', borderRadius: '2px' }} />, action: () => editor.chain().focus().setColor('#3b82f6').run(), isActive: editor.isActive('textStyle', { color: '#3b82f6' }) },
        { label: "Clear color", icon: <span style={{ fontSize: '10px' }}>⨉</span>, action: () => editor.chain().focus().unsetColor().run(), isActive: false },
      ]
    },
    {
      title: "Math",
      items: [
        { label: "Superscript", icon: <span style={{ fontSize: "12px" }}>x²</span>, action: () => editor.chain().focus().toggleSuperscript().run(), isActive: editor.isActive("superscript") },
        { label: "Subscript", icon: <span style={{ fontSize: "12px" }}>x₂</span>, action: () => editor.chain().focus().toggleSubscript().run(), isActive: editor.isActive("subscript") },
      ]
    },
    {
      title: "History",
      items: [
        { label: "Undo", icon: <span style={{ fontSize: "14px" }}>↩</span>, action: () => editor.chain().focus().undo().run(), isActive: false },
        { label: "Redo", icon: <span style={{ fontSize: "14px" }}>↪</span>, action: () => editor.chain().focus().redo().run(), isActive: false },
      ]
    }
  ];

  const renderButton = (btn: ToolbarButton, isDesktop: boolean = false) => (
    <button
      key={btn.label}
      onClick={(e) => {
        // Prevent immediate input blur mapping issues on mobile
        e.preventDefault();
        btn.action();
      }}
      title={btn.label}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: isMobile ? "36px" : "32px",
        minWidth: isMobile ? "36px" : "32px",
        padding: "0 8px",
        borderRadius: "8px",
        border: "none",
        cursor: "pointer",
        fontSize: "14px",
        transition: "all 0.15s",
        background: btn.isActive ? "rgba(139,92,246,0.2)" : "transparent",
        color: btn.isActive ? "#c4b5fd" : "var(--text-muted)",
      }}
      onMouseEnter={(e) => {
        if (!btn.isActive && !isMobile) {
          e.currentTarget.style.background = "var(--card-border)";
          e.currentTarget.style.color = "var(--foreground)";
        }
      }}
      onMouseLeave={(e) => {
        if (!btn.isActive && !isMobile) {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "var(--text-muted)";
        }
      }}
    >
      {btn.icon}
    </button>
  );

  // --- DESKTOP RENDER --- //
  if (!isMobile) {
    return (
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: "4px",
        padding: "8px 12px",
        borderRadius: "12px",
        background: "var(--input-bg)",
        border: "1px solid var(--card-border)",
      }}>
        {categories.map((cat, i) => (
          <React.Fragment key={cat.title}>
            {cat.items.map(btn => renderButton(btn, true))}
            {i !== categories.length - 1 && (
              <div style={{ width: "1px", height: "24px", background: "var(--card-border)", margin: "0 6px" }} />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  }

  // --- MOBILE CORE SET --- //
  const coreLabels = ["Bold", "Italic", "Underline", "Bullet", "Link", "Undo"];
  const allFlattened = categories.flatMap(c => c.items);
  const coreButtons = coreLabels.map(l => allFlattened.find(b => b.label === l)!).filter(Boolean);

  // --- MOBILE RENDER --- //
  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: "var(--card)",
        backdropFilter: "none",
        borderTop: "1px solid var(--card-border)",
        zIndex: 100,
        transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 -4px 20px rgba(0,0,0,0.1)",
      }}
    >
      {/* Top Bar: Always visible. Has Core Tools + Expand Toggle */}
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "space-between",
        padding: "8px 12px",
        height: "56px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", flex: 1, overflowX: "auto", scrollbarWidth: "none" }}>
          {coreButtons.map(btn => renderButton(btn))}
        </div>
        
        <div style={{ width: "1px", height: "30px", background: "var(--card-border)", margin: "0 8px" }} />

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "36px",
            height: "36px",
            borderRadius: "8px",
            background: isExpanded ? "var(--accent-purple)" : "var(--card)",
            border: "1px solid var(--card-border)",
            color: isExpanded ? "#fff" : "var(--foreground)",
            transition: "all 0.2s"
          }}
        >
          {isExpanded ? (
            <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 20, height: 20 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 20, height: 20, transform: "rotate(180deg)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </button>
      </div>

      {/* Expanded Sections Drawer */}
      <div style={{ 
        height: isExpanded ? "260px" : "0px",
        overflowY: "auto",
        borderTop: isExpanded ? "1px solid var(--card-border)" : "none",
        transition: "height 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
      }}>
        <div style={{ padding: "16px" }}>
          {categories.map(cat => (
            <div key={cat.title} style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", marginBottom: "8px", fontWeight: 600 }}>
                {cat.title}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {cat.items.map(btn => renderButton(btn))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

