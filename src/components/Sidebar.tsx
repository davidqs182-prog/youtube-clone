"use client";

import Link from "next/link";
import { Home, Compass, PlaySquare, Clock, History, ThumbsUp, Flame, Music, Gamepad2, Trophy, Menu } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

export default function Sidebar({ isOpen, toggleSidebar }: SidebarProps) {
  const mainLinks = [
    { icon: Home, text: "Home", active: true },
    { icon: Compass, text: "Shorts" },
    { icon: PlaySquare, text: "Subscriptions" },
  ];

  const secondaryLinks = [
    { icon: History, text: "History" },
    { icon: Clock, text: "Watch Later" },
    { icon: ThumbsUp, text: "Liked videos" },
  ];

  const exploreLinks = [
    { icon: Flame, text: "Trending" },
    { icon: Music, text: "Music" },
    { icon: Gamepad2, text: "Gaming" },
    { icon: Trophy, text: "Sports" },
  ];

  return (
    <>
      {/* Overlay Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[60] transition-opacity duration-300"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Panel */}
      <aside className={`fixed top-0 left-0 h-full w-60 bg-[var(--yt-bg)] z-[70] transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col overflow-y-auto no-scrollbar pb-6 shadow-2xl`}>
        
        {/* Header inside overlay (Logo & Hamburger) */}
        <div className="flex items-center gap-4 px-4 h-14 shrink-0">
          <button onClick={toggleSidebar} className="p-2 hover:bg-[var(--yt-hover)] rounded-full transition-colors">
            <Menu className="w-6 h-6 text-[var(--yt-text)]" />
          </button>
          <Link href="/" className="flex items-center gap-1" title="YouTube Home" onClick={toggleSidebar}>
            <div className="bg-red-600 text-white font-bold px-2 py-0.5 rounded flex items-center justify-center text-sm md:text-base tracking-tighter relative">
              <span className="scale-110 mb-0.5">▶</span>
            </div>
            <span className="font-semibold text-lg md:text-xl tracking-tighter">YouTube</span>
          </Link>
        </div>

        <div className="flex flex-col mb-4 pt-3">
          {mainLinks.map((link) => (
            <Link
              href="/"
              key={link.text}
              onClick={toggleSidebar}
              className={`flex items-center justify-start py-2.5 px-3 mx-3 rounded-xl hover:bg-[var(--yt-hover)] transition-colors ${
                link.active ? "bg-[var(--yt-hover)] font-medium" : ""
              }`}
            >
              <link.icon className={`w-6 h-6 mr-5 ${link.active ? "" : "stroke-[1.5]"}`} />
              <span className="text-sm whitespace-nowrap overflow-hidden text-ellipsis">{link.text}</span>
            </Link>
          ))}
        </div>

        <div className="w-full h-[1px] bg-[var(--yt-border)] my-2"></div>
        
        <div className="flex flex-col mb-4">
          <h3 className="px-5 py-2 text-base font-semibold">You</h3>
          {secondaryLinks.map((link) => (
            <Link
              href="/"
              key={link.text}
              onClick={toggleSidebar}
              className="flex items-center justify-start py-2.5 px-3 mx-3 rounded-xl hover:bg-[var(--yt-hover)] transition-colors"
            >
              <link.icon className="w-6 h-6 mr-5 stroke-[1.5]" />
              <span className="text-sm whitespace-nowrap overflow-hidden text-ellipsis">{link.text}</span>
            </Link>
          ))}
        </div>

        <div className="w-full h-[1px] bg-[var(--yt-border)] my-2"></div>

        <div className="flex flex-col mb-4">
          <h3 className="px-5 py-2 text-base font-semibold">Explore</h3>
          {exploreLinks.map((link) => (
            <Link
              href="/"
              key={link.text}
              onClick={toggleSidebar}
              className="flex items-center justify-start py-2.5 px-3 mx-3 rounded-xl hover:bg-[var(--yt-hover)] transition-colors"
            >
              <link.icon className="w-6 h-6 mr-5 stroke-[1.5]" />
              <span className="text-sm whitespace-nowrap overflow-hidden text-ellipsis">{link.text}</span>
            </Link>
          ))}
        </div>
      </aside>
    </>
  );
}
