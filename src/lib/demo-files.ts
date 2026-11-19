/**
 * Pure file-name logic behind demoImage() (kept apart from the fs call so it
 * can be unit-tested). In public/demo/, `<slot>.<ext>` is the client's real
 * photo; `<slot>.sample.<ext>` is a generated stand-in that the page labels
 * as a sample. A real file always wins over a sample.
 */
export const DEMO_EXT = [".jpg", ".jpeg", ".png", ".webp", ".avif"];

export type DemoImage = { src: string; isSample: boolean };

export function pickDemoFile(files: string[], slot: string): DemoImage | null {
  const want = slot.toLowerCase();
  let sample: string | null = null;
  for (const f of files) {
    const dot = f.lastIndexOf(".");
    if (dot <= 0) continue;
    const ext = f.slice(dot).toLowerCase();
    if (!DEMO_EXT.includes(ext)) continue;
    const base = f.slice(0, dot).toLowerCase();
    if (base === want) return { src: `/demo/${f}`, isSample: false };
    if (base === `${want}.sample` && !sample) sample = f;
  }
  return sample ? { src: `/demo/${sample}`, isSample: true } : null;
}
