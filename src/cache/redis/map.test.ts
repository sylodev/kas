import MockRedis from "ioredis-mock";
import { sleep } from "../../helpers/sleep";
import { RedisMapCache } from "./map.redis";

jest.setMock("ioredis", () => require("ioredis-mock"));
const client = new MockRedis();

describe("Kas Redis Map Cache", () => {
  test("Should cache data for 2 seconds", async () => {
    const cache = new RedisMapCache<string>(client, "fortnite", { defaultExpiry: "2s" });
    expect(await cache.set("test", "sweet")).toBeTruthy();
    expect(await cache.get("test")).toBe("sweet");

    await sleep(2000);
    expect(await cache.get("test")).toBeUndefined();
  });
  test("Should delete cached data", async () => {
    const cache = new RedisMapCache<string>(client, "fortnite");
    expect(await cache.set("pog", "gers")).toBeTruthy();
    expect(await cache.get("pog")).toBe("gers");
    expect(await cache.delete("pog")).toBeTruthy();
    expect(await cache.get("pog")).toBeUndefined();
  });
  test("Should clear all cached data", async () => {
    const cache = new RedisMapCache<string>(client, "fortnite", { enableExpensiveClear: true });
    expect(await cache.set("one", "two")).toBeTruthy();
    expect(await cache.get("one")).toBe("two");
    expect(await cache.clear()).toBeUndefined();
    expect(await cache.get("one")).toBeUndefined();
  });
  test("Should check if cached data exists", async () => {
    const cache = new RedisMapCache<string>(client, "fortnite");
    expect(await cache.set("built", "differently")).toBeTruthy();
    expect(await cache.has("built")).toBeTruthy();
    expect(await cache.delete("built")).toBeTruthy();
    expect(await cache.has("built")).toBeFalsy();
  });
});
