import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("flake package wrapper", () => {
  it("defaults the packaged app to port 3005", () => {
    const flake = readFileSync(join(process.cwd(), "flake.nix"), "utf8");

    expect(flake).toContain("--set-default PORT 3005");
  });
});
