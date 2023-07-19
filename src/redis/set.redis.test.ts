import { Redis } from "ioredis";
import { redisMock as MockRedis } from "ioredis-mock";
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RedisSetCache } from "./set.redis.js";

vi.mock('ioredis', () => import('ioredis-mock'))

let client: Redis;
beforeEach(() => {
  console.log({MockRedis})
  client = new MockRedis();
});

describe("RedisSetCache", () => {
  it("Should cache data", async () => {
    const cache = new RedisSetCache<string>(client, "fortnite");
    expect(await cache.add("test")).toBeTruthy();
    expect(await cache.has("test")).toBeTruthy();
  });

  it("Should delete cached data", async () => {
    const cache = new RedisSetCache<string>(client, "fortnite");
    expect(await cache.add("test")).toBeTruthy();
    expect(await cache.has("test")).toBeTruthy();
    expect(await cache.delete("test")).toBeTruthy();
    expect(await cache.has("test")).toBeFalsy();
  });

  it("Should clear cached data", async () => {
    const cache = new RedisSetCache<string>(client, "fortnite");
    expect(await cache.add("test")).toBeTruthy();
    expect(await cache.has("test")).toBeTruthy();
    expect(await cache.clear()).toBeUndefined();
    expect(await cache.has("test")).toBeFalsy();
  });

  it("Should get all cached data with keys()", async () => {
    const cache = new RedisSetCache<string>(client, "fortnite");
    expect(await cache.add("test1")).toBeTruthy();
    expect(await cache.has("test1")).toBeTruthy();
    expect(await cache.add("test1")).toBeTruthy();
    expect(await cache.add("test2")).toBeTruthy();
    expect(await cache.keys()).toEqual(["test1", "test2"]);
  });
});
