import { sleep } from "../../helpers/sleep";
import { MemoryMapCache } from "./map.memory";

describe("Kas Memory Map Cache", () => {
  test("Should cache data for 2 seconds", async () => {
    const cache = new MemoryMapCache<string>("2s");
    expect(await cache.set("test", "epic")).toBeTruthy();
    expect(await cache.get("test")).toBe("epic");

    await sleep(2000);
    expect(await cache.get("test")).toBeUndefined();
  });
  test("Should delete cached data", async () => {
    const cache = new MemoryMapCache<string>();
    expect(await cache.set("test", "epic")).toBeTruthy();
    expect(await cache.get("test")).toBe("epic");
    expect(await cache.delete("test")).toBeTruthy();
    expect(await cache.get("test")).toBeUndefined();
  });
  test("Should clear all cached data", async () => {
    const cache = new MemoryMapCache<string>();
    expect(await cache.set("test", "epic")).toBeTruthy();
    expect(await cache.get("test")).toBe("epic");
    expect(await cache.clear()).toBeUndefined();
    expect(await cache.get("test")).toBeUndefined();
  });
  test("Should check if cached data exists", async () => {
    const cache = new MemoryMapCache<string>();
    expect(await cache.set("test", "epic")).toBeTruthy();
    expect(await cache.has("test")).toBeTruthy();
    expect(await cache.delete("test")).toBeTruthy();
    expect(await cache.has("test")).toBeFalsy();
  });
});
