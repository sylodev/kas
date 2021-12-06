import MockRedis from "ioredis-mock";
import { sleep } from "../helpers/sleep";
import { RedisMapCache } from "./map.redis";

jest.setMock("ioredis", () => require("ioredis-mock"));
const client = new MockRedis();

describe("Kas Redis Map Cache", () => {
  test("Should cache data for 2 seconds", async () => {
    const cache = new RedisMapCache<string>(client, "fortnite", { defaultExpiry: "2s" });
    expect(await cache.set("test", "epic")).toBeTruthy();
    expect(await cache.get("test")).toBe("epic");

    await sleep(2000);
    expect(await cache.get("test")).toBeUndefined();
  });
  test("Should delete cached data", async () => {
    const cache = new RedisMapCache<string>(client, "fortnite");
    expect(await cache.set("test", "epic")).toBeTruthy();
    expect(await cache.get("test")).toBe("epic");
    expect(await cache.delete("test")).toBeTruthy();
    expect(await cache.get("test")).toBeUndefined();
  });
  test("Should clear all cached data", async () => {
    const cache = new RedisMapCache<string>(client, "fortnite", { trackKeys: true });
    expect(await cache.set("test", "epic")).toBeTruthy();
    expect(await cache.get("test")).toBe("epic");
    expect(await cache.clear()).toBeUndefined();
    expect(await cache.get("test")).toBeUndefined();
  });
  test("Should check if cached data exists", async () => {
    const cache = new RedisMapCache<string>(client, "fortnite");
    expect(await cache.set("test", "epic")).toBeTruthy();
    expect(await cache.has("test")).toBeTruthy();
    expect(await cache.delete("test")).toBeTruthy();
    expect(await cache.has("test")).toBeFalsy();
  });
  test('Should allow the "options" parameter to be a expiry string', async () => {
    const cache = new RedisMapCache<string>(client, "fortnite", "5s");
    expect((cache as any).defaultExpiry).toBe(5000);
  });
  it('should return a list of keys from the "keys" method', async () => {
    const cache = new RedisMapCache<string>(client, "fortnite", { trackKeys: true });
    await cache.set("test1", "epic");
    expect(await cache.keys()).toEqual(["test1"]);
    await cache.set("test2", "epic");
    expect(await cache.keys()).toEqual(["test1", "test2"]);
    await cache.delete("test1");
    expect(await cache.keys()).toEqual(["test2"]);
    await cache.clear();
    expect(await cache.keys()).toEqual([]);
  });
});
