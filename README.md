# sylo-digital/kas

Flexible caching solution -- with robust, built-in TypeScript types and Redis support.

## Features

- Redis (sets) support, with namespace support -- scope entries to a "namespace" to avoid collisions with similarly named keys.
- Generic classes, providing sweet type safety.
- String-based TTLs (although a raw milliseconds value is supported if you want that extra performance, supported with an exported `Duration` enum with some pre-calculated durations)

## Usage

```ts
import { MemoryMapCache } from "@sylo-digital/kas";

// instansiate memory map cache with default ttl of 5 seconds,
// this ttl is then applied to all entries.
const cache = new MemoryMapCache<string>("5s");
cache.set("foo", "bar");
cache.set("fortnite", "epic", "1 minute"); // entry-specific ttl

cache.get("foo"); // "bar"
cache.get("fortnite"); // "epic"
```

### Redis Cache

Redis caches can be instantiated like any Redis instance.

```ts
import Redis from "ioredis";
import { connectionOptions } from "./constants";
import { RedisMapCache } from "@sylo-digital/kas";

const cache = new RedisMapCache<string>(connectionOptions, "namespace", "5s");
const cache = new RedisMapCache<string>(process.env.REDIS_URI, "namespace", 5000);

// use redis instance directly.
const redis = new Redis(connectionOptions);
const cache = new RedisMapCache<string>(redis, "namespace", { defaultExpiry: "5s" });

// although the set cache class has a "defaultExpiry" option,
// expiry isn't currently supported, but might be a thing in the future.
const set = new RedisSetCache<string>(redis, "namespace");
```
