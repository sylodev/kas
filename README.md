# sylo-digital/kas

> Intuitive caching solution - with robust, built-in TypeScript types and redis support.

## features

- redis (sets) support
- namespace support
- generic classes, providing sweet type safety
- string-based ttls (although raw milliseconds is supported if you want that extra performance, along with an exported `Duration` enum with some pre-calculated durations)

## usage

```ts
import { MemoryMapCache } from "@sylo-digital/kas";

const cache = new MemoryMapCache<string>("5s"); // sets default ttl to 5 seconds
cache.set("foo", "bar");
cache.get("foo"); // "bar"
```

### redis cache

```ts
import Redis from "ioredis";
import { connectionOptions } from "./constants";
import { RedisMapCache } from "@sylo-digital/kas";

const redis = new Redis(connectionOptions);
const cache = new RedisMapCache<string>(redis, "namespace", { defaultExpiry: "5s" });
// is the same as...
const cache = new RedisMapCache<string>(connectionOptions, "namespace", "5s");
// is the same as...
const cache = new RedisMapCache<string>(process.env.REDIS_URI, "namespace", 5000);
```
