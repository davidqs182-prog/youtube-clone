"use client";

import { useState } from "react";
import TopNav from "./TopNav";
import Sidebar from "./Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[var(--yt-bg)] text-[var(--yt-text)]">
      <TopNav toggleSidebar={toggleSidebar} />
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <main className="flex-1 h-full overflow-y-auto w-full relative snap-y snap-mandatory scroll-smooth">
          {children}
        </main>
      </div>
    </div>
  );
}
