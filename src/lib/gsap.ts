"use client";

/**
 * GSAP for the browser only, with its plugins registered once. Import gsap
 * from here (never from "gsap" directly) so registration always happens.
 */
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText, DrawSVGPlugin);
  // Fonts change line breaks and heights: re-measure once they are in.
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
}

export { DrawSVGPlugin, gsap, ScrollTrigger, SplitText, useGSAP };
