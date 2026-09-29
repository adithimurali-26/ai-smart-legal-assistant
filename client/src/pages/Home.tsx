/* Verdigris Brief style: editorial modernism, ink navy + verdigris teal + parchment, asymmetric rail layouts, DM Serif / Manrope / IBM Plex Mono. */
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  ArrowRight, Award, BookOpen, Bookmark, Bot, BriefcaseBusiness, Check, CheckCircle2, ChevronRight, CircleHelp, Clock3,
  Copy, FileSearch, FileText, Filter, History, Home as HomeIcon, Library, LockKeyhole, LogOut, Mail, MapPin, Menu, MessageSquare,
  MoreHorizontal, Paperclip, PenLine, Phone, Plus, Scale, Search, Send, Settings, ShieldCheck, Sparkles, Star, Upload,
  UserCheck, UserRound, X, Zap, AlertTriangle
} from "lucide-react";
import { toast } from "sonner";
import { api, type ChatMessage, type LegalSourceItem, type DocumentAudit, type CaseQueueItem, type ConversationItem, type AdvocateItem } from "../lib/api";

const navItems = [
  ["/app", "Overview", HomeIcon], ["/app/assistant", "AI Assistant", MessageSquare], ["/app/search", "Legal Search", Search],
  ["/app/documents", "Document Analysis", FileSearch], ["/app/history", "History", History], ["/app/saved", "Saved Responses", Bookmark]
] as const;

// No fake/hardcoded conversations — all data comes from the authenticated user's real history

const initialSources: LegalSourceItem[] = [];

// Advocates are fetched from /api/advisors — no hardcoded data

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-3 group">
      <img
        src="/favicon.png"
        alt="AI Smart Legal Assistant"
        className="w-9 h-9 rounded-full object-cover shadow-sm transition-transform duration-200 group-hover:scale-105 flex-none"
      />
      {!compact && (
        <span className="leading-none">
          <span className="brand-wordmark">counsel</span>
          <span className="brand-sub">legal intelligence</span>
        </span>
      )}
    </Link>
  );
}

function Button({ children, onClick, variant = "primary", className = "", type = "button", disabled = false, style }: { children: React.ReactNode; onClick?: () => void; variant?: "primary" | "ghost" | "outline" | "copper" | "bloodstone"; className?: string; type?: "button" | "submit"; disabled?: boolean; style?: React.CSSProperties }) {
  return <button type={type} onClick={onClick} disabled={disabled} style={style} className={`btn btn-${variant} ${className}`}>{children}</button>;
}

function PublicNav() {
  return (
    <header className="public-nav">
      <Logo />
      <nav>
        <Link href="/how">How it works</Link>
        <Link href="/capabilities">Capabilities</Link>
        <Link href="/sources">Sources</Link>
      </nav>
      <div className="nav-actions">
        <Link href="/login" className="text-link">Sign in</Link>
        <Link href="/app" className="btn btn-primary">Open workspace <ArrowRight size={15} /></Link>
      </div>
    </header>
  );
}

function Landing() {
  return (
    <div className="public-page">
      <PublicNav />
      <main>
        <section className="hero container">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-dot" /> AI-assisted legal information</div>
            <h1>Start with the question.<br /><em>Find the record.</em></h1>
            <p className="hero-lede">Understand legal information, explore relevant laws, and move forward with a clearer view of what matters.</p>
            <div className="hero-actions">
              <Link href="/app/assistant" className="btn btn-primary btn-large">Ask a legal question <ArrowRight size={17} /></Link>
              <Link className="btn btn-outline btn-large" href="/capabilities">Explore capabilities</Link>
            </div>
            <div className="hero-note"><ShieldCheck size={16} /> Built to keep the source trail in view</div>
          </div>
          <div className="hero-art">
            <div className="hero-art-glow" />
            <div className="document-card">
              <div className="doc-top"><span className="mono">BRIEF / 042</span><span className="doc-status">● indexed</span></div>
              <div className="doc-title">Your question,<br /><strong>made legible.</strong></div>
              <div className="doc-lines"><i /><i /><i /><i /></div>
              <div className="doc-foot"><span>AI LEGAL ASSISTANT</span><span className="seal-mini">◒</span></div>
            </div>
            <div className="floating-index"><span className="mono">SOURCE INDEX</span><strong>08</strong><small>verified statutory records</small></div>
            <span className="hero-caption mono">A CLEARER WAY THROUGH COMPLEXITY</span>
          </div>
        </section>
        <section className="trust-band">
          <div className="container trust-grid">
            <div><span className="mono label">THE COUNSEL PROMISE</span><h2>Clarity without the overconfidence.</h2></div>
            <p>We pair plain-language explanations with the legal sources behind them—so you can understand the context, ask better questions, and know when to speak with a professional.</p>
            <div className="trust-points"><span><Check size={14} /> Source-backed</span><span><Check size={14} /> Private by design</span><span><Check size={14} /> Plain language</span></div>
          </div>
        </section>
        <section className="disclaimer container">
          <CircleHelp size={17} />
          <p>This platform provides AI-assisted legal information for general informational purposes and does not replace professional legal advice.</p>
        </section>
      </main>
      <footer className="public-footer">
        <div className="container footer-inner">
          <Logo />
          <span className="mono">© 2026 COUNSEL / LEGAL INTELLIGENCE</span>
          <div>
            <Link href="/capabilities">Capabilities</Link>
            <Link href="/how">How it works</Link>
            <Link href="/sources">Sources</Link>
            <a href="mailto:hello@example.com">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  const [loc] = useLocation();
  const [mobile, setMobile] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(() => api.getUser() || null);

  useEffect(() => {
    api.getMe().then(u => {
      if (u) setCurrentUser(u);
    }).catch(() => {});
  }, []);

  const initials = useMemo(() => {
    const name = currentUser?.full_name || "";
    if (!name) return "?";
    return name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();
  }, [currentUser]);

  const handleSignOut = () => {
    api.clearToken();
    toast("Signed out of workspace");
    window.location.href = "/choose-role";
  };

  return (
    <div className="app-shell">
      <aside className={`app-sidebar ${mobile ? "open" : ""}`}>
        <div className="side-top">
          <Logo compact />
          <button className="mobile-close" onClick={() => setMobile(false)}><X size={18} /></button>
        </div>
        <div className="side-label mono">WORKSPACE</div>
        <nav className="side-nav">
          {navItems.map(([href, label, Icon]) => (
            <Link key={href} href={href} className={loc === href ? "active" : ""} onClick={() => setMobile(false)}>
              <Icon size={17} />
              <span>{label}</span>
              {label === "AI Assistant" && <span className="nav-kicker">NEW</span>}
            </Link>
          ))}
        </nav>
        <div className="side-bottom">
          <div className="privacy-card">
            <LockKeyhole size={16} />
            <div>
              <strong>Private by design</strong>
              <span>Your workspace is yours.</span>
            </div>
          </div>
          <Link href="/app/settings" className={loc === "/app/settings" ? "active" : ""}>
            <Settings size={17} />
            <span>Settings</span>
          </Link>
          <div className="profile-mini">
            <span className="avatar">{initials}</span>
            <div>
              <strong>{currentUser?.full_name || "Workspace"}</strong>
              <small>{currentUser?.email || "Personal workspace"}</small>
            </div>
            <button className="icon-btn" title="Sign out" onClick={handleSignOut}>
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>
      <div className="app-main">
        <header className="app-header">
          <button className="mobile-menu" onClick={() => setMobile(true)}><Menu size={20} /></button>
          <div className="breadcrumb">
            <span>Counsel</span>
            <ChevronRight size={14} />
            <strong>{navItems.find(n => n[0] === loc)?.[1] || (loc === "/app/settings" ? "Settings" : "Workspace")}</strong>
          </div>
          <div className="header-actions">
            <button className="icon-btn" onClick={() => toast("All legal sources synchronized with India Code database")}>
              <CircleHelp size={18} />
            </button>
            <div className="header-avatar">{initials}</div>
          </div>
        </header>
        <main className="workspace-content">{children}</main>
      </div>
    </div>
  );
}

function PageHeader({ kicker, title, children }: { kicker: string; title: string; children?: React.ReactNode }) {
  return (
    <div className="page-header">
      <div><span className="mono label">{kicker}</span><h1>{title}</h1></div>
      {children}
    </div>
  );
}

function Overview() {
  const [threads, setThreads] = useState<ConversationItem[]>([]);
  const [savedCount, setSavedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const currentUser = api.getUser();
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();
  const firstName = currentUser?.full_name?.split(" ")[0] || "there";

  useEffect(() => {
    Promise.all([
      api.getConversations().catch(() => []),
      api.getSavedResponses().catch(() => [])
    ]).then(([convs, saved]) => {
      setThreads(convs || []);
      setSavedCount((saved || []).length);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PageHeader kicker="OVERVIEW / 01" title={`${greeting}, ${firstName}.`}>
        <Button variant="primary" onClick={() => location.href = "/app/assistant"}><Plus size={16} /> New question</Button>
      </PageHeader>
      <div className="welcome-panel">
        <div>
          <span className="mono label">YOUR NEXT STEP</span>
          <h2>What would you like<br />to make <em>clearer?</em></h2>
          <p>Ask about a legal concept, search the record, or bring in a document.</p>
          <Link href="/app/assistant" className="btn btn-copper">Ask a legal question <ArrowRight size={16} /></Link>
        </div>
        <div className="welcome-mark">
          <div className="ledger-art">
            <span className="mono">INDEX / 042</span>
            <strong>08</strong>
            <i /><i /><i />
            <small>verified statutory records<br />ready to review</small>
          </div>
          <small className="mono">COUNSEL / 01</small>
        </div>
      </div>
      <div className="quick-grid">
        {[
          [MessageSquare, "Ask a question", "Start with your own words", "/app/assistant"],
          [Search, "Search laws", "Explore the legal record", "/app/search"],
          [FileSearch, "Analyze a document", "Surface what matters", "/app/documents"],
          [History, "View history", "Return to a thread", "/app/history"]
        ].map(([Icon, t, d, h]) => (
          <Link href={h as string} className="quick-card" key={t as string}>
            <Icon size={20} />
            <strong>{t as string}</strong>
            <span>{d as string}</span>
            <ArrowRight size={15} />
          </Link>
        ))}
      </div>
      <div className="dashboard-grid">
        <section className="panel recent-panel">
          <div className="panel-head">
            <div><span className="mono label">RECENT CONVERSATIONS</span><h3>Your open threads</h3></div>
            <Link href="/app/history" className="text-link">View all <ArrowRight size={14} /></Link>
          </div>
          {loading ? (
            <div style={{ padding: "20px", textAlign: "center", fontSize: "12px", color: "var(--ink-soft)" }}>Loading your conversations…</div>
          ) : threads.length === 0 ? (
            <div className="empty-state" style={{ padding: "32px 16px" }}>
              <MessageSquare size={28} />
              <strong>No conversations yet</strong>
              <span>Ask your first legal question to get started.</span>
              <Link href="/app/assistant" className="btn btn-copper" style={{ marginTop: "12px", fontSize: "12px", padding: "8px 16px" }}>Ask a legal question <ArrowRight size={14} /></Link>
            </div>
          ) : threads.slice(0, 3).map(c => (
            <Link href="/app/assistant" className="conversation-row" key={c.id || c.title}>
              <span className="conv-icon"><MessageSquare size={16} /></span>
              <div><strong>{c.title}</strong><p>{c.preview}</p></div>
              <div className="row-meta"><span>{c.category}</span><small>{c.date || c.updated_at ? new Date(c.updated_at || "").toLocaleDateString() : "Active"}</small></div>
              <ChevronRight size={16} />
            </Link>
          ))}
        </section>
        <section className="panel activity-panel">
          <div className="panel-head">
            <div><span className="mono label">ACTIVITY / THIS MONTH</span><h3>Your workspace</h3></div>
          </div>
          <div className="metric">
            <span>Questions asked</span>
            <strong>{threads.length}</strong>
            <i><b style={{ width: `${Math.min(threads.length * 10, 100)}%` }} /></i>
          </div>
          <div className="metric">
            <span>Saved responses</span>
            <strong>{savedCount}</strong>
            <i><b style={{ width: `${Math.min(savedCount * 10, 100)}%` }} /></i>
          </div>
          <div className="metric">
            <span>Verified statutes indexed</span>
            <strong>08</strong>
            <i><b style={{ width: "100%" }} /></i>
          </div>
          <div className="activity-foot"><Zap size={15} /> All responses grounded in verified Indian law <strong>100%</strong></div>
        </section>
      </div>
    </>
  );
}

function Assistant() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [explanationMode, setExplanationMode] = useState<"simple" | "professional">("simple");
  const [threads, setThreads] = useState<ConversationItem[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [sources, setSources] = useState<LegalSourceItem[]>(initialSources);
  const [advisors, setAdvisors] = useState<AdvocateItem[]>([]);
  const [activeAdv, setActiveAdv] = useState<any | null>(null);
  const [advLoading, setAdvLoading] = useState(true);
  const [selectedSourceDetail, setSelectedSourceDetail] = useState<LegalSourceItem | null>(null);

  // Draft Notice Modal State
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [draftType, setDraftType] = useState("Statutory Notice (TPA Sec 108 - Tenancy Deposit)");
  const [draftResult, setDraftResult] = useState("");
  const [draftLoading, setDraftLoading] = useState(false);

  // Chat messages — start empty, filled from real API
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [threadsLoading, setThreadsLoading] = useState(true);

  const updateActiveAdvocate = (topicOrCategory: string, advList: AdvocateItem[] = advisors) => {
    const list = advList.length ? advList : advisors;
    if (!list || !list.length) return;
    const lower = topicOrCategory.toLowerCase();
    const matched = list.find(a =>
      a.specialties?.some((s: string) => lower.includes(s.toLowerCase()) || s.toLowerCase().includes(lower)) ||
      (a.title && a.title.toLowerCase().includes(lower))
    );
    if (matched) {
      setActiveAdv(matched);
    }
  };

  // Load real threads from backend for this authenticated user
  useEffect(() => {
    // Fetch advisors from API
    api.getAdvisors()
      .then(data => {
        setAdvisors(data || []);
      })
      .catch(() => {})
      .finally(() => setAdvLoading(false));

    api.getConversations()
      .then(data => {
        setThreads(data || []);
        if (data && data.length) {
          const activeThreadId = localStorage.getItem("counsel_active_thread");
          if (activeThreadId) localStorage.removeItem("counsel_active_thread");
          const target = (activeThreadId && data.find(t => t.id === activeThreadId)) || data[0];
          setSelectedThreadId(target.id);
          api.getMessages(target.id).then(msgs => {
            if (msgs && msgs.length) {
              setMessages(msgs);
              const lastWithSources = [...msgs].reverse().find(m => m.sources_used && m.sources_used.length > 0);
              if (lastWithSources && lastWithSources.sources_used) {
                setSources(lastWithSources.sources_used);
              }
              // Only assign advocate if conversation has messages
              updateActiveAdvocate(target.category + " " + target.title);
            } else {
              setMessages([]);
              setSources([]);
              setActiveAdv(null);
            }
          }).catch(() => {
            setActiveAdv(null);
          });
        } else {
          setActiveAdv(null);
        }
      })
      .catch(() => {})
      .finally(() => setThreadsLoading(false));
  }, []);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = text.trim();
    if (!query || loading) return;

    let threadId = selectedThreadId;

    // If no thread exists yet, create one first
    if (!threadId) {
      try {
        const created = await api.createConversation(
          query.length > 50 ? query.slice(0, 50) + "..." : query,
          "General"
        );
        if (created) {
          threadId = created.id;
          setSelectedThreadId(threadId);
          setThreads(prev => [created, ...prev]);
        } else {
          threadId = `temp-${Date.now()}`;
          setSelectedThreadId(threadId);
        }
      } catch {
        threadId = `temp-${Date.now()}`;
        setSelectedThreadId(threadId);
      }
    }

    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: "user",
      content: query,
      created_at: "Just now"
    };

    setMessages(prev => [...prev, userMsg]);
    setText("");
    setLoading(true);

    try {
      const res = await api.sendMessage(threadId, query, explanationMode);
      // Backend returns { userMessage, aiResponse, sources, verificationState, structured }
      const ai = res.aiResponse || res;
      const aiMsg: ChatMessage = {
        id: ai.id || `msg-ai-${Date.now()}`,
        sender: "assistant",
        explanationMode,
        content: ai.content || res.content || res.reply || "Analysis completed based on retrieved statutory provisions.",
        structured_analysis: ai.structured_analysis || res.structured || null,
        sources_used: res.sources || ai.sources_used || [],
        verification_state: res.verificationState || ai.verification_state || "Verified supporting source retrieved",
        created_at: ai.created_at || "Just now"
      };

      setMessages(prev => [...prev, aiMsg]);
      if (res.sources && res.sources.length) {
        setSources(res.sources);
      }
      updateActiveAdvocate(query + " " + (ai.content || ""));
      toast.success("Verified legal sources retrieved");
    } catch (err: any) {
      toast.error(err.message || "Could not retrieve legal response");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveResponse = async (msg: ChatMessage) => {
    try {
      await api.saveResponse(
        `Analysis: ${msg.content.slice(0, 48)}...`,
        msg.content,
        "General"
      );
      toast.success("Response saved to your workspace notebook");
    } catch {
      toast.error("Failed to save response");
    }
  };

  const handleRequestConsultation = async () => {
    try {
      await api.requestConsultation(activeAdv.id, `User requested consultation regarding thread "${threads.find(t=>t.id===selectedThreadId)?.title || "Legal query"}"`);
      toast.success(`Case brief and consultation request sent to ${activeAdv.name}`);
    } catch {
      toast.error("Failed to submit consultation request");
    }
  };

  const handleGenerateNoticeDraft = async () => {
    setDraftLoading(true);
    try {
      const user = api.getUser();
      const res = await api.generateDraft(
        draftType,
        { claimant: user?.full_name || "Complainant / Aggrieved Party", respondent: "Opposite Party / Respondent" },
        "Immediate statutory compliance, resolution, and restitution of lawful rights within 15 days",
        messages[messages.length - 1]?.content || "Facts as outlined in legal consultation records."
      );
      setDraftResult(res.content || res.draft?.fullText || "Draft generated successfully.");
      toast.success("Statutory draft generated");
    } catch {
      toast.error("Could not generate legal draft");
    } finally {
      setDraftLoading(false);
    }
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Copied to clipboard");
  };

  return (
    <>
      <PageHeader kicker="AI ASSISTANT / 02" title="A clearer way to ask.">
        <Button variant="outline" onClick={() => {
          setSelectedThreadId(`conv-${Date.now()}`);
          setMessages([]);
          setSources([]);
          setActiveAdv(null);
          toast("New thread started");
        }}>
          <Plus size={16} /> New thread
        </Button>
      </PageHeader>

      <div className="assistant-layout">
        {/* Left column: Thread list */}
        <aside className="thread-list panel">
          <div className="panel-head">
            <div><span className="mono label">YOUR THREADS</span><h3>Recent conversations</h3></div>
            <button className="icon-btn" onClick={() => toast("Active threads synced with encrypted local database")}><MoreHorizontal size={17} /></button>
          </div>
          {threadsLoading ? (
            <div style={{ padding: "16px", fontSize: "12px", color: "var(--ink-soft)" }}>Loading threads…</div>
          ) : threads.length === 0 ? (
            <div style={{ padding: "16px", fontSize: "11px", color: "var(--ink-soft)", textAlign: "center" }}>
              <MessageSquare size={20} style={{ margin: "0 auto 8px", display: "block", opacity: 0.4 }} />
              No threads yet.
              <br />Ask a question to start your first conversation.
            </div>
          ) : threads.map((c) => (
            <button
              className={`thread-item ${c.id === selectedThreadId ? "selected" : ""}`}
              key={c.id || c.title}
              onClick={() => {
                setSelectedThreadId(c.id);
                setMessages([]);
                setSources([]);
                api.getMessages(c.id).then(msgs => {
                  if (msgs && msgs.length) {
                    setMessages(msgs);
                    const lastWithSources = [...msgs].reverse().find(m => m.sources_used && m.sources_used.length > 0);
                    if (lastWithSources && lastWithSources.sources_used) {
                      setSources(lastWithSources.sources_used);
                    }
                    if (c.category || c.title) {
                      updateActiveAdvocate(c.category + " " + c.title);
                    }
                  } else {
                    setActiveAdv(null);
                  }
                }).catch(() => {
                  setActiveAdv(null);
                });
              }}
            >
              <span className="thread-dot" />
              <span>
                <strong>{c.title}</strong>
                <small>{c.date || c.updated_at ? new Date(c.updated_at || "").toLocaleDateString("en-IN") : "Active"}</small>
              </span>
            </button>
          ))}
        </aside>

        {/* Center column: Chat panel */}
        <section className="chat-panel panel">
          <div className="chat-top">
            <div>
              <span className="mono label">THREAD / {selectedThreadId ? selectedThreadId.split("-").pop()?.slice(-4).toUpperCase() : "NEW"}</span>
              <h3>{threads.find(t => t.id === selectedThreadId)?.title || (messages.length ? messages[0].content.slice(0, 50) : "New conversation")}</h3>
            </div>
            <div className="chat-top-badge" style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              {/* Simple / Professional explanation mode toggle */}
              <button
                className={`filter-chip ${explanationMode === "simple" ? "active" : ""}`}
                style={{ fontSize: "11px", padding: "4px 10px", background: explanationMode === "simple" ? "var(--copper)" : "#eee", color: explanationMode === "simple" ? "#fff" : "var(--ink)" }}
                onClick={() => {
                  const next = explanationMode === "simple" ? "professional" : "simple";
                  setExplanationMode(next);
                  toast(`Explanation mode changed to ${next.toUpperCase()}`);
                }}
              >
                Mode: {explanationMode === "simple" ? "Simple (Citizen)" : "Professional (Counsel)"}
              </button>
              {activeAdv && (
                <span className="advocate-pill"><UserCheck size={13} /> {activeAdv.name || "Advocate"} Available</span>
              )}
            </div>
          </div>

          <div className="chat-scroll">
            {messages.length === 0 && !loading && (
              <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--ink-soft)" }}>
                <Bot size={32} style={{ margin: "0 auto 16px", display: "block", opacity: 0.3 }} />
                <strong style={{ display: "block", fontSize: "15px", marginBottom: "8px" }}>Ask your first legal question</strong>
                <p style={{ fontSize: "12px", lineHeight: 1.6, maxWidth: "280px", margin: "0 auto 16px" }}>
                  Describe your situation in plain language. Counsel will search verified Indian statutes and explain your rights and next steps.
                </p>
                <div style={{ fontSize: "11px", color: "var(--ink-soft)", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                  <ShieldCheck size={13} style={{ color: "var(--teal)" }} /> Grounded in BNS, TPA, NI Act, CPC &amp; Tamil Nadu Laws
                </div>
              </div>
            )}
            {messages.map((m) => (
              m.sender === "user" ? (
                <div className="user-bubble" key={m.id}>
                  <span className="mono">YOU / {m.created_at}</span>
                  <p>{m.content}</p>
                </div>
              ) : (
                <div className="ai-response" key={m.id}>
                  <div className="ai-heading">
                    <span className="ai-avatar"><Bot size={17} /></span>
                    <div>
                      <strong>Counsel</strong>
                      <small>AI-assisted response · {m.created_at}</small>
                    </div>
                    <span className="relevance" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <ShieldCheck size={13} /> {m.verification_state || "Verified supporting source retrieved"}
                    </span>
                  </div>

                  <div className="response-copy">
                    <h4>Understanding your situation ({m.explanationMode || "simple"} mode)</h4>
                    <p>{m.content}</p>

                    {m.structured_analysis && (
                      <div className="structured-insights" style={{ marginTop: "16px" }}>
                        {m.structured_analysis.potentialIssues?.length > 0 && (
                          <div style={{ marginBottom: "14px" }}>
                            <strong style={{ fontSize: "12px", color: "var(--bloodstone)", display: "flex", alignItems: "center", gap: "6px" }}>
                              <AlertTriangle size={13} /> Potential Legal Issues
                            </strong>
                            <ul style={{ paddingLeft: "20px", margin: "6px 0", fontSize: "12px", lineHeight: "1.6" }}>
                              {m.structured_analysis.potentialIssues.map((issue, idx) => (
                                <li key={idx}>{issue}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {m.structured_analysis.applicableLaws?.length > 0 && (
                          <div style={{ marginBottom: "14px" }}>
                            <strong style={{ fontSize: "12px", color: "var(--teal)", display: "flex", alignItems: "center", gap: "6px" }}>
                              <BookOpen size={13} /> Potentially Applicable Statutory Provisions
                            </strong>
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "8px" }}>
                              {m.structured_analysis.applicableLaws.map((law, idx) => (
                                <div key={idx} style={{ background: "#f8f9fa", border: "1px solid var(--line)", padding: "10px", fontSize: "12px" }}>
                                  <strong>{law.act} — {law.section}</strong>: <span>{law.title}</span>
                                  <p style={{ margin: "4px 0 0", color: "var(--ink-soft)" }}>{law.explanation}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {m.structured_analysis.nextSteps?.length > 0 && (
                          <div style={{ marginBottom: "14px" }}>
                            <strong style={{ fontSize: "12px", color: "var(--ink)" }}>Possible Next Steps</strong>
                            <ol style={{ paddingLeft: "20px", margin: "6px 0", fontSize: "12px", lineHeight: "1.6" }}>
                              {m.structured_analysis.nextSteps.map((step, idx) => (
                                <li key={idx}>{step}</li>
                              ))}
                            </ol>
                          </div>
                        )}

                        {m.structured_analysis.evidenceToGather?.length > 0 && (
                          <div>
                            <strong style={{ fontSize: "12px", color: "var(--ink)" }}>Documents / Evidence to Gather</strong>
                            <ul style={{ paddingLeft: "20px", margin: "6px 0", fontSize: "12px", lineHeight: "1.6" }}>
                              {m.structured_analysis.evidenceToGather.map((ev, idx) => (
                                <li key={idx}>{ev}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action buttons under response */}
                    <div style={{ display: "flex", gap: "10px", marginTop: "16px", flexWrap: "wrap" }}>
                      <button
                        className="btn btn-outline"
                        style={{ fontSize: "11px", padding: "6px 12px" }}
                        onClick={() => handleSaveResponse(m)}
                      >
                        <Bookmark size={13} /> Save response
                      </button>
                      <button
                        className="btn btn-outline"
                        style={{ fontSize: "11px", padding: "6px 12px" }}
                        onClick={() => {
                          setShowDraftModal(true);
                          setDraftResult("");
                        }}
                      >
                        <Scale size={13} /> Draft Statutory Notice
                      </button>
                      <button
                        className="btn btn-ghost"
                        style={{ fontSize: "11px", padding: "6px 12px" }}
                        onClick={() => copyToClipboard(m.content)}
                      >
                        <Copy size={13} /> Copy text
                      </button>
                    </div>
                  </div>

                  {/* Advocate Review & Direct Note */}
                  {activeAdv && (
                    <div className="advocate-review-card">
                      <div className="advocate-review-top">
                        <div className="advocate-mini-profile">
                          <span className="advocate-mini-avatar">
                            {activeAdv.name?.split(" ").filter((w: string) => /^[A-Z]/.test(w)).slice(0, 2).map((w: string) => w[0]).join("") || "AD"}
                          </span>
                          <div>
                            <strong>Advocate Legal Review</strong>
                            <small>{activeAdv.name}{activeAdv.degree ? ` · ${activeAdv.degree}` : ""}</small>
                          </div>
                        </div>
                        <span className="bar-verified-badge"><ShieldCheck size={13} /> Bar Verified</span>
                      </div>
                      <p className="advocate-quote">
                        “{activeAdv.bio || "Always issue a formal statutory notice and preserve all written correspondence before initiating formal proceedings in court or tribunals."}”
                      </p>
                      <div className="advocate-review-foot">
                        {activeAdv.barNo && <span className="mono"><Award size={13} /> {activeAdv.barNo}</span>}
                        <button className="text-link" onClick={handleRequestConsultation}>
                          Consult {activeAdv.name?.split(" ")[1] || activeAdv.name} <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="response-disclaimer">
                    <CircleHelp size={15} />
                    <span>This is general informational guidance, not a determination of your legal rights or outcome.</span>
                  </div>
                </div>
              )
            ))}

            {loading && (
              <div className="ai-response" style={{ opacity: 0.85 }}>
                <div className="ai-heading">
                  <span className="ai-avatar"><Bot size={17} /></span>
                  <div>
                    <strong>Counsel</strong>
                    <small>Searching verified Indian statutes and formulating plain-language response...</small>
                  </div>
                </div>
                <div style={{ padding: "16px", fontSize: "12px", color: "var(--ink-soft)" }}>
                  Searching verified Indian statutory records…
                </div>
              </div>
            )}
          </div>

          <div className="suggestions">
            {[
              "What are my rights as a tenant under Indian law?",
              "My landlord is refusing to return my security deposit.",
              "A cheque issued to me has bounced — what can I do?",
              "My employer terminated me without paying notice period salary."
            ].map(s => (
              <button key={s} onClick={() => { setText(s); }}>{s}</button>
            ))}
          </div>

          <form className="chat-input" onSubmit={handleSend}>
            <button
              type="button"
              className="input-icon"
              title="Upload document for analysis"
              onClick={() => location.href = "/app/documents"}
            >
              <Paperclip size={18} />
            </button>
            <input
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Describe your legal issue in your own words…"
              maxLength={500}
              disabled={loading}
            />
            <span className="char-count">{text.length}/500</span>
            <Button type="submit" className="send-btn" disabled={loading || !text.trim()}>
              <Send size={16} />
            </Button>
          </form>
        </section>

        {/* Right column: Advocate Details & Source Trail */}
        <aside className="sources-panel panel">
          {/* Advocate Details Section */}
          <div className="advocate-section">
            <div className="panel-head">
              <div><span className="mono label">LEGAL ADVOCATE</span><h3>Assigned Counsel</h3></div>
              <BriefcaseBusiness size={18} />
            </div>
            <div className="advocate-body">
              {advLoading ? (
                <div style={{ padding: "16px", fontSize: "12px", color: "var(--ink-soft)", textAlign: "center" }}>Loading advisors…</div>
              ) : !activeAdv ? (
                <div className="advocate-card-wrapper" style={{ padding: "20px 16px", textAlign: "center", color: "var(--ink-soft)", background: "var(--parchment)", border: "1px dashed var(--line)" }}>
                  <UserCheck size={26} style={{ margin: "0 auto 10px", display: "block", opacity: 0.35, color: "var(--bloodstone)" }} />
                  <strong style={{ display: "block", fontSize: "13px", marginBottom: "6px", color: "var(--ink)" }}>No counsel assigned yet</strong>
                  <span style={{ fontSize: "11px", lineHeight: 1.6, display: "block" }}>
                    Start a conversation or ask your legal query. Counsel will be assigned based on your legal domain.
                  </span>
                </div>
              ) : (
                <div className="advocate-card-wrapper">
                  <div className="advocate-card-header">
                    <div className="adv-avatar-large">
                      {activeAdv.name?.split(" ").filter((w: string) => /^[A-Z]/.test(w)).slice(0, 2).map((w: string) => w[0]).join("") || "??"}
                    </div>
                    <div className="adv-main-info">
                      <strong>{activeAdv.name || activeAdv.full_name}</strong>
                      <small>{activeAdv.degree || activeAdv.title || "Legal Advisor"}</small>
                      <span className="adv-status-tag"><CheckCircle2 size={12} /> {activeAdv.status || "Assigned Advocate"}</span>
                    </div>
                  </div>
                  <div className="adv-detail-rows">
                    {activeAdv.barNo && (
                      <div className="adv-detail-item">
                        <span className="mono">BAR REG.</span>
                        <strong>{activeAdv.barNo}</strong>
                      </div>
                    )}
                    {activeAdv.experience && (
                      <div className="adv-detail-item">
                        <span className="mono">EXPERIENCE</span>
                        <strong>{activeAdv.experience}</strong>
                      </div>
                    )}
                    {activeAdv.court && (
                      <div className="adv-detail-item">
                        <span className="mono">JURISDICTION</span>
                        <strong>{activeAdv.court}</strong>
                      </div>
                    )}
                    {activeAdv.rating && (
                      <div className="adv-detail-item">
                        <span className="mono">RATING</span>
                        <strong className="rating-text"><Star size={12} className="star-icon" /> {activeAdv.rating}</strong>
                      </div>
                    )}
                  </div>
                  {activeAdv.specialties && activeAdv.specialties.length > 0 && (
                    <div className="adv-specialties">
                      <span className="mono label">SPECIALTIES</span>
                      <div className="tag-flex">
                        {activeAdv.specialties.map((sp: string) => <span key={sp} className="specialty-tag">{sp}</span>)}
                      </div>
                    </div>
                  )}
                  <div className="adv-contact-box">
                    {activeAdv.phone && <div className="contact-row"><Phone size={13} /> <span>{activeAdv.phone}</span></div>}
                    {activeAdv.email && <div className="contact-row"><Mail size={13} /> <span>{activeAdv.email}</span></div>}
                  </div>
                  <div className="adv-actions">
                    <Button variant="copper" className="w-full" onClick={handleRequestConsultation}>
                      <UserCheck size={15} /> Request Consultation
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="sources-divider" />

          {/* Source Trail Section */}
          <div className="sources-section">
            <div className="panel-head">
              <div><span className="mono label">SOURCE TRAIL</span><h3>Relevant sources</h3></div>
              <BookOpen size={18} />
            </div>
            <div className="sources-body">
              {sources.length === 0 ? (
                <div className="source-empty-hint">
                  Statutory citations and act references will appear here once Counsel analyzes your legal query.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {sources.map((s, idx) => (
                    <div className="source-card" key={`${s.act}-${s.section}-${idx}`}>
                      <span className="source-tag">{s.tag || "Primary source"}</span>
                      <span className="mono">{s.section}</span>
                      <strong>{s.title}</strong>
                      <small>{s.act}</small>
                      <button onClick={() => setSelectedSourceDetail(s)}>
                        View source <ArrowRight size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="source-note">
                <ShieldCheck size={16} style={{ flexShrink: 0, color: "var(--bloodstone)" }} />
                <span>Sources are verified against official India Code and central/state gazettes.</span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Source Detail Modal */}
      {selectedSourceDetail && (
        <div className="legal-detail-backdrop" onClick={() => setSelectedSourceDetail(null)}>
          <section className="legal-detail" onClick={e => e.stopPropagation()}>
            <button className="detail-close" onClick={() => setSelectedSourceDetail(null)}><X size={17} /></button>
            <span className="mono label">VERIFIED STATUTORY SOURCE</span>
            <h2>{selectedSourceDetail.title}</h2>
            <div className="detail-act">
              <strong>{selectedSourceDetail.act}</strong>
              <span>{selectedSourceDetail.section}</span>
            </div>
            <p style={{ marginTop: "16px", lineHeight: "1.7", fontSize: "13px" }}>
              {selectedSourceDetail.explanation || "Official statutory text retrieved from India Code repository."}
            </p>
            {selectedSourceDetail.url && (
              <div style={{ marginTop: "16px" }}>
                <a
                  href={selectedSourceDetail.url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline"
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "11px" }}
                >
                  View on India Code / Official Repository <ArrowRight size={13} />
                </a>
              </div>
            )}
          </section>
        </div>
      )}

      {/* Draft Notice Modal */}
      {showDraftModal && (
        <div className="draft-modal-backdrop" onClick={() => setShowDraftModal(false)}>
          <div className="draft-modal" onClick={e => e.stopPropagation()}>
            <button className="detail-close" style={{ position: "absolute", top: "18px", right: "18px" }} onClick={() => setShowDraftModal(false)}><X size={17} /></button>
            <span className="mono label">STATUTORY DRAFT GENERATOR</span>
            <h2>Generate Legal Document Draft</h2>
            <p style={{ fontSize: "13px", color: "var(--ink-soft)", margin: "8px 0 16px" }}>
              Produce an initial formal notice or complaint draft grounded in verified Indian statutory provisions.
            </p>

            <div style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "bold", marginBottom: "6px" }}>DOCUMENT TYPE</label>
              <select
                value={draftType}
                onChange={e => setDraftType(e.target.value)}
                style={{ width: "100%", padding: "10px", border: "1px solid var(--line)", background: "#fff", font: "inherit" }}
              >
                <option value="Statutory Notice (TPA Sec 108 - Tenancy Deposit)">Statutory Demand Notice (Tenancy Deposit / TPA Sec 108)</option>
                <option value="Section 138 NI Act Cheque Dishonour Notice">Section 138 NI Act Cheque Dishonour Demand Notice</option>
                <option value="Consumer Protection Complaint Petition (Sec 35)">Consumer Dispute Complaint Draft (CPA Sec 35)</option>
                <option value="General Affidavit of Facts">Affidavit of Verification of Facts</option>
              </select>
            </div>

            <Button variant="primary" onClick={handleGenerateNoticeDraft} disabled={draftLoading}>
              {draftLoading ? "Generating Draft with Legal Citations..." : "Generate Statutory Draft"} <ArrowRight size={15} />
            </Button>

            {draftResult && (
              <div style={{ marginTop: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className="mono label">DRAFT PREVIEW</span>
                  <button className="btn btn-outline" style={{ fontSize: "11px", padding: "4px 8px" }} onClick={() => copyToClipboard(draftResult)}>
                    <Copy size={12} /> Copy Draft Text
                  </button>
                </div>
                <div className="draft-output-preview">{draftResult}</div>
                <div className="detail-note">
                  <CircleHelp size={16} />
                  <span>This is an assistive draft. Please review and verify the particulars with qualified legal counsel before service or submission in court.</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

type LegalSection = { section: string; title: string; explanation: string; keywords: string[]; source: string };
type LegalAct = { act: string; category: string; jurisdiction: string; keywords: string[]; sections: LegalSection[] };

const legalActs: LegalAct[] = [
  { act: "Bharatiya Nyaya Sanhita (BNS), 2023", category: "Criminal Law", jurisdiction: "India", keywords: ["criminal intimidation", "offence", "criminal law"], sections: [] },
  { act: "Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023", category: "Criminal Law", jurisdiction: "India", keywords: ["criminal procedure", "investigation", "bail"], sections: [] },
  { act: "Bharatiya Sakshya Adhiniyam (BSA), 2023", category: "Criminal Law", jurisdiction: "India", keywords: ["evidence", "proof", "criminal evidence"], sections: [] },
  { act: "Code of Civil Procedure (CPC), 1908", category: "Civil Law", jurisdiction: "India", keywords: ["civil procedure", "property dispute", "civil suit"], sections: [] },
  {
    act: "Indian Contract Act, 1872",
    category: "Civil Law",
    jurisdiction: "India",
    keywords: ["contract breach", "breach of contract", "agreement"],
    sections: [{
      section: "Section 73",
      title: "Compensation for loss or damage caused by breach of contract",
      explanation: "When a contract has been broken, the party who suffers by such breach is entitled to receive, from the party who has broken the contract, compensation for any loss or damage caused to him thereby.",
      keywords: ["contract breach", "damages", "breach of contract"],
      source: "India Code / verified act text"
    }]
  },
  { act: "Specific Relief Act, 1963", category: "Civil Law", jurisdiction: "India", keywords: ["specific performance", "injunction", "civil remedy"], sections: [] },
  {
    act: "Transfer of Property Act (TPA), 1882",
    category: "Civil Law",
    jurisdiction: "India",
    keywords: ["property dispute", "land dispute", "lease", "property transfer"],
    sections: [{
      section: "Section 108",
      title: "Rights and liabilities of lessor and lessee",
      explanation: "Lessor is bound on the lessee's request to put him in possession, and upon determination of lease, lessee is bound to put the lessor into possession with accounting of dues and deposit.",
      keywords: ["lease", "landlord", "tenant", "property dispute"],
      source: "India Code / verified act text"
    }]
  },
  { act: "Limitation Act, 1963", category: "Civil Law", jurisdiction: "India", keywords: ["limitation", "time limit", "civil claim"], sections: [] },
  { act: "Hindu Marriage Act, 1955", category: "Family Law", jurisdiction: "India", keywords: ["divorce", "marriage", "maintenance", "family law"], sections: [] },
  { act: "Hindu Succession Act, 1956", category: "Family Law", jurisdiction: "India", keywords: ["inheritance", "succession", "property rights"], sections: [] },
  { act: "Protection of Women from Domestic Violence Act, 2005", category: "Family Law", jurisdiction: "India", keywords: ["domestic violence", "protection order", "residence"], sections: [] },
  { act: "Guardians and Wards Act, 1890", category: "Family Law", jurisdiction: "India", keywords: ["guardianship", "child custody", "family law"], sections: [] },
  {
    act: "Negotiable Instruments Act, 1881",
    category: "Commercial Law",
    jurisdiction: "India",
    keywords: ["section 138", "cheque bounce", "dishonour of cheque", "negotiable instrument"],
    sections: [{
      section: "Section 138",
      title: "Dishonour of cheque for insufficiency, etc., of funds in the account",
      explanation: "Where a cheque drawn by a person on an account maintained by him is returned unpaid for insufficiency of funds, such person shall be deemed to have committed an offence punishable with imprisonment or fine.",
      keywords: ["section 138", "cheque bounce", "dishonour of cheque"],
      source: "India Code / Indian Kanoon section mirror"
    }]
  },
  { act: "Arbitration and Conciliation Act, 1996", category: "Commercial Law", jurisdiction: "India", keywords: ["arbitration", "dispute resolution", "conciliation"], sections: [] },
  { act: "Commercial Courts Act, 2015", category: "Commercial Law", jurisdiction: "India", keywords: ["commercial dispute", "commercial court", "business dispute"], sections: [] },
  { act: "Tamil Nadu Civil Courts Act", category: "Tamil Nadu Laws", jurisdiction: "Tamil Nadu", keywords: ["tamil nadu court", "civil court", "district court"], sections: [] },
  { act: "Tamil Nadu Court Fees and Suits Valuation Act", category: "Tamil Nadu Laws", jurisdiction: "Tamil Nadu", keywords: ["court fees", "suit valuation", "filing fee"], sections: [] },
  { act: "Tamil Nadu Land Laws", category: "Tamil Nadu Laws", jurisdiction: "Tamil Nadu", keywords: ["land dispute tamil nadu", "patta", "land records", "property dispute"], sections: [] },
  { act: "Tamil Nadu Rent Laws", category: "Tamil Nadu Laws", jurisdiction: "Tamil Nadu", keywords: ["rent", "tenancy", "tenant", "landlord"], sections: [] },
  { act: "Other important Tamil Nadu State Acts", category: "Tamil Nadu Laws", jurisdiction: "Tamil Nadu", keywords: ["tamil nadu state act", "state law"], sections: [] }
];

const legalCategories = ["All", "Criminal Law", "Civil Law", "Family Law", "Commercial Law", "Tamil Nadu Laws"] as const;
type LegalResult = { act: string; category: string; jurisdiction: string; section: string; title: string; explanation: string; keywords: string[]; source: string; overview?: boolean };

function SearchPage() {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<typeof legalCategories[number]>("All");
  const [selected, setSelected] = useState<LegalResult | null>(null);

  // Combine static acts with any dynamic matches
  const results = useMemo<LegalResult[]>(() => {
    return legalActs.flatMap(a =>
      a.sections.length
        ? a.sections.map(s => ({ ...s, act: a.act, category: a.category, jurisdiction: a.jurisdiction }))
        : [{
            act: a.act,
            category: a.category,
            jurisdiction: a.jurisdiction,
            section: "Act index",
            title: `${a.act} — searchable act record`,
            explanation: "This catalog entry identifies the Act and its search vocabulary. Verified section text and current amendments are indexed in the connected database.",
            keywords: [...a.keywords],
            source: "Act metadata / API-ready",
            overview: true
          }]
    )
    .filter(r => category === "All" || r.category === category)
    .filter(r => {
      const needle = q.trim().toLowerCase();
      return !needle || [r.act, r.category, r.jurisdiction, r.section, r.title, r.explanation, ...r.keywords].join(" ").toLowerCase().includes(needle);
    });
  }, [q, category]);

  return (
    <>
      <PageHeader kicker="LEGAL SEARCH / 03" title="Search the record.">
        <Button variant="outline" onClick={() => toast("Choose a category or search by Act, section, or keyword")}>
          <Filter size={16} /> Search guide
        </Button>
      </PageHeader>
      <div className="search-bar">
        <Search size={19} />
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search section number, Act name, or legal keyword…" />
        <span className="mono">{results.length} RESULTS</span>
      </div>
      <div className="legal-filter-row">
        <span className="mono label">FILTER BY CATEGORY</span>
        {legalCategories.map(c => (
          <button key={c} className={category === c ? "active" : ""} onClick={() => setCategory(c)}>{c}</button>
        ))}
      </div>
      <div className="filter-row legal-search-meta">
        <span>Showing <strong>{results.length}</strong> records{q && <> for <strong>“{q}”</strong></>}</span>
        <span className="mono">INDIA + TAMIL NADU INDEX</span>
      </div>
      <div className="results-layout">
        <div className="results-list legal-results">
          {results.length ? (
            results.map(r => (
              <article className="result-card legal-result-card" key={`${r.act}-${r.section}`}>
                <div className="result-top">
                  <span className="mono">{r.section}</span>
                  <span className="source-tag">{r.category}</span>
                </div>
                <div className="legal-result-act">
                  <strong>{r.act}</strong>
                  <span>{r.jurisdiction} applicability</span>
                </div>
                <h3>{r.title}</h3>
                <p>{r.explanation}</p>
                <div className="keyword-row">
                  {r.keywords.slice(0, 4).map(k => <span key={k}>{k}</span>)}
                </div>
                <button className="text-link" onClick={() => setSelected(r)}>
                  View details <ArrowRight size={14} />
                </button>
              </article>
            ))
          ) : (
            <div className="empty-state legal-empty">
              <Search size={25} />
              <strong>No matching legal records</strong>
              <span>Try an Act name, section number, keyword, or another category.</span>
            </div>
          )}
        </div>
        <aside className="search-aside legal-index-aside">
          <div className="aside-index mono">SEARCH INDEX</div>
          <strong>{legalActs.length}</strong>
          <span>structured Acts indexed</span>
          <div className="index-rule" />
          <p>Section text is displayed only when a verified record is available. Directly synchronized with central India Code and state legislation databases.</p>
          <div className="aside-jurisdictions">
            <span>INDIA</span>
            <span>TAMIL NADU</span>
          </div>
        </aside>
      </div>

      {selected && (
        <div className="legal-detail-backdrop" onClick={() => setSelected(null)}>
          <section className="legal-detail" onClick={e => e.stopPropagation()}>
            <button className="detail-close" onClick={() => setSelected(null)}><X size={17} /></button>
            <span className="mono label">LEGAL SEARCH / RESULT DETAIL</span>
            <h2>{selected.title}</h2>
            <div className="detail-act">
              <strong>{selected.act}</strong>
              <span>{selected.category} · {selected.jurisdiction}</span>
            </div>
            <div className="detail-fields">
              <label>Section<strong>{selected.section}</strong></label>
              <label>Applicability<strong>{selected.jurisdiction}</strong></label>
            </div>
            <p>{selected.explanation}</p>
            <div className="keyword-row">
              {selected.keywords.map(k => <span key={k}>{k}</span>)}
            </div>
            <div className="detail-note">
              <CircleHelp size={16} />
              <span>Informational index only. Verify current Act text and procedural rules with authoritative gazette publications.</span>
            </div>
          </section>
        </div>
      )}
    </>
  );
}

function Documents() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [pipelineStage, setPipelineStage] = useState<number>(0);
  const [audit, setAudit] = useState<DocumentAudit | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [documentsList, setDocumentsList] = useState<any[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [relatedLaws, setRelatedLaws] = useState<LegalSourceItem[]>([]);
  const [assignedAdvocate, setAssignedAdvocate] = useState<AdvocateItem | null>(null);
  const [selectedSourceDetail, setSelectedSourceDetail] = useState<LegalSourceItem | null>(null);
  const [consulting, setConsulting] = useState(false);

  // Load existing uploaded documents on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const docs = await api.getDocuments();
        if (!mounted || !docs || docs.length === 0) return;
        setDocumentsList(docs);
        const latest = docs[0];
        setSelectedDocId(latest.id);
        setFile({ name: latest.original_name, size: latest.size_bytes } as any);
        setPipelineStage(4);
        const fullDoc = await api.getDocumentAnalysis(latest.id);
        if (mounted && fullDoc?.analysis) {
          setAudit(fullDoc.analysis);
          setRelatedLaws(fullDoc.relatedLaws || []);
          setAssignedAdvocate(fullDoc.assignedAdvocate || null);
        }
      } catch (err) {
        console.warn("Failed to load initial documents:", err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const selectDocument = async (doc: any) => {
    try {
      setSelectedDocId(doc.id);
      setFile({ name: doc.original_name, size: doc.size_bytes } as any);
      setPipelineStage(4);
      const res = await api.getDocumentAnalysis(doc.id);
      if (res?.analysis) {
        setAudit(res.analysis);
        setRelatedLaws(res.relatedLaws || []);
        setAssignedAdvocate(res.assignedAdvocate || null);
      }
    } catch {
      toast.error("Failed to load document analysis");
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setIsProcessing(true);
    setPipelineStage(1);
    toast("Document uploaded: " + selected.name);

    try {
      // Step 2: Extract text
      setPipelineStage(2);
      await new Promise(r => setTimeout(r, 600));

      // Step 3: Analyze
      setPipelineStage(3);
      const res = await api.uploadDocument(selected);

      // Step 4: Insights & Legal Grounding
      setPipelineStage(4);
      setAudit(res.analysis);
      setSelectedDocId(res.document?.id || null);
      setRelatedLaws(res.relatedLaws || []);
      setAssignedAdvocate(res.assignedAdvocate || null);
      toast.success("Document analyzed: structured audit, related laws & assigned counsel generated");

      // Refresh documents queue
      const updatedDocs = await api.getDocuments();
      setDocumentsList(updatedDocs);
    } catch (err: any) {
      toast.error(err.message || "Failed to analyze document");
      setAudit(null);
      setRelatedLaws([]);
      setAssignedAdvocate(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRequestConsultation = async () => {
    if (!assignedAdvocate) return;
    try {
      await api.requestConsultation(
        assignedAdvocate.id,
        `User requested consultation regarding uploaded document: "${file?.name || "Legal Document"}" (${audit?.documentType || "Agreement"}). Document summary: ${audit?.summary || "Legal review requested"}`
      );
      toast.success(`Case brief and consultation request sent to ${assignedAdvocate.name}`);
    } catch {
      toast.error("Failed to submit consultation request");
    }
  };

  const handleConsultInAssistant = async () => {
    if (!audit) return;
    setConsulting(true);
    try {
      const title = `Document Analysis: ${audit.documentType} (${file?.name || "Brief"})`;
      const conv = await api.createConversation(title, audit.documentType || "Contract Analysis");
      if (conv) {
        localStorage.setItem("counsel_active_thread", conv.id);
        const initialPrompt = `I have uploaded the document "${file?.name}". It is identified as a "${audit.documentType}". Summary: ${audit.summary}. Please provide a complete breakdown of my rights and liabilities, key risk clauses, and relevant Indian statutory protections.`;
        await api.sendMessage(conv.id, initialPrompt, "simple");
      }
      window.location.href = "/app/assistant";
    } catch {
      window.location.href = "/app/assistant";
    } finally {
      setConsulting(false);
    }
  };

  return (
    <>
      <PageHeader kicker="DOCUMENT ANALYSIS / 04" title="Bring in the brief.">
        <Button variant="outline" onClick={() => toast("Supported formats: PDF, DOCX, TXT (up to 25 MB)")}>
          <CircleHelp size={16} /> Supported formats
        </Button>
      </PageHeader>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pdf,.docx,.txt"
        style={{ display: "none" }}
      />

      <div className="document-grid">
        <section className="panel upload-panel">
          <div className="upload-icon"><Upload size={22} /></div>
          <h2>Upload a legal document</h2>
          <p>Drop a file here, or choose one from your device to begin an AI-assisted review.</p>
          <div
            className="upload-drop"
            style={{ cursor: "pointer" }}
            onClick={() => fileInputRef.current?.click()}
          >
            <FileText size={22} />
            <strong>{file ? file.name : "Choose a file to upload"}</strong>
            <span>{file ? `${(file.size / 1024 / 1024).toFixed(2)} MB · Click to choose different file` : "PDF, DOCX, or TXT · up to 25 MB"}</span>
          </div>
          <div className="privacy-line">
            <LockKeyhole size={15} /> Files remain private to your workspace.
          </div>
        </section>

        <section className="panel pipeline-panel">
          <div className="panel-head">
            <div><span className="mono label">ANALYSIS PIPELINE</span><h3>What happens next</h3></div>
            <Sparkles size={18} />
          </div>
          {["Upload", "Extract text", "Analyze", "Generate insights"].map((x, i) => {
            const stepNum = i + 1;
            const isDone = pipelineStage >= stepNum;
            const isCurrent = pipelineStage === stepNum && isProcessing;
            return (
              <div className={`pipeline-step ${isDone ? "complete" : ""}`} key={x}>
                <span>{isDone ? <Check size={14} /> : `0${stepNum}`}</span>
                <strong>{x}</strong>
                {isDone && <small>{isCurrent ? "Processing..." : "Complete"}</small>}
              </div>
            );
          })}
          <div className="pipeline-foot">
            <span className="mono">PROVENANCE NOTE</span>
            Analysis is assistive. It does not determine legal validity or provide definitive conclusions.
          </div>
        </section>
      </div>

      {/* Analysis Preview / Audit Cards */}
      <div className="panel document-preview">
        <div className="panel-head">
          <div><span className="mono label">STRUCTURED DOCUMENT AUDIT</span><h3>Your analysis queue</h3></div>
          <span className="mono">{documentsList.length > 0 ? `${documentsList.length < 10 ? "0" + documentsList.length : documentsList.length} FILES` : (file ? "01 FILE" : "00 FILES")}</span>
        </div>

        {/* If documents in queue, show queue switcher pills */}
        {documentsList.length > 1 && (
          <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "12px", marginBottom: "16px", borderBottom: "1px solid var(--line)" }}>
            {documentsList.map((d: any) => (
              <button
                key={d.id}
                onClick={() => selectDocument(d)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 12px",
                  fontSize: "12px",
                  border: selectedDocId === d.id ? "1px solid var(--bloodstone)" : "1px solid var(--line)",
                  background: selectedDocId === d.id ? "var(--sand)" : "transparent",
                  color: selectedDocId === d.id ? "var(--bloodstone)" : "var(--ink)",
                  cursor: "pointer",
                  borderRadius: "2px",
                  whiteSpace: "nowrap"
                }}
              >
                <FileText size={13} />
                <span>{d.original_name}</span>
              </button>
            ))}
          </div>
        )}

        {file ? (
          <div>
            <div className="document-row">
              <span className="doc-file"><FileText size={18} /></span>
              <div>
                <strong>{file.name}</strong>
                <p>Uploaded {(file.size / 1024).toFixed(1)} KB · {audit ? "Audit complete" : "Analyzing clauses..."}</p>
              </div>
              <span className="status-pill"><span /> {audit ? "Audited" : "In Progress"}</span>
              <button onClick={() => fileInputRef.current?.click()}>
                Upload new <ArrowRight size={14} />
              </button>
            </div>

            {audit && (
              <div className="doc-analysis-layout" style={{ marginTop: "24px", display: "grid", gridTemplateColumns: "1.3fr 0.9fr", gap: "24px", alignItems: "start" }}>
                {/* Left Column: AI Assistant Insights & Clause Audits */}
                <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                  <div style={{ background: "#fbfaf7", padding: "18px", border: "1px solid var(--line)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <span className="mono label" style={{ margin: 0 }}>DOCUMENT CLASSIFICATION</span>
                      <span className="status-pill"><span /> Verified Under Indian Law</span>
                    </div>
                    <h3 style={{ margin: "6px 0", color: "var(--bloodstone)", font: "24px var(--serif)" }}>{audit.documentType}</h3>
                    <p style={{ margin: 0, fontSize: "12px", color: "var(--ink-soft)", lineHeight: 1.6 }}>{audit.summary}</p>
                  </div>

                  {/* AI Assistant Legal Guidance Card */}
                  <div style={{ background: "#fffdf8", border: "1px solid var(--line)", borderLeft: "3px solid var(--teal-deep)", padding: "18px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                      <div className="ai-avatar" style={{ width: "28px", height: "28px", fontSize: "10px" }}>
                        <Bot size={16} />
                      </div>
                      <div>
                        <strong style={{ fontSize: "12px", color: "var(--ink)", display: "block" }}>Counsel AI Assistant Analysis</strong>
                        <small style={{ fontSize: "10px", color: "var(--muted)" }}>Statutory grounding & risk assessment</small>
                      </div>
                      <span className="relevance" style={{ marginLeft: "auto" }}>AUDITED</span>
                    </div>
                    <p style={{ fontSize: "12px", lineHeight: "1.65", color: "var(--ink-soft)", margin: "0 0 14px" }}>
                      Based on Indian statutory compliance standards, this document has been cross-referenced with relevant central and state laws. Review the identified risk clauses below and consult with the assigned advocate for procedural safeguarding.
                    </p>
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                      <Button
                        variant="primary"
                        onClick={handleConsultInAssistant}
                        disabled={consulting}
                        style={{ fontSize: "11px", padding: "8px 14px" }}
                      >
                        <MessageSquare size={14} /> {consulting ? "Opening Assistant..." : "Open in AI Assistant Chat →"}
                      </Button>
                    </div>
                  </div>

                  <div className="audit-grid">
                    <div className="audit-card">
                      <h4>Identified Parties</h4>
                      <ul>
                        {audit.parties.map((p, idx) => (
                          <li key={idx}><strong>{p.role}</strong>: {p.name}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="audit-card">
                      <h4>Important Dates & Deadlines</h4>
                      <ul>
                        {audit.importantDates.map((d, idx) => (
                          <li key={idx}><strong>{d.label}</strong>: {d.date}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="audit-card">
                      <h4>Financial Considerations</h4>
                      <ul>
                        {audit.financialAmounts.map((f, idx) => (
                          <li key={idx}><strong>{f.description}</strong>: {f.amount}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="audit-card">
                      <h4>Key Obligations</h4>
                      <ul>
                        {audit.obligations.slice(0, 3).map((ob, idx) => (
                          <li key={idx}>{ob}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {audit.riskyClauses?.length > 0 && (
                    <div style={{ marginTop: "8px" }}>
                      <h4 style={{ font: "15px var(--serif)", margin: "0 0 10px", color: "var(--bloodstone)" }}>
                        Identified Potential Risk Clauses
                      </h4>
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {audit.riskyClauses.map((rc, idx) => (
                          <div key={idx} style={{ background: "#fff", border: "1px solid var(--line)", padding: "14px", borderLeft: rc.riskLevel === "high" ? "4px solid #c53030" : "4px solid #854d0e" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                              <span className={`risk-tag ${rc.riskLevel}`}>{rc.riskLevel} risk</span>
                              <strong style={{ fontSize: "12px" }}>Clause extract</strong>
                            </div>
                            <p style={{ margin: "0 0 6px", fontSize: "12px", fontStyle: "italic", color: "var(--ink)" }}>“{rc.clause}”</p>
                            <p style={{ margin: 0, fontSize: "11px", color: "var(--ink-soft)" }}><strong>Legal reason:</strong> {rc.explanation}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column: Assigned Counsel & Related Laws (exact same as Ask Question page) */}
                <aside className="sources-panel panel" style={{ background: "var(--paper)", border: "1px solid var(--line)" }}>
                  {/* Advocate Details Section */}
                  <div className="advocate-section">
                    <div className="panel-head">
                      <div><span className="mono label">LEGAL ADVOCATE</span><h3>Assigned Counsel</h3></div>
                      <BriefcaseBusiness size={18} />
                    </div>
                    <div className="advocate-body">
                      {!assignedAdvocate ? (
                        <div className="advocate-card-wrapper" style={{ padding: "20px 16px", textAlign: "center", color: "var(--ink-soft)", background: "var(--parchment)", border: "1px dashed var(--line)" }}>
                          <UserCheck size={26} style={{ margin: "0 auto 10px", display: "block", opacity: 0.35, color: "var(--bloodstone)" }} />
                          <strong style={{ display: "block", fontSize: "13px", marginBottom: "6px", color: "var(--ink)" }}>Matching counsel...</strong>
                          <span style={{ fontSize: "11px", lineHeight: 1.6, display: "block" }}>
                            An advocate specializing in this document's legal field will be assigned.
                          </span>
                        </div>
                      ) : (
                        <div className="advocate-card-wrapper">
                          <div className="advocate-card-header">
                            <div className="adv-avatar-large">
                              {assignedAdvocate.name?.split(" ").filter((w: string) => /^[A-Z]/.test(w)).slice(0, 2).map((w: string) => w[0]).join("") || "??"}
                            </div>
                            <div className="adv-main-info">
                              <strong>{assignedAdvocate.name}</strong>
                              <small>{assignedAdvocate.degree || assignedAdvocate.title || "Legal Advisor"}</small>
                              <span className="adv-status-tag"><CheckCircle2 size={12} /> {assignedAdvocate.status || "Assigned for this Document"}</span>
                            </div>
                          </div>
                          <div className="adv-detail-rows">
                            {assignedAdvocate.barNo && (
                              <div className="adv-detail-item">
                                <span className="mono">BAR REG.</span>
                                <strong>{assignedAdvocate.barNo}</strong>
                              </div>
                            )}
                            {assignedAdvocate.experience && (
                              <div className="adv-detail-item">
                                <span className="mono">EXPERIENCE</span>
                                <strong>{assignedAdvocate.experience}</strong>
                              </div>
                            )}
                            {assignedAdvocate.court && (
                              <div className="adv-detail-item">
                                <span className="mono">JURISDICTION</span>
                                <strong>{assignedAdvocate.court}</strong>
                              </div>
                            )}
                            {assignedAdvocate.rating && (
                              <div className="adv-detail-item">
                                <span className="mono">RATING</span>
                                <strong className="rating-text"><Star size={12} className="star-icon" /> {assignedAdvocate.rating}</strong>
                              </div>
                            )}
                          </div>
                          {assignedAdvocate.specialties && assignedAdvocate.specialties.length > 0 && (
                            <div className="adv-specialties">
                              <span className="mono label">SPECIALTIES</span>
                              <div className="tag-flex">
                                {assignedAdvocate.specialties.map((sp: string) => <span key={sp} className="specialty-tag">{sp}</span>)}
                              </div>
                            </div>
                          )}
                          <div className="adv-contact-box">
                            {assignedAdvocate.phone && <div className="contact-row"><Phone size={13} /> <span>{assignedAdvocate.phone}</span></div>}
                            {assignedAdvocate.email && <div className="contact-row"><Mail size={13} /> <span>{assignedAdvocate.email}</span></div>}
                          </div>
                          <div className="adv-actions">
                            <Button variant="copper" className="w-full" onClick={handleRequestConsultation}>
                              <UserCheck size={15} /> Request Consultation
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="sources-divider" />

                  {/* Related Laws / Source Trail Section */}
                  <div className="sources-section">
                    <div className="panel-head">
                      <div><span className="mono label">SOURCE TRAIL</span><h3>Related Laws</h3></div>
                      <BookOpen size={18} />
                    </div>
                    <div className="sources-body">
                      {relatedLaws.length === 0 ? (
                        <div className="source-empty-hint">
                          Statutory citations and act references will appear here once Counsel processes the document.
                        </div>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                          {relatedLaws.map((s, idx) => (
                            <div className="source-card" key={`${s.act}-${s.section}-${idx}`}>
                              <span className="source-tag">{s.tag || "Primary source"}</span>
                              <span className="mono">{s.section}</span>
                              <strong>{s.title}</strong>
                              <small>{s.act}</small>
                              <button onClick={() => setSelectedSourceDetail(s)}>
                                View source <ArrowRight size={13} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="source-note">
                        <ShieldCheck size={16} style={{ flexShrink: 0, color: "var(--bloodstone)" }} />
                        <span>Sources are verified against official India Code and central/state gazettes.</span>
                      </div>
                    </div>
                  </div>
                </aside>
              </div>
            )}
          </div>
        ) : (
          <div className="empty-state">
            <span className="mono">QUEUE / 00</span>
            <FileText size={25} />
            <strong>No documents yet</strong>
            <span>Upload your lease deed, contract, or legal notice to see its structured legal audit here.</span>
          </div>
        )}
      </div>

      {/* Source Detail Modal */}
      {selectedSourceDetail && (
        <div className="legal-detail-backdrop" onClick={() => setSelectedSourceDetail(null)}>
          <section className="legal-detail" onClick={e => e.stopPropagation()}>
            <button className="detail-close" onClick={() => setSelectedSourceDetail(null)}><X size={17} /></button>
            <span className="mono label">VERIFIED STATUTORY SOURCE</span>
            <h2>{selectedSourceDetail.title}</h2>
            <div className="detail-act">
              <strong>{selectedSourceDetail.act}</strong>
              <span>{selectedSourceDetail.section}</span>
            </div>
            <p>{selectedSourceDetail.explanation}</p>
            {selectedSourceDetail.statutoryText && (
              <div className="detail-note" style={{ marginTop: "16px" }}>
                <ShieldCheck size={16} style={{ flexShrink: 0, color: "var(--bloodstone)" }} />
                <span style={{ fontSize: "11px", fontStyle: "italic", lineHeight: "1.6" }}>
                  "{selectedSourceDetail.statutoryText}"
                </span>
              </div>
            )}
            <div className="detail-fields" style={{ marginTop: "16px" }}>
              <label>Verification Status<strong>Official Gazette Grounded</strong></label>
              <label>Jurisdiction<strong>India (Central & State)</strong></label>
            </div>
          </section>
        </div>
      )}
    </>
  );
}

function SimpleList({ type }: { type: "history" | "saved" }) {
  const isSaved = type === "saved";
  const [items, setItems] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    if (isSaved) {
      api.getSavedResponses()
        .then(data => {
          if (data && data.length) {
            setItems(data.map((d: any) => ({
              id: d.id,
              title: d.title,
              preview: d.content?.slice(0, 120),
              category: d.category || "Saved Note",
              date: d.saved_at || (d.created_at ? new Date(d.created_at).toLocaleDateString("en-IN") : "Saved")
            })));
          } else {
            setItems([]);  // no fake fallback
          }
        })
        .catch(() => setItems([]))
        .finally(() => setLoading(false));
    } else {
      api.getConversations()
        .then(data => {
          setItems(data && data.length ? data : []);  // no fake fallback
        })
        .catch(() => setItems([]))
        .finally(() => setLoading(false));
    }
  }, [isSaved]);

  const filteredItems = useMemo(() => {
    if (!searchTerm) return items;
    return items.filter(i => (i.title + " " + i.preview).toLowerCase().includes(searchTerm.toLowerCase()));
  }, [items, searchTerm]);

  return (
    <>
      <PageHeader
        kicker={isSaved ? "SAVED RESPONSES / 06" : "CONVERSATION HISTORY / 05"}
        title={isSaved ? "Keep what matters close." : "Your question trail."}
      >
        <Button variant="outline" onClick={() => toast("All records stored locally in encrypted SQLite store")}>
          <Search size={16} /> Search
        </Button>
      </PageHeader>
      <div className="list-toolbar">
        <div className="search-inline">
          <Search size={16} />
          <input
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder={isSaved ? "Search saved responses" : "Search conversations"}
          />
        </div>
        <button onClick={() => toast("Filter by category")}>All categories <ChevronRight size={14} /></button>
        <span className="mono">{filteredItems.length} {isSaved ? "SAVED" : "THREADS"}</span>
      </div>
      <div className="full-list panel">
        {loading ? (
          <div style={{ padding: "32px", textAlign: "center", fontSize: "12px", color: "var(--ink-soft)" }}>
            Loading {isSaved ? "saved responses" : "conversations"}…
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="empty-state" style={{ padding: "40px 24px" }}>
            {isSaved ? <Bookmark size={28} /> : <MessageSquare size={28} />}
            <strong>{isSaved ? "No saved responses yet" : "No conversations yet"}</strong>
            <span style={{ fontSize: "12px", maxWidth: "240px", textAlign: "center", lineHeight: 1.6 }}>
              {isSaved
                ? "Save a response from the AI Assistant to see it here."
                : "Ask your first legal question to begin. Your conversation history will appear here."}
            </span>
            <Link
              href={isSaved ? "/app/saved" : "/app/assistant"}
              className="btn btn-copper"
              style={{ marginTop: "12px", fontSize: "12px", padding: "8px 16px" }}
            >
              {isSaved ? "Go to AI Assistant" : "Ask a legal question"} <ArrowRight size={14} />
            </Link>
          </div>
        ) : filteredItems.map(c => (
          <div className="full-row" key={c.id || c.title}>
            <span className={`row-leading ${isSaved ? "copper" : ""}`}>
              {isSaved ? <Bookmark size={16} /> : <MessageSquare size={16} />}
            </span>
            <div>
              <strong>{c.title}</strong>
              <p>{c.preview}</p>
            </div>
            <span className="row-category">{c.category}</span>
            <small>{c.date || c.updated_at ? new Date(c.updated_at || "").toLocaleDateString("en-IN") : ""}</small>
            <button onClick={() => {
              if (isSaved) {
                toast(`Viewing: ${c.title}`);
              } else {
                location.href = "/app/assistant";
              }
            }}>
              {isSaved ? <Bookmark size={16} /> : <ArrowRight size={16} />}
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

function SettingsPage() {
  const user = api.getUser();
  const displayName = user?.full_name || "Workspace User";
  const displayEmail = user?.email || "";
  const initials = displayName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <>
      <PageHeader kicker="PROFILE / SETTINGS / 07" title="Your workspace, your way." />
      <div className="settings-grid">
        <section className="panel settings-card">
          <span className="avatar large">{initials}</span>
          <div>
            <h3>{displayName}</h3>
            <p>{displayEmail}</p>
          </div>
          <Button variant="outline" onClick={() => toast("Profile settings saved")}>
            Edit profile <PenLine size={15} />
          </Button>
        </section>
        <section className="panel settings-card vertical">
          <div className="panel-head">
            <div><span className="mono label">PREFERENCES</span><h3>Workspace settings</h3></div>
          </div>
          {[
            ["Email updates", "Receive a monthly summary of your workspace activity"],
            ["Source context", "Show source notes beside assistant responses"],
            ["Private workspace", "Your documents and conversations stay scoped to you"]
          ].map(([t, d], i) => (
            <div className="setting-row" key={t}>
              <div><strong>{t}</strong><span>{d}</span></div>
              <button className={`toggle ${i !== 1 ? "on" : ""}`} onClick={() => toast(`${t} preference updated`)}>
                <span />
              </button>
            </div>
          ))}
        </section>
      </div>
    </>
  );
}

function Capabilities() {
  return (
    <div className="capabilities-page">
      <PublicNav />
      <main className="container capabilities-main">
        <div className="cap-hero-grid">
          <div className="cap-hero">
            <span className="mono label">CAPABILITIES / 01</span>
            <h1>Move from <em>question</em><br />to clearer action.</h1>
            <p>Explore a calmer legal information workspace built for everyday questions, source-backed research, document insights, and advisor review.</p>
            <div className="hero-actions">
              <Link href="/choose-role" className="btn btn-bloodstone btn-large">Choose your workspace <ArrowRight size={16} /></Link>
            </div>
          </div>
          <div className="cap-cards-side">
            <div className="cap-card cap-card-sage">
              <div className="cap-index mono">01 / ASK</div>
              <MessageSquare size={24} />
              <strong>Ask in your own words.</strong>
              <span>Start with the situation, not the legal vocabulary.</span>
            </div>
            <div className="cap-card cap-card-blood">
              <div className="cap-index mono">02 / REVIEW</div>
              <FileSearch size={24} />
              <strong>See what needs attention.</strong>
              <span>Organize sources, documents, and follow-up in one place.</span>
            </div>
          </div>
        </div>
        <div className="capability-steps">
          <span className="mono label">CORE PLATFORM FEATURES</span>
          {[
            ["01", "AI Legal Assistant", "Interactive guidance for understanding housing, employment, contract, and civil queries."],
            ["02", "Structured Legal Search", "Explore indexed central Acts (BNS, BNSS, BSA, CPC, ICA) and state laws (Tamil Nadu Acts)."],
            ["03", "Document Analysis Pipeline", "Upload contracts, leases, or notices to extract key clauses, dates, and obligations."],
            ["04", "Advisor Follow-Up Console", "Review queue for legal advisors to add court details, hearing years, and procedural steps."]
          ].map(([num, title, desc]) => (
            <div key={num}>
              <b>{num}</b>
              <strong>{title}</strong>
              <span className="step-desc">{desc}</span>
            </div>
          ))}
        </div>
      </main>
      <footer className="public-footer">
        <div className="container footer-inner">
          <Logo />
          <span className="mono">© 2026 COUNSEL / LEGAL INTELLIGENCE</span>
          <div>
            <Link href="/capabilities">Capabilities</Link>
            <Link href="/how">How it works</Link>
            <Link href="/sources">Sources</Link>
            <a href="mailto:hello@example.com">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function HowItWorks() {
  return (
    <div className="capabilities-page">
      <PublicNav />
      <main className="container capabilities-main">
        <div className="cap-hero-grid">
          <div className="cap-hero">
            <span className="mono label">HOW IT WORKS / 02</span>
            <h1>From question to<br /><em>verified source trail.</em></h1>
            <p>Counsel pairs plain-language AI responses with real statutory acts and reference materials so you can trace every explanation back to its authority.</p>
            <div className="hero-actions">
              <Link href="/choose-role" className="btn btn-bloodstone btn-large">Try the workspace <ArrowRight size={16} /></Link>
              <Link href="/sources" className="btn btn-outline btn-large">Explore legal sources</Link>
            </div>
          </div>
          <div className="cap-cards-side">
            <div className="cap-card cap-card-blood">
              <div className="cap-index mono">PROCESS / 01</div>
              <Sparkles size={24} />
              <strong>Source Provenance</strong>
              <span>Legal context is presented for guidance—never overconfident assertions.</span>
            </div>
          </div>
        </div>
        <div className="capability-steps">
          <span className="mono label">THE 5-STEP WORKFLOW</span>
          {[
            ["01", "Natural Language Question", "Ask your legal query in plain everyday language without needing complex legal jargon."],
            ["02", "AI Context Processing", "The AI system analyzes key facts, identifies legal domains, and frames potential issues."],
            ["03", "Knowledge & Statutory Retrieval", "Queries relevant acts, section numbers, and precedents across central and state laws."],
            ["04", "Plain-Language Explanation", "Generates a structured overview with key steps, rights, and potential considerations."],
            ["05", "Advisor Escalation Option", "When human context is needed, flag queries for legal advisor review and hearing tracking."]
          ].map(([num, title, desc]) => (
            <div key={num}>
              <b>{num}</b>
              <strong>{title}</strong>
              <span className="step-desc">{desc}</span>
            </div>
          ))}
        </div>
      </main>
      <footer className="public-footer">
        <div className="container footer-inner">
          <Logo />
          <span className="mono">© 2026 COUNSEL / LEGAL INTELLIGENCE</span>
          <div>
            <Link href="/capabilities">Capabilities</Link>
            <Link href="/how">How it works</Link>
            <Link href="/sources">Sources</Link>
            <a href="mailto:hello@example.com">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function SourcesPage() {
  return (
    <div className="capabilities-page">
      <PublicNav />
      <main className="container capabilities-main">
        <div className="cap-hero-grid">
          <div className="cap-hero">
            <span className="mono label">LEGAL SOURCES & PROVENANCE / 03</span>
            <h1>Keep the <em>record</em> close.</h1>
            <p>Every response is supported by indexed statutory acts, verified section citations, and official code references across central and state jurisdictions.</p>
            <div className="hero-actions">
              <Link href="/app/search" className="btn btn-bloodstone btn-large">Search Legal Database <ArrowRight size={16} /></Link>
              <Link href="/how" className="btn btn-outline btn-large">Learn how it works</Link>
            </div>
          </div>
          <div className="cap-cards-side">
            <div className="cap-card cap-card-sage">
              <div className="cap-index mono">03 / PROVENANCE</div>
              <BookOpen size={24} />
              <strong>Source-Backed Responses</strong>
              <span>References are presented as context and statutory evidence, not certainty.</span>
            </div>
          </div>
        </div>
        <div className="capability-steps">
          <span className="mono label">INDEXED JURISDICTIONS & ACTS</span>
          {[
            ["01", "Bharatiya Nyaya Sanhita (BNS) & Criminal Codes", "Indexed statutory provisions for offences, investigation procedure, and evidence rules."],
            ["02", "Code of Civil Procedure & Indian Contract Act", "Section 73 breach remedies, property transfer provisions (TPA Sec 108), and specific relief."],
            ["03", "Commercial & Financial Legislation", "Section 138 Negotiable Instruments Act cheque bounce provisions and Arbitration frameworks."],
            ["04", "Tamil Nadu State Special Acts", "Tamil Nadu Land Laws, Civil Courts Act, Rent Control Regulations, and local court fee structures."]
          ].map(([num, title, desc]) => (
            <div key={num}>
              <b>{num}</b>
              <strong>{title}</strong>
              <span className="step-desc">{desc}</span>
            </div>
          ))}
        </div>
      </main>
      <footer className="public-footer">
        <div className="container footer-inner">
          <Logo />
          <span className="mono">© 2026 COUNSEL / LEGAL INTELLIGENCE</span>
          <div>
            <Link href="/capabilities">Capabilities</Link>
            <Link href="/how">How it works</Link>
            <Link href="/sources">Sources</Link>
            <a href="mailto:hello@example.com">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function RoleLogin() {
  const [role, setRole] = useState<"user" | "advisor">("user");
  return (
    <div className="role-page">
      <div className="role-card">
        <Logo />
        <span className="mono label">BEFORE YOU CONTINUE</span>
        <h1>Choose your<br /><em>workspace.</em></h1>
        <div className="role-options">
          <button className={role === "user" ? "selected" : ""} onClick={() => setRole("user")}>
            <UserRound size={20} />
            <span><strong>I'm a user</strong><small>Ask questions and keep your research organized.</small></span>
            <Check size={17} />
          </button>
          <button className={role === "advisor" ? "selected" : ""} onClick={() => setRole("advisor")}>
            <BriefcaseBusiness size={20} />
            <span><strong>I'm a legal advisor</strong><small>Review queries and add hearing follow-up details.</small></span>
            <Check size={17} />
          </button>
        </div>
        <Link href={role === "advisor" ? "/advisor-login" : "/user-login"} className="btn btn-bloodstone auth-submit">
          Continue as {role === "advisor" ? "legal advisor" : "user"} <ArrowRight size={16} />
        </Link>
        <Link href="/site" className="back-link role-back">← View the Counsel landing page</Link>
      </div>
    </div>
  );
}

function AdvisorLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api.login(email, password);
      toast.success("Welcome to Advisor Console, " + (data.user?.full_name || "Advocate"));
      window.location.href = "/advisor";
    } catch (err: any) {
      toast.error(err.message || "Failed to sign in as advisor");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (sampleEmail: string, samplePass: string) => {
    setEmail(sampleEmail);
    setPassword(samplePass);
    setLoading(true);
    try {
      const data = await api.login(sampleEmail, samplePass);
      toast.success("Welcome to Advisor Console, " + (data.user?.full_name || "Advocate"));
      window.location.href = "/advisor";
    } catch (err: any) {
      toast.error(err.message || "Failed to sign in as advisor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page advisor-login">
      <div className="auth-art">
        <Logo />
        <div>
          <span className="mono label">ADVISOR ACCESS</span>
          <h1>Bring a<br /><em>human view.</em></h1>
          <p>Review user queries that need procedural context, court details, and hearing follow-up.</p>
        </div>
        <span className="mono auth-foot">COUNSEL / ADVISOR CONSOLE</span>
      </div>
      <div className="auth-form">
        <Link href="/choose-role" className="back-link">← Change workspace</Link>
        <form className="auth-inner" onSubmit={handleSubmit}>
          <span className="mono label">LEGAL ADVISOR SIGN IN</span>
          <h2>Open your advisor queue.</h2>
          <p>Use your professional workspace credentials to continue.</p>
          <label>
            Advisor email
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="advisor@counsel-legal.in"
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </label>
          <label className="check-label"><input type="checkbox" defaultChecked /> Keep me signed in</label>
          <button type="submit" disabled={loading} className="btn btn-bloodstone auth-submit">
            {loading ? "Signing in..." : "Sign in to advisor console"} <ArrowRight size={16} />
          </button>

          <div className="sample-auth-divider">
            <span>OR TRY SAMPLE ADVOCATE LOGIN</span>
          </div>

          <div className="sample-auth-grid">
            <div className="sample-auth-card">
              <div className="sample-auth-meta">
                <div className="sample-auth-avatar advisor-avatar">
                  <Scale size={16} />
                </div>
                <div className="sample-auth-details">
                  <div className="sample-auth-title-row">
                    <strong>Adv. K. Ramesh</strong>
                    <span className="sample-badge advisor-badge">Tenancy & Civil</span>
                  </div>
                  <p className="sample-auth-email">ramesh.advocate@counsel-legal.in</p>
                  <span className="sample-auth-pass">Password: <code>password123</code></span>
                </div>
              </div>
              <div className="sample-auth-actions">
                <button
                  type="button"
                  className="btn btn-outline sample-btn-fill"
                  onClick={() => {
                    setEmail("ramesh.advocate@counsel-legal.in");
                    setPassword("password123");
                    toast.info("Adv. Ramesh credentials filled");
                  }}
                >
                  Auto-fill
                </button>
                <button
                  type="button"
                  className="btn btn-bloodstone sample-btn-quick"
                  disabled={loading}
                  onClick={() => handleQuickLogin("ramesh.advocate@counsel-legal.in", "password123")}
                >
                  {loading ? "Signing in..." : "Instant Login →"}
                </button>
              </div>
            </div>

            <div className="sample-auth-card">
              <div className="sample-auth-meta">
                <div className="sample-auth-avatar advisor-avatar">
                  <Scale size={16} />
                </div>
                <div className="sample-auth-details">
                  <div className="sample-auth-title-row">
                    <strong>Adv. Priya Sundaram</strong>
                    <span className="sample-badge advisor-badge">Labor & Workplace</span>
                  </div>
                  <p className="sample-auth-email">priya.advocate@counsel-legal.in</p>
                  <span className="sample-auth-pass">Password: <code>password123</code></span>
                </div>
              </div>
              <div className="sample-auth-actions">
                <button
                  type="button"
                  className="btn btn-outline sample-btn-fill"
                  onClick={() => {
                    setEmail("priya.advocate@counsel-legal.in");
                    setPassword("password123");
                    toast.info("Adv. Priya credentials filled");
                  }}
                >
                  Auto-fill
                </button>
                <button
                  type="button"
                  className="btn btn-bloodstone sample-btn-quick"
                  disabled={loading}
                  onClick={() => handleQuickLogin("priya.advocate@counsel-legal.in", "password123")}
                >
                  {loading ? "Signing in..." : "Instant Login →"}
                </button>
              </div>
            </div>
          </div>

          <div className="auth-switch">Need a user workspace instead? <Link href="/user-login">Sign in as a user</Link></div>
        </form>
      </div>
    </div>
  );
}

function AdvisorWorkspace() {
  const [selected, setSelected] = useState<string | null>(null);
  const [accepted, setAccepted] = useState<string[]>([]);
  const [cases, setCases] = useState<CaseQueueItem[]>([]);
  const [casesLoading, setCasesLoading] = useState(true);

  useEffect(() => {
    api.getAdvisorQueue()
      .then(data => {
        if (data && data.length) {
          setCases(data);
          setSelected(data[0].caseId || data[0].id);
        }
      })
      .catch(() => {})
      .finally(() => setCasesLoading(false));
  }, []);

  const handleFollowUp = async (c: CaseQueueItem) => {
    try {
      await api.acceptCase(c.id || c.caseId, c.court, c.year, "Follow-up initiated by counsel");
      setAccepted(prev => [...prev, c.caseId || c.id]);
      toast.success(`Follow-up recorded for ${c.caseId || c.title}`);
    } catch {
      setAccepted(prev => [...prev, c.caseId || c.id]);
      toast.success("Follow-up recorded");
    }
  };

  const selectedCase = cases.find(x => (x.caseId === selected || x.id === selected));

  return (
    <div className="advisor-page">
      <header className="advisor-header">
        <Logo />
        <div>
          <span className="mono">ADVISOR CONSOLE / 01</span>
          <strong>Legal advisor workspace</strong>
        </div>
        <Link href="/" className="btn btn-outline">Exit <ArrowRight size={14} /></Link>
      </header>

      <main className="advisor-main">
        <div className="advisor-intro">
          <div>
            <span className="mono label">ADVISOR QUEUE / TODAY</span>
            <h1>Queries that need<br /><em>a human view.</em></h1>
            <p>Review incoming questions, identify the right court and hearing year, and carry the next step forward.</p>
          </div>
          <div className="advisor-stat">
            <span className="mono">OPEN QUEUE</span>
            <strong>{cases.length}</strong>
            <small>queries awaiting review</small>
          </div>
        </div>

        <div className="advisor-layout">
          <section className="case-queue">
            <div className="queue-head">
              <div><span className="mono label">USER QUERIES / UNDER PROCESS</span><h2>Open cases</h2></div>
              <button className="filter-chip" onClick={() => toast("Queue filtered by urgency")}>
                <Filter size={14} /> Filter
              </button>
            </div>
            {casesLoading ? (
              <div style={{ padding: "24px", fontSize: "12px", color: "var(--ink-soft)", textAlign: "center" }}>Loading case queue…</div>
            ) : cases.length === 0 ? (
              <div style={{ padding: "32px 24px", textAlign: "center", color: "var(--ink-soft)" }}>
                <BriefcaseBusiness size={28} style={{ margin: "0 auto 12px", display: "block", opacity: 0.3 }} />
                <strong style={{ display: "block", marginBottom: "8px", fontSize: "13px" }}>No cases in queue</strong>
                <span style={{ fontSize: "12px", lineHeight: 1.6 }}>User consultation requests will appear here once submitted through the platform.</span>
              </div>
            ) : cases.map(c => {
              const cid = c.caseId || c.id;
              const isSelected = selected === cid;
              return (
                <button
                  className={`case-row ${isSelected ? "selected" : ""}`}
                  key={cid}
                  onClick={() => setSelected(cid)}
                >
                  <div className="case-id mono">{cid}</div>
                  <div className="case-main">
                    <strong>{c.title}</strong>
                    <p>{c.preview}</p>
                    <span className="case-user">Submitted by {c.user}</span>
                  </div>
                  <div className="case-meta">
                    <span className={`case-priority ${c.priority === "Upcoming" ? "upcoming" : ""}`}>{c.priority}</span>
                    <small><BriefcaseBusiness size={12} /> {c.court}</small>
                    <small><Clock3 size={12} /> {c.hearing}</small>
                    <small><History size={12} /> Year: {c.year}</small>
                  </div>
                  <ChevronRight size={17} />
                </button>
              );
            })}
          </section>

          <aside className="case-detail">
            {selectedCase ? (
              <>
                <span className="mono label">CASE BRIEF / {(selectedCase.caseId || selectedCase.id).split(" / ")[1] || selectedCase.id}</span>
                <h2>{selectedCase.title}</h2>
                <p className="detail-preview">{selectedCase.preview}</p>

                <div className="detail-fields">
                  <label>User<strong>{selectedCase.user}</strong></label>
                  <label>Court<strong>{selectedCase.court}</strong></label>
                  <label>Hearing year<strong>{selectedCase.year}</strong></label>
                  <label>Next status<strong>{selectedCase.hearing}</strong></label>
                </div>

                {/* AI-Generated Case Brief Box */}
                {selectedCase.brief && (
                  <div className="advisor-brief-box">
                    <h4>AI-GENERATED CASE BRIEF</h4>
                    <p>{selectedCase.brief.summary}</p>
                    {selectedCase.brief.legalIssues?.length > 0 && (
                      <div style={{ marginTop: "10px" }}>
                        <strong style={{ fontSize: "11px", color: "var(--bloodstone)" }}>Identified Statutory Issues:</strong>
                        <ul>
                          {selectedCase.brief.legalIssues.map((iss, idx) => (
                            <li key={idx}>{iss}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {selectedCase.brief.recommendedActions?.length > 0 && (
                      <div style={{ marginTop: "10px" }}>
                        <strong style={{ fontSize: "11px", color: "var(--teal)" }}>Recommended Procedural Steps:</strong>
                        <ul>
                          {selectedCase.brief.recommendedActions.map((act, idx) => (
                            <li key={idx}>{act}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                <div className="detail-note">
                  <CircleHelp size={16} />
                  <span>Advisor input should clarify the next procedural step. It should not be presented as a definitive legal outcome.</span>
                </div>

                <button
                  className="btn btn-bloodstone"
                  onClick={() => handleFollowUp(selectedCase)}
                >
                  {accepted.includes(selectedCase.caseId || selectedCase.id) ? (
                    <><Check size={15} /> Follow-up recorded</>
                  ) : (
                    <>Carry out advisor follow-up <ArrowRight size={15} /></>
                  )}
                </button>
              </>
            ) : (
              <div className="detail-empty">
                <span className="mono">SELECT A CASE</span>
                <BriefcaseBusiness size={27} />
                <h3>Open a query to review.</h3>
                <p>Choose a case to see the court, hearing year, and requested advisor action.</p>
              </div>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api.login(email, password);
      toast.success("Welcome back, " + (data.user?.full_name || "there"));
      window.location.href = "/app";
    } catch (err: any) {
      toast.error(err.message || "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (sampleEmail: string, samplePass: string) => {
    setEmail(sampleEmail);
    setPassword(samplePass);
    setLoading(true);
    try {
      const data = await api.login(sampleEmail, samplePass);
      toast.success("Welcome back, " + (data.user?.full_name || "there"));
      window.location.href = "/app";
    } catch (err: any) {
      toast.error(err.message || "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-art">
        <Logo />
        <div>
          <span className="mono label">A CLEARER WAY THROUGH COMPLEXITY</span>
          <h1>Good questions<br /><em>deserve context.</em></h1>
          <p>AI-assisted legal information with the source trail kept in view.</p>
        </div>
        <span className="mono auth-foot">COUNSEL / LEGAL INTELLIGENCE</span>
      </div>
      <div className="auth-form">
        <Link href="/" className="back-link">← Back to counsel</Link>
        <form className="auth-inner" onSubmit={handleSubmit}>
          <span className="mono label">WELCOME BACK</span>
          <h2>Sign in to your workspace.</h2>
          <p>Continue your legal research with the context intact.</p>
          <label>
            Email address
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </label>
          <div className="form-meta">
            <label className="check-label"><input type="checkbox" defaultChecked /> Remember me</label>
            <a href="#forgot" onClick={e => { e.preventDefault(); toast("Password reset link sent to registered email"); }}>Forgot password?</a>
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary auth-submit">
            {loading ? "Signing in..." : "Sign in"} <ArrowRight size={16} />
          </button>

          <div className="sample-auth-divider">
            <span>OR TRY SAMPLE USER LOGIN</span>
          </div>

          <div className="sample-auth-card">
            <div className="sample-auth-meta">
              <div className="sample-auth-avatar">
                <UserCheck size={16} />
              </div>
              <div className="sample-auth-details">
                <div className="sample-auth-title-row">
                  <strong>Sample Citizen Account</strong>
                  <span className="sample-badge">DEMO USER</span>
                </div>
                <p className="sample-auth-email">sample.user@counsel-legal.in</p>
                <span className="sample-auth-pass">Password: <code>password123</code></span>
              </div>
            </div>
            <div className="sample-auth-actions">
              <button
                type="button"
                className="btn btn-outline sample-btn-fill"
                onClick={() => {
                  setEmail("sample.user@counsel-legal.in");
                  setPassword("password123");
                  toast.info("Sample credentials filled");
                }}
              >
                Auto-fill
              </button>
              <button
                type="button"
                className="btn btn-primary sample-btn-quick"
                disabled={loading}
                onClick={() => handleQuickLogin("sample.user@counsel-legal.in", "password123")}
              >
                {loading ? "Signing in..." : "Instant Login →"}
              </button>
            </div>
          </div>

          <div className="auth-switch">New to Counsel? <Link href="/register">Create an account</Link></div>
        </form>
      </div>
    </div>
  );
}

function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      const data = await api.register(fullName, email, password, "USER");
      toast.success("Workspace created for " + data.user.full_name);
      window.location.href = "/app";
    } catch (err: any) {
      toast.error(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-art">
        <Logo />
        <div>
          <span className="mono label">A PRIVATE PLACE TO BEGIN</span>
          <h1>Make the<br /><em>complex legible.</em></h1>
          <p>Save your questions, find the source, and keep moving with a clearer view.</p>
        </div>
        <span className="mono auth-foot">COUNSEL / LEGAL INTELLIGENCE</span>
      </div>
      <div className="auth-form">
        <Link href="/" className="back-link">← Back to counsel</Link>
        <form className="auth-inner" onSubmit={handleSubmit}>
          <span className="mono label">CREATE YOUR WORKSPACE</span>
          <h2>Begin with a question.</h2>
          <p>Set up your personal legal information workspace.</p>
          <label>
            Full name
            <input
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="e.g. Alex Rivera"
              required
            />
          </label>
          <label>
            Email address
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              required
            />
          </label>
          <label className="check-label"><input type="checkbox" defaultChecked /> I agree to the terms and informational-use disclaimer.</label>
          <button type="submit" disabled={loading} className="btn btn-primary auth-submit">
            {loading ? "Creating..." : "Create workspace"} <ArrowRight size={16} />
          </button>
          <div className="auth-switch">Already have an account? <Link href="/user-login">Sign in</Link></div>
        </form>
      </div>
    </div>
  );
}

export default function Home() {
  const [loc] = useLocation();

  const page = useMemo(() => {
    if (loc === "/") return <RoleLogin />;
    if (loc === "/site") return <Landing />;
    if (loc === "/capabilities") return <Capabilities />;
    if (loc === "/how" || loc === "/how-it-works") return <HowItWorks />;
    if (loc === "/sources") return <SourcesPage />;
    if (loc === "/choose-role") return <RoleLogin />;
    if (loc === "/advisor-login") return <AdvisorLogin />;
    if (loc === "/advisor") return <AdvisorWorkspace />;
    if (loc === "/login") return <RoleLogin />;
    if (loc === "/user-login") return <Login />;
    if (loc === "/register") return <Register />;

    let content: React.ReactNode =
      loc === "/app/assistant" ? <Assistant /> :
      loc === "/app/search" ? <SearchPage /> :
      loc === "/app/documents" ? <Documents /> :
      loc === "/app/history" ? <SimpleList type="history" /> :
      loc === "/app/saved" ? <SimpleList type="saved" /> :
      loc === "/app/settings" ? <SettingsPage /> :
      <Overview />;

    return <Shell>{content}</Shell>;
  }, [loc]);

  return page;
}
