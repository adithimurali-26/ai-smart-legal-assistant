/**
 * Unified API Client for Indian Legal Intelligence Platform
 */

export interface LegalSourceItem {
  id?: string;
  act: string;
  section: string;
  title: string;
  tag?: string;
  url?: string;
  explanation?: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant" | "advisor";
  content: string;
  explanationMode?: "simple" | "professional";
  structured_analysis?: {
    summary: string;
    applicableLaws: { act: string; section: string; title: string; explanation: string }[];
    nextSteps: string[];
    evidenceToGather: string[];
    potentialIssues: string[];
  } | null;
  sources_used?: LegalSourceItem[];
  verification_state?: string;
  created_at: string;
}

export interface ConversationItem {
  id: string;
  title: string;
  category: string;
  preview: string;
  date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AdvocateItem {
  id: string;
  name: string;
  degree: string;
  title: string;
  barNo: string;
  experience: string;
  court: string;
  location: string;
  rating: string;
  status: string;
  phone: string;
  email: string;
  specialties: string[];
  bio?: string;
}

export interface CaseQueueItem {
  id: string;
  caseId: string;
  title: string;
  user: string;
  userEmail?: string;
  court: string;
  year: string;
  hearing: string;
  priority: string;
  preview: string;
  brief?: {
    summary: string;
    facts: string[];
    legalIssues: string[];
    recommendedActions: string[];
  } | null;
}

export interface DocumentAudit {
  documentType: string;
  summary: string;
  parties: { role: string; name: string }[];
  importantDates: { label: string; date: string }[];
  financialAmounts: { description: string; amount: string }[];
  obligations: string[];
  terminationConditions: string[];
  deadlines: string[];
  riskyClauses: { clause: string; riskLevel: "low" | "medium" | "high"; explanation: string }[];
  missingClauses: string[];
}

export const api = {
  getToken(): string | null {
    return localStorage.getItem("counsel_token");
  },

  setToken(token: string) {
    localStorage.setItem("counsel_token", token);
  },

  clearToken() {
    localStorage.removeItem("counsel_token");
    localStorage.removeItem("counsel_user");
  },

  getUser(): any | null {
    try {
      const u = localStorage.getItem("counsel_user");
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  },

  setUser(user: any) {
    localStorage.setItem("counsel_user", JSON.stringify(user));
  },

  async fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    const token = this.getToken();
    const headers = new Headers(options.headers || {});
    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return fetch(url, { ...options, credentials: "include", headers });
  },

  // Auth
  async login(email: string, password: string) {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Login failed" }));
      throw new Error(err.error || "Login failed");
    }
    const data = await res.json();
    if (data.token) this.setToken(data.token);
    if (data.user) this.setUser(data.user);
    return data;
  },

  async register(full_name: string, email: string, password: string, role = "user") {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ full_name, email, password, role }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Registration failed" }));
      throw new Error(err.error || "Registration failed");
    }
    const data = await res.json();
    if (data.token) this.setToken(data.token);
    if (data.user) this.setUser(data.user);
    return data;
  },

  async getMe() {
    const res = await this.fetchWithAuth("/api/auth/me");
    if (!res.ok) return null;
    const data = await res.json();
    if (data.user) this.setUser(data.user);
    return data.user;
  },

  // Chat
  async getConversations(): Promise<ConversationItem[]> {
    try {
      const res = await this.fetchWithAuth("/api/chat/conversations");
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  async createConversation(title: string, category: string): Promise<ConversationItem | null> {
    try {
      const res = await this.fetchWithAuth("/api/chat/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, category }),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async getMessages(conversationId: string): Promise<ChatMessage[]> {
    try {
      const res = await this.fetchWithAuth(`/api/chat/conversations/${conversationId}`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.messages || [];
    } catch {
      return [];
    }
  },

  async sendMessage(conversationId: string, content: string, explanationMode: "simple" | "professional" = "simple"): Promise<any> {
    const res = await this.fetchWithAuth(`/api/chat/conversations/${conversationId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, explanationMode }),
    });
    if (!res.ok) {
      throw new Error("Failed to send message to legal assistant");
    }
    return await res.json();
  },

  // Legal Search
  async searchLaws(query: string, category: string = "All") {
    try {
      const res = await fetch(`/api/legal-search?q=${encodeURIComponent(query)}&category=${encodeURIComponent(category)}`);
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  // Documents
  async uploadDocument(file: File): Promise<{ document: any; analysis: DocumentAudit }> {
    const formData = new FormData();
    formData.append("file", file);

    const res = await this.fetchWithAuth("/api/documents/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      throw new Error("Document upload or analysis failed");
    }
    return await res.json();
  },

  async getDocuments() {
    try {
      const res = await this.fetchWithAuth("/api/documents");
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  async getDocumentAnalysis(id: string) {
    try {
      const res = await this.fetchWithAuth(`/api/documents/${id}`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  // Advocates & Advisor Queue
  async getAdvisors(): Promise<AdvocateItem[]> {
    try {
      const res = await fetch("/api/advisors");
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  async getAdvisorQueue(): Promise<CaseQueueItem[]> {
    try {
      const res = await this.fetchWithAuth("/api/advisors/queue");
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  async requestConsultation(advisorId: string, notes: string, caseId?: string) {
    const res = await this.fetchWithAuth("/api/advisors/consult", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ advisorId, notes, caseId }),
    });
    return await res.json();
  },

  async acceptCase(caseId: string, court?: string, year?: string, notes?: string) {
    const res = await this.fetchWithAuth(`/api/advisors/accept-case/${caseId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ court, year, notes }),
    });
    return await res.json();
  },

  // Saved Responses
  async getSavedResponses() {
    try {
      const res = await this.fetchWithAuth("/api/saved-responses");
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  async saveResponse(title: string, content: string, category: string = "General") {
    const res = await this.fetchWithAuth("/api/saved-responses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, category }),
    });
    return await res.json();
  },

  // Cases & Timeline
  async getTimeline(caseId: string) {
    try {
      const res = await this.fetchWithAuth(`/api/timeline/${caseId}`);
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  async generateDraft(draftType: string, parties: any, demandedRelief: string, facts?: string, amountClaimed?: string) {
    const res = await this.fetchWithAuth("/api/legal-drafts/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ draftType, parties, demandedRelief, facts, amountClaimed }),
    });
    return await res.json();
  },
};
