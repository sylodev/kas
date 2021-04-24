import { MemoryMapCache } from "../src";

describe("Kas Memory Cache", () => {
  test("Should cache data for 2 seconds", async () => {
    const cache = new MemoryMapCache<string>("2s");
    expect(await cache.set("test", "sweet")).toBeTruthy();
    expect(await cache.get("test")).toBe("sweet");

    await new Promise((resolve) => setTimeout(resolve, 2 * 1000));
    expect(await cache.get("test")).toBe(undefined);
  });
  test("Should delete cached data", async () => {
    const cache = new MemoryMapCache();
    expect(await cache.set("test", "sweet")).toBeTruthy();
    expect(await cache.get("test")).toBe("sweet");
    expect(await cache.delete("test")).toBeTruthy();
    expect(await cache.get("test")).toBe(undefined);
  });
  test("Should clear all cached data", async () => {
    const cache = new MemoryMapCache();
    expect(await cache.set("test", "sweet")).toBeTruthy();
    expect(await cache.get("test")).toBe("sweet");
    expect(await cache.clear()).toBe(undefined);
    expect(await cache.get("test")).toBe(undefined);
  });
});
