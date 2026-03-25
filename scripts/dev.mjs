/**
 * Dev server launcher with route pre-warming.
 * Starts `vite`, waits until ready, then pre-warms every
 * known route so the first click is instant.
 */

import { spawn } from "child_process";
import http from "http";

const PORT = process.env.PORT || 3000;
const BASE = `http://localhost:${PORT}`;

if (!process.env.NEXTAUTH_URL) {
  process.env.NEXTAUTH_URL = BASE;
}

// All static routes in the app (slug routes are skipped — they need real ids)
const ROUTES = [
  "/auth",
  "/dashboard",
  "/profile",
  "/forms/new",
];

// ── Start Vite dev server ──────────────────────────────────────────────────
const next = spawn(`npx vite --port ${PORT}`, {
  stdio: ["inherit", "pipe", "pipe"],
  shell: true,
});

let ready = false;

const forward = (chunk) => {
  process.stdout.write(chunk);
  const line = chunk.toString().toLowerCase();
  if (!ready && line.includes("ready in")) {
    ready = true;
    warmup();
  }
};

next.stdout.on("data", forward);
next.stderr.on("data", (c) => process.stderr.write(c));
next.on("exit", (code) => process.exit(code ?? 0));
process.on("SIGINT", () => next.kill("SIGINT"));
process.on("SIGTERM", () => next.kill("SIGTERM"));

// ── Wait for server to accept connections, then hit every route ───────────
function waitForServer(retries = 30) {
  return new Promise((resolve, reject) => {
    const attempt = () => {
      const req = http.get(`${BASE}/auth`, (res) => {
        res.resume();
        resolve();
      });
      req.on("error", () => {
        if (retries-- <= 0) return reject(new Error("Server did not start"));
        setTimeout(attempt, 500);
      });
      req.end();
    };
    attempt();
  });
}

async function warmup() {
  try {
    await waitForServer();
    console.log("\n\x1b[36m▲ Pre-warming routes...\x1b[0m");
    await Promise.all(
      ROUTES.map((route) =>
        fetch(`${BASE}${route}`, {
          headers: { "x-warmup": "1" },
          redirect: "manual",
        })
          .then(() => console.log(`  \x1b[32m✓\x1b[0m ${route}`))
          .catch(() => console.log(`  \x1b[33m~\x1b[0m ${route} (retrying on first visit)`))
      )
    );
    console.log("\x1b[36m▲ All routes compiled — clicks will be instant.\x1b[0m\n");
  } catch (e) {
    console.warn("Warmup skipped:", e.message);
  }
}
