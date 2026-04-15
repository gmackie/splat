import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import express from "express";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_DATA_DIR = path.join(__dirname, "data");
const DIST_DIR = path.join(__dirname, "dist");

function normalizeEmail(email) {
  return String(email).trim().toLowerCase();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function appendWaitlistEmail(dataDir, email) {
  await fs.mkdir(dataDir, { recursive: true });
  const record = JSON.stringify({
    email,
    createdAt: new Date().toISOString()
  });
  await fs.appendFile(path.join(dataDir, "waitlist.jsonl"), `${record}\n`, "utf8");
}

export function createApp(options = {}) {
  const app = express();
  const dataDir = options.dataDir ?? process.env.DATA_DIR ?? DEFAULT_DATA_DIR;

  app.use(express.json());

  app.get("/api/health", (_request, response) => {
    response.json({ ok: true });
  });

  app.post("/api/waitlist", async (request, response) => {
    const email = normalizeEmail(request.body?.email);

    if (!isValidEmail(email)) {
      response.status(400).json({ error: "Please enter a valid email address." });
      return;
    }

    await appendWaitlistEmail(dataDir, email);
    response.status(201).json({ ok: true });
  });

  app.use(express.static(DIST_DIR));

  app.get(/.*/, async (_request, response, next) => {
    try {
      response.sendFile(path.join(DIST_DIR, "index.html"));
    } catch (error) {
      next(error);
    }
  });

  return app;
}

if (process.argv[1] === __filename) {
  const port = Number(process.env.PORT ?? 3000);
  const app = createApp();

  app.listen(port, "0.0.0.0", () => {
    console.log(`splat listening on ${port}`);
  });
}
