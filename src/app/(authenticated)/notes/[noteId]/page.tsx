"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../../hooks/useAuth";
import { getNote, updateNoteSnapshot } from "../../../../lib/firestore";
import { Note } from "../../../../types";
import Editor from "../../../../components/Editor";
import Skeleton from "../../../../components/Skeleton";
import CollaborationSidebar from "../../../../components/CollaborationSidebar";
import AudioModal from "../../../../components/AudioModal";
import { AudioProvider, useAudio } from "../../../../contexts/AudioContext";
import { useMediaQuery } from "../../../../hooks/useMediaQuery";

function NoteContent() {
  const params = useParams();
  const noteId = params.noteId as string;
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { inCall, joinCall, participants } = useAudio();
  
  const [note, setNote] = useState<Note | null>(null);
  const [loadingNote, setLoadingNote] = useState(true);
  const [title, setTitle] = useState("");
  const [titleSaveTimeout, setTitleSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const [audioModalOpen, setAudioModalOpen] = useState(false);
  const [awareness, setAwareness] = useState<any>(null);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [isSynced, setIsSynced] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editorInstance, setEditorInstance] = useState<any>(null);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const exportMenuRef = React.useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery("(max-width: 1024px)");

  useEffect(() => {
    const fetchNote = async () => {
      if (noteId) {
        try {
          const noteData = await getNote(noteId);
          if (noteData) {
            setNote(noteData);
            setTitle(noteData.title);
          } else {
            router.push("/dashboard");
          }
        } catch (err) {
          console.error("Failed to fetch note:", err);
          router.push("/dashboard");
        } finally {
          setLoadingNote(false);
        }
      }
    };
    if (user) fetchNote();
  }, [noteId, user, router]);

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (titleSaveTimeout) clearTimeout(titleSaveTimeout);
    const timeout = setTimeout(async () => {
      try {
        await updateNoteSnapshot(noteId, note?.content || "", newTitle);
      } catch (err) {
        console.error("Failed to save title:", err);
      }
    }, 1000);
    setTitleSaveTimeout(timeout);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setExportMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const downloadFile = (filename: string, content: string, contentType: string) => {
    const element = document.createElement('a');
    const file = new Blob([content], { type: contentType });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleExport = (format: 'txt' | 'html' | 'md' | 'pdf') => {
    setExportMenuOpen(false);
    if (!editorInstance) return;

    const safeTitle = (title || "Untitled_Note").replace(/[^a-z0-9]/gi, '_').toLowerCase();
    
    if (format === 'pdf') {
      const htmlContent = editorInstance.getHTML();
      const printHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${title || "Untitled Note"}</title>
<style>
  @page { margin: 0; }
  @media print {
    body { padding: 20mm !important; margin: 0 !important; }
  }
  body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; color: #000; }
  pre { background: #f4f4f4; padding: 15px; border-radius: 5px; overflow-x: auto; border: 1px solid #ddd; }
  code { font-family: monospace; background: #f4f4f4; padding: 2px 4px; border-radius: 3px; border: 1px solid #eee; }
  blockquote { border-left: 4px solid #ccc; margin: 0; padding-left: 16px; color: #555; }
  h1, h2, h3 { color: #000; }
  ul[data-type="taskList"] { list-style: none; padding: 0; }
  ul[data-type="taskList"] li { display: flex; align-items: flex-start; margin-bottom: 8px; }
  ul[data-type="taskList"] input { margin-right: 8px; margin-top: 4px; }
  ul[data-type="taskList"] li[data-checked="true"] div { text-decoration: line-through; opacity: 0.6; }
</style>
</head>
<body>
${htmlContent}
</body>
</html>`;

      const printIframe = document.createElement('iframe');
      printIframe.style.position = 'absolute';
      printIframe.style.width = '0px';
      printIframe.style.height = '0px';
      printIframe.style.border = 'none';
      document.body.appendChild(printIframe);
      
      const printDocument = printIframe.contentWindow?.document;
      if (printDocument) {
        printDocument.open();
        printDocument.write(printHtml);
        printDocument.close();
        
        setTimeout(() => {
          printIframe.contentWindow?.focus();
          printIframe.contentWindow?.print();
          setTimeout(() => {
            document.body.removeChild(printIframe);
          }, 1000);
        }, 500);
      } else {
        window.print();
        document.body.removeChild(printIframe);
      }
      return;
    }

    if (format === 'txt') {
      const textContent = editorInstance.getText();
      downloadFile(`${safeTitle}.txt`, textContent, 'text/plain');
    } else if (format === 'html') {
      const htmlContent = editorInstance.getHTML();
      const fullHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${title || "Untitled Note"}</title>
<style>
  body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #333; }
  pre { background: #f4f4f4; padding: 15px; border-radius: 5px; overflow-x: auto; }
  code { font-family: monospace; background: #f4f4f4; padding: 2px 4px; border-radius: 3px; }
  blockquote { border-left: 4px solid #ccc; margin: 0; padding-left: 16px; color: #666; }
  h1, h2, h3 { color: #111; }
  ul[data-type="taskList"] { list-style: none; padding: 0; }
  ul[data-type="taskList"] li { display: flex; align-items: flex-start; margin-bottom: 8px; }
  ul[data-type="taskList"] input { margin-right: 8px; margin-top: 4px; }
  ul[data-type="taskList"] li[data-checked="true"] div { text-decoration: line-through; opacity: 0.6; }
</style>
</head>
<body>
${htmlContent}
</body>
</html>`;
      downloadFile(`${safeTitle}.html`, fullHtml, 'text/html');
    } else if (format === 'md') {
      // Basic HTML to Markdown converter
      let html = editorInstance.getHTML();
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      
      let md = '';
      
      const processNode = (node: Node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          md += node.textContent;
          return;
        }
        
        if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node as HTMLElement;
          const tag = el.tagName.toLowerCase();
          
          if (tag === 'h1') md += '# ';
          if (tag === 'h2') md += '## ';
          if (tag === 'h3') md += '### ';
          if (tag === 'strong' || tag === 'b') md += '**';
          if (tag === 'em' || tag === 'i') md += '*';
          if (tag === 'code' && el.parentNode?.nodeName !== 'PRE') md += '`';
          if (tag === 'pre') md += '\n```\n';
          if (tag === 'blockquote') md += '\n> ';
          if (tag === 'p' && md.length > 0 && !md.endsWith('\n\n')) md += '\n\n';
          if (tag === 'li') {
            const parentList = el.closest('ul, ol');
            if (parentList) {
               if (parentList.getAttribute('data-type') === 'taskList') {
                  const isChecked = el.getAttribute('data-checked') === 'true';
                  md += `\n- [${isChecked ? 'x' : ' '}] `;
               } else if (parentList.tagName.toLowerCase() === 'ol') {
                  md += '\n1. ';
               } else {
                  md += '\n- ';
               }
            }
          }
          if (tag === 'a') md += '[';
          
          Array.from(el.childNodes).forEach(processNode);
          
          if (tag === 'h1' || tag === 'h2' || tag === 'h3') md += '\n\n';
          if (tag === 'strong' || tag === 'b') md += '**';
          if (tag === 'em' || tag === 'i') md += '*';
          if (tag === 'code' && el.parentNode?.nodeName !== 'PRE') md += '`';
          if (tag === 'pre') md += '\n```\n\n';
          if (tag === 'blockquote') md += '\n\n';
          if (tag === 'a') md += `](${el.getAttribute('href')})`;
        }
      };
      
      processNode(tempDiv);
      md = md.replace(/\n{3,}/g, '\n\n').trim(); // clean up excessive newlines
      downloadFile(`${safeTitle}.md`, md, 'text/markdown');
    }
  };

  if (loadingNote) {
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", position: "relative", zIndex: 10, background: "var(--background)" }}>
        {/* Header Skeleton */}
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: isMobile ? "auto" : "72px",
            minHeight: "72px",
            padding: isMobile ? "12px 20px" : "0 28px",
            borderBottom: "1px solid var(--card-border)",
            background: "var(--background)",
            backdropFilter: "blur(20px)",
            flexWrap: isMobile ? "wrap" : "nowrap",
            gap: isMobile ? "12px" : "0",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "8px" : "16px", flex: isMobile ? "1 1 100%" : "auto" }}>
             <Skeleton width="80px" height="36px" borderRadius="10px" />
             {!isMobile && <div style={{ width: "1px", height: "24px", background: "var(--card-border)", margin: "0 4px" }} />}
             <Skeleton width="180px" height="24px" />
             {isMobile && <Skeleton width="10px" height="10px" borderRadius="50%" style={{ marginLeft: "auto" }} />}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
             {!isMobile && <Skeleton width="80px" height="16px" style={{ marginRight: "8px" }} />}
             <Skeleton width={isMobile ? "90px" : "110px"} height="36px" borderRadius="14px" />
             <Skeleton width="60px" height="36px" borderRadius="10px" />
             {isMobile && <Skeleton width="36px" height="36px" borderRadius="10px" />}
          </div>
        </header>

        {/* Content Skeleton */}
        <div style={{ 
          display: "flex", 
          flex: 1, 
          padding: isMobile ? "12px" : "24px 28px", 
          gap: isMobile ? "0" : "24px", 
          overflow: "hidden",
          flexDirection: isMobile ? "column" : "row",
          position: "relative"
        }}>
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", overflowY: "auto" }}>
             <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: "100%" }}>
                {/* Toolbar area skeleton */}
                <div style={{ marginBottom: isMobile ? "0px" : "16px" }}>
                  {!isMobile && (
                    <div 
                      style={{ 
                        display: "flex", 
                        flexWrap: "wrap",
                        alignItems: "center", 
                        gap: "4px", 
                        padding: "8px 12px", 
                        background: "var(--input-bg)", 
                        borderRadius: "12px", 
                        border: "1px solid var(--card-border)" 
                      }}
                    >
                      <Skeleton width="32px" height="32px" borderRadius="8px" />
                      <Skeleton width="32px" height="32px" borderRadius="8px" />
                      <Skeleton width="32px" height="32px" borderRadius="8px" />
                      <Skeleton width="32px" height="32px" borderRadius="8px" />
                      <div style={{ width: "1px", height: "24px", background: "var(--card-border)", margin: "0 6px" }} />
                      <Skeleton width="32px" height="32px" borderRadius="8px" />
                      <Skeleton width="32px" height="32px" borderRadius="8px" />
                      <Skeleton width="32px" height="32px" borderRadius="8px" />
                      <div style={{ width: "1px", height: "24px", background: "var(--card-border)", margin: "0 6px" }} />
                      <Skeleton width="32px" height="32px" borderRadius="8px" />
                      <Skeleton width="32px" height="32px" borderRadius="8px" />
                      <Skeleton width="32px" height="32px" borderRadius="8px" />
                    </div>
                  )}
                </div>
                
                {/* Content area */}
                <div 
                  style={{ 
                    flex: 1,
                    background: "var(--card)", 
                    border: "1px solid var(--card-border)", 
                    borderRadius: "16px", 
                    padding: "24px",
                    marginBottom: isMobile ? "80px" : "0",
                    minHeight: "400px"
                  }}
                >
                  <Skeleton width="40%" height="32px" style={{ marginBottom: "32px" }} />
                  
                  <Skeleton width="95%" height="18px" style={{ marginBottom: "12px" }} />
                  <Skeleton width="90%" height="18px" style={{ marginBottom: "12px" }} />
                  <Skeleton width="92%" height="18px" style={{ marginBottom: "12px" }} />
                  <Skeleton width="40%" height="18px" style={{ marginBottom: "32px" }} />

                  <Skeleton width="85%" height="18px" style={{ marginBottom: "12px" }} />
                  <Skeleton width="80%" height="18px" style={{ marginBottom: "12px" }} />
                  <Skeleton width="88%" height="18px" style={{ marginBottom: "12px" }} />
                </div>
             </div>
          </div>

          {!isMobile && (
            <aside style={{ width: "280px", flexShrink: 0 }}>
               <div style={{ 
                 height: "100%", 
                 borderRadius: "16px", 
                 background: "var(--card)", 
                 border: "1px solid var(--card-border)",
                 padding: "20px",
                 display: "flex",
                 flexDirection: "column"
               }}>
                 <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
                    <Skeleton width="80px" height="18px" />
                    <Skeleton width="24px" height="24px" borderRadius="12px" />
                 </div>
                 <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                   {[1, 2, 3].map(i => (
                     <div key={i} style={{ display: "flex", gap: "12px", alignItems: "center", padding: "8px", background: "var(--input-bg)", borderRadius: "12px", border: "1px solid var(--card-border)" }}>
                        <Skeleton width="32px" height="32px" borderRadius="16px" />
                        <Skeleton width="80px" height="14px" />
                     </div>
                   ))}
                 </div>
               </div>
            </aside>
          )}
        </div>
      </div>
    );
  }

  if (!user || !note) return null;

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", position: "relative", zIndex: 10, background: "var(--background)" }}>
      {/* Background glow cues */}
      <div style={{ position: "fixed", top: 0, left: 0, width: "400px", height: "400px", background: "radial-gradient(circle, rgba(139,92,246,0.04) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

      {/* Header */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: isMobile ? "auto" : "72px",
          minHeight: "72px",
          padding: isMobile ? "12px 20px" : "0 28px",
          borderBottom: "1px solid var(--card-border)",
          background: "var(--background)",
          backdropFilter: "blur(20px)",
          flexWrap: isMobile ? "wrap" : "nowrap",
          gap: isMobile ? "12px" : "0",
          position: "relative",
          zIndex: 200,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "8px" : "16px", flex: isMobile ? "1 1 100%" : "auto" }}>
          {/* Back button */}
          <Link
            href={isMobile ? "/notes" : "/dashboard"}
            prefetch={true}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 12px",
              borderRadius: "10px",
              background: "var(--input-bg)",
              border: "1px solid var(--card-border)",
              color: "var(--text-muted)",
              fontSize: "13px",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.2s",
              textDecoration: "none"
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 14, height: 14 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {!isMobile && (isMobile ? "Notes" : "Dashboard")}
          </Link>

          {!isMobile && <div style={{ width: "1px", height: "24px", background: "var(--card-border)", margin: "0 4px" }} />}

          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Untitled Note"
            style={{
              background: "transparent",
              border: "none",
              outline: "none",
              fontSize: isMobile ? "18px" : "20px",
              fontWeight: 700,
              color: "var(--foreground)",
              width: "100%",
              maxWidth: isMobile ? "130px" : "300px",
            }}
          />

          {/* Connection Indicator (Mobile Top Right) */}
          {isMobile && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "auto" }}>
              {saving ? (
                <span style={{ fontSize: "11px", color: "var(--accent-purple)", animation: "pulse 1.5s infinite" }}>
                  Saving...
                </span>
              ) : (
                <div
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    background: isSynced ? "#22c55e" : "#eab308",
                    boxShadow: isSynced ? "0 0 8px rgba(34,197,94,0.5)" : "none",
                    animation: isSynced ? "none" : "pulse 1.5s infinite",
                  }}
                />
              )}
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Connection & Save Status (Desktop) */}
          {!isMobile && (
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginRight: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: isSynced ? "#22c55e" : "#eab308",
                    boxShadow: isSynced ? "0 0 8px rgba(34,197,94,0.5)" : "none",
                    animation: isSynced ? "none" : "pulse 1.5s infinite",
                  }}
                />
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  {isSynced ? "Connected" : "Syncing..."}
                </span>
              </div>
              {saving && (
                <span style={{ fontSize: "12px", color: "var(--accent-purple)", animation: "pulse 1.5s infinite" }}>
                  Saving...
                </span>
              )}
            </div>
          )}

          {/* Audio Call Button */}
          {!inCall ? (
            <button
              onClick={joinCall}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 16px",
                borderRadius: "14px",
                background: "transparent",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                color: "var(--foreground)",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                letterSpacing: "0.02em",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)";
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 14, height: 14, opacity: 0.8 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span style={{ display: isMobile ? "none" : "inline" }}>Join Voice</span>
            </button>
          ) : (
            <button
              onClick={() => setAudioModalOpen(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 16px",
                borderRadius: "14px",
                background: "var(--foreground)",
                border: "none",
                color: "var(--background)",
                fontSize: "12px",
                fontWeight: 800,
                cursor: "pointer",
                transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                boxShadow: "0 0 20px rgba(255, 255, 255, 0.1)",
              }}
            >
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: "#22c55e",
                  boxShadow: "0 0 8px #22c55e",
                }}
              />
              <span style={{ display: isMobile ? "none" : "inline" }}>Active Call</span>
            </button>
          )}

          {/* Share Button Group */}
          <div style={{ display: "flex", gap: "8px", position: "relative" }}>
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert("Link copied! Share it with collaborators.");
              }}
              style={{
                padding: "8px 12px",
                borderRadius: "10px",
                background: "rgba(139,92,246,0.1)",
                border: "1px solid rgba(139,92,246,0.3)",
                color: "var(--accent-purple)",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Share
            </button>

            {/* Export Dropdown Container */}
            <div ref={exportMenuRef}>
              <button
                onClick={() => setExportMenuOpen(!exportMenuOpen)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 12px",
                  borderRadius: "10px",
                  background: "var(--input-bg)",
                  border: "1px solid var(--card-border)",
                  color: "var(--text-muted)",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                className="settings-option-hover"
                title="Export Note"
              >
                <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 14, height: 14 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                {!isMobile && "Export"}
                <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 12, height: 12, transform: exportMenuOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Export Menu */}
              {exportMenuOpen && (
                <div
                  className="export-dropdown"
                  style={{
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    right: 0,
                    width: "160px",
                    background: "var(--card)",
                    border: "1px solid var(--card-border)",
                    borderRadius: "12px",
                    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
                    padding: "6px",
                    zIndex: 100,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div style={{ padding: "8px 12px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Export As
                  </div>
                  
                  <button
                    onClick={() => handleExport('txt')}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "8px 12px",
                      width: "100%",
                      textAlign: "left",
                      background: "transparent",
                      border: "none",
                      borderRadius: "8px",
                      color: "var(--foreground)",
                      fontSize: "13px",
                      fontWeight: 500,
                      cursor: "pointer",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "var(--input-bg)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    <span>📄</span> Plain Text
                  </button>
                  
                  <button
                    onClick={() => handleExport('html')}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "8px 12px",
                      width: "100%",
                      textAlign: "left",
                      background: "transparent",
                      border: "none",
                      borderRadius: "8px",
                      color: "var(--foreground)",
                      fontSize: "13px",
                      fontWeight: 500,
                      cursor: "pointer",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "var(--input-bg)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    <span>&lt;/&gt;</span> HTML
                  </button>
                  
                  <button
                    onClick={() => handleExport('md')}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "8px 12px",
                      width: "100%",
                      textAlign: "left",
                      background: "transparent",
                      border: "none",
                      borderRadius: "8px",
                      color: "var(--foreground)",
                      fontSize: "13px",
                      fontWeight: 500,
                      cursor: "pointer",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "var(--input-bg)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    <span>M↓</span> Markdown
                  </button>
                  
                  <div style={{ height: "1px", background: "var(--card-border)", margin: "4px 0" }} />
                  
                  <button
                    onClick={() => handleExport('pdf')}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "8px 12px",
                      width: "100%",
                      textAlign: "left",
                      background: "transparent",
                      border: "none",
                      borderRadius: "8px",
                      color: "var(--foreground)",
                      fontSize: "13px",
                      fontWeight: 500,
                      cursor: "pointer",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "var(--input-bg)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    <span>🖨️</span> Print / PDF
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Active Users Toggle Button (Mobile Only) */}
          {isMobile && (
            <button
              onClick={() => setShowMobileSidebar(!showMobileSidebar)}
              style={{
                padding: "8px 12px",
                borderRadius: "10px",
                background: showMobileSidebar ? "var(--accent-purple)" : "var(--input-bg)",
                border: "1px solid var(--card-border)",
                color: showMobileSidebar ? "#fff" : "var(--text-muted)",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
              }}
              title="Active Users"
            >
              <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 16, height: 16 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </button>
          )}
        </div>
      </header>

      {/* Content area */}
      <div style={{ 
        display: "flex", 
        flex: 1, 
        padding: isMobile ? "12px" : "24px 28px", 
        gap: isMobile ? "0" : "24px", 
        overflow: "hidden",
        flexDirection: isMobile ? "column" : "row",
        position: "relative"
      }}>
        
        {/* Main Editor */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", overflowY: "auto" }}>
          <Editor 
            noteId={noteId} 
            initialTitle={title} 
            onTitleChange={handleTitleChange} 
            onAwarenessUpdate={setAwareness}
            onSyncChange={setIsSynced}
            onSaveStatusChange={setSaving}
            onEditorReady={setEditorInstance}
          />
        </div>

        {/* Collaboration Sidebar */}
        {!isMobile ? (
          <aside style={{ width: "280px", flexShrink: 0 }}>
            <CollaborationSidebar awareness={awareness} />
          </aside>
        ) : showMobileSidebar ? (
          <aside
            style={{
              position: "absolute",
              top: "12px",
              right: "12px",
              bottom: "80px",
              width: "280px",
              zIndex: 150,
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.5)",
              borderRadius: "16px",
              overflow: "hidden"
            }}
          >
            <CollaborationSidebar awareness={awareness} />
          </aside>
        ) : null}
      </div>

      <AudioModal isOpen={audioModalOpen} onClose={() => setAudioModalOpen(false)} />

      <style jsx global>{`
        @keyframes pulseShadow {
          0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(34, 197, 94, 0); }
          100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
        }
      `}</style>
    </div>
  );
}

export default function NotePage() {
  const params = useParams();
  const noteId = params.noteId as string;
  
  return (
    <AudioProvider noteId={noteId}>
      <NoteContent />
    </AudioProvider>
  );
}
