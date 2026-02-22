import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(() => {
  // For GitHub Pages, we need a non-root base like "/JimTrak/".
  // On local dev/build, GITHUB_REPOSITORY isn't set, so base stays "/".
  const repo = process.env.GITHUB_REPOSITORY?.split("/")[1];
  const base = repo ? `/${repo}/` : "/";
  return {
    plugins: [react()],
    base
  };
});
