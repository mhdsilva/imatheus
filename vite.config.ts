import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";
import { renderResume } from "./src/resume-view";

let resolvedBase = "/";

export default defineConfig({
  base: process.env.VITE_BASE_PATH || "/",
  plugins: [
    {
      name: "static-curriculum",
      configResolved(config) {
        resolvedBase = config.base;
      },
      transformIndexHtml(html, context) {
        return context.filename
          .replace(/\\/g, "/")
          .endsWith("/curriculo/index.html")
          ? html.replace("<!--resume-->", () => renderResume(resolvedBase))
          : html;
      },
    },
  ],
  build: {
    rollupOptions: {
      input: {
        game: fileURLToPath(new URL("./index.html", import.meta.url)),
        curriculum: fileURLToPath(
          new URL("./curriculo/index.html", import.meta.url),
        ),
      },
    },
  },
  server: {
    // Avoid Linux inotify exhaustion shared with editors and other projects.
    // One-second polling keeps hot reload without consuming native watchers.
    watch: { usePolling: true, interval: 1000 },
  },
});
