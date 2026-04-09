import { X, ThumbsUp, ThumbsDown, Settings2, MoreVertical, Reply, Send } from "lucide-react";
import { useMemo } from "react";

interface CommentsPanelProps {
  onClose: () => void;
  video: any;
}

export default function CommentsPanel({ onClose, video }: CommentsPanelProps) {
  const dynamicComments = useMemo(() => {
    if (!video) return [];
    
    const pool = [
      "This is exactly what I was looking for!",
      "I can't believe how detailed this is. Incredible job.",
      "I've been watching this channel for years, never disappoints.",
      "The algorithm finally blessed me today.",
      "Such an underrated masterpiece.",
      "This perfectly sums up everything.",
      "Anyone else watching this in 2024?",
      "Thanks for sharing this, really helpful!",
      "I literally watched this 5 times already.",
      "Bro really thought he could get away with that 😂",
      "Please make a part 2 to this!"
    ];
    
    const names = ["ninopreuss", "ayeleru", "doniyoraloxanov", "justfun", "codingexpert", "maria_designs", "tech_freak", "gamerz_unite", "random_user"];
    const times = ["1 year ago", "3 weeks ago", "9 months ago", "2 days ago", "14 hours ago", "just now", "1 month ago"];
    
    // Always include a specific tailored comment at the top!
    const tailoredComment = {
      id: `c-0-${video.id}`,
      name: `@${video.author.replace(/\s+/g, '').toLowerCase()}`,
      time: "Pinned by creator",
      text: `Welcome! Feel free to ask any questions about "${video.title}" right here in the comments section! 👇`,
      likes: "14K",
      replies: 128,
      avatar: video.avatar || `https://ui-avatars.com/api/?name=Creator&background=ff0000&color=FFF`
    };

    const generated = [tailoredComment];
    
    // Generate 6 to 12 random comments
    let seed = video.id.charCodeAt(0) + video.id.length; // simple pseudo-seed
    const random = () => {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };

    const count = Math.floor(random() * 6) + 6; 
    for(let i=1; i<count; i++) {
       const nameStr = names[Math.floor(random() * names.length)];
       const hexColor = Math.floor(random()*16777215).toString(16).padStart(6, '0');
       generated.push({
          id: `c-${video.id}-${i}`,
          name: `@${nameStr}${Math.floor(random()*1000)}`,
          time: times[Math.floor(random() * times.length)],
          text: pool[Math.floor(random() * pool.length)],
          likes: Math.floor(random() * 900) + (random() > 0.5 ? "K" : ""),
          replies: Math.floor(random() * 50),
          avatar: `https://ui-avatars.com/api/?name=${nameStr}&background=${hexColor}&color=FFF`
       });
    }
    
    return generated;
  }, [video]);

  const emojis = ["❤️", "🙌", "🔥", "👏", "😢", "😍", "😮", "😂"];

  return (
    <div className="w-full h-full flex flex-col bg-[#0f0f0f] border border-[var(--yt-border)] rounded-xl overflow-hidden shrink-0 animate-in fade-in slide-in-from-right-4 duration-300">
      
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--yt-border)] shrink-0">
        <div className="flex items-center gap-4">
          <span className="font-bold text-lg text-white">{video?.comments || "11,332"} Comments</span>
          <button className="flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors cursor-pointer group">
            <Settings2 size={18} className="group-hover:scale-105" />
            <span className="text-sm font-semibold">Sort by</span>
          </button>
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-[#272727] rounded-full transition-colors text-white"
        >
          <X size={24} />
        </button>
      </div>

      {/* Scrollable Comments List */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden no-scrollbar overscroll-contain px-4 py-4">
        <div className="flex flex-col gap-6">
          {dynamicComments.map(comment => (
            <div key={comment.id} className="flex gap-4">
              <img src={comment.avatar} alt="User avatar" className="w-10 h-10 rounded-full shrink-0 mt-0.5 object-cover" />
              <div className="flex flex-col flex-1">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-medium text-white">{comment.name}</span>
                    <span className="text-[12px] text-gray-400">{comment.time}</span>
                  </div>
                  <button className="p-1 text-gray-200 hover:text-white rounded-full">
                    <MoreVertical size={16} />
                  </button>
                </div>
                <p className="text-[14px] text-gray-100 mt-1 leading-snug">
                  {comment.text}
                </p>
                <div className="flex items-center gap-4 mt-2 text-gray-300">
                  <button className="hover:text-white hover:bg-white/10 p-1.5 rounded-full transition-colors">
                    <ThumbsUp size={14} className="mb-0.5" />
                  </button>
                  <span className="text-[12px] -ml-2">{comment.likes}</span>
                  <button className="hover:text-white hover:bg-white/10 p-1.5 rounded-full transition-colors ml-1">
                    <ThumbsDown size={14} className="mt-0.5" />
                  </button>
                  <button className="text-[12px] font-semibold hover:bg-white/10 px-3 py-1.5 rounded-full transition-colors ml-2">
                    Reply
                  </button>
                </div>
                {comment.replies > 0 && (
                  <button className="flex items-center gap-2 mt-1 text-blue-400 hover:bg-blue-400/10 w-fit px-3 py-1.5 rounded-full text-sm font-semibold transition-colors">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M18 9l-6 6-6-6"/></svg>
                    {comment.replies} replies
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sticky Bottom Input Area */}
      <div className="w-full shrink-0 bg-[#0f0f0f]/95 backdrop-blur-md border-t border-[var(--yt-border)] px-4 py-3 flex flex-col gap-3">
        {/* Emojis Ribbon */}
        <div className="flex items-center justify-between px-1">
          {emojis.map((emoji, index) => (
            <button key={index} className="text-xl hover:scale-125 transition-transform hover:bg-[#272727] w-8 h-8 rounded-full flex items-center justify-center">
              {emoji}
            </button>
          ))}
        </div>
        
        {/* Input Bar */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0 text-white text-sm font-bold shadow-sm">
            D
          </div>
          <div className="flex-1 bg-[#272727] rounded-full h-10 flex items-center px-4 overflow-hidden focus-within:border focus-within:border-gray-500">
            <input 
              type="text"
              placeholder="Únete a la conversación..."
              className="flex-1 bg-transparent text-sm text-white placeholder-gray-400 outline-none"
            />
            {/* GIF icon mimicking the provided image design */}
            <div className="shrink-0 flex items-center justify-center border-2 border-gray-400 rounded-md p-0.5 px-1 ml-2 opacity-70 hover:opacity-100 cursor-pointer transition-opacity">
              <span className="text-[9px] font-black text-gray-400 leading-none">GIF</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
