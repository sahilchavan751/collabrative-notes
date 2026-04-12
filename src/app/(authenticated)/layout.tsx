"use client";

import React from "react";
import PrimarySidebar from "../../components/PrimarySidebar";
import SecondarySidebar from "../../components/SecondarySidebar";
import BottomNavigation from "../../components/BottomNavigation";
import { useAuth } from "../../hooks/useAuth";
import { useRouter, usePathname } from "next/navigation";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { NotesProvider } from "../../contexts/NotesContext";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Protect the route group
  React.useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", background: "#0a0a0f" }}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) return null;

  // Mobile navigation logic:
  // - On /notes, show the list (SecondarySidebar)
  // - On other routes, show the page content (children)
  const isNotesListPage = pathname === "/notes";
  const isNoteDetailPage = pathname.startsWith("/notes/");
  
  return (
    <NotesProvider>
    <div style={{ 
      display: "flex", 
      flexDirection: isMobile ? "column" : "row",
      height: "100vh", 
      overflow: "hidden", 
      background: "var(--background)",
      color: "var(--foreground)" 
    }}>
      {/* Desktop Sidebar */}
      {!isMobile && <PrimarySidebar />}

      {/* Mobile Flow Management */}
      {isMobile ? (
        <React.Fragment>
          {isNotesListPage ? (
            <SecondarySidebar />
          ) : (
            <main style={{ flex: 1, overflow: "hidden", position: "relative", paddingBottom: isNoteDetailPage ? "0px" : "64px" }}>
              {children}
            </main>
          )}
          {!isNoteDetailPage && <BottomNavigation />}
        </React.Fragment>
      ) : (
        <React.Fragment>
          {/* Desktop Layout */}
          <SecondarySidebar />
          <main style={{ flex: 1, overflow: "hidden", position: "relative" }}>
            {children}
          </main>
        </React.Fragment>
      )}
    </div>
    </NotesProvider>
  );
}
