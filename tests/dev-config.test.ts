import { test } from "node:test";
import assert from "node:assert/strict";
import config from "../vite.config";

test("development avoids native inotify watchers while retaining hot reload", () => {
  assert.equal(config.server?.watch && config.server.watch.usePolling, true);
  assert.equal(config.server?.watch && config.server.watch.interval, 1000);
  assert.notEqual(config.server?.hmr, false);
});
