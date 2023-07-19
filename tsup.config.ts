import type { Options } from "tsup";

export const tsup: Options = {
  sourcemap: true,
  keepNames: true,
  dts: true,
  clean: true,
  minify: false,
  format: "esm",
  platform: "node",
  entryPoints: ["src/index.ts"],
};
