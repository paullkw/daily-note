import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import path from "node:path";

const dbDir = path.join(process.cwd(), "data");
const dbPath = path.join(dbDir, "app.db");

type SqliteDatabase = InstanceType<typeof Database>;

declare global {
  var __sqliteDb: SqliteDatabase | undefined;
}

function createDb(): SqliteDatabase {
  mkdirSync(dbDir, { recursive: true });

  const db = new Database(dbPath);

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  return db;
}

const db = global.__sqliteDb ?? createDb();

if (process.env.NODE_ENV !== "production") {
  global.__sqliteDb = db;
}

type UserRow = {
  id: number;
  email: string;
  password_hash: string;
  created_at: string;
};

export type User = {
  id: number;
  email: string;
  passwordHash: string;
  createdAt: string;
};

function mapUser(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    createdAt: row.created_at,
  };
}

export function findUserByEmail(email: string): User | null {
  const statement = db.prepare<[string], UserRow>(
    "SELECT id, email, password_hash, created_at FROM users WHERE email = ?"
  );
  const row = statement.get(email);

  return row ? mapUser(row) : null;
}

export function findUserById(id: number): User | null {
  const statement = db.prepare<[number], UserRow>(
    "SELECT id, email, password_hash, created_at FROM users WHERE id = ?"
  );
  const row = statement.get(id);

  return row ? mapUser(row) : null;
}

export function createUser(email: string, passwordHash: string): User {
  const insertStatement = db.prepare<[string, string]>(
    "INSERT INTO users (email, password_hash) VALUES (?, ?)"
  );
  const result = insertStatement.run(email, passwordHash);

  const user = findUserById(Number(result.lastInsertRowid));

  if (!user) {
    throw new Error("Failed to create user");
  }

  return user;
}