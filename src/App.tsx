import { useCallback, useEffect, useState } from 'react';
import { Shield, GraduationCap, ShieldCheck, Sparkles, MessageSquare, Trash2, ArrowRight, Plus } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Sidebar, { type View } from '@/components/Sidebar';
import OnboardingModal from '@/components/OnboardingModal';
import VerificationEngine from '@/components/VerificationEngine';
import QuizEngine from '@/components/QuizEngine';
import Chatbot from '@/components/Chatbot';
import HelplinesPage from '@/components/HelplinesPage';
import { RobotSVG } from '@/components/Robot';
import type { AnalysisResult, ChatSession, Theme, UserProfile } from '@/lib/types';

const KEY_USER = 'trustai_user';
const KEY_THEME = 'trustai_theme';
const KEY_HISTORY = 'trustai_history';
const KEY_ONBOARDED = 'trustai_onboarded';
const KEY_CHAT_SESSIONS = 'trustai_chat_sessions';

function App() {
  const [theme, setTheme] = useState<Theme>('default');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [view, setView] = useState<View>('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);

  useEffect(() => {
    try {
      const t = (localStorage.getItem(KEY_THEME) as Theme) || 'default';
      if (t === 'default' || t === 'dark' || t === 'cyber') setTheme(t);
      const rawUser = localStorage.getItem(KEY_USER);
      if (rawUser) setUser(JSON.parse(rawUser));
      const rawHistory = localStorage.getItem(KEY_HISTORY);
      if (rawHistory) setHistory(JSON.parse(rawHistory));
      const onboarded = localStorage.getItem(KEY_ONBOARDED);
      if (!rawUser && !onboarded) setShowOnboarding(true);
      const rawChatSessions = localStorage.getItem(KEY_CHAT_SESSIONS);
      if (rawChatSessions) setChatSessions(JSON.parse(rawChatSessions) as ChatSession[]);
    } catch {
      // localStorage not available
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(KEY_THEME, theme);
    } catch {
      // ignore
    }
  }, [theme, hydrated]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [view]);

  const handleOnboard = (profile: UserProfile) => {
    setUser(profile);
    try {
      localStorage.setItem(KEY_USER, JSON.stringify(profile));
      localStorage.setItem(KEY_ONBOARDED, '1');
    } catch {
      // ignore
    }
    setShowOnboarding(false);
  };

  const handleSaveAnalysis = useCallback((r: AnalysisResult) => {
    setHistory((prev) => {
      const next = [r, ...prev].slice(0, 25);
      try {
        localStorage.setItem(KEY_HISTORY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(KEY_HISTORY);
    } catch {
      // ignore
    }
  };

  const deleteChatSession = (id: string) => {
    const next = chatSessions.filter((s) => s.id !== id);
    setChatSessions(next);
    try {
      localStorage.setItem(KEY_CHAT_SESSIONS, JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const renderChatHistory = () => (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-app">Chat History</h1>
          <p className="text-sm text-muted">Your past conversations with TrustAI — stored locally on your device.</p>
        </div>
        <button
          onClick={() => {
            setChatOpen(true);
            setView('home');
          }}
          className="btn-glow flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold"
        >
          <Plus size={14} /> New Chat
        </button>
      </div>
      {chatSessions.length === 0 ? (
        <div className="glass-card mt-6 p-10 text-center">
          <MessageSquare className="mx-auto text-[var(--primary)]" size={36} />
          <p className="mt-4 text-sm text-muted">No chat sessions yet. Start a conversation with TrustAI!</p>
          <button
            onClick={() => {
              setChatOpen(true);
              setView('home');
            }}
            className="btn-primary mt-4 rounded-xl px-4 py-2 text-sm font-semibold"
          >
            Start Chatting
          </button>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {chatSessions.map((s) => (
            <div key={s.id} className="glass-card group p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <MessageSquare className="text-[var(--primary)]" size={16} />
                  <span className="text-sm font-bold text-app">{s.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted">{new Date(s.updatedAt).toLocaleString()}</span>
                  <button
                    onClick={() => deleteChatSession(s.id)}
                    aria-label="Delete chat session"
                    className="opacity-0 transition group-hover:opacity-100 btn-ghost flex h-8 w-8 items-center justify-center rounded-lg"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <p className="mt-2 line-clamp-2 text-xs text-muted">
                {s.messages.filter((m) => m.role === 'user').length} messages
              </p>
              <button
                onClick={() => {
                  setChatOpen(true);
                  setView('home');
                }}
                className="btn-ghost mt-3 flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold"
              >
                Load conversation <ArrowRight size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderHome = () => (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <div className="text-center animate-fade-up">
        <div className="mx-auto mb-4 flex justify-center">
          <RobotSVG waving size={120} />
        </div>
        <p className="text-xs font-bold uppercase tracking-widest text-[var(--primary)]">Your Digital Safety Companion</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-app sm:text-5xl">
          Welcome{user?.name ? `, ${user.name}` : ''}.
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-base text-muted">
          Verify suspicious content, spot scams in seconds, and level up your digital safety skills — all with your own AI companion.
        </p>
      </div>
      <div className="mt-12 flex flex-col items-center gap-4">
        <button
          onClick={() => setView('verify')}
          className="btn-glow flex w-full max-w-md items-center justify-center gap-3 rounded-2xl px-6 py-5 text-base font-bold"
        >
          <Shield size={22} />
          Analyze Content &amp; Links
        </button>
        <button
          onClick={() => setView('quiz')}
          className="btn-glow flex w-full max-w-md items-center justify-center gap-3 rounded-2xl px-6 py-5 text-base font-bold"
        >
          <GraduationCap size={22} />
          Interactive Safety Training
        </button>
      </div>
      <div className="mt-16 grid gap-4 sm:grid-cols-3">
        {[
          { Icon: ShieldCheck, title: 'Deep verification', text: 'AI-powered verdicts with sources and tactical breakdowns.' },
          { Icon: Sparkles, title: 'Learn by doing', text: '15-question levels teach you to spot real-world scams.' },
          { Icon: GraduationCap, title: 'Personal & private', text: 'Your history lives only on this device.' },
        ].map(({ Icon, title, text }) => (
          <div key={title} className="glass-card p-5">
            <Icon className="text-[var(--primary)]" size={22} />
            <h3 className="mt-3 text-sm font-bold text-app">{title}</h3>
            <p className="mt-1 text-xs text-muted">{text}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderHistory = () => (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-app">Analysis History</h1>
          <p className="text-sm text-muted">Past verifications — stored locally on your device.</p>
        </div>
        {history.length > 0 && (
          <button onClick={clearHistory} className="btn-ghost rounded-xl px-3 py-2 text-xs font-semibold">
            Clear
          </button>
        )}
      </div>
      {history.length === 0 ? (
        <div className="glass-card mt-6 p-10 text-center">
          <p className="text-sm text-muted">No history yet. Try analyzing something!</p>
          <button onClick={() => setView('verify')} className="btn-primary mt-4 rounded-xl px-4 py-2 text-sm font-semibold">
            Analyze Content
          </button>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {history.map((r) => {
            const color =
              r.verdict === 'Fraud/Scam'
                ? 'var(--danger)'
                : r.verdict === 'Verified/Safe'
                  ? 'var(--success)'
                  : r.verdict === 'Misleading'
                    ? 'var(--warning)'
                    : r.verdict === 'Satire'
                      ? 'var(--info)'
                      : 'var(--muted)';
            return (
              <div key={r.id} className="glass-card p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="rounded-full border px-3 py-1 text-xs font-bold" style={{ borderColor: color, color }}>
                    {r.verdict}
                  </span>
                  <span className="text-xs text-muted">{new Date(r.analyzedAt).toLocaleString()}</span>
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-app">{r.summary}</p>
                <p className="mt-1 text-xs text-muted">Trust score: {r.trustScore}% · Risk: {r.riskLevel}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderAbout = () => (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-black text-app">About TrustAI</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        TrustAI is a hackathon-built digital safety companion that helps everyday internet users verify suspicious content
        and learn to spot scams, misinformation, and manipulation. Powered by Google Gemini and built with React.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="glass-card p-5">
          <h3 className="text-sm font-bold text-app">Privacy-first</h3>
          <p className="mt-1 text-xs text-muted">Your name, history, and preferences stay in your browser.</p>
        </div>
        <div className="glass-card p-5">
          <h3 className="text-sm font-bold text-app">AI-powered</h3>
          <p className="mt-1 text-xs text-muted">Every verdict includes sources, tactics, and expert explanation.</p>
        </div>
        <div className="glass-card p-5">
          <h3 className="text-sm font-bold text-app">Learn &amp; level up</h3>
          <p className="mt-1 text-xs text-muted">Interactive training with fresh questions every round.</p>
        </div>
        <div className="glass-card p-5">
          <h3 className="text-sm font-bold text-app">Built by Team OffGrids</h3>
          <p className="mt-1 text-xs text-muted">A hackathon project — no data sold, ever.</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-app-gradient">
      <Navbar
        theme={theme}
        onThemeChange={setTheme}
        onMenuClick={() => setSidebarOpen(true)}
        onLogoClick={() => setView('home')}
      />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} onNavigate={(v) => setView(v)} />
      <main className="min-h-[calc(100vh-160px)]">
        {view === 'home' && renderHome()}
        {view === 'verify' && (
          <VerificationEngine user={user} onSaved={handleSaveAnalysis} onBack={() => setView('home')} />
        )}
        {view === 'quiz' && <QuizEngine onBack={() => setView('home')} />}
        {view === 'helplines' && <HelplinesPage lang={'en'} />}
        {view === 'history' && renderHistory()}
        {view === 'chat-history' && renderChatHistory()}
        {view === 'about' && renderAbout()}
      </main>
      <footer className="border-t border-app py-6 text-center text-xs text-muted">
        © 2026 TrustAI. Created by Team OffGrids
      </footer>
      {showOnboarding && <OnboardingModal onComplete={handleOnboard} />}
      <Chatbot user={user} open={chatOpen} onOpenChange={setChatOpen} />
    </div>
  );
}

export default App;
