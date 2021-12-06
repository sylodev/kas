import { sleep } from "../helpers/sleep";
import { MemoryMapCache } from "./map.memory";

describe("MemoryMapCache", () => {
  it("Should cache data for 2 seconds", async () => {
    const cache = new MemoryMapCache<string>(50);
    expect(cache.set("test", "epic")).toBeTruthy();
    expect(cache.get("test")).toBe("epic");
    await sleep(50);
    expect(cache.get("test")).toBeUndefined();
  });

  it("Should delete cached data", async () => {
    const cache = new MemoryMapCache<string>();
    expect(cache.set("test", "epic")).toBeTruthy();
    expect(cache.get("test")).toBe("epic");
    expect(cache.delete("test")).toBeTruthy();
    expect(cache.get("test")).toBeUndefined();
  });

  it("Should clear all cached data", async () => {
    const cache = new MemoryMapCache<string>();
    expect(cache.set("test", "epic")).toBeTruthy();
    expect(cache.get("test")).toBe("epic");
    expect(cache.clear()).toBeUndefined();
    expect(cache.get("test")).toBeUndefined();
  });

  it("Should check if cached data exists", async () => {
    const cache = new MemoryMapCache<string>();
    expect(cache.set("test", "epic")).toBeTruthy();
    expect(cache.has("test")).toBeTruthy();
    expect(cache.delete("test")).toBeTruthy();
    expect(cache.has("test")).toBeFalsy();
  });
});
