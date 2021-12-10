import { resolveRedisInstance } from "./resolve-redis-instance";
import Redis from "ioredis";
import RedisMock from "ioredis-mock";

class Test extends Redis {}

it("should take a redis connection URI", () => {
  expect(resolveRedisInstance({ lazyConnect: true })).toBeInstanceOf(Redis);
  expect(resolveRedisInstance(new RedisMock())).toBeInstanceOf(RedisMock);
  expect(resolveRedisInstance("redis://localhost:6379", { lazyConnect: true })).toBeInstanceOf(Redis);
  expect(resolveRedisInstance(new Test({ lazyConnect: true }))).toBeInstanceOf(Test);
});
