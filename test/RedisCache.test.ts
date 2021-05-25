import { RedisMapCache, SetOption } from "../src";
import { sleep } from "../src/helpers/sleep";
import Redis from "ioredis-mock";

jest.setMock("ioredis", () => require("ioredis-mock"));
const client = new Redis();

describe("Kas Redis Cache", () => {
  test("Should cache data for 2 seconds", async () => {
    const cache = new RedisMapCache<string>(client, "fortnite", { defaultExpiry: "2s" });
    expect(await cache.set("test", "sweet")).toBeTruthy();
    expect(await cache.get("test")).toBe("sweet");

    await sleep(2000);
    expect(await cache.get("test")).toBeUndefined();
  });
  test("Should delete cached data", async () => {
    const cache = new RedisMapCache<string>(client, "fortnite");
    expect(await cache.set("test", "sweet")).toBeTruthy();
    expect(await cache.get("test")).toBe("sweet");
    expect(await cache.delete("test")).toBeTruthy();
    expect(await cache.get("test")).toBeUndefined();
  });
  test("Should clear all cached data", async () => {
    const cache = new RedisMapCache<string>(client, "fortnite");
    expect(await cache.set("test", "sweet", undefined, SetOption.KEEP_TTL)).toBeTruthy();
    expect(await cache.get("test")).toBe("sweet");
    expect(await cache.clear()).toBeUndefined();
    expect(await cache.get("test")).toBeUndefined();
  });
  test("Should check if cached data exists", async () => {
    const cache = new RedisMapCache<string>(client, "fortnite");
    expect(await cache.set("test", "sweet")).toBeTruthy();
    expect(await cache.has("test")).toBeTruthy();
    expect(await cache.delete("test")).toBeTruthy();
    expect(await cache.has("test")).toBeFalsy();
  });
});
