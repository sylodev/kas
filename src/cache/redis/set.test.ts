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
    expect(await cache.add("epic")).toBeTruthy();
    expect(await cache.has("epic")).toBeTruthy();
    expect(await cache.delete("epic")).toBeTruthy();
    expect(await cache.has("epic")).toBeFalsy();
  });
});
