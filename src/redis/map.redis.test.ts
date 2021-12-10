import { Redis } from "ioredis";
import MockRedis from "ioredis-mock";
import { sleep } from "../helpers/sleep";
import { RedisMapCache } from "./map.redis";

jest.setMock("ioredis", () => require("ioredis-mock"));

let client: Redis;
beforeEach(() => {
  client = new MockRedis();
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
    const cache = new RedisMapCache<string>(client, "fortnite", { defaultExpiry: 50 });
    expect(await cache.set("test", "epic")).toBeTruthy();
    expect(await cache.get("test")).toBe("epic");
    await sleep(50);
    expect(await cache.get("test")).toBeUndefined();
  });

  it("Should delete cached data", async () => {
    const cache = new RedisMapCache<string>(client, "fortnite");
    expect(await cache.set("test", "epic")).toBeTruthy();
    expect(await cache.get("test")).toBe("epic");
    expect(await cache.delete("test")).toBeTruthy();
    expect(await cache.get("test")).toBeUndefined();
  });

  it("Should clear all cached data", async () => {
    const cache = new RedisMapCache<string>(client, "fortnite", { trackKeys: true });
    expect(await cache.set("test", "epic")).toBeTruthy();
    expect(await cache.get("test")).toBe("epic");
    expect(await cache.clear()).toBeUndefined();
    expect(await cache.get("test")).toBeUndefined();
  });

  it("Should check if cached data exists", async () => {
    const cache = new RedisMapCache<string>(client, "fortnite");
    expect(await cache.set("test", "epic")).toBeTruthy();
    expect(await cache.has("test")).toBeTruthy();
    expect(await cache.delete("test")).toBeTruthy();
    expect(await cache.has("test")).toBeFalsy();
  });

  it('Should allow the "options" parameter to be a expiry string', async () => {
    const cache = new RedisMapCache<string>(client, "fortnite", "5s");
    expect((cache as any).defaultExpiry).toBe(5000);
  });

  it('should return a list of keys from the "keys" method', async () => {
    const cache = new RedisMapCache<string>(client, "fortnite", { trackKeys: true });

    await cache.set("test1", "epic");
    expect(await cache.keys()).toEqual(["test1"]);
    await cache.set("test2", "epic");
    expect(await cache.keys()).toEqual(["test1", "test2"]);

    // deleting keys should remove them from the result
    await cache.delete("test1");
    expect(await cache.keys()).toEqual(["test2"]);

    // clearing everything should also clear the set
    await cache.clear();
    expect(await cache.keys()).toEqual([]);
  });

  it("should support getting multiple keys", async () => {
    const cache = new RedisMapCache<string>(client, "fortnite", { trackKeys: true });

    await cache.set("test1", "epic");
    await cache.set("test2", "epic");
    await cache.set("test3", "epic");

    expect(await cache.getMany(["test1", "test2", "test3"])).toEqual(["epic", "epic", "epic"]);
  });

  it("should handle getting all entries in the cache", async () => {
    const cache = new RedisMapCache<string>(client, "fortnite", { trackKeys: true });

    await cache.set("test1", "epic1");
    await cache.set("test2", "epic2");
    expect(await cache.keys()).toEqual(["test1", "test2"]);
    expect(await getGeneratorValues(cache.entries())).toEqual([
      ["test1", "epic1"],
      ["test2", "epic2"],
    ]);

    // deleting keys should remove them from the result
    await cache.delete("test1");
    expect(await getGeneratorValues(cache.entries())).toEqual([["test2", "epic2"]]);

    // clearing everything should mean an empty result
    await cache.clear();
    expect(await getGeneratorValues(cache.entries())).toEqual([]);
  });

  it("should handle getting all values in the cache", async () => {
    const cache = new RedisMapCache<string>(client, "fortnite", { trackKeys: true });

    await cache.set("test1", "epic1");
    await cache.set("test2", "epic2");
    expect(await cache.values()).toEqual(["epic1", "epic2"]);

    // deleting keys should remove them from the result
    await cache.delete("test1");
    expect(await cache.values()).toEqual(["epic2"]);

    // clearing everything should mean an empty result
    await cache.clear();
    expect(await cache.values()).toEqual([]);
  });

  it("should support null values", async () => {
    const cache = new RedisMapCache<null>(client, "fortnite");

    expect(await cache.get("test")).toBeUndefined();
    await cache.set("test", null);
    expect(await cache.get("test")).toBeNull();
    expect(await cache.has("test")).toBeTruthy();
    await cache.delete("test");
    expect(await cache.get("test")).toBeUndefined();
  });
});
