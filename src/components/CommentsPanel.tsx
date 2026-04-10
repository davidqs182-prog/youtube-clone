"use client";

import { X, ThumbsUp, ThumbsDown, Settings2, MoreVertical, Languages, ChevronDown } from "lucide-react";
import { useMemo, useState, useEffect, useRef } from "react";

interface CommentsPanelProps {
  onClose: () => void;
  video: any;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatCount(raw: string | number | undefined): string {
  const n = typeof raw === "number" ? raw : parseInt(String(raw || "0").replace(/[^0-9]/g, ""), 10);
  if (isNaN(n)) return String(raw ?? "0");
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1)}K`;
  return String(n);
}

/** Seeded pseudo-random so each video always shows the same high count */
function seededCommentCount(videoId: string): string {
  let s = 0;
  for (let i = 0; i < videoId.length; i++) s += videoId.charCodeAt(i);
  const raw = 5000 + (((s * 9301 + 49297) % 233280) / 233280) * 2_495_000;
  return formatCount(Math.round(raw));
}

// ── Translation map ───────────────────────────────────────────────────────────

const translations: Record<string, { es: string; en: string }> = {
  "This is exactly what I was looking for!": {
    es: "¡Esto es exactamente lo que estaba buscando!",
    en: "This is exactly what I was looking for!",
  },
  "I can't believe how detailed this is. Incredible job.": {
    es: "No puedo creer lo detallado que está esto. Trabajo increíble.",
    en: "I can't believe how detailed this is. Incredible job.",
  },
  "I've been watching this channel for years, never disappoints.": {
    es: "Llevo años viendo este canal, nunca decepciona.",
    en: "I've been watching this channel for years, never disappoints.",
  },
  "The algorithm finally blessed me today.": {
    es: "El algoritmo por fin me bendijo hoy.",
    en: "The algorithm finally blessed me today.",
  },
  "Such an underrated masterpiece.": {
    es: "Una obra maestra muy subestimada.",
    en: "Such an underrated masterpiece.",
  },
  "This perfectly sums up everything.": {
    es: "Esto resume perfectamente todo.",
    en: "This perfectly sums up everything.",
  },
  "Anyone else watching this in 2024?": {
    es: "¿Alguien más viendo esto en 2024?",
    en: "Anyone else watching this in 2024?",
  },
  "Thanks for sharing this, really helpful!": {
    es: "¡Gracias por compartir esto, muy útil!",
    en: "Thanks for sharing this, really helpful!",
  },
  "I literally watched this 5 times already.": {
    es: "Literalmente ya lo vi 5 veces.",
    en: "I literally watched this 5 times already.",
  },
  "Bro really thought he could get away with that 😂": {
    es: "Bro de verdad pensó que se saldría con la suya 😂",
    en: "Bro really thought he could get away with that 😂",
  },
  "Please make a part 2 to this!": {
    es: "¡Por favor haz una parte 2 de esto!",
    en: "Please make a part 2 to this!",
  },
};

type Lang = "original" | "es" | "en";

function translateText(text: string, lang: Lang): string {
  if (lang === "original") return text;
  return translations[text]?.[lang] ?? text;
}

// ── Realtime stream data ──────────────────────────────────────────────────────

const REALTIME_POOL = [
  "¡Qué increíble momento! 🔥",
  "LOL no lo puedo creer",
  "First time watching, already subscribed!",
  "Esto me hizo el día 😂",
  "¿Alguien más lleva 3 horas aquí?",
  "This part never gets old!!",
  "Goated content fr fr 🐐",
  "Para el algoritmo ❤️",
  "W video, no cap",
  "Maestro 🙌",
  "Subiendo el volumen al máximo 🔊",
  "literally screaming rn",
  "bro went crazy 💀",
  "Peak content, no notes.",
  "Mi parte favorita fue justo esta 👇",
];

const REALTIME_POOL_ES: Record<string, string> = {
  "First time watching, already subscribed!": "¡Primera vez que lo veo y ya me suscribí!",
  "This part never gets old!!": "¡Esta parte nunca envejece!!",
  "Goated content fr fr 🐐": "Contenido legendario de verdad 🐐",
  "W video, no cap": "Gran vídeo, sin mentiras",
  "literally screaming rn": "literalmente gritando ahora mismo",
  "bro went crazy 💀": "bro se volvió loco 💀",
  "Peak content, no notes.": "Contenido de nivel máximo, sin críticas.",
};

const REALTIME_POOL_EN: Record<string, string> = {
  "¡Qué increíble momento! 🔥": "What an incredible moment! 🔥",
  "LOL no lo puedo creer": "LOL I can't believe it",
  "Esto me hizo el día 😂": "This made my day 😂",
  "¿Alguien más lleva 3 horas aquí?": "Anyone else been here for 3 hours?",
  "Para el algoritmo ❤️": "For the algorithm ❤️",
  "Subiendo el volumen al máximo 🔊": "Cranking the volume to max 🔊",
  "Maestro 🙌": "Masterpiece 🙌",
  "Mi parte favorita fue justo esta 👇": "This right here was my favorite part 👇",
};

function translateRealtimeText(text: string, lang: Lang): string {
  if (lang === "es") return REALTIME_POOL_ES[text] ?? text;
  if (lang === "en") return REALTIME_POOL_EN[text] ?? text;
  return text;
}

const REALTIME_NAMES = [
  "xX_g4mer_Xx", "sofia.views", "lucas_real", "anon_user92", "pepitaflores",
  "thenewguy88", "hype_nation", "vero_mvp", "randomdude99", "clutchplays",
];

function generateRealtimeComment(seed: number) {
  const text = REALTIME_POOL[seed % REALTIME_POOL.length];
  const name = REALTIME_NAMES[(seed * 3) % REALTIME_NAMES.length];
  const now = new Date();
  const timeStr = now.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  return { id: `rt-${seed}-${Date.now()}`, name: `@${name}`, avatar: `https://i.pravatar.cc/150?u=${name}${seed}`, text, timeStr };
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function CommentsPanel({ onClose, video }: CommentsPanelProps) {
  const [lang, setLang] = useState<Lang>("original");
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [realtimeActive, setRealtimeActive] = useState(false);
  const [realtimeComments, setRealtimeComments] = useState<ReturnType<typeof generateRealtimeComment>[]>([]);
  const realtimeCountRef = useRef(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setLangDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Realtime comment stream — fires every ~2s when active
  useEffect(() => {
    if (!realtimeActive) return;
    // Fire one immediately so the panel isn't empty for 2s
    setRealtimeComments([generateRealtimeComment(++realtimeCountRef.current)]);
    const interval = setInterval(() => {
      setRealtimeComments(prev => [generateRealtimeComment(++realtimeCountRef.current), ...prev].slice(0, 50));
    }, 2200);
    return () => clearInterval(interval);
  }, [realtimeActive]);

  // Reset realtime list when deactivated
  useEffect(() => {
    if (!realtimeActive) setRealtimeComments([]);
  }, [realtimeActive]);

  const langLabel: Record<Lang, string> = { original: "Original", es: "Español", en: "English" };
  const langOptions: Lang[] = ["original", "es", "en"];

  // ── Static comments generation ──
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
      "Please make a part 2 to this!",
    ];
    const names = ["ninopreuss", "ayeleru", "doniyoraloxanov", "justfun", "codingexpert", "maria_designs", "tech_freak", "gamerz_unite", "random_user"];
    const times = ["1 year ago", "3 weeks ago", "9 months ago", "2 days ago", "14 hours ago", "just now", "1 month ago"];

    const tailoredComment = {
      id: `c-0-${video.id}`,
      name: `@${video.author.replace(/\s+/g, "").toLowerCase()}`,
      time: "Pinned by creator",
      text: `Welcome! Feel free to ask any questions about "${video.title}" right here in the comments section! 👇`,
      likes: "14K",
      replies: 128,
      avatar: video.avatar || `https://i.pravatar.cc/150?u=Creator-${video.id}`,
    };

    const generated: typeof tailoredComment[] = [tailoredComment];

    let seed = video.id.charCodeAt(0) + video.id.length;
    const random = () => { const x = Math.sin(seed++) * 10000; return x - Math.floor(x); };

    const count = Math.floor(random() * 6) + 6;
    for (let i = 1; i < count; i++) {
      const nameStr = names[Math.floor(random() * names.length)];
      generated.push({
        id: `c-${video.id}-${i}`,
        name: `@${nameStr}${Math.floor(random() * 1000)}`,
        time: times[Math.floor(random() * times.length)],
        text: pool[Math.floor(random() * pool.length)],
        likes: formatCount(Math.floor(random() * 50000)),
        replies: Math.floor(random() * 50),
        avatar: `https://i.pravatar.cc/150?u=${nameStr}${i}-${video.id}`,
      });
    }
    return generated;
  }, [video]);

  const emojis = ["❤️", "🙌", "🔥", "👏", "😢", "😍", "😮", "😂"];
  const commentCount = video?.id ? seededCommentCount(video.id) : formatCount(video?.comments);

  return (
    <div className="w-full h-full flex flex-col bg-[#0f0f0f] border border-[var(--yt-border)] rounded-xl overflow-hidden shrink-0 animate-in fade-in slide-in-from-right-4 duration-300">

      {/* ── Row 1: Title + Close ── */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2 shrink-0">
        <span className="font-bold text-lg text-white whitespace-nowrap">
          {commentCount} Comments
        </span>
        <button
          onClick={onClose}
          className="p-2 hover:bg-[#272727] rounded-full transition-colors text-white shrink-0"
        >
          <X size={24} />
        </button>
      </div>

      {/* ── Row 2: Sort by | Translate dropdown | Real time Comments ── */}
      <div className="flex items-center gap-1 px-3 pb-2 border-b border-[var(--yt-border)] shrink-0 flex-wrap">

        {/* Sort by */}
        <button className="flex items-center gap-1.5 text-gray-300 hover:text-white hover:bg-white/10 px-2.5 py-1.5 rounded-full transition-colors group">
          <Settings2 size={15} className="group-hover:scale-105 shrink-0" />
          <span className="text-sm font-semibold">Sort by</span>
        </button>

        <div className="w-px h-4 bg-[#333] mx-0.5" />

        {/* Translate dropdown */}
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setLangDropdownOpen(o => !o)}
            className={`flex items-center gap-1.5 text-sm font-semibold px-2.5 py-1.5 rounded-full transition-all ${
              lang !== "original"
                ? "text-blue-400 bg-blue-500/15 hover:bg-blue-500/25"
                : "text-gray-300 hover:text-white hover:bg-white/10"
            }`}
          >
            <Languages size={15} className="shrink-0" />
            <span>{langLabel[lang]}</span>
            <ChevronDown
              size={13}
              className={`shrink-0 transition-transform duration-200 ${langDropdownOpen ? "rotate-180" : ""}`}
            />
          </button>

          {/* Dropdown menu */}
          {langDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 z-50 bg-[#212121] border border-[#333] rounded-xl shadow-2xl overflow-hidden min-w-[140px] animate-in fade-in zoom-in-95 duration-150">
              {langOptions.map(opt => (
                <button
                  key={opt}
                  onClick={() => { setLang(opt); setLangDropdownOpen(false); }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium transition-colors ${
                    lang === opt
                      ? "text-blue-400 bg-blue-500/15"
                      : "text-gray-200 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span>{langLabel[opt]}</span>
                  {lang === opt && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-px h-4 bg-[#333] mx-0.5" />

        {/* Real time Comments */}
        <button
          onClick={() => setRealtimeActive(a => !a)}
          className={`flex items-center gap-1.5 text-sm font-semibold px-2.5 py-1.5 rounded-full transition-all ${
            realtimeActive
              ? "text-red-400 bg-red-500/15 hover:bg-red-500/25"
              : "text-gray-300 hover:text-white hover:bg-white/10"
          }`}
        >
          <span className="relative flex h-2 w-2 shrink-0">
            {realtimeActive && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            )}
            <span className={`relative inline-flex rounded-full h-2 w-2 ${realtimeActive ? "bg-red-500" : "bg-gray-500"}`} />
          </span>
          <span>Real time Comments</span>
        </button>
      </div>

      {/* ── Scrollable area ── */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden no-scrollbar overscroll-contain px-4 py-4">
        <div className="flex flex-col gap-6">

          {/* ── REALTIME MODE: only show live stream ── */}
          {realtimeActive && (
            <div className="flex flex-col gap-3">
              {/* Live header */}
              <div className="flex items-center gap-2 text-red-400 text-xs font-semibold uppercase tracking-wide">
                <span className="animate-ping inline-flex h-1.5 w-1.5 rounded-full bg-red-400" />
                En vivo ahora
                {lang !== "original" && (
                  <span className="ml-auto text-blue-400 normal-case font-normal tracking-normal">
                    · Traduciendo al {lang === "es" ? "Español" : "English"}
                  </span>
                )}
              </div>

              {/* Waiting state */}
              {realtimeComments.length === 0 && (
                <p className="text-gray-500 text-sm italic text-center py-8">
                  Esperando comentarios en tiempo real…
                </p>
              )}

              {/* Live comments */}
              {realtimeComments.map(rc => {
                const displayText = translateRealtimeText(rc.text, lang);
                const wasTranslated = lang !== "original" && displayText !== rc.text;
                return (
                  <div key={rc.id} className="flex gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <img src={rc.avatar} alt={rc.name} className="w-8 h-8 rounded-full shrink-0 object-cover border border-red-500/30" />
                    <div className="flex flex-col flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[12px] font-medium text-white">{rc.name}</span>
                        {/* Blue timestamp */}
                        <span className="text-[11px] font-bold text-blue-400 tabular-nums bg-blue-500/10 px-1.5 py-0.5 rounded-md">
                          {rc.timeStr}
                        </span>
                      </div>
                      <p className="text-[13px] text-gray-200 mt-0.5 leading-snug">{displayText}</p>
                      {wasTranslated && (
                        <span className="text-[10px] text-blue-400/60 mt-0.5 italic">
                          Traducido al {lang === "es" ? "Español" : "English"}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── NORMAL MODE: static comments ── */}
          {!realtimeActive && dynamicComments.map(comment => (
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
                  {translateText(comment.text, lang)}
                </p>

                {/* Translation badge — only shown when a language is active */}
                {lang !== "original" && (
                  <span className="text-[10px] text-blue-400/70 mt-0.5 italic">
                    Traducido al {lang === "es" ? "Español" : "English"}
                  </span>
                )}

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

      {/* ── Sticky Bottom Input ── */}
      <div className="w-full shrink-0 bg-[#0f0f0f]/95 backdrop-blur-md border-t border-[var(--yt-border)] px-4 py-3 flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          {emojis.map((emoji, index) => (
            <button key={index} className="text-xl hover:scale-125 transition-transform hover:bg-[#272727] w-8 h-8 rounded-full flex items-center justify-center">
              {emoji}
            </button>
          ))}
        </div>
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
            <div className="shrink-0 flex items-center justify-center border-2 border-gray-400 rounded-md p-0.5 px-1 ml-2 opacity-70 hover:opacity-100 cursor-pointer transition-opacity">
              <span className="text-[9px] font-black text-gray-400 leading-none">GIF</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
