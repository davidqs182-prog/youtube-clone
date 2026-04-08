import Link from "next/link";
import { Menu, Search, Mic, Video, Bell, User } from "lucide-react";

interface TopNavProps {
  toggleSidebar: () => void;
}

export default function TopNav({ toggleSidebar }: TopNavProps) {
  return (
    <nav className="flex items-center justify-between px-4 h-14 bg-[var(--yt-bg)] z-50 shrink-0">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="p-2 hover:bg-[var(--yt-hover)] rounded-full transition-colors">
          <Menu className="w-6 h-6 text-[var(--yt-text)]" />
        </button>
        <Link href="/" className="flex items-center gap-1" title="YouTube Home">
          <svg xmlns="http://www.w3.org/2000/svg" width="30" height="21" viewBox="0 0 30 21" className="ml-0.5">
            <path fill="#FF0000" d="M29.5 3.3c-.3-1.2-1.3-2.1-2.5-2.5C24.8.2 15 .2 15 .2s-9.8 0-12 .6C1.8 1.2.8 2.1.5 3.3.2 5.5.2 10.5.2 10.5s0 5 .3 7.2c.3 1.2 1.3 2.1 2.5 2.5 2.2.6 12 .6 12 .6s9.8 0 12-.6c1.2-.4 2.2-1.3 2.5-2.5.3-2.2.3-7.2.3-7.2s0-5-.3-7.2z"/>
            <path fill="#FFFFFF" d="M12 15l8-4.5-8-4.5v9z"/>
          </svg>
          <span className="font-semibold text-lg md:text-[21px] tracking-tighter text-white" style={{ letterSpacing: '-0.8px' }}>YouTube</span>
        </Link>
      </div>

      {/* Center Section - Search Bar */}
      <div className="hidden md:flex items-center flex-grow max-w-[720px] px-10">
        <div className="flex w-full items-center">
          <div className="flex w-full bg-[#121212] border border-[var(--yt-border)] rounded-l-full overflow-hidden items-center px-4 h-10 ml-8 focus-within:border-blue-500">
            <Search className="w-5 h-5 text-gray-400 hidden lg:block mr-2" />
            <input
              type="text"
              placeholder="Search"
              className="w-full bg-transparent outline-none text-base text-[var(--yt-text)] placeholder-gray-400"
            />
          </div>
          <button className="h-10 px-5 bg-[var(--yt-hover)] border border-l-0 border-[var(--yt-border)] rounded-r-full hover:bg-[#3f3f3f] transition-colors flex items-center justify-center" title="Search">
            <Search className="w-5 h-5 text-gray-300" />
          </button>
        </div>
        <button className="ml-4 p-2.5 bg-[#181818] hover:bg-[var(--yt-hover)] rounded-full flex-shrink-0 transition-colors" title="Search with your voice">
          <Mic className="w-5 h-5 text-[var(--yt-text)]" />
        </button>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 sm:gap-4 md:mr-2">
        <button className="md:hidden p-2 hover:bg-[var(--yt-hover)] rounded-full">
          <Search className="w-6 h-6 text-[var(--yt-text)]" />
        </button>
        <button className="hidden sm:block p-2 hover:bg-[var(--yt-hover)] rounded-full transition-colors" title="Create">
          <Video className="w-6 h-6 text-[var(--yt-text)]" />
        </button>
        <button className="p-2 hover:bg-[var(--yt-hover)] rounded-full transition-colors relative" title="Notifications">
          <Bell className="w-6 h-6 text-[var(--yt-text)]" />
          <span className="absolute top-1.5 right-1.5 bg-red-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-[var(--yt-bg)]">
            9+
          </span>
        </button>
        <button className="p-1 sm:p-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold">
            D
          </div>
        </button>
      </div>
    </nav>
  );
}
