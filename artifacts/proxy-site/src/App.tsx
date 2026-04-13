import { useState, useRef, useEffect, useCallback, KeyboardEvent } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

type NavAction = "home" | "browser" | "games" | "settings";

interface Theme {
  bg: string;
  bg2: string;
  bg3: string;
  border: string;
  text: string;
  textGrey: string;
  textDim: string;
  accent: string;
  accentText: string;
  sidebar: string;
  particleColor: string;
  inputBg: string;
  cardBg: string;
}

// ─── Theme definitions ────────────────────────────────────────────────────────

const THEMES: Record<string, Theme> = {
  default: {
    bg: "#000000", bg2: "#0a0a0a", bg3: "#161616",
    border: "#1c1c1c", text: "#ffffff", textGrey: "#717171",
    textDim: "#2a2a2a", accent: "#ffffff", accentText: "#000000",
    sidebar: "rgba(6,6,6,0.94)", particleColor: "rgba(255,255,255,0.6)",
    inputBg: "#080808", cardBg: "#0a0a0a",
  },
  inverted: {
    bg: "#ffffff", bg2: "#f2f2f2", bg3: "#e8e8e8",
    border: "#d0d0d0", text: "#000000", textGrey: "#666666",
    textDim: "#cccccc", accent: "#000000", accentText: "#ffffff",
    sidebar: "rgba(240,240,240,0.96)", particleColor: "rgba(0,0,0,0.25)",
    inputBg: "#f8f8f8", cardBg: "#f2f2f2",
  },
  sky: {
    bg: "#06101e", bg2: "#0c1a2e", bg3: "#0e2038",
    border: "#1a3050", text: "#c8e8fc", textGrey: "#5a90b8",
    textDim: "#1a3050", accent: "#5eb8ff", accentText: "#000000",
    sidebar: "rgba(6,16,30,0.94)", particleColor: "rgba(94,184,255,0.5)",
    inputBg: "#080f1a", cardBg: "#0a1624",
  },
  catppuccinMocha: {
    bg: "#1e1e2e", bg2: "#181825", bg3: "#11111b",
    border: "#313244", text: "#cdd6f4", textGrey: "#6c7086",
    textDim: "#313244", accent: "#cba6f7", accentText: "#1e1e2e",
    sidebar: "rgba(24,24,37,0.95)", particleColor: "rgba(203,166,247,0.4)",
    inputBg: "#1e1e2e", cardBg: "#181825",
  },
  catppuccinMacchiato: {
    bg: "#24273a", bg2: "#1e2030", bg3: "#181926",
    border: "#363a4f", text: "#cad3f5", textGrey: "#6e738d",
    textDim: "#363a4f", accent: "#c6a0f6", accentText: "#24273a",
    sidebar: "rgba(30,32,48,0.95)", particleColor: "rgba(198,160,246,0.4)",
    inputBg: "#24273a", cardBg: "#1e2030",
  },
  catppuccinFrappe: {
    bg: "#303446", bg2: "#292c3c", bg3: "#232634",
    border: "#414559", text: "#c6d0f5", textGrey: "#737994",
    textDim: "#414559", accent: "#ca9ee6", accentText: "#303446",
    sidebar: "rgba(41,44,60,0.95)", particleColor: "rgba(202,158,230,0.4)",
    inputBg: "#303446", cardBg: "#292c3c",
  },
  catppuccinLatte: {
    bg: "#eff1f5", bg2: "#e6e9ef", bg3: "#dce0e8",
    border: "#ccd0da", text: "#4c4f69", textGrey: "#9ca0b0",
    textDim: "#ccd0da", accent: "#8839ef", accentText: "#ffffff",
    sidebar: "rgba(230,233,239,0.96)", particleColor: "rgba(136,57,239,0.3)",
    inputBg: "#eff1f5", cardBg: "#e6e9ef",
  },
};

const THEME_LABELS: Record<string, string> = {
  default: "Default", inverted: "Inverted", sky: "Sky",
  catppuccinMocha: "Catppuccin Mocha", catppuccinMacchiato: "Catppuccin Macchiato",
  catppuccinFrappe: "Catppuccin Frappe", catppuccinLatte: "Catppuccin Latte",
};

// ─── Constants ───────────────────────────────────────────────────────────────

const SPLASH_MESSAGES = [
  "browse freely.", "your internet, unlocked.", "go anywhere.",
  "fast & private.", "the web, your way.", "no limits.",
];

const SHORTCUTS = [
  { name: "YouTube", icon: "fa-brands fa-youtube", url: "https://www.youtube.com" },
  { name: "GitHub", icon: "fa-brands fa-github", url: "https://github.com" },
  { name: "Discord", icon: "fa-brands fa-discord", url: "https://discord.com/app" },
  { name: "Twitch", icon: "fa-brands fa-twitch", url: "https://twitch.tv" },
  { name: "Reddit", icon: "fa-brands fa-reddit", url: "https://reddit.com" },
];

const NAV_ITEMS: { icon: string; label: string; action: NavAction }[] = [
  { icon: "fa-solid fa-house", label: "Home", action: "home" },
  { icon: "fa-solid fa-globe", label: "Browser", action: "browser" },
  { icon: "fa-solid fa-gamepad", label: "Games", action: "games" },
];

const NAV_BOTTOM: { icon: string; label: string; action: NavAction }[] = [
  { icon: "fa-solid fa-gear", label: "Settings", action: "settings" },
];

const TAB_CLOAKS: { label: string; title: string; icon: string }[] = [
  { label: "Default (Spatium)", title: "Spatium", icon: "" },
  { label: "Google Classroom", title: "Classroom", icon: "https://www.gstatic.com/classroom/logo_square_rounded.svg" },
  { label: "Canvas LMS", title: "Dashboard", icon: "https://du11hjcvx0uqb.cloudfront.net/dist/images/favicon-e10d657a73.ico" },
  { label: "Google Docs", title: "Document - Google Docs", icon: "https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico" },
  { label: "Khan Academy", title: "Khan Academy", icon: "https://cdn.kastatic.org/images/favicon.ico" },
  { label: "Quizlet", title: "Quizlet", icon: "https://assets.quizlet.com/a/j/dist/app/i/icons/favicon/apple-touch-icon.e491e04.png" },
  { label: "PowerSchool", title: "PowerSchool Grades and Attendance", icon: "" },
];

const SEARCH_ENGINES: Record<string, string> = {
  duckduckgo: "https://duckduckgo.com/?q=%s",
  google: "https://www.google.com/search?q=%s",
  bing: "https://www.bing.com/search?q=%s",
  brave: "https://search.brave.com/search?q=%s",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isValidUrl(str: string) {
  try { const u = new URL(str); return u.protocol === "http:" || u.protocol === "https:"; }
  catch { return false; }
}

function toProxyUrl(input: string, engine = "duckduckgo"): string {
  const url = input.trim();
  if (!url) return "";
  if (isValidUrl(url)) return `/api/proxy?url=${encodeURIComponent(url)}`;
  if (!url.startsWith("http") && url.includes(".") && !url.includes(" ")) {
    const h = `https://${url}`;
    if (isValidUrl(h)) return `/api/proxy?url=${encodeURIComponent(h)}`;
  }
  const engineUrl = SEARCH_ENGINES[engine] || SEARCH_ENGINES.duckduckgo;
  return `/api/proxy?url=${encodeURIComponent(engineUrl.replace("%s", encodeURIComponent(url)))}`;
}

// ─── Canvas Particle System ───────────────────────────────────────────────────

function ParticleCanvas({ color, enabled }: { color: string; enabled: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    interface Particle { x: number; y: number; vx: number; vy: number; radius: number; }
    let cw = 0, ch = 0, particles: Particle[] = [];

    function init() {
      cw = canvas!.width = canvas!.offsetWidth;
      ch = canvas!.height = canvas!.offsetHeight;
      particles = [];
      for (let i = 0; i < 70; i++) {
        particles.push({
          x: Math.random() * cw, y: Math.random() * ch,
          vx: Math.random() * 0.8 + 0.4, vy: Math.random() * 0.8 + 0.4,
          radius: Math.random() * 2 + 1,
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, cw, ch);
      ctx.fillStyle = color;
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x > cw) p.x = 0;
        if (p.y > ch) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });
      rafRef.current = requestAnimationFrame(draw);
    }

    const onResize = () => init();
    window.addEventListener("resize", onResize);
    init();
    draw();

    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(rafRef.current);
    };
  }, [color, enabled]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed", inset: 0, width: "100%", height: "100%",
        zIndex: 1, pointerEvents: "none",
      }}
    />
  );
}

// ─── Settings Page ────────────────────────────────────────────────────────────

interface SettingsProps {
  theme: string; setTheme: (t: string) => void;
  searchEngine: string; setSearchEngine: (e: string) => void;
  particlesEnabled: boolean; setParticlesEnabled: (v: boolean) => void;
  bgImage: string; setBgImage: (v: string) => void;
  t: Theme;
}

function SettingsPage({ theme, setTheme, searchEngine, setSearchEngine, particlesEnabled, setParticlesEnabled, bgImage, setBgImage, t }: SettingsProps) {
  const [bgInput, setBgInput] = useState(bgImage);
  const [panicKey, setPanicKey] = useState(() => localStorage.getItem("spatium_panic_key") || "");
  const [panicLink, setPanicLink] = useState(() => localStorage.getItem("spatium_panic_link") || "");
  const [panicSaved, setPanicSaved] = useState(false);

  function savePanic() {
    localStorage.setItem("spatium_panic_key", panicKey);
    localStorage.setItem("spatium_panic_link", panicLink);
    setPanicSaved(true);
    setTimeout(() => setPanicSaved(false), 1800);
  }

  function applyCloak(_label: string, title: string, icon: string) {
    document.title = title;
    if (icon) {
      let link = document.querySelector<HTMLLinkElement>("link[rel*='icon']");
      if (!link) { link = document.createElement("link"); link.rel = "shortcut icon"; document.head.appendChild(link); }
      link.href = icon;
    }
    localStorage.setItem("spatium_cloak_title", title);
    localStorage.setItem("spatium_cloak_icon", icon);
  }

  function resetCloak() {
    document.title = "Spatium";
    localStorage.removeItem("spatium_cloak_title");
    localStorage.removeItem("spatium_cloak_icon");
  }

  function openAboutBlank() {
    const w = window.open("about:blank", "_blank");
    if (w) {
      w.document.write(`<html><head><title>${document.title}</title></head><body style="margin:0;padding:0;overflow:hidden;background:#000"><iframe src="${window.location.href}" style="width:100%;height:100vh;border:none"></iframe></body></html>`);
      w.document.close();
    }
  }

  const cardStyle: React.CSSProperties = {
    background: t.cardBg, border: `1px solid ${t.border}`,
    borderRadius: "14px", padding: "22px 24px", marginBottom: "14px",
  };
  const h3Style: React.CSSProperties = { color: t.text, fontWeight: 700, fontSize: "0.95rem", marginBottom: "6px" };
  const pStyle: React.CSSProperties = { color: t.textGrey, fontSize: "0.82rem", lineHeight: 1.6, marginBottom: "12px" };
  const inputStyle: React.CSSProperties = {
    background: t.inputBg, border: `1px solid ${t.border}`,
    borderRadius: "8px", padding: "9px 13px",
    color: t.text, fontSize: "0.85rem", outline: "none",
    fontFamily: "'Figtree', sans-serif", width: "100%", marginBottom: "8px",
    boxSizing: "border-box",
  };
  const selectStyle: React.CSSProperties = { ...inputStyle, marginBottom: "0", cursor: "pointer", appearance: "none", WebkitAppearance: "none" };
  const btnStyle: React.CSSProperties = {
    background: t.accent, color: t.accentText,
    border: "none", borderRadius: "8px", padding: "9px 18px",
    fontSize: "0.82rem", fontWeight: 700, cursor: "pointer",
    fontFamily: "'Figtree', sans-serif", marginRight: "8px", marginTop: "8px",
  };
  const btnGhostStyle: React.CSSProperties = {
    ...btnStyle, background: "transparent", color: t.textGrey,
    border: `1px solid ${t.border}`,
  };

  const toggleStyle = (on: boolean): React.CSSProperties => ({
    width: "42px", height: "22px", borderRadius: "11px",
    background: on ? t.accent : t.border,
    position: "relative", cursor: "pointer", transition: "background 0.2s", flexShrink: 0,
  });
  const knobStyle = (on: boolean): React.CSSProperties => ({
    position: "absolute", top: "3px", left: on ? "23px" : "3px",
    width: "16px", height: "16px", borderRadius: "50%",
    background: on ? t.accentText : t.textGrey, transition: "left 0.2s",
  });

  return (
    <div style={{
      flex: 1, overflowY: "auto", padding: "28px 32px",
      background: t.bg, animation: "fadeInUp 0.5s ease-out",
    }}>
      <h2 style={{ color: t.text, fontWeight: 900, fontSize: "1.5rem", marginBottom: "6px", letterSpacing: "-1px" }}>Settings</h2>
      <p style={{ ...pStyle, marginBottom: "24px" }}>Customize your Spatium experience</p>

      {/* Themes */}
      <div style={cardStyle}>
        <h3 style={h3Style}>Themes</h3>
        <p style={pStyle}>Pick a theme to customize the look and feel of Spatium.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "8px" }}>
          {Object.entries(THEME_LABELS).map(([key, label]) => {
            const th = THEMES[key];
            const active = theme === key;
            return (
              <div key={key} onClick={() => setTheme(key)} style={{
                border: `2px solid ${active ? t.accent : t.border}`,
                borderRadius: "10px", padding: "10px 12px", cursor: "pointer",
                background: th.bg2, transition: "border-color 0.15s, transform 0.12s",
                transform: active ? "scale(1.03)" : "scale(1)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: th.accent, flexShrink: 0 }} />
                  <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: th.text, opacity: 0.5, flexShrink: 0 }} />
                  <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: th.textGrey, flexShrink: 0 }} />
                </div>
                <span style={{ fontSize: "0.72rem", color: th.text, fontWeight: 600 }}>{label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Particles */}
      <div style={cardStyle}>
        <h3 style={h3Style}>Particles</h3>
        <p style={pStyle}>Toggle the animated particle system in the background.</p>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={toggleStyle(particlesEnabled)} onClick={() => setParticlesEnabled(!particlesEnabled)}>
            <div style={knobStyle(particlesEnabled)} />
          </div>
          <span style={{ color: t.textGrey, fontSize: "0.82rem" }}>{particlesEnabled ? "Enabled" : "Disabled"}</span>
        </div>
      </div>

      {/* About:Blank */}
      <div style={cardStyle}>
        <h3 style={h3Style}>About:Blank Cloak</h3>
        <p style={pStyle}>Open Spatium inside an about:blank popup to hide the URL from the tab bar.</p>
        <button style={btnStyle} onClick={openAboutBlank}>Open in About:Blank</button>
      </div>

      {/* Panic Key */}
      <div style={cardStyle}>
        <h3 style={h3Style}>Panic Key</h3>
        <p style={pStyle}>Press a key to instantly redirect to a safe site. Separate multiple keys with a comma (e.g. "A,B").</p>
        <input style={inputStyle} placeholder="Panic key(s), e.g. Escape" value={panicKey} onChange={e => setPanicKey(e.target.value)} />
        <input style={inputStyle} placeholder="Redirect URL, e.g. https://google.com" value={panicLink} onChange={e => setPanicLink(e.target.value)} />
        <button style={btnStyle} onClick={savePanic}>{panicSaved ? "Saved!" : "Save"}</button>
      </div>

      {/* Tab Cloaker */}
      <div style={cardStyle}>
        <h3 style={h3Style}>Tab Cloaker</h3>
        <p style={pStyle}>Change the title and icon of this browser tab to blend in.</p>
        <div style={{ position: "relative", marginBottom: "10px" }}>
          <select style={selectStyle} onChange={e => {
            const cloak = TAB_CLOAKS.find(c => c.label === e.target.value);
            if (cloak) applyCloak(cloak.label, cloak.title, cloak.icon);
          }}>
            <option value="">Select a preset...</option>
            {TAB_CLOAKS.map(c => <option key={c.label} value={c.label}>{c.label}</option>)}
          </select>
        </div>
        <button style={btnGhostStyle} onClick={resetCloak}>Reset Cloak</button>
      </div>

      {/* Background Image */}
      <div style={cardStyle}>
        <h3 style={h3Style}>Background Image</h3>
        <p style={pStyle}>Set a custom background image URL for the home page.</p>
        <input style={inputStyle} placeholder="https://example.com/image.jpg" value={bgInput} onChange={e => setBgInput(e.target.value)} />
        <button style={btnStyle} onClick={() => setBgImage(bgInput)}>Apply</button>
        <button style={btnGhostStyle} onClick={() => { setBgInput(""); setBgImage(""); }}>Reset</button>
      </div>

      {/* Search Engine */}
      <div style={cardStyle}>
        <h3 style={h3Style}>Search Engine</h3>
        <p style={pStyle}>Choose which search engine is used when searching from the home page.</p>
        <div style={{ position: "relative" }}>
          <select style={selectStyle} value={searchEngine} onChange={e => setSearchEngine(e.target.value)}>
            <option value="duckduckgo">DuckDuckGo (Default)</option>
            <option value="google">Google</option>
            <option value="bing">Bing</option>
            <option value="brave">Brave Search</option>
          </select>
        </div>
      </div>

      {/* Info */}
      <div style={cardStyle}>
        <h3 style={h3Style}>Information</h3>
        <p style={{ ...pStyle, marginBottom: 0 }}>Version: v1.0.0 &nbsp;•&nbsp; Spatium</p>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [splash] = useState(() => SPLASH_MESSAGES[Math.floor(Math.random() * SPLASH_MESSAGES.length)]);
  const [input, setInput] = useState("");
  const [proxyUrl, setProxyUrl] = useState("");
  const [activeNav, setActiveNav] = useState<NavAction>("home");
  const inputRef = useRef<HTMLInputElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Persisted settings
  const [isLoading, setIsLoading] = useState(false);
  const [themeKey, setThemeKeyRaw] = useState<string>(() => localStorage.getItem("spatium_theme") || "default");
  const [searchEngine, setSearchEngineRaw] = useState(() => localStorage.getItem("spatium_engine") || "duckduckgo");
  const [particlesEnabled, setParticlesEnabledRaw] = useState(() => localStorage.getItem("spatium_particles") !== "false");
  const [bgImage, setBgImageRaw] = useState(() => localStorage.getItem("spatium_bg") || "");

  const setTheme = useCallback((t: string) => { setThemeKeyRaw(t); localStorage.setItem("spatium_theme", t); }, []);
  const setSearchEngine = useCallback((e: string) => { setSearchEngineRaw(e); localStorage.setItem("spatium_engine", e); }, []);
  const setParticlesEnabled = useCallback((v: boolean) => { setParticlesEnabledRaw(v); localStorage.setItem("spatium_particles", String(v)); }, []);
  const setBgImage = useCallback((v: string) => { setBgImageRaw(v); localStorage.setItem("spatium_bg", v); }, []);

  const t = THEMES[themeKey] || THEMES.default;

  // Load FA
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css";
    document.head.appendChild(link);
  }, []);

  // Restore cloak
  useEffect(() => {
    const ct = localStorage.getItem("spatium_cloak_title");
    const ci = localStorage.getItem("spatium_cloak_icon");
    if (ct) document.title = ct;
    if (ci) {
      let link = document.querySelector<HTMLLinkElement>("link[rel*='icon']");
      if (!link) { link = document.createElement("link"); link.rel = "shortcut icon"; document.head.appendChild(link); }
      link.href = ci;
    }
  }, []);

  // Panic key
  useEffect(() => {
    function onKey(e: globalThis.KeyboardEvent) {
      const keys = (localStorage.getItem("spatium_panic_key") || "").split(",").map(k => k.trim().toLowerCase()).filter(Boolean);
      const link = localStorage.getItem("spatium_panic_link") || "";
      if (link && keys.includes(e.key.toLowerCase())) window.location.href = link;
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Iframe nav messages
  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      if (e.data?.type === "navigate" && e.data.url) {
        const url: string = e.data.url;
        setInput(url);
        openProxy(url);
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [searchEngine]);

  function openProxy(url: string) {
    setIsLoading(true);
    setProxyUrl(toProxyUrl(url, searchEngine));
    setActiveNav("browser");
  }

  function handleSearch(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!input.trim()) return;
    openProxy(input);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleSearch();
  }

  function handleShortcut(url: string) { setInput(url); openProxy(url); }
  function handleBack() { setIsLoading(true); iframeRef.current?.contentWindow?.history.back(); }
  function handleForward() { setIsLoading(true); iframeRef.current?.contentWindow?.history.forward(); }
  function handleRefresh() { if (iframeRef.current) { setIsLoading(true); iframeRef.current.src = proxyUrl; } }
  function handleHome() { setActiveNav("home"); }
  function handleIframeLoad() { setIsLoading(false); }

  const CTRL: React.CSSProperties = {
    background: "transparent", border: "none", color: t.textGrey,
    padding: "6px 8px", borderRadius: "8px", fontSize: "0.95rem", cursor: "pointer",
  };
  const TT: React.CSSProperties = {
    position: "absolute", left: "68px", background: t.bg2, color: t.text,
    padding: "7px 13px", borderRadius: "8px", fontSize: "0.8rem", fontWeight: 600,
    whiteSpace: "nowrap", pointerEvents: "none", opacity: 0,
    transform: "translateX(-8px)", transition: "opacity 0.18s, transform 0.18s",
    border: `1px solid ${t.border}`, zIndex: 1000,
  };

  return (
    <div style={{
      display: "flex", height: "100vh", width: "100vw", overflow: "hidden",
      backgroundColor: t.bg, fontFamily: "'Figtree', sans-serif",
      backgroundImage: bgImage && activeNav === "home" ? `url(${bgImage})` : "none",
      backgroundSize: "cover", backgroundPosition: "center",
      transition: "background-color 0.3s",
    }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700;900&display=swap');
        @keyframes fadeInUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes progressBar { 0%{width:0%;margin-left:0} 50%{width:70%;margin-left:15%} 100%{width:0%;margin-left:100%} }
        @keyframes pulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.08);opacity:0.85} }
        @keyframes dot { 0%,80%,100%{transform:scale(0.7);opacity:0.4} 40%{transform:scale(1);opacity:1} }
        .ni { transition: background .15s, color .15s; cursor: pointer; }
        .ni:hover { background: rgba(128,128,128,.12) !important; }
        .ni:hover .tt { opacity: 1 !important; transform: translateX(0) !important; }
        .sc { transition: background .15s, border-color .15s, transform .15s; cursor: pointer; }
        .sc:hover { transform: translateY(-3px); opacity: 0.9; }
        .sw { transition: border-color .2s, background .2s; }
        .sw:focus-within { border-color: rgba(128,128,128,.4) !important; }
        .cb:hover { background: rgba(128,128,128,.12) !important; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(128,128,128,.2); border-radius: 3px; }
      `}</style>

      {/* Particle canvas */}
      <ParticleCanvas color={t.particleColor} enabled={particlesEnabled} />

      {/* ── Sidebar ── */}
      <nav style={{
        position: "relative", zIndex: 100, width: "75px", height: "100%", flexShrink: 0,
        background: t.sidebar, backdropFilter: "blur(20px)",
        borderRight: `1px solid ${t.border}`,
        display: "flex", flexDirection: "column",
        padding: "22px 0", alignItems: "center", gap: "4px",
        transition: "background 0.3s, border-color 0.3s",
      }}>
        <div style={{
          marginBottom: "22px", width: "36px", height: "36px", borderRadius: "10px",
          background: t.accent, display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "15px", fontWeight: 900, color: t.accentText, userSelect: "none",
        }}>S</div>

        {NAV_ITEMS.map((item) => {
          const active = activeNav === item.action;
          return (
            <div key={item.action} className="ni" onClick={() => setActiveNav(item.action)}
              style={{
                position: "relative", display: "flex", alignItems: "center", justifyContent: "center",
                width: "50px", height: "50px", borderRadius: "13px", margin: "0 auto 2px",
                color: active ? t.text : t.textGrey,
                background: active ? `${t.accent}18` : "transparent",
              }}>
              <i className={item.icon} style={{ fontSize: "1.15rem" }} />
              <div className="tt" style={TT}>{item.label}</div>
            </div>
          );
        })}

        <div style={{ marginTop: "auto" }}>
          {NAV_BOTTOM.map((item) => {
            const active = activeNav === item.action;
            return (
              <div key={item.action} className="ni" onClick={() => setActiveNav(item.action)}
                style={{
                  position: "relative", display: "flex", alignItems: "center", justifyContent: "center",
                  width: "50px", height: "50px", borderRadius: "13px", margin: "0 auto 2px",
                  color: active ? t.text : t.textGrey,
                  background: active ? `${t.accent}18` : "transparent",
                }}>
                <i className={item.icon} style={{ fontSize: "1.15rem" }} />
                <div className="tt" style={TT}>{item.label}</div>
              </div>
            );
          })}
        </div>
      </nav>

      {/* ── Main ── */}
      <div style={{ flexGrow: 1, position: "relative", zIndex: 10, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* HOME */}
        {activeNav === "home" && (
          <div style={{
            flex: 1, display: "flex", flexDirection: "column",
            justifyContent: "center", alignItems: "center", textAlign: "center",
            animation: "fadeInUp 0.55s ease-out", padding: "20px",
          }}>
            <h1 style={{
              fontSize: "clamp(4rem, 10vw, 7.5rem)", fontWeight: 900,
              marginBottom: "8px", letterSpacing: "-5px", lineHeight: 1,
              color: t.text, userSelect: "none",
            }}>Spatium</h1>

            <p style={{ fontSize: "0.93rem", color: t.textGrey, marginBottom: "38px", letterSpacing: "2px", textTransform: "lowercase" }}>
              {splash}
            </p>

            <form onSubmit={handleSearch} style={{ width: "100%", maxWidth: "520px", marginBottom: "28px" }}>
              <div className="sw" style={{
                background: t.inputBg, border: `1px solid ${t.border}`,
                borderRadius: "13px", padding: "15px 18px",
                display: "flex", alignItems: "center", gap: "12px",
              }}>
                <i className="fa-solid fa-magnifying-glass" style={{ color: t.textGrey, fontSize: "0.9rem" }} />
                <input
                  type="text" value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search or enter a URL..."
                  autoComplete="off"
                  style={{
                    background: "none", border: "none", outline: "none",
                    color: t.text, fontSize: "1rem", width: "100%",
                    fontFamily: "'Figtree', sans-serif",
                  }}
                />
                <button type="submit" style={{
                  background: `${t.accent}18`, border: `1px solid ${t.border}`,
                  color: t.text, padding: "7px 16px", borderRadius: "8px",
                  fontSize: "0.82rem", fontWeight: 600, cursor: "pointer",
                  fontFamily: "'Figtree', sans-serif", transition: "background .15s",
                }}>Go</button>
              </div>
            </form>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center" }}>
              {SHORTCUTS.map(s => (
                <div key={s.name} className="sc" onClick={() => handleShortcut(s.url)}
                  style={{
                    background: t.cardBg, border: `1px solid ${t.border}`,
                    padding: "16px", borderRadius: "13px",
                    width: "92px", height: "92px",
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center", gap: "9px",
                  }}>
                  <i className={s.icon} style={{ fontSize: "20px", color: t.textGrey }} />
                  <span style={{ fontSize: "0.58rem", textTransform: "uppercase", letterSpacing: "1px", color: t.textGrey, fontWeight: 700 }}>
                    {s.name}
                  </span>
                </div>
              ))}
            </div>

            <p style={{ position: "absolute", bottom: "22px", fontSize: "0.66rem", color: t.textDim, letterSpacing: "1.5px" }}>
              ENCRYPTED CONNECTION • SPATIUM
            </p>
          </div>
        )}

        {/* BROWSER */}
        {activeNav === "browser" && (
          <div style={{ display: "flex", flexDirection: "column", height: "100%", position: "relative" }}>

            {/* Top bar */}
            <div style={{
              display: "flex", alignItems: "center", gap: "8px",
              padding: "9px 14px", background: t.sidebar,
              backdropFilter: "blur(10px)", borderBottom: `1px solid ${t.border}`, flexShrink: 0,
              position: "relative", zIndex: 20,
            }}>
              <button className="cb" style={CTRL} onClick={handleHome} title="Home"><i className="fa-solid fa-house" /></button>
              <button className="cb" style={CTRL} onClick={handleBack} title="Back"><i className="fa-solid fa-arrow-left" /></button>
              <button className="cb" style={CTRL} onClick={handleForward} title="Forward"><i className="fa-solid fa-arrow-right" /></button>
              <button className="cb" style={{ ...CTRL, ...(isLoading ? { color: t.accent } : {}) }}
                onClick={isLoading ? () => { if (iframeRef.current) iframeRef.current.src = ""; setIsLoading(false); } : handleRefresh}
                title={isLoading ? "Stop" : "Refresh"}>
                <i className={`fa-solid ${isLoading ? "fa-xmark" : "fa-rotate-right"}`}
                  style={{ animation: isLoading ? "spin 0.8s linear infinite" : "none" }} />
              </button>

              <div className="sw" style={{
                flex: 1, background: t.inputBg, border: `1px solid ${t.border}`,
                borderRadius: "9px", padding: "7px 14px",
                display: "flex", alignItems: "center", gap: "9px",
              }}>
                <i className={`fa-solid fa-${isLoading ? "circle-notch" : "lock"}`}
                  style={{ color: t.textGrey, fontSize: "0.72rem", animation: isLoading ? "spin 0.8s linear infinite" : "none" }} />
                <input
                  ref={inputRef}
                  type="text" value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search or enter a URL..."
                  style={{
                    background: "none", border: "none", outline: "none",
                    color: t.text, fontSize: "0.88rem", width: "100%",
                    fontFamily: "'Figtree', sans-serif",
                  }}
                />
                <button className="cb" onClick={() => handleSearch()}
                  style={{ ...CTRL, padding: "0 4px", fontSize: "0.85rem" }}>
                  <i className="fa-solid fa-arrow-right" />
                </button>
              </div>

              <div style={{ fontSize: "0.66rem", color: isLoading ? t.textGrey : t.textDim, letterSpacing: "1px", whiteSpace: "nowrap" }}>
                {isLoading ? "LOADING..." : "SECURED • OK"}
              </div>
            </div>

            {/* Loading progress bar */}
            {isLoading && (
              <div style={{ position: "absolute", top: "51px", left: 0, right: 0, height: "2px", zIndex: 30, overflow: "hidden" }}>
                <div style={{
                  height: "100%", background: t.accent,
                  animation: "progressBar 1.8s ease-in-out infinite",
                }} />
              </div>
            )}

            {/* Loading overlay */}
            {isLoading && (
              <div style={{
                position: "absolute", inset: 0, top: "51px",
                background: t.bg, zIndex: 15,
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", gap: "20px",
                animation: "fadeInUp 0.2s ease-out",
              }}>
                <div style={{
                  width: "48px", height: "48px", borderRadius: "14px",
                  background: t.accent, display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: "20px", fontWeight: 900,
                  color: t.accentText, animation: "pulse 1.5s ease-in-out infinite",
                }}>S</div>
                <div style={{ textAlign: "center" }}>
                  <p style={{ color: t.text, fontSize: "0.9rem", fontWeight: 700, margin: "0 0 6px" }}>Loading</p>
                  <p style={{ color: t.textGrey, fontSize: "0.78rem", margin: 0, maxWidth: "260px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {input || "Please wait..."}
                  </p>
                </div>
                <div style={{ display: "flex", gap: "6px" }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{
                      width: "6px", height: "6px", borderRadius: "50%",
                      background: t.textGrey,
                      animation: `dot 1.2s ease-in-out ${i * 0.2}s infinite`,
                    }} />
                  ))}
                </div>
              </div>
            )}

            <iframe ref={iframeRef} src={proxyUrl}
              onLoad={handleIframeLoad}
              style={{ flex: 1, border: "none", width: "100%", height: "100%" }}
              sandbox="allow-scripts allow-forms allow-same-origin allow-popups allow-modals allow-downloads"
              title="Spatium Browser" />
          </div>
        )}

        {/* GAMES */}
        {activeNav === "games" && (
          <iframe src="https://drank-was-here.b-cdn.net/"
            style={{ flex: 1, border: "none", width: "100%", height: "100%" }}
            allow="fullscreen; autoplay" title="Spatium Games" />
        )}

        {/* SETTINGS */}
        {activeNav === "settings" && (
          <SettingsPage
            theme={themeKey} setTheme={setTheme}
            searchEngine={searchEngine} setSearchEngine={setSearchEngine}
            particlesEnabled={particlesEnabled} setParticlesEnabled={setParticlesEnabled}
            bgImage={bgImage} setBgImage={setBgImage}
            t={t}
          />
        )}
      </div>
    </div>
  );
}
