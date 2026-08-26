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
        <Link href="/" className="flex items-center gap-1 py-1" title="YouTube Home">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="409.289 277.787 512 114.301" className="h-5 w-auto">
            <g className="style-scope yt-icon">
              <g className="style-scope yt-icon">
                <path fill="red" d="M569.154 295.637a20.447 20.447 0 0 0-14.436-14.436c-12.728-3.414-63.79-3.414-63.79-3.414s-51.061 0-63.79 3.414a20.447 20.447 0 0 0-14.435 14.436c-3.414 12.728-3.414 39.3-3.414 39.3s0 26.573 3.414 39.302a20.446 20.446 0 0 0 14.435 14.435c12.729 3.414 63.79 3.414 63.79 3.414s51.062 0 63.79-3.414a20.446 20.446 0 0 0 14.436-14.435c3.414-12.729 3.414-39.301 3.414-39.301s-.014-26.573-3.414-39.301Z" className="style-scope yt-icon"/>
                <path fill="#fff" d="m474.585 359.429 42.42-24.49-42.42-24.488v48.978Z" className="style-scope yt-icon"/>
              </g>
              <g className="style-scope yt-icon">
                <g fill="#fff" className="style-scope yt-icon">
                  <path d="m607.043 352.103-18.333-66.21h15.994l6.425 30.014c1.64 7.393 2.836 13.696 3.615 18.911h.47c.539-3.736 1.748-10 3.617-18.803l6.653-30.121h15.994l-18.562 66.21v31.76H607.03v-31.76h.013ZM646.29 381.765c-3.226-2.178-5.524-5.565-6.896-10.161-1.357-4.597-2.042-10.699-2.042-18.334v-10.39c0-7.701.78-13.897 2.339-18.561s3.991-8.078 7.298-10.215c3.306-2.137 7.647-3.213 13.024-3.213 5.296 0 9.53 1.09 12.728 3.267 3.186 2.177 5.524 5.591 7.003 10.215 1.478 4.637 2.218 10.806 2.218 18.507v10.39c0 7.635-.726 13.764-2.164 18.387-1.438 4.637-3.777 8.025-7.003 10.162-3.226 2.137-7.607 3.212-13.132 3.212-5.699.013-10.147-1.089-13.373-3.266Zm18.091-11.21c.887-2.338 1.344-6.142 1.344-11.438V336.82c0-5.135-.443-8.898-1.344-11.264-.9-2.379-2.473-3.561-4.731-3.561-2.177 0-3.723 1.182-4.61 3.561-.9 2.38-1.344 6.13-1.344 11.264v22.298c0 5.296.43 9.113 1.29 11.438.86 2.339 2.406 3.508 4.664 3.508 2.258 0 3.83-1.169 4.731-3.508ZM733.99 383.878h-12.606l-1.398-8.764h-.35c-3.427 6.613-8.562 9.92-15.416 9.92-4.745 0-8.253-1.56-10.51-4.664-2.259-3.119-3.388-7.984-3.388-14.597v-53.481h16.116v52.54c0 3.2.349 5.47 1.048 6.828.699 1.357 1.868 2.043 3.508 2.043 1.398 0 2.742-.43 4.032-1.29 1.29-.86 2.231-1.95 2.863-3.266v-56.869h16.102v71.6Z" className="style-scope yt-icon"/>
                  <path d="M777.769 298.862h-15.995v85.013h-15.766v-85.013h-15.995v-12.957h47.756v12.957Z" className="style-scope yt-icon"/>
                  <path d="M816.638 383.878h-12.607l-1.398-8.764h-.35c-3.426 6.613-8.56 9.92-15.416 9.92-4.745 0-8.252-1.56-10.51-4.664-2.259-3.119-3.388-7.984-3.388-14.597v-53.481h16.116v52.54c0 3.2.35 5.47 1.048 6.828.7 1.357 1.868 2.043 3.509 2.043 1.397 0 2.741-.43 4.032-1.29 1.29-.86 2.23-1.95 2.862-3.266v-56.869h16.102v71.6ZM869.972 323.729c-.981-4.516-2.554-7.783-4.73-9.812-2.178-2.03-5.176-3.038-8.993-3.038-2.957 0-5.726.834-8.293 2.514-2.567 1.68-4.556 3.87-5.954 6.6h-.12v-37.716h-15.525v101.586h13.306l1.64-6.774h.35c1.25 2.419 3.118 4.314 5.604 5.726 2.487 1.398 5.256 2.097 8.293 2.097 5.444 0 9.463-2.514 12.03-7.528 2.567-5.027 3.857-12.862 3.857-23.534v-11.33c0-7.998-.497-14.275-1.465-18.791Zm-14.771 29.206c0 5.215-.215 9.302-.646 12.259-.43 2.957-1.142 5.067-2.163 6.303-1.008 1.25-2.38 1.869-4.087 1.869-1.33 0-2.553-.31-3.682-.941-1.13-.619-2.043-1.56-2.742-2.796v-40.631c.537-1.95 1.479-3.535 2.81-4.785 1.316-1.25 2.768-1.869 4.313-1.869 1.64 0 2.904.645 3.791 1.922.9 1.29 1.519 3.441 1.868 6.479.35 3.037.524 7.352.524 12.957v9.233h.014ZM894.3 357.062c0 4.596.134 8.037.403 10.336.269 2.298.833 3.965 1.693 5.027.86 1.048 2.178 1.572 3.965 1.572 2.406 0 4.073-.94 4.96-2.809.9-1.868 1.385-4.986 1.465-9.341l13.898.82c.08.618.12 1.478.12 2.567 0 6.612-1.814 11.559-5.43 14.825-3.615 3.266-8.736 4.906-15.349 4.906-7.943 0-13.508-2.487-16.693-7.473-3.199-4.987-4.785-12.688-4.785-23.119v-12.5c0-10.739 1.653-18.588 4.96-23.534 3.306-4.947 8.965-7.42 16.989-7.42 5.524 0 9.771 1.008 12.728 3.038 2.957 2.03 5.04 5.175 6.25 9.462 1.21 4.288 1.815 10.202 1.815 17.755v12.259h-26.99v3.629Zm2.043-33.737c-.82 1.008-1.358 2.662-1.64 4.96-.27 2.298-.404 5.78-.404 10.457v5.135h11.788v-5.135c0-4.597-.16-8.078-.47-10.457-.31-2.38-.874-4.046-1.694-5.027-.82-.968-2.083-1.465-3.79-1.465-1.72.013-2.984.524-3.79 1.532Z" className="style-scope yt-icon"/>
                </g>
              </g>
            </g>
          </svg>
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
