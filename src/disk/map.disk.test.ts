import Database from "better-sqlite3";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { DiskMapCache } from "./map.disk.js";

let database: Database.Database;
let cache: DiskMapCache<any>;

beforeEach(() => {
  database = new Database(":memory:");
  cache = new DiskMapCache(database);
});

afterEach(() => {
  database.close();
  database = undefined;
  cache = undefined;
});

describe("DiskMapCache", () => {
  it("should update keys", () => {
    cache.set("foo", "bar");
    cache.set("foo", "other");
    expect(cache.get("foo")).toBe("other");
    cache.delete("foo");
    expect(cache.get("foo")).toBe(undefined);
  });

  it("should store objects", () => {
    cache.set("foo", { bar: "baz" });
    expect(cache.get("foo")).toEqual({ bar: "baz" });
  });
});
