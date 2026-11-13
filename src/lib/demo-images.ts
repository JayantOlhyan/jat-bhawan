import "server-only";
import fs from "node:fs";
import path from "node:path";

/**
 * Finds a client-supplied image in public/demo/ for a named slot, e.g.
 * public/demo/hero.jpg. Returns the public URL, or null to show a placeholder.
 */
const EXT = [".jpg", ".jpeg", ".png", ".webp", ".avif"];

export function demoImage(slot: string): string | null {
  try {
    const dir = path.join(process.cwd(), "public", "demo");
    const files = fs.readdirSync(dir);
    const hit = files.find((f) => {
      const ext = path.extname(f).toLowerCase();
      return EXT.includes(ext) && path.basename(f, path.extname(f)).toLowerCase() === slot;
    });
    return hit ? `/demo/${hit}` : null;
  } catch {
    return null;
  }
}
