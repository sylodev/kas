import MockRedis from "ioredis-mock";
import { RedisSetCache } from "./set.redis";

jest.setMock("ioredis", () => require("ioredis-mock"));
const client = new MockRedis();

describe("Kas Redis Set Cache", () => {
  test("Should cache data", async () => {
    const cache = new RedisSetCache<string>(client, "fortnite");
    expect(await cache.add("test")).toBeTruthy();
    expect(await cache.has("test")).toBeTruthy();
  });
  test("Should delete cached data", async () => {
    const cache = new RedisSetCache<string>(client, "fortnite");
    expect(await cache.add("test")).toBeTruthy();
    expect(await cache.has("test")).toBeTruthy();
    expect(await cache.delete("test")).toBeTruthy();
    expect(await cache.has("test")).toBeFalsy();
  });
  test("Should clear cached data", async () => {
    const cache = new RedisSetCache<string>(client, "fortnite", { enableExpensiveClear: true });
    expect(await cache.add("test")).toBeTruthy();
    expect(await cache.has("test")).toBeTruthy();
    expect(await cache.clear()).toBeUndefined();
    expect(await cache.has("test")).toBeFalsy();
  });
});
