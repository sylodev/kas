import { Redis } from "ioredis";
import { redisMock as MockRedis } from "ioredis-mock";
import { expect, it } from 'vitest';
import { resolveRedisInstance } from "./resolve-redis-instance.js";

class Test extends Redis {}

it("should take a redis connection URI", () => {
  expect(resolveRedisInstance({ lazyConnect: true })).toBeInstanceOf(Redis);
  expect(resolveRedisInstance("redis://localhost:6379", { lazyConnect: true })).toBeInstanceOf(Redis);
  expect(resolveRedisInstance(new Test({ lazyConnect: true }))).toBeInstanceOf(Test);

  const mock = new MockRedis()
  expect(resolveRedisInstance(mock)).toEqual(mock);
});
