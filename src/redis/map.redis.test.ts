import { Redis } from "ioredis";
import { GenericContainer, type StartedTestContainer } from "testcontainers";
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { sleep } from "../helpers/sleep.js";
import { SetOption } from "../types.js";
import { RedisMapCache } from "./map.redis.js";
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

async function getGeneratorValues<T>(generator: AsyncGenerator<T, any, any>): Promise<T[]> {
  const values: T[] = [];
  for await (const value of generator) {
    values.push(value);
  }

  return values;
}

describe("RedisMapCache", () => {
  it("Should cache data for 2 seconds", async () => {
    const cache = new RedisMapCache<string>(redisClient, "fortnite", { defaultExpiry: 50 });
    expect(await cache.set("test", "epic")).toBeTruthy();
    expect(await cache.get("test")).toBe("epic");
    await sleep(50);
    expect(await cache.get("test")).toBeUndefined();
  });

  it("Should delete cached data", async () => {
    const cache = new RedisMapCache<string>(redisClient, "fortnite");
    expect(await cache.set("test", "epic")).toBeTruthy();
    expect(await cache.get("test")).toBe("epic");
    expect(await cache.delete("test")).toBeTruthy();
    expect(await cache.get("test")).toBeUndefined();
  });

  it("Should clear all cached data", async () => {
    const cache = new RedisMapCache<string>(redisClient, "fortnite", { trackKeys: true });
    expect(await cache.set("test", "epic")).toBeTruthy();
    expect(await cache.get("test")).toBe("epic");
    expect(await cache.clear()).toBeUndefined();
    expect(await cache.get("test")).toBeUndefined();
  });

  it("Should check if cached data exists", async () => {
    const cache = new RedisMapCache<string>(redisClient, "fortnite");
    expect(await cache.set("test", "epic")).toBeTruthy();
    expect(await cache.has("test")).toBeTruthy();
    expect(await cache.delete("test")).toBeTruthy();
    expect(await cache.has("test")).toBeFalsy();
  });

  it('Should allow the "options" parameter to be a expiry string', async () => {
    const cache = new RedisMapCache<string>(redisClient, "fortnite", "5s");
    expect((cache as any).defaultExpiry).toBe(5000);
  });

  it('should return a list of keys from the "keys" method', async () => {
    const cache = new RedisMapCache<string>(redisClient, "fortnite", { trackKeys: true });

    await cache.set("test1", "epic");
    expect(await cache.keys()).toEqual(["test1"]);
    await cache.set("test2", "epic");
    expect((await cache.keys()).sort()).toEqual(["test1", "test2"]);

    // deleting keys should remove them from the result
    await cache.delete("test1");
    expect(await cache.keys()).toEqual(["test2"]);

    // clearing everything should also clear the set
    await cache.clear();
    expect(await cache.keys()).toEqual([]);
  });

  it("should support getting multiple keys", async () => {
    const cache = new RedisMapCache<string>(redisClient, "fortnite", { trackKeys: true });

    await cache.set("test1", "epic");
    await cache.set("test2", "epic");
    await cache.set("test3", "epic");

    expect(await cache.getMany(["test1", "test2", "test3"])).toEqual(["epic", "epic", "epic"]);
  });

  it("should handle getting all entries in the cache", async () => {
    const cache = new RedisMapCache<string>(redisClient, "fortnite", { trackKeys: true });

    // redis doesnt like mget with no keys. ioredis-mock doesnt catch this.
    expect(await getGeneratorValues(cache.entries())).toEqual([]);

    await cache.set("test1", "epic1");
    await cache.set("test2", "epic2");
    expect((await cache.keys()).sort()).toEqual(["test1", "test2"]);
    expect(
      (await getGeneratorValues(cache.entries())).sort((a, b) => {
        if (a[0] > b[0]) return 1;
        if (a[0] < b[0]) return -1;
        return 0;
      }),
    ).toEqual([
      ["test1", "epic1"],
      ["test2", "epic2"],
    ]);

    // deleting keys should remove them from the result
    await cache.delete("test1");
    expect((await getGeneratorValues(cache.entries())).sort()).toEqual([["test2", "epic2"]]);

    // clearing everything should mean an empty result
    await cache.clear();
    expect(await getGeneratorValues(cache.entries())).toEqual([]);
  });

  it("should handle getting all values in the cache", async () => {
    const cache = new RedisMapCache<string>(redisClient, "fortnite", { trackKeys: true });

    // redis doesnt like mget with no keys. ioredis-mock doesnt catch this.
    expect(await cache.values()).toEqual([]);

    await cache.set("test1", "epic1");
    await cache.set("test2", "epic2");
    expect((await cache.values()).sort()).toEqual(["epic1", "epic2"]);

    // deleting keys should remove them from the result
    await cache.delete("test1");
    expect(await cache.values()).toEqual(["epic2"]);

    // clearing everything should mean an empty result
    await cache.clear();
    expect(await cache.values()).toEqual([]);
  });

  it("should support null values", async () => {
    const cache = new RedisMapCache<null>(redisClient, "fortnite");

    expect(await cache.get("test")).toBeUndefined();
    await cache.set("test", null);
    expect(await cache.get("test")).toBeNull();
    expect(await cache.has("test")).toBeTruthy();
    await cache.delete("test");
    expect(await cache.get("test")).toBeUndefined();
  });

  it("should support an array of set options", async () => {
    const cache = new RedisMapCache<string>(redisClient, "fortnite");

    expect(await cache.set("test", "epic1")).toBeTruthy();
    expect(await cache.set("test", "epic2", undefined, [SetOption.KEEP_TTL, SetOption.ONLY_IF_SET])).toBeTruthy();
    expect(await cache.get("test")).toBe("epic2");
  });
});
