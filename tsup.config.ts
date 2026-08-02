import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/main.ts",
  },
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  treeshake: true,
});
