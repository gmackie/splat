import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import request from "supertest";
import { afterEach, describe, expect, it } from "vitest";

import { createApp } from "../server.mjs";

const tempDirs = [];

async function makeTempDir() {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "splat-waitlist-"));
  tempDirs.push(dir);
  return dir;
}

afterEach(async () => {
  await Promise.all(
    tempDirs.splice(0).map((dir) => fs.rm(dir, { recursive: true, force: true }))
  );
});

describe("POST /api/waitlist", () => {
  it("stores a normalized email address", async () => {
    const dataDir = await makeTempDir();
    const app = createApp({ dataDir });

    const response = await request(app)
      .post("/api/waitlist")
      .send({ email: " Test@Example.com " });

    expect(response.status).toBe(201);
    expect(response.body.ok).toBe(true);

    const stored = await fs.readFile(path.join(dataDir, "waitlist.jsonl"), "utf8");
    expect(stored).toContain("\"email\":\"test@example.com\"");
  });

  it("rejects an invalid email address", async () => {
    const dataDir = await makeTempDir();
    const app = createApp({ dataDir });

    const response = await request(app)
      .post("/api/waitlist")
      .send({ email: "not-an-email" });

    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/valid email/i);
  });
});
