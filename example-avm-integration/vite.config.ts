import { defineConfig } from "vite";

export default defineConfig(({ command }) => ({
  base:
    command === "build"
      ? "/autogram-extension/example-avm-integration/"
      : "/",
}));
