import "server-only";
import fs from "node:fs";
import path from "node:path";
import { pickDemoFile, type DemoImage } from "./demo-files";

export type { DemoImage };

/**
 * Finds the image for a named slot in public/demo/, e.g. public/demo/hall.jpg
 * (the client's photo) or public/demo/hall.sample.webp (a labelled sample).
 * Returns null when there is neither, so the caller shows a placeholder or nothing.
 */
export function demoImage(slot: string): DemoImage | null {
  try {
    return pickDemoFile(fs.readdirSync(path.join(process.cwd(), "public", "demo")), slot);
  } catch {
    return null;
  }
}

/** Page-header illustrations in public/brand/scenes/ (decorative). */
export type SceneName = "donors" | "hall" | "committee" | "members" | "about" | "contact" | "not-found";

/** The scene's public URL if public/brand/scenes/<name>.webp exists, else null. */
export function sceneImage(name: SceneName): string | null {
  const file = path.join(process.cwd(), "public", "brand", "scenes", `${name}.webp`);
  return fs.existsSync(file) ? `/brand/scenes/${name}.webp` : null;
}
