import { loadPackage } from "../helpers/load-package.js";
import { type MapCache } from "../interfaces/map-cache.interface.js";
import type { Database } from "better-sqlite3";
import { pack, unpack } from "msgpackr";
import ms from "ms";

export interface DiskMapCacheOptions<Type> {
  tableName?: string;
  serializer?: (value: Type) => Buffer;
  deserializer?: (buffer: Buffer) => Type;
  maxItems?: number;
  maxAge?: number | string;
  disableCountCache?: boolean;
}

export class DiskMapCache<Type> implements MapCache<Type> {
  private database: Database;
  private tableName: string;
  private maxItems?: number;
  private disableCountCache: boolean;
  private serializer: (value: Type) => Buffer;
  private deserializer: (buffer: Buffer) => Type;
  private _count: number | null = null;

  constructor(database: string | Database, options?: DiskMapCacheOptions<Type>) {
    const Database = loadPackage<typeof import("better-sqlite3")>("better-sqlite3", () => require("better-sqlite3"));

    this.tableName = options?.tableName ?? "kas_cache";
    this.disableCountCache = options?.disableCountCache ?? false;
    this.maxItems = options?.maxItems;
    this.serializer = options?.serializer ?? pack;
    this.deserializer = options?.deserializer ?? unpack;

    if (typeof database === "string") {
      // path to where to put the database
      this.database = new Database(database);
    } else if (database instanceof Database) {
      this.database = database;
    }

    this.init();

    if (options?.maxAge) {
      const maxAge = typeof options.maxAge === "string" ? ms(options.maxAge) : options.maxAge;
      setInterval(() => {
        const after = Date.now() - maxAge;
        this.database.prepare(`DELETE FROM ${this.tableName} WHERE updated_at < ?`).run(after);
      }, maxAge).unref();
    }
  }

  get<T extends Type>(key: string): T {
    const row = this.database.prepare(`SELECT value FROM ${this.tableName} WHERE key = ?`).get(key) as {
      value: Buffer;
    };

    if (row === undefined) return;
    return this.deserializer(row.value) as T;
  }

  set(key: string, value: Type) {
    const serialized = this.serializer(value);
    const timestamp = Date.now();
    const row = this.database
      .prepare(
        `
            INSERT INTO ${this.tableName}
            VALUES (?, ?, ?, ?)
            ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = ?
            RETURNING created_at, updated_at
            `,
      )
      .get(key, serialized, timestamp, timestamp, serialized, timestamp) as { created_at: number; updated_at: number };

    const wasInserted = row.created_at === row.updated_at;
    if (wasInserted) {
      if (this._count !== null) this._count++;
      if (this.maxItems) {
        // an item was inserted, so we have to check if we're over the limit
        // and if so, delete the oldest item.
        const count = this.count();
        if (count > this.maxItems) {
          this.database.exec(
            `DELETE FROM ${this.tableName} WHERE created_at = (SELECT MIN(created_at) FROM ${this.tableName})`,
          );
        }
      }
    }

    return true;
  }

  has(key: string): boolean {
    if (this._count === 0) return false;
    const row = this.database.prepare(`SELECT value FROM ${this.tableName} WHERE key = ?`).get(key);
    return !!row;
  }

  delete(key: string): boolean {
    const result = this.database.prepare(`DELETE FROM ${this.tableName} WHERE key = ?`).run(key);
    if (this._count !== null) this._count--;
    return result.changes > 0;
  }

  clear() {
    this.database.prepare(`DELETE FROM ${this.tableName}`).run();
    this._count = 0;
  }

  count() {
    if (this._count !== null) return this._count;
    const row = this.database.prepare(`SELECT COUNT(*) AS count FROM ${this.tableName}`).get() as { count: number };
    if (!this.disableCountCache) {
      this._count = row.count;
      setTimeout(() => {
        this._count = null;
      }, 5000);
    }

    return this._count;
  }

  private init() {
    this.database.exec("PRAGMA journal_mode = WAL");
    this.database.exec("PRAGMA synchronous = NORMAL");
    this.migrate();
  }

  private migrate() {
    this.database.exec(`
        CREATE TABLE IF NOT EXISTS ${this.tableName} (
            key TEXT PRIMARY KEY,
            value BLOB NOT NULL,
            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL
        )
    `);
  }
}
