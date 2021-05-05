# sylo-digital/kas

kas allows for easy caching with multiple caching solutions, including redis. along with robust, built-in types, which makes it really easy to write confidently - string-based ttls provide a stress-free solution to worrying about how to convert one time unit to another.

## features

- string-based ttls
- redis support
- namespace support
- generic classes, providing sweet type safety
- implements a passive method and probabilistic algorithm ([similar to redis](https://redis.io/commands/expire#how-redis-expires-keys)) to automatically expire memory cache entries

## usage

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
import { RedisMapCache } from "@sylo-digital/kas";
import { connectionOptions } from "./constants";
import Redis from "ioredis";

const redis = new Redis(connectionOptions);
const cache = new RedisMapCache<string>(redis, { defaultExpiry: "5s" });
// or
const cache = new RedisMapCache<string>(connectionOptions, { defaultExpiry: "5s" });

[ ... ]
```
