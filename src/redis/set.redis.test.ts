import { Redis } from "ioredis";
import { GenericContainer, type StartedTestContainer } from "testcontainers";
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { RedisSetCache } from "./set.redis.js";
import ms from "ms";

let container: StartedTestContainer;
let redisClient: Redis;

beforeAll(async () => {
  container = await new GenericContainer("redis").withExposedPorts(6379).start();
  redisClient = new Redis(container.getMappedPort(6379), container.getHost());
}, ms("1m"));

afterEach(async () => {
  await redisClient.flushall();
});

describe("RedisSetCache", () => {
  it("Should cache data", async () => {
    const cache = new RedisSetCache<string>(redisClient, "fortnite");
    expect(await cache.add("test")).toBeTruthy();
    expect(await cache.has("test")).toBeTruthy();
  });

  it("Should delete cached data", async () => {
    const cache = new RedisSetCache<string>(redisClient, "fortnite");
    expect(await cache.add("test")).toBeTruthy();
    expect(await cache.has("test")).toBeTruthy();
    expect(await cache.delete("test")).toBeTruthy();
    expect(await cache.has("test")).toBeFalsy();
  });

  it("Should clear cached data", async () => {
    const cache = new RedisSetCache<string>(redisClient, "fortnite");
    expect(await cache.add("test")).toBeTruthy();
    expect(await cache.has("test")).toBeTruthy();
    expect(await cache.clear()).toBeUndefined();
    expect(await cache.has("test")).toBeFalsy();
  });

  it("Should get all cached data with keys()", async () => {
    const cache = new RedisSetCache<string>(redisClient, "fortnite");
    expect(await cache.add("test1")).toBeTruthy();
    expect(await cache.has("test1")).toBeTruthy();
    expect(await cache.add("test1")).toBeTruthy();
    expect(await cache.add("test2")).toBeTruthy();
    expect((await cache.keys()).sort()).toEqual(["test1", "test2"]);
  });
});
