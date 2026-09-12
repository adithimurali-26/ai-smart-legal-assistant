/* Verdigris Brief style: editorial modernism, ink navy + verdigris teal + parchment, asymmetric rail layouts, DM Serif / Manrope / IBM Plex Mono. */
import { useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  ArrowRight, Award, BookOpen, Bookmark, Bot, BriefcaseBusiness, Check, CheckCircle2, ChevronRight, CircleHelp, Clock3,
  FileSearch, FileText, Filter, History, Home as HomeIcon, Library, LockKeyhole, Mail, MapPin, Menu, MessageSquare,
  MoreHorizontal, Paperclip, PenLine, Phone, Plus, Search, Send, Settings, ShieldCheck, Sparkles, Star, Upload,
  UserCheck, UserRound, X, Zap
} from "lucide-react";
import { toast } from "sonner";

const navItems = [
  ["/app", "Overview", HomeIcon], ["/app/assistant", "AI Assistant", MessageSquare], ["/app/search", "Legal Search", Search],
  ["/app/documents", "Document Analysis", FileSearch], ["/app/history", "History", History], ["/app/saved", "Saved Responses", Bookmark]
] as const;
const conversations = [
  { title: "Tenant security deposit issue", date: "Today, 10:42 AM", category: "Housing", preview: "What are my rights if my landlord refuses to return…" },
  { title: "Employment termination question", date: "Yesterday, 3:18 PM", category: "Employment", preview: "Help me understand the notice period in my…" },
  { title: "Contract clause explanation", date: "Aug 24, 2026", category: "Contracts", preview: "Can you explain this indemnification clause…" }
];
const sources = [
  { act: "Transfer of Property Act, 1882", section: "Section 108", title: "Rights and liabilities of lessor and lessee", tag: "Primary source" },
  { act: "Model Tenancy Act, 2021", section: "Section 12", title: "Refund of security deposit", tag: "Reference" }
];
const advocates = [
  {
    id: "adv-1",
    name: "Adv. K. Ramesh",
    degree: "B.A. LL.B (Hons.), LL.M",
    title: "Senior Legal Advocate — Housing & Consumer Law",
    barNo: "TN / 3492 / 2014",
    experience: "12+ Years Practice",
    court: "Madras High Court & Consumer Forum",
    location: "Chennai, Tamil Nadu",
    rating: "4.9 ★ (142 cases)",
    status: "Assigned Advocate",
    phone: "+91 98401 23456",
    email: "ramesh.advocate@counsel-legal.in",
    specialties: ["Tenancy & Lease Disputes", "Property Law", "Consumer Redressal"]
  },
  {
    id: "adv-2",
    name: "Adv. Priya Sundaram",
    degree: "LL.B (Madras University)",
    title: "Labor & Employment Legal Consultant",
    barNo: "TN / 1840 / 2017",
    experience: "9+ Years Practice",
    court: "Labor Court & City Civil Court",
    location: "Chennai, Tamil Nadu",
    rating: "4.8 ★ (98 cases)",
    status: "Available for Review",
    phone: "+91 98402 34567",
    email: "priya.advocate@counsel-legal.in",
    specialties: ["Employment Contracts", "Termination Claims", "Notice Period Disputes"]
  }
];

function Logo({ compact = false }: { compact?: boolean }) {
  return <Link href="/" className="flex items-center gap-3 group"><span className="brand-seal"><span /></span>{!compact && <span className="leading-none"><span className="brand-wordmark">counsel</span><span className="brand-sub">legal intelligence</span></span>}</Link>;
}
function Button({ children, onClick, variant = "primary", className = "", type = "button" }: { children: React.ReactNode; onClick?: () => void; variant?: "primary" | "ghost" | "outline" | "copper"; className?: string; type?: "button" | "submit" }) {
  return <button type={type} onClick={onClick} className={`btn btn-${variant} ${className}`}>{children}</button>;
}
function PublicNav() { return <header className="public-nav"><Logo /><nav><Link href="/how">How it works</Link><Link href="/capabilities">Capabilities</Link><Link href="/sources">Sources</Link></nav><div className="nav-actions"><Link href="/login" className="text-link">Sign in</Link><Link href="/app" className="btn btn-primary">Open workspace <ArrowRight size={15} /></Link></div></header>; }
function Landing() { return <div className="public-page"><PublicNav /><main>
  <section className="hero container"><div className="hero-copy"><div className="eyebrow"><span className="eyebrow-dot" /> AI-assisted legal information</div><h1>Start with the question.<br /><em>Find the record.</em></h1><p className="hero-lede">Understand legal information, explore relevant laws, and move forward with a clearer view of what matters.</p><div className="hero-actions"><Link href="/app/assistant" className="btn btn-primary btn-large">Ask a legal question <ArrowRight size={17} /></Link><Link className="btn btn-outline btn-large" href="/capabilities">Explore capabilities</Link></div><div className="hero-note"><ShieldCheck size={16} /> Built to keep the source trail in view</div></div><div className="hero-art"><div className="hero-art-glow" /><div className="document-card"><div className="doc-top"><span className="mono">BRIEF / 042</span><span className="doc-status">● indexed</span></div><div className="doc-title">Your question,<br /><strong>made legible.</strong></div><div className="doc-lines"><i /><i /><i /><i /></div><div className="doc-foot"><span>AI LEGAL ASSISTANT</span><span className="seal-mini">◒</span></div></div><div className="floating-index"><span className="mono">SOURCE INDEX</span><strong>02</strong><small>relevant records found</small></div><span className="hero-caption mono">A CLEARER WAY THROUGH COMPLEXITY</span></div></section>
  <section className="trust-band"><div className="container trust-grid"><div><span className="mono label">THE COUNSEL PROMISE</span><h2>Clarity without the overconfidence.</h2></div><p>We pair plain-language explanations with the legal sources behind them—so you can understand the context, ask better questions, and know when to speak with a professional.</p><div className="trust-points"><span><Check size={14} /> Source-backed</span><span><Check size={14} /> Private by design</span><span><Check size={14} /> Plain language</span></div></div></section>
  <section className="disclaimer container"><CircleHelp size={17}/><p>This platform provides AI-assisted legal information for general informational purposes and does not replace professional legal advice.</p></section>
 </main><footer className="public-footer"><div className="container footer-inner"><Logo /><span className="mono">© 2026 COUNSEL / LEGAL INTELLIGENCE</span><div><Link href="/capabilities">Capabilities</Link><Link href="/how">How it works</Link><Link href="/sources">Sources</Link><a href="mailto:hello@example.com">Contact</a></div></div></footer></div> }

function Shell({ children }: { children: React.ReactNode }) { const [loc] = useLocation(); const [mobile, setMobile] = useState(false); return <div className="app-shell"><aside className={`app-sidebar ${mobile?"open":""}`}><div className="side-top"><Logo compact /><button className="mobile-close" onClick={()=>setMobile(false)}><X size={18}/></button></div><div className="side-label mono">WORKSPACE</div><nav className="side-nav">{navItems.map(([href,label,Icon])=><Link key={href} href={href} className={loc===href?"active":""} onClick={()=>setMobile(false)}><Icon size={17}/><span>{label}</span>{label==="AI Assistant"&&<span className="nav-kicker">NEW</span>}</Link>)}</nav><div className="side-bottom"><div className="privacy-card"><LockKeyhole size={16}/><div><strong>Private by design</strong><span>Your workspace is yours.</span></div></div><Link href="/app/settings" className={loc==="/app/settings"?"active":""}><Settings size={17}/><span>Settings</span></Link><div className="profile-mini"><span className="avatar">AR</span><div><strong>Alex Rivera</strong><small>Personal workspace</small></div><MoreHorizontal size={17}/></div></div></aside><div className="app-main"><header className="app-header"><button className="mobile-menu" onClick={()=>setMobile(true)}><Menu size={20}/></button><div className="breadcrumb"><span>Counsel</span><ChevronRight size={14}/><strong>{navItems.find(n=>n[0]===loc)?.[1] || (loc==="/app/settings"?"Settings":"Workspace")}</strong></div><div className="header-actions"><button className="icon-btn" onClick={()=>toast("No new notifications")}> <CircleHelp size={18}/></button><div className="header-avatar">AR</div></div></header><main className="workspace-content">{children}</main></div></div> }
function PageHeader({ kicker, title, children }: { kicker:string; title:string; children?:React.ReactNode }) { return <div className="page-header"><div><span className="mono label">{kicker}</span><h1>{title}</h1></div>{children}</div> }
function Overview() { return <><PageHeader kicker="OVERVIEW / 01" title="Good morning, Alex."><Button variant="primary" onClick={()=>location.href="/app/assistant"}><Plus size={16}/> New question</Button></PageHeader><div className="welcome-panel"><div><span className="mono label">YOUR NEXT STEP</span><h2>What would you like<br />to make <em>clearer?</em></h2><p>Ask about a legal concept, search the record, or bring in a document.</p><Link href="/app/assistant" className="btn btn-copper">Ask a legal question <ArrowRight size={16}/></Link></div><div className="welcome-mark"><div className="ledger-art"><span className="mono">INDEX / 042</span><strong>01</strong><i /><i /><i /><small>source trail<br/>ready to review</small></div><small className="mono">COUNSEL / 01</small></div></div><div className="quick-grid">{[[MessageSquare,"Ask a question","Start with your own words","/app/assistant"],[Search,"Search laws","Explore the legal record","/app/search"],[FileSearch,"Analyze a document","Surface what matters","/app/documents"],[History,"View history","Return to a thread","/app/history"]].map(([Icon,t,d,h])=><Link href={h as string} className="quick-card" key={t as string}><Icon size={20}/><strong>{t as string}</strong><span>{d as string}</span><ArrowRight size={15}/></Link>)}</div><div className="dashboard-grid"><section className="panel recent-panel"><div className="panel-head"><div><span className="mono label">RECENT CONVERSATIONS</span><h3>Your open threads</h3></div><Link href="/app/history" className="text-link">View all <ArrowRight size={14}/></Link></div>{conversations.map(c=><Link href="/app/assistant" className="conversation-row" key={c.title}><span className="conv-icon"><MessageSquare size={16}/></span><div><strong>{c.title}</strong><p>{c.preview}</p></div><div className="row-meta"><span>{c.category}</span><small>{c.date}</small></div><ChevronRight size={16}/></Link>)}</section><section className="panel activity-panel"><div className="panel-head"><div><span className="mono label">ACTIVITY / THIS MONTH</span><h3>Your workspace</h3></div></div><div className="metric"><span>Questions asked</span><strong>24</strong><i><b style={{width:"72%"}} /></i></div><div className="metric"><span>Documents analyzed</span><strong>08</strong><i><b style={{width:"41%"}} /></i></div><div className="metric"><span>Saved responses</span><strong>12</strong><i><b style={{width:"55%"}} /></i></div><div className="activity-foot"><Zap size={15}/> Consistent with last month <strong>+18%</strong></div></section></div></> }
function Assistant() { 
  const [text,setText]=useState(""); 
  const [sent,setSent]=useState(true); 
  const [activeAdv, setActiveAdv]=useState(advocates[0]);
  return <>
    <PageHeader kicker="AI ASSISTANT / 02" title="A clearer way to ask.">
      <Button variant="outline" onClick={()=>toast("New thread started")}> <Plus size={16}/> New thread</Button>
    </PageHeader>
    <div className="assistant-layout">
      <aside className="thread-list panel">
        <div className="panel-head">
          <div><span className="mono label">YOUR THREADS</span><h3>Recent conversations</h3></div>
          <button className="icon-btn" onClick={()=>toast("Thread options")}> <MoreHorizontal size={17}/></button>
        </div>
        {conversations.map((c,i)=><button className={`thread-item ${i===0?"selected":""}`} key={c.title}><span className="thread-dot" /><span><strong>{c.title}</strong><small>{c.date}</small></span></button>)}
      </aside>
      <section className="chat-panel panel">
        <div className="chat-top">
          <div><span className="mono label">THREAD / 042</span><h3>Tenant security deposit issue</h3></div>
          <div className="chat-top-badge">
            <span className="status-pill"><span/> General information</span>
            <span className="advocate-pill"><UserCheck size={13}/> Advocate Assigned</span>
          </div>
        </div>
        <div className="chat-scroll">
          <div className="user-bubble">
            <span className="mono">YOU / TODAY, 10:42 AM</span>
            <p>What are my rights if my landlord refuses to return my security deposit?</p>
          </div>
          {sent&&<div className="ai-response">
            <div className="ai-heading">
              <span className="ai-avatar"><Bot size={17}/></span>
              <div><strong>Counsel</strong><small>AI-assisted response · just now</small></div>
              <span className="relevance">High relevance</span>
            </div>
            <div className="response-copy">
              <h4>Understanding your situation</h4>
              <p>If your tenancy has ended and the agreed conditions for returning the deposit have been met, the landlord will generally need to account for any deductions and return the remaining amount. The exact rule depends on your agreement and the law that applies where the property is located.</p>
              <h4>Possible next steps</h4>
              <ol>
                <li>Preserve the lease, payment records, and move-out correspondence.</li>
                <li>Review the agreement for the deposit timeline and permitted deductions.</li>
                <li>Send a dated written request asking for the deposit or an itemized explanation.</li>
                <li>If the issue remains unresolved, consider an appropriate local remedy or professional advice.</li>
              </ol>
            </div>
            
            {/* Advocate Review & Direct Note */}
            <div className="advocate-review-card">
              <div className="advocate-review-top">
                <div className="advocate-mini-profile">
                  <span className="advocate-mini-avatar">KR</span>
                  <div>
                    <strong>Advocate Legal Review</strong>
                    <small>{activeAdv.name} · {activeAdv.degree}</small>
                  </div>
                </div>
                <span className="bar-verified-badge"><ShieldCheck size={13}/> Bar Verified</span>
              </div>
              <p className="advocate-quote">“If the deposit return is delayed past 30 days without written deduction notes, issue a formal statutory notice under Section 108 of TPA and Model Tenancy Act before filing in the Consumer Forum.”</p>
              <div className="advocate-review-foot">
                <span className="mono"><Award size={13}/> {activeAdv.barNo}</span>
                <button className="text-link" onClick={()=>toast(`Connecting you directly with ${activeAdv.name}`)}>
                  Consult {activeAdv.name.split(" ")[1]} <ArrowRight size={14}/>
                </button>
              </div>
            </div>

            <div className="response-disclaimer">
              <CircleHelp size={15}/>
              <span>This is general informational guidance, not a determination of your legal rights or outcome.</span>
            </div>
          </div>}
        </div>
        <div className="suggestions">
          {["What are my rights as a tenant?","How can I respond to a legal notice?","Explain this section simply."].map(s=><button key={s} onClick={()=>setText(s)}>{s}</button>)}
        </div>
        <form className="chat-input" onSubmit={e=>{e.preventDefault(); if(text.trim()){setSent(true);setText("");toast("Question added to thread")}}}><button type="button" className="input-icon" onClick={()=>toast("Attachment upload is ready for backend connection")}><Paperclip size={18}/></button><input value={text} onChange={e=>setText(e.target.value)} placeholder="Describe your legal issue in your own words…" maxLength={500}/><span className="char-count">{text.length}/500</span><Button type="submit" className="send-btn"><Send size={16}/></Button></form>
      </section>

      {/* Right Column: Advocate Details & Source Trail */}
      <aside className="sources-panel panel">
        {/* Advocate Details Section */}
        <div className="advocate-section">
          <div className="panel-head">
            <div><span className="mono label">LEGAL ADVOCATE</span><h3>Assigned Counsel</h3></div>
            <BriefcaseBusiness size={18}/>
          </div>
          <div className="advocate-card-wrapper">
            <div className="advocate-card-header">
              <div className="adv-avatar-large">KR</div>
              <div className="adv-main-info">
                <strong>{activeAdv.name}</strong>
                <small>{activeAdv.degree}</small>
                <span className="adv-status-tag"><CheckCircle2 size={12}/> {activeAdv.status}</span>
              </div>
            </div>
            <div className="adv-detail-rows">
              <div className="adv-detail-item">
                <span className="mono">BAR REG.</span>
                <strong>{activeAdv.barNo}</strong>
              </div>
              <div className="adv-detail-item">
                <span className="mono">EXPERIENCE</span>
                <strong>{activeAdv.experience}</strong>
              </div>
              <div className="adv-detail-item">
                <span className="mono">JURISDICTION</span>
                <strong>{activeAdv.court}</strong>
              </div>
              <div className="adv-detail-item">
                <span className="mono">RATING</span>
                <strong className="rating-text"><Star size={12} className="star-icon"/> {activeAdv.rating}</strong>
              </div>
            </div>
            <div className="adv-specialties">
              <span className="mono label">SPECIALTIES</span>
              <div className="tag-flex">
                {activeAdv.specialties.map(sp => <span key={sp} className="specialty-tag">{sp}</span>)}
              </div>
            </div>
            <div className="adv-contact-box">
              <div className="contact-row"><Phone size={13}/> <span>{activeAdv.phone}</span></div>
              <div className="contact-row"><Mail size={13}/> <span>{activeAdv.email}</span></div>
            </div>
            <div className="adv-actions">
              <Button variant="copper" className="w-full" onClick={()=>toast(`Consultation request sent to ${activeAdv.name}`)}>
                <UserCheck size={15}/> Request Consultation
              </Button>
            </div>
          </div>
        </div>

        <div className="sources-divider"/>

        {/* Source Trail Section */}
        <div className="sources-section">
          <div className="panel-head">
            <div><span className="mono label">SOURCE TRAIL</span><h3>Relevant sources</h3></div>
            <BookOpen size={18}/>
          </div>
          <p className="source-intro">The statutory records below informed this response context.</p>
          {sources.map(s=><div className="source-card" key={s.section}>
            <span className="source-tag">{s.tag}</span>
            <span className="mono">{s.section}</span>
            <strong>{s.title}</strong>
            <small>{s.act}</small>
            <button onClick={()=>toast("Source viewer placeholder — connect to legal database")}>View source <ArrowRight size={13}/></button>
          </div>)}
          <div className="source-note">
            <ShieldCheck size={16}/><span>Sources are shown for context. They do not establish a definitive legal determination.</span>
          </div>
        </div>
      </aside>
    </div>
  </> 
}
type LegalSection = {section:string;title:string;explanation:string;keywords:string[];source:string};
type LegalAct = {act:string;category:string;jurisdiction:string;keywords:string[];sections:LegalSection[]};
const legalActs: LegalAct[] = [
  {act:"Bharatiya Nyaya Sanhita (BNS), 2023",category:"Criminal Law",jurisdiction:"India",keywords:["criminal intimidation","offence","criminal law"],sections:[]},
  {act:"Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023",category:"Criminal Law",jurisdiction:"India",keywords:["criminal procedure","investigation","bail"],sections:[]},
  {act:"Bharatiya Sakshya Adhiniyam (BSA), 2023",category:"Criminal Law",jurisdiction:"India",keywords:["evidence","proof","criminal evidence"],sections:[]},
  {act:"Code of Civil Procedure (CPC), 1908",category:"Civil Law",jurisdiction:"India",keywords:["civil procedure","property dispute","civil suit"],sections:[]},
  {act:"Indian Contract Act, 1872",category:"Civil Law",jurisdiction:"India",keywords:["contract breach","breach of contract","agreement"],sections:[{section:"Section 73",title:"Compensation for loss or damage caused by breach of contract",explanation:"A source-linked section record reserved for verified statutory text and plain-language explanation.",keywords:["contract breach","damages","breach of contract"],source:"India Code / verified act text"}]},
  {act:"Specific Relief Act, 1963",category:"Civil Law",jurisdiction:"India",keywords:["specific performance","injunction","civil remedy"],sections:[]},
  {act:"Transfer of Property Act (TPA), 1882",category:"Civil Law",jurisdiction:"India",keywords:["property dispute","land dispute","lease","property transfer"],sections:[{section:"Section 108",title:"Rights and liabilities of lessor and lessee",explanation:"A source-linked section record reserved for verified statutory text and plain-language explanation.",keywords:["lease","landlord","tenant","property dispute"],source:"India Code / verified act text"}]},
  {act:"Limitation Act, 1963",category:"Civil Law",jurisdiction:"India",keywords:["limitation","time limit","civil claim"],sections:[]},
  {act:"Hindu Marriage Act, 1955",category:"Family Law",jurisdiction:"India",keywords:["divorce","marriage","maintenance","family law"],sections:[]},
  {act:"Hindu Succession Act, 1956",category:"Family Law",jurisdiction:"India",keywords:["inheritance","succession","property rights"],sections:[]},
  {act:"Protection of Women from Domestic Violence Act, 2005",category:"Family Law",jurisdiction:"India",keywords:["domestic violence","protection order","residence"],sections:[]},
  {act:"Guardians and Wards Act, 1890",category:"Family Law",jurisdiction:"India",keywords:["guardianship","child custody","family law"],sections:[]},
  {act:"Negotiable Instruments Act, 1881",category:"Commercial Law",jurisdiction:"India",keywords:["section 138","cheque bounce","dishonour of cheque","negotiable instrument"],sections:[{section:"Section 138",title:"Dishonour of cheque for insufficiency, etc., of funds in the account",explanation:"Where a cheque is returned unpaid for the statutory reasons described in the provision, the section sets out the offence and conditions that apply. Verify the current statutory text and procedural requirements before relying on it.",keywords:["section 138","cheque bounce","dishonour of cheque"],source:"India Code / Indian Kanoon section mirror"}]},
  {act:"Arbitration and Conciliation Act, 1996",category:"Commercial Law",jurisdiction:"India",keywords:["arbitration","dispute resolution","conciliation"],sections:[]},
  {act:"Commercial Courts Act, 2015",category:"Commercial Law",jurisdiction:"India",keywords:["commercial dispute","commercial court","business dispute"],sections:[]},
  {act:"Tamil Nadu Civil Courts Act",category:"Tamil Nadu Laws",jurisdiction:"Tamil Nadu",keywords:["tamil nadu court","civil court","district court"],sections:[]},
  {act:"Tamil Nadu Court Fees and Suits Valuation Act",category:"Tamil Nadu Laws",jurisdiction:"Tamil Nadu",keywords:["court fees","suit valuation","filing fee"],sections:[]},
  {act:"Tamil Nadu Land Laws",category:"Tamil Nadu Laws",jurisdiction:"Tamil Nadu",keywords:["land dispute tamil nadu","patta","land records","property dispute"],sections:[]},
  {act:"Tamil Nadu Rent Laws",category:"Tamil Nadu Laws",jurisdiction:"Tamil Nadu",keywords:["rent","tenancy","tenant","landlord"],sections:[]},
  {act:"Other important Tamil Nadu State Acts",category:"Tamil Nadu Laws",jurisdiction:"Tamil Nadu",keywords:["tamil nadu state act","state law"],sections:[]}
];
const legalCategories = ["All","Criminal Law","Civil Law","Family Law","Commercial Law","Tamil Nadu Laws"] as const;
type LegalResult = {act:string;category:string;jurisdiction:string;section:string;title:string;explanation:string;keywords:string[];source:string;overview?:boolean};
function SearchPage() { const [q,setQ]=useState(""); const [category,setCategory]=useState<typeof legalCategories[number]>("All"); const [selected,setSelected]=useState<LegalResult|null>(null); const results=useMemo<LegalResult[]>(()=>legalActs.flatMap(a=>a.sections.length?a.sections.map(s=>({...s,act:a.act,category:a.category,jurisdiction:a.jurisdiction})): [{act:a.act,category:a.category,jurisdiction:a.jurisdiction,section:"Act index",title:`${a.act} — searchable act record`,explanation:"This catalog entry identifies the Act and its search vocabulary. Verified section text and current amendments should be loaded from a connected legal database/API.",keywords:[...a.keywords],source:"Act metadata / API-ready",overview:true}]).filter(r=>category==="All"||r.category===category).filter(r=>{const needle=q.trim().toLowerCase();return !needle||[r.act,r.category,r.jurisdiction,r.section,r.title,r.explanation,...r.keywords].join(" ").toLowerCase().includes(needle)}),[q,category]); return <><PageHeader kicker="LEGAL SEARCH / 03" title="Search the record."><Button variant="outline" onClick={()=>toast("Choose a category or search by Act, section, or keyword")}> <Filter size={16}/> Search guide</Button></PageHeader><div className="search-bar"><Search size={19}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search section number, Act name, or legal keyword…"/><span className="mono">{results.length} RESULTS</span></div><div className="legal-filter-row"><span className="mono label">FILTER BY CATEGORY</span>{legalCategories.map(c=><button key={c} className={category===c?"active":""} onClick={()=>setCategory(c)}>{c}</button>)}</div><div className="filter-row legal-search-meta"><span>Showing <strong>{results.length}</strong> records{q&&<> for <strong>“{q}”</strong></>}</span><span className="mono">INDIA + TAMIL NADU INDEX</span></div><div className="results-layout"><div className="results-list legal-results">{results.length?results.map(r=><article className="result-card legal-result-card" key={`${r.act}-${r.section}`}><div className="result-top"><span className="mono">{r.section}</span><span className="source-tag">{r.category}</span></div><div className="legal-result-act"><strong>{r.act}</strong><span>{r.jurisdiction} applicability</span></div><h3>{r.title}</h3><p>{r.explanation}</p><div className="keyword-row">{r.keywords.slice(0,4).map(k=><span key={k}>{k}</span>)}</div><button className="text-link" onClick={()=>setSelected(r)}>View details <ArrowRight size={14}/></button></article>):<div className="empty-state legal-empty"><Search size={25}/><strong>No matching legal records</strong><span>Try an Act name, section number, keyword, or another category.</span></div>}</div><aside className="search-aside legal-index-aside"><div className="aside-index mono">SEARCH INDEX</div><strong>{legalActs.length}</strong><span>structured Acts indexed</span><div className="index-rule"/><p>Section text is displayed only when a verified record is available. Connect a legal database/API for complete and current coverage.</p><div className="aside-jurisdictions"><span>INDIA</span><span>TAMIL NADU</span></div></aside></div>{selected&&<div className="legal-detail-backdrop" onClick={()=>setSelected(null)}><section className="legal-detail" onClick={e=>e.stopPropagation()}><button className="detail-close" onClick={()=>setSelected(null)}><X size={17}/></button><span className="mono label">LEGAL SEARCH / RESULT DETAIL</span><h2>{selected.title}</h2><div className="detail-act"><strong>{selected.act}</strong><span>{selected.category} · {selected.jurisdiction}</span></div><div className="detail-fields"><label>Section<strong>{selected.section}</strong></label><label>Applicability<strong>{selected.jurisdiction}</strong></label></div><p>{selected.explanation}</p><div className="keyword-row">{selected.keywords.map(k=><span key={k}>{k}</span>)}</div><div className="detail-note"><CircleHelp size={16}/><span>Informational index only. Verify the current Act text, amendments, rules, and applicable procedure with an authoritative source or qualified legal professional.</span></div></section></div>}</> }
function Documents() { const [uploaded,setUploaded]=useState(false); return <><PageHeader kicker="DOCUMENT ANALYSIS / 04" title="Bring in the brief."><Button variant="outline" onClick={()=>toast("Supported: PDF, DOCX, TXT")}> <CircleHelp size={16}/> Supported formats</Button></PageHeader><div className="document-grid"><section className="panel upload-panel"><div className="upload-icon"><Upload size={22}/></div><h2>Upload a legal document</h2><p>Drop a file here, or choose one from your device to begin an AI-assisted review.</p><div className="upload-drop" onClick={()=>{setUploaded(true);toast("Document queued for analysis")}}><FileText size={22}/><strong>{uploaded?"lease-agreement.pdf":"Choose a file to upload"}</strong><span>{uploaded?"PDF · 1.2 MB · Ready to analyze":"PDF, DOCX, or TXT · up to 25 MB"}</span></div><div className="privacy-line"><LockKeyhole size={15}/> Files remain private to your workspace.</div></section><section className="panel pipeline-panel"><div className="panel-head"><div><span className="mono label">ANALYSIS PIPELINE</span><h3>What happens next</h3></div><Sparkles size={18}/></div>{["Upload","Extract text","Analyze","Generate insights"].map((x,i)=><div className={`pipeline-step ${uploaded&&i===0?"complete":""}`} key={x}><span>{uploaded&&i===0?<Check size={14}/>:`0${i+1}`}</span><strong>{x}</strong>{i===0&&uploaded&&<small>Complete</small>}</div>)}<div className="pipeline-foot"><span className="mono">PROVENANCE NOTE</span>Analysis is assistive. It does not determine legal validity or provide definitive conclusions.</div></section></div><div className="panel document-preview"><div className="panel-head"><div><span className="mono label">RECENT DOCUMENTS</span><h3>Your analysis queue</h3></div><span className="mono">{uploaded?"01 FILE":"00 FILES"}</span></div>{uploaded?<div className="document-row"><span className="doc-file"><FileText size={18}/></span><div><strong>lease-agreement.pdf</strong><p>Uploaded just now · waiting for analysis</p></div><span className="status-pill"><span/> Ready</span><button onClick={()=>toast("Analysis placeholder — connect FastAPI pipeline")}>Analyze <ArrowRight size={14}/></button></div>:<div className="empty-state"><span className="mono">QUEUE / 00</span><FileText size={25}/><strong>No documents yet</strong><span>Upload your first document to see it here.</span></div>}</div></> }
function SimpleList({ type }: {type:"history"|"saved"}) { const isSaved=type==="saved"; return <><PageHeader kicker={isSaved?"SAVED RESPONSES / 06":"CONVERSATION HISTORY / 05"} title={isSaved?"Keep what matters close.":"Your question trail."}><Button variant="outline" onClick={()=>toast("Search is ready")}><Search size={16}/> Search</Button></PageHeader><div className="list-toolbar"><div className="search-inline"><Search size={16}/><input placeholder={isSaved?"Search saved responses":"Search conversations"}/></div><button>All categories <ChevronRight size={14}/></button><span className="mono">{isSaved?"12 SAVED":"24 THREADS"}</span></div><div className="full-list panel">{(isSaved?conversations.map(c=>({...c,title:c.title+" — key points",date:"Saved "+c.date})):conversations.concat([{title:"Small claims process overview",date:"Aug 19, 2026",category:"Civil",preview:"What should I prepare before filing a small claim?"}])).map(c=><div className="full-row" key={c.title}><span className={`row-leading ${isSaved?"copper":""}`}>{isSaved?<Bookmark size={16}/>:<MessageSquare size={16}/>}</span><div><strong>{c.title}</strong><p>{c.preview}</p></div><span className="row-category">{c.category}</span><small>{c.date}</small><button onClick={()=>toast("Opening item")}>{isSaved?<Bookmark size={16}/>:<ArrowRight size={16}/>}</button></div>)}</div></> }
function SettingsPage(){return <><PageHeader kicker="PROFILE / SETTINGS / 07" title="Your workspace, your way."/><div className="settings-grid"><section className="panel settings-card"><span className="avatar large">AR</span><div><h3>Alex Rivera</h3><p>alex.rivera@example.com</p></div><Button variant="outline" onClick={()=>toast("Profile editor placeholder")}>Edit profile <PenLine size={15}/></Button></section><section className="panel settings-card vertical"><div className="panel-head"><div><span className="mono label">PREFERENCES</span><h3>Workspace settings</h3></div></div>{[["Email updates","Receive a monthly summary of your workspace activity"],["Source context","Show source notes beside assistant responses"],["Private workspace","Your documents and conversations stay scoped to you"]].map(([t,d],i)=><div className="setting-row" key={t}><div><strong>{t}</strong><span>{d}</span></div><button className={`toggle ${i!==1?"on":""}`} onClick={()=>toast(`${t} preference updated`)}><span/></button></div>)}</section></div></> }
function Capabilities(){return <div className="capabilities-page"><PublicNav/><main className="container capabilities-main"><div className="cap-hero-grid"><div className="cap-hero"><span className="mono label">CAPABILITIES / 01</span><h1>Move from <em>question</em><br/>to clearer action.</h1><p>Explore a calmer legal information workspace built for everyday questions, source-backed research, document insights, and advisor review.</p><div className="hero-actions"><Link href="/choose-role" className="btn btn-bloodstone btn-large">Choose your workspace <ArrowRight size={16}/></Link></div></div><div className="cap-cards-side"><div className="cap-card cap-card-sage"><div className="cap-index mono">01 / ASK</div><MessageSquare size={24}/><strong>Ask in your own words.</strong><span>Start with the situation, not the legal vocabulary.</span></div><div className="cap-card cap-card-blood"><div className="cap-index mono">02 / REVIEW</div><FileSearch size={24}/><strong>See what needs attention.</strong><span>Organize sources, documents, and follow-up in one place.</span></div></div></div><div className="capability-steps"><span className="mono label">CORE PLATFORM FEATURES</span>{[["01","AI Legal Assistant","Interactive guidance for understanding housing, employment, contract, and civil queries."],["02","Structured Legal Search","Explore indexed central Acts (BNS, BNSS, BSA, CPC, ICA) and state laws (Tamil Nadu Acts)."],["03","Document Analysis Pipeline","Upload contracts, leases, or notices to extract key clauses, dates, and obligations."],["04","Advisor Follow-Up Console","Review queue for legal advisors to add court details, hearing years, and procedural steps."]].map(([num,title,desc])=><div key={num}><b>{num}</b><strong>{title}</strong><span className="step-desc">{desc}</span></div>)}</div></main><footer className="public-footer"><div className="container footer-inner"><Logo /><span className="mono">© 2026 COUNSEL / LEGAL INTELLIGENCE</span><div><Link href="/capabilities">Capabilities</Link><Link href="/how">How it works</Link><Link href="/sources">Sources</Link><a href="mailto:hello@example.com">Contact</a></div></div></footer></div>}
function HowItWorks(){return <div className="capabilities-page"><PublicNav/><main className="container capabilities-main"><div className="cap-hero-grid"><div className="cap-hero"><span className="mono label">HOW IT WORKS / 02</span><h1>From question to<br/><em>verified source trail.</em></h1><p>Counsel pairs plain-language AI responses with real statutory acts and reference materials so you can trace every explanation back to its authority.</p><div className="hero-actions"><Link href="/choose-role" className="btn btn-bloodstone btn-large">Try the workspace <ArrowRight size={16}/></Link><Link href="/sources" className="btn btn-outline btn-large">Explore legal sources</Link></div></div><div className="cap-cards-side"><div className="cap-card cap-card-blood"><div className="cap-index mono">PROCESS / 01</div><Sparkles size={24}/><strong>Source Provenance</strong><span>Legal context is presented for guidance—never overconfident assertions.</span></div></div></div><div className="capability-steps"><span className="mono label">THE 5-STEP WORKFLOW</span>{[["01","Natural Language Question","Ask your legal query in plain everyday language without needing complex legal jargon."],["02","AI Context Processing","The AI system analyzes key facts, identifies legal domains, and frames potential issues."],["03","Knowledge & Statutory Retrieval","Queries relevant acts, section numbers, and precedents across central and state laws."],["04","Plain-Language Explanation","Generates a structured overview with key steps, rights, and potential considerations."],["05","Advisor Escalation Option","When human context is needed, flag queries for legal advisor review and hearing tracking."]].map(([num,title,desc])=><div key={num}><b>{num}</b><strong>{title}</strong><span className="step-desc">{desc}</span></div>)}</div></main><footer className="public-footer"><div className="container footer-inner"><Logo /><span className="mono">© 2026 COUNSEL / LEGAL INTELLIGENCE</span><div><Link href="/capabilities">Capabilities</Link><Link href="/how">How it works</Link><Link href="/sources">Sources</Link><a href="mailto:hello@example.com">Contact</a></div></div></footer></div>}
function SourcesPage(){return <div className="capabilities-page"><PublicNav/><main className="container capabilities-main"><div className="cap-hero-grid"><div className="cap-hero"><span className="mono label">LEGAL SOURCES & PROVENANCE / 03</span><h1>Keep the <em>record</em> close.</h1><p>Every response is supported by indexed statutory acts, verified section citations, and official code references across central and state jurisdictions.</p><div className="hero-actions"><Link href="/app/search" className="btn btn-bloodstone btn-large">Search Legal Database <ArrowRight size={16}/></Link><Link href="/how" className="btn btn-outline btn-large">Learn how it works</Link></div></div><div className="cap-cards-side"><div className="cap-card cap-card-sage"><div className="cap-index mono">03 / PROVENANCE</div><BookOpen size={24}/><strong>Source-Backed Responses</strong><span>References are presented as context and statutory evidence, not certainty.</span></div></div></div><div className="capability-steps"><span className="mono label">INDEXED JURISDICTIONS & ACTS</span>{[["01","Bharatiya Nyaya Sanhita (BNS) & Criminal Codes","Indexed statutory provisions for offences, investigation procedure, and evidence rules."],["02","Code of Civil Procedure & Indian Contract Act","Section 73 breach remedies, property transfer provisions (TPA Sec 108), and specific relief."],["03","Commercial & Financial Legislation","Section 138 Negotiable Instruments Act cheque bounce provisions and Arbitration frameworks."],["04","Tamil Nadu State Special Acts","Tamil Nadu Land Laws, Civil Courts Act, Rent Control Regulations, and local court fee structures."]].map(([num,title,desc])=><div key={num}><b>{num}</b><strong>{title}</strong><span className="step-desc">{desc}</span></div>)}</div></main><footer className="public-footer"><div className="container footer-inner"><Logo /><span className="mono">© 2026 COUNSEL / LEGAL INTELLIGENCE</span><div><Link href="/capabilities">Capabilities</Link><Link href="/how">How it works</Link><Link href="/sources">Sources</Link><a href="mailto:hello@example.com">Contact</a></div></div></footer></div>}
function RoleLogin(){const [role,setRole]=useState<"user"|"advisor">("user");return <div className="role-page"><div className="role-card"><Logo/><span className="mono label">BEFORE YOU CONTINUE</span><h1>Choose your<br/><em>workspace.</em></h1><div className="role-options"><button className={role==="user"?"selected":""} onClick={()=>setRole("user")}><UserRound size={20}/><span><strong>I'm a user</strong><small>Ask questions and keep your research organized.</small></span><Check size={17}/></button><button className={role==="advisor"?"selected":""} onClick={()=>setRole("advisor")}><BriefcaseBusiness size={20}/><span><strong>I'm a legal advisor</strong><small>Review queries and add hearing follow-up details.</small></span><Check size={17}/></button></div><Link href={role==="advisor"?"/advisor-login":"/user-login"} className="btn btn-bloodstone auth-submit">Continue as {role==="advisor"?"legal advisor":"user"} <ArrowRight size={16}/></Link><Link href="/site" className="back-link role-back">← View the Counsel landing page</Link></div></div>}
function AdvisorLogin(){return <div className="auth-page advisor-login"><div className="auth-art"><Logo/><div><span className="mono label">ADVISOR ACCESS</span><h1>Bring a<br/><em>human view.</em></h1><p>Review user queries that need procedural context, court details, and hearing follow-up.</p></div><span className="mono auth-foot">COUNSEL / ADVISOR CONSOLE</span></div><div className="auth-form"><Link href="/choose-role" className="back-link">← Change workspace</Link><div className="auth-inner"><span className="mono label">LEGAL ADVISOR SIGN IN</span><h2>Open your advisor queue.</h2><p>Use your professional workspace credentials to continue.</p><label>Advisor email<input type="email" placeholder="advisor@example.com" /></label><label>Password<input type="password" placeholder="Enter your password" /></label><label className="check-label"><input type="checkbox"/> Keep me signed in</label><Link href="/advisor" className="btn btn-bloodstone auth-submit">Sign in to advisor console <ArrowRight size={16}/></Link><div className="auth-switch">Need a user workspace instead? <Link href="/user-login">Sign in as a user</Link></div></div></div></div>}
function AdvisorWorkspace(){const [selected,setSelected]=useState<string|null>(null);const [accepted,setAccepted]=useState<string[]>([]);const cases=[{id:"CASE / 1042",title:"Tenant security deposit issue",user:"Priya N.",court:"District Consumer Forum",year:"2026",hearing:"Awaiting first hearing",priority:"Needs review",preview:"Landlord has not returned the deposit after move-out."},{id:"CASE / 1038",title:"Employment termination notice",user:"Rahul M.",court:"Labour Court · Central",year:"2026",hearing:"Hearing in 14 days",priority:"Upcoming",preview:"User needs help understanding notice period and next filing."},{id:"CASE / 1029",title:"Contract clause explanation",user:"Maya S.",court:"—",year:"—",hearing:"Court details needed",priority:"New query",preview:"A clause needs a plain-language explanation before escalation."}];return <div className="advisor-page"><header className="advisor-header"><Logo/><div><span className="mono">ADVISOR CONSOLE / 01</span><strong>Legal advisor workspace</strong></div><Link href="/" className="btn btn-outline">Exit <ArrowRight size={14}/></Link></header><main className="advisor-main"><div className="advisor-intro"><div><span className="mono label">ADVISOR QUEUE / TODAY</span><h1>Queries that need<br/><em>a human view.</em></h1><p>Review incoming questions, identify the right court and hearing year, and carry the next step forward.</p></div><div className="advisor-stat"><span className="mono">OPEN QUEUE</span><strong>{cases.length}</strong><small>queries awaiting review</small></div></div><div className="advisor-layout"><section className="case-queue"><div className="queue-head"><div><span className="mono label">USER QUERIES / UNDER PROCESS</span><h2>Open cases</h2></div><button className="filter-chip" onClick={()=>toast("Queue filters opened")}> <Filter size={14}/> Filter</button></div>{cases.map(c=><button className={`case-row ${selected===c.id?"selected":""}`} key={c.id} onClick={()=>setSelected(c.id)}><div className="case-id mono">{c.id}</div><div className="case-main"><strong>{c.title}</strong><p>{c.preview}</p><span className="case-user">Submitted by {c.user}</span></div><div className="case-meta"><span className={`case-priority ${c.priority==="Upcoming"?"upcoming":""}`}>{c.priority}</span><small><BriefcaseBusiness size={12}/> {c.court}</small><small><Clock3 size={12}/> {c.hearing}</small><small><History size={12}/> Year: {c.year}</small></div><ChevronRight size={17}/></button>)}</section><aside className="case-detail">{selected?<>{(()=>{const c=cases.find(x=>x.id===selected)!;return <><span className="mono label">CASE DETAIL / {c.id.split(" / ")[1]}</span><h2>{c.title}</h2><p className="detail-preview">{c.preview}</p><div className="detail-fields"><label>User<strong>{c.user}</strong></label><label>Court<strong>{c.court}</strong></label><label>Hearing year<strong>{c.year}</strong></label><label>Next status<strong>{c.hearing}</strong></label></div><div className="detail-note"><CircleHelp size={16}/><span>Advisor input should clarify the next procedural step. It should not be presented as a definitive legal outcome.</span></div><button className="btn btn-bloodstone" onClick={()=>{setAccepted([...accepted,c.id]);toast("Case marked for advisor follow-up")}}>{accepted.includes(c.id)?"Follow-up recorded":"Carry out advisor follow-up"} <ArrowRight size={15}/></button></>})()}</>:<div className="detail-empty"><span className="mono">SELECT A CASE</span><BriefcaseBusiness size={27}/><h3>Open a query to review.</h3><p>Choose a case to see the court, hearing year, and requested advisor action.</p></div>}</aside></div></main></div>}
function Login(){return <div className="auth-page"><div className="auth-art"><Logo/><div><span className="mono label">A CLEARER WAY THROUGH COMPLEXITY</span><h1>Good questions<br /><em>deserve context.</em></h1><p>AI-assisted legal information with the source trail kept in view.</p></div><span className="mono auth-foot">COUNSEL / LEGAL INTELLIGENCE</span></div><div className="auth-form"><Link href="/" className="back-link">← Back to counsel</Link><div className="auth-inner"><span className="mono label">WELCOME BACK</span><h2>Sign in to your workspace.</h2><p>Continue your legal research with the context intact.</p><label>Email address<input type="email" placeholder="you@example.com" /></label><label>Password<input type="password" placeholder="Enter your password" /></label><div className="form-meta"><label className="check-label"><input type="checkbox"/> Remember me</label><a href="#forgot">Forgot password?</a></div><Link href="/app" className="btn btn-primary auth-submit">Sign in <ArrowRight size={16}/></Link><div className="auth-switch">New to Counsel? <Link href="/register">Create an account</Link></div></div></div></div>}
function Register(){return <div className="auth-page"><div className="auth-art"><Logo/><div><span className="mono label">A PRIVATE PLACE TO BEGIN</span><h1>Make the<br /><em>complex legible.</em></h1><p>Save your questions, find the source, and keep moving with a clearer view.</p></div><span className="mono auth-foot">COUNSEL / LEGAL INTELLIGENCE</span></div><div className="auth-form"><Link href="/" className="back-link">← Back to counsel</Link><div className="auth-inner"><span className="mono label">CREATE YOUR WORKSPACE</span><h2>Begin with a question.</h2><p>Set up your personal legal information workspace.</p><label>Full name<input placeholder="Alex Rivera" /></label><label>Email address<input type="email" placeholder="you@example.com" /></label><label>Password<input type="password" placeholder="At least 8 characters" /></label><label className="check-label"><input type="checkbox"/> I agree to the terms and informational-use disclaimer.</label><Link href="/app" className="btn btn-primary auth-submit">Create workspace <ArrowRight size={16}/></Link><div className="auth-switch">Already have an account? <Link href="/login">Sign in</Link></div></div></div></div>}
export default function Home(){ const [loc] = useLocation(); const page=useMemo(()=>{if(loc==="/")return <RoleLogin/>;if(loc==="/site")return <Landing/>;if(loc==="/capabilities")return <Capabilities/>;if(loc==="/how"||loc==="/how-it-works")return <HowItWorks/>;if(loc==="/sources")return <SourcesPage/>;if(loc==="/choose-role")return <RoleLogin/>;if(loc==="/advisor-login")return <AdvisorLogin/>;if(loc==="/advisor")return <AdvisorWorkspace/>;if(loc==="/login")return <RoleLogin/>;if(loc==="/user-login")return <Login/>;if(loc==="/register")return <Register/>;let content:React.ReactNode=loc==="/app/assistant"?<Assistant/>:loc==="/app/search"?<SearchPage/>:loc==="/app/documents"?<Documents/>:loc==="/app/history"?<SimpleList type="history"/>:loc==="/app/saved"?<SimpleList type="saved"/>:loc==="/app/settings"?<SettingsPage/>:<Overview/>;return <Shell>{content}</Shell>},[loc]);return page }
