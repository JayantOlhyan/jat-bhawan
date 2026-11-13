"use client";

import { getRepos } from "../data";
import { sampleAmountPaise, sampleDonor } from "../data/seed/donations";
import { createRng } from "../data/seed/rng";
import { SEED_FUNDS } from "../data/seed/static";

/**
 * Demo-only: adds a random verified sample donation every 25–45 s so the
 * ticker visibly moves during a meeting. Runs only in a visible tab (so two
 * open tabs don't double up). Disabled with ?sim=0. Returns a stop function.
 */
export function startDonationSimulator(): () => void {
  try {
    if (new URLSearchParams(window.location.search).get("sim") === "0") return () => {};
  } catch {
    return () => {};
  }
  const rng = createRng(Date.now() & 0xffffffff);
  let timer: ReturnType<typeof setTimeout> | undefined;
  let stopped = false;

  const schedule = () => {
    if (stopped) return;
    timer = setTimeout(tick, rng.int(25, 45) * 1000);
  };

  const tick = async () => {
    if (stopped) return;
    if (document.visibilityState === "visible") {
      try {
        const repos = getRepos();
        const r = rng.next();
        const created = await repos.donations.create({
          ...sampleDonor(rng, rng.int(1, 99)),
          fundId: SEED_FUNDS[r < 0.6 ? 0 : r < 0.85 ? 1 : 2].id,
          amountPaise: sampleAmountPaise(rng),
          display: rng.chance(0.1) ? "anonymous" : rng.chance(0.1) ? "hide_amount" : "full",
          source: "online",
        });
        await repos.donations.verify(created.id, `SIM${Date.now().toString(36).toUpperCase()}`);
      } catch (err) {
        console.warn("Simulator skipped a tick", err);
      }
    }
    schedule();
  };

  schedule();
  return () => {
    stopped = true;
    if (timer) clearTimeout(timer);
  };
}
