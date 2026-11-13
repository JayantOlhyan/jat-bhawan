import type { Repos } from "./repos";
import { createMockRepos } from "./mock/repos";

/**
 * The single swap point for the data layer.
 *
 * Today: MockRepos. On the server it serves seed data only; in the browser it
 * adds a localStorage overlay plus BroadcastChannel live updates.
 * Later: return SupabaseRepos (server client with the user's session on the
 * server, browser client + Realtime in the browser). Nothing else changes.
 */

let serverRepos: (Repos & { reset(): void }) | null = null;
let browserRepos: (Repos & { reset(): void }) | null = null;

export function getRepos(): Repos & { reset(): void } {
  if (typeof window === "undefined") {
    return (serverRepos ??= createMockRepos(false));
  }
  return (browserRepos ??= createMockRepos(true));
}

export type { Repos } from "./repos";
