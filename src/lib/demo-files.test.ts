import { describe, expect, it } from "vitest";
import { pickDemoFile } from "./demo-files";

describe("pickDemoFile", () => {
  it("finds a sample and marks it", () => {
    expect(pickDemoFile(["README.txt", "hall.sample.webp"], "hall")).toEqual({ src: "/demo/hall.sample.webp", isSample: true });
  });
  it("a real photo always wins over the sample, whatever the order", () => {
    expect(pickDemoFile(["hall.sample.webp", "hall.JPG"], "hall")).toEqual({ src: "/demo/hall.JPG", isSample: false });
    expect(pickDemoFile(["hall.jpg", "hall.sample.webp"], "hall")).toEqual({ src: "/demo/hall.jpg", isSample: false });
  });
  it("does not confuse slots that share a prefix", () => {
    expect(pickDemoFile(["hall-stage.sample.webp"], "hall")).toBeNull();
    expect(pickDemoFile(["hall.sample.webp"], "hall-stage")).toBeNull();
  });
  it("ignores other file types", () => {
    expect(pickDemoFile(["story.txt", "story.sample.gif"], "story")).toBeNull();
  });
});
