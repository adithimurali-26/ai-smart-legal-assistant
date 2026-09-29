import fs from "fs";
import path from "path";
import { config } from "../config/env";
import { DatabaseSync } from "node:sqlite";
import pg from "pg";

let sqliteDb: DatabaseSync | null = null;
let pgPool: pg.Pool | null = null;
let isPostgres = false;

export async function initDatabase(): Promise<void> {
  if (config.databaseUrl && config.databaseUrl.startsWith("postgres")) {
    try {
      console.log("[DB] Connecting to PostgreSQL database...");
      pgPool = new pg.Pool({ connectionString: config.databaseUrl });
      await pgPool.query("SELECT 1");
      isPostgres = true;
      console.log("[DB] Connected to PostgreSQL successfully.");
      await initPostgresSchema();
      return;
    } catch (err) {
      console.warn("[DB] PostgreSQL connection failed, falling back to local SQLite:", err);
      pgPool = null;
    }
  }

  // Ensure data directory exists
  if (!fs.existsSync(config.dataDir)) {
    fs.mkdirSync(config.dataDir, { recursive: true });
  }

  const dbPath = path.join(config.dataDir, "legal_assistant.sqlite");
  console.log(`[DB] Initializing local persistent SQLite database at: ${dbPath}`);
  sqliteDb = new DatabaseSync(dbPath);
  sqliteDb.exec("PRAGMA journal_mode = WAL;");
  sqliteDb.exec("PRAGMA foreign_keys = ON;");
  initSqliteSchema();
  console.log("[DB] SQLite database initialized successfully.");
}

function initSqliteSchema(): void {
  if (!sqliteDb) return;

  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS legal_advisors (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      name TEXT NOT NULL,
      degree TEXT NOT NULL,
      title TEXT NOT NULL,
      bar_no TEXT NOT NULL,
      experience TEXT NOT NULL,
      court TEXT NOT NULL,
      location TEXT NOT NULL,
      rating TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      specialties TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Available',
      bio TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'General',
      preview TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL,
      sender TEXT NOT NULL,
      content TEXT NOT NULL,
      explanation_mode TEXT DEFAULT 'simple',
      structured_analysis TEXT,
      sources_used TEXT,
      verification_state TEXT DEFAULT 'Verified supporting source retrieved',
      created_at TEXT NOT NULL,
      FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS cases (
      id TEXT PRIMARY KEY,
      case_number TEXT UNIQUE NOT NULL,
      user_id TEXT NOT NULL,
      assigned_advisor_id TEXT,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      court TEXT DEFAULT '—',
      year TEXT DEFAULT '2026',
      hearing_status TEXT DEFAULT 'Awaiting review',
      priority TEXT DEFAULT 'Needs review',
      status TEXT DEFAULT 'open',
      preview TEXT,
      brief_json TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      case_id TEXT,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      size_bytes INTEGER NOT NULL,
      file_path TEXT NOT NULL,
      extracted_text TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS document_analyses (
      id TEXT PRIMARY KEY,
      document_id TEXT NOT NULL,
      document_type TEXT NOT NULL,
      summary TEXT NOT NULL,
      parties TEXT NOT NULL,
      important_dates TEXT NOT NULL,
      financial_amounts TEXT NOT NULL,
      obligations TEXT NOT NULL,
      termination_conditions TEXT NOT NULL,
      deadlines TEXT NOT NULL,
      risky_clauses TEXT NOT NULL,
      missing_clauses TEXT NOT NULL,
      related_laws TEXT,
      assigned_advocate_id TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS case_timeline_events (
      id TEXT PRIMARY KEY,
      case_id TEXT NOT NULL,
      event_date TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      source_type TEXT NOT NULL,
      confirmed INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS consultation_requests (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      advisor_id TEXT,
      case_id TEXT,
      conversation_id TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS legal_sources (
      id TEXT PRIMARY KEY,
      act_name TEXT NOT NULL,
      section TEXT NOT NULL,
      title TEXT NOT NULL,
      chapter TEXT,
      category TEXT NOT NULL,
      jurisdiction TEXT NOT NULL,
      year INTEGER,
      statutory_text TEXT NOT NULL,
      plain_explanation TEXT NOT NULL,
      keywords TEXT NOT NULL,
      source_url TEXT,
      verified INTEGER NOT NULL DEFAULT 1,
      effective_date TEXT
    );

    CREATE TABLE IF NOT EXISTS saved_responses (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      message_id TEXT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      preview TEXT NOT NULL,
      category TEXT NOT NULL,
      saved_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS legal_drafts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      case_id TEXT,
      draft_type TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      form_data TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_conversations_user ON conversations(user_id);
    CREATE INDEX IF NOT EXISTS idx_messages_conv ON messages(conversation_id);
    CREATE INDEX IF NOT EXISTS idx_cases_user ON cases(user_id);
    CREATE INDEX IF NOT EXISTS idx_cases_advisor ON cases(assigned_advisor_id);
    CREATE INDEX IF NOT EXISTS idx_documents_user ON documents(user_id);
    CREATE INDEX IF NOT EXISTS idx_timeline_case ON case_timeline_events(case_id);
    CREATE INDEX IF NOT EXISTS idx_sources_category ON legal_sources(category);
    CREATE INDEX IF NOT EXISTS idx_saved_user ON saved_responses(user_id);
  `);
}

async function initPostgresSchema(): Promise<void> {
  if (!pgPool) return;
  await pgPool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS legal_advisors (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      name TEXT NOT NULL,
      degree TEXT NOT NULL,
      title TEXT NOT NULL,
      bar_no TEXT NOT NULL,
      experience TEXT NOT NULL,
      court TEXT NOT NULL,
      location TEXT NOT NULL,
      rating TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      specialties TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Available',
      bio TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'General',
      preview TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL,
      sender TEXT NOT NULL,
      content TEXT NOT NULL,
      explanation_mode TEXT DEFAULT 'simple',
      structured_analysis TEXT,
      sources_used TEXT,
      verification_state TEXT DEFAULT 'Verified supporting source retrieved',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS cases (
      id TEXT PRIMARY KEY,
      case_number TEXT UNIQUE NOT NULL,
      user_id TEXT NOT NULL,
      assigned_advisor_id TEXT,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      court TEXT DEFAULT '—',
      year TEXT DEFAULT '2026',
      hearing_status TEXT DEFAULT 'Awaiting review',
      priority TEXT DEFAULT 'Needs review',
      status TEXT DEFAULT 'open',
      preview TEXT,
      brief_json TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      case_id TEXT,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      size_bytes BIGINT NOT NULL,
      file_path TEXT NOT NULL,
      extracted_text TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS document_analyses (
      id TEXT PRIMARY KEY,
      document_id TEXT NOT NULL,
      document_type TEXT NOT NULL,
      summary TEXT NOT NULL,
      parties TEXT NOT NULL,
      important_dates TEXT NOT NULL,
      financial_amounts TEXT NOT NULL,
      obligations TEXT NOT NULL,
      termination_conditions TEXT NOT NULL,
      deadlines TEXT NOT NULL,
      risky_clauses TEXT NOT NULL,
      missing_clauses TEXT NOT NULL,
      related_laws TEXT,
      assigned_advocate_id TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS case_timeline_events (
      id TEXT PRIMARY KEY,
      case_id TEXT NOT NULL,
      event_date TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      source_type TEXT NOT NULL,
      confirmed INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS consultation_requests (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      advisor_id TEXT,
      case_id TEXT,
      conversation_id TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS legal_sources (
      id TEXT PRIMARY KEY,
      act_name TEXT NOT NULL,
      section TEXT NOT NULL,
      title TEXT NOT NULL,
      chapter TEXT,
      category TEXT NOT NULL,
      jurisdiction TEXT NOT NULL,
      year INTEGER,
      statutory_text TEXT NOT NULL,
      plain_explanation TEXT NOT NULL,
      keywords TEXT NOT NULL,
      source_url TEXT,
      verified INTEGER NOT NULL DEFAULT 1,
      effective_date TEXT
    );

    CREATE TABLE IF NOT EXISTS saved_responses (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      message_id TEXT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      preview TEXT NOT NULL,
      category TEXT NOT NULL,
      saved_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS legal_drafts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      case_id TEXT,
      draft_type TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      form_data TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
}

// Convert '?' in SQL to '$1', '$2', etc. for PostgreSQL
function convertPlaceholders(sql: string): string {
  let counter = 1;
  return sql.replace(/\?/g, () => `$${counter++}`);
}

export const db = {
  async all<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    if (isPostgres && pgPool) {
      const pgSql = convertPlaceholders(sql);
      const res = await pgPool.query(pgSql, params);
      return res.rows as T[];
    }
    if (!sqliteDb) throw new Error("Database not initialized");
    const stmt = sqliteDb.prepare(sql);
    return stmt.all(...params) as T[];
  },

  async get<T = any>(sql: string, params: any[] = []): Promise<T | null> {
    if (isPostgres && pgPool) {
      const pgSql = convertPlaceholders(sql);
      const res = await pgPool.query(pgSql, params);
      return (res.rows[0] as T) || null;
    }
    if (!sqliteDb) throw new Error("Database not initialized");
    const stmt = sqliteDb.prepare(sql);
    const row = stmt.get(...params);
    return (row as T) || null;
  },

  async run(sql: string, params: any[] = []): Promise<{ changes: number }> {
    if (isPostgres && pgPool) {
      const pgSql = convertPlaceholders(sql);
      const res = await pgPool.query(pgSql, params);
      return { changes: res.rowCount || 0 };
    }
    if (!sqliteDb) throw new Error("Database not initialized");
    const stmt = sqliteDb.prepare(sql);
    stmt.run(...params);
    return { changes: 1 };
  },

  async exec(sql: string): Promise<void> {
    if (isPostgres && pgPool) {
      await pgPool.query(sql);
      return;
    }
    if (!sqliteDb) throw new Error("Database not initialized");
    sqliteDb.exec(sql);
  },
};
