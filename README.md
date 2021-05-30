# sylo-digital/kas

> Intuitive caching solution - with robust, built-in TypeScript types and redis support.

## features

- redis (sets) support
- namespace support
- generic classes, providing sweet type safety
- string-based ttls (although raw milliseconds is supported if you want that extra performance, along with an exported `Duration` enum with some pre-calculated durations)
- implements a passive method and probabilistic algorithm ([similar to redis](https://redis.io/commands/expire#how-redis-expires-keys)) to automatically expire memory cache entries

## basic usage

start by adding it to your project from the npm registry:

```bash
yarn add @sylo-digital/kas
# or
npm install @sylo-digital/kas
```

### memory cache

```ts
import { MemoryMapCache } from "@sylo-digital/kas";

const cache = new MemoryMapCache<string>("5s"); // sets default ttl to 5 seconds
await cache.set("foo", "bar");
await cache.get("foo"); // "bar"
```

### redis cache

```ts
import Redis from "ioredis";
import { RedisMapCache } from "@sylo-digital/kas";
import { connectionOptions } from "./constants";

const redis = new Redis(connectionOptions);
const cache = new RedisMapCache<string>(redis, "namespace" { defaultExpiry: "5s" });
// or
const cache = new RedisMapCache<string>(connectionOptions, "namespace", { defaultExpiry: "5s" });

[ ... ]
```
