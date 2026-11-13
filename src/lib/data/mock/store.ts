import type { ChangeTopic, DemoSettings, Unsubscribe } from "../repos";
import { SEED_BOOKINGS, SEED_COMMITTEE, SEED_DONATIONS, SEED_MEMBERS } from "../seed";
import type { Booking, CommitteePost, Donation, Member } from "../types";

/**
 * Seed + a localStorage overlay of records created/edited in the demo.
 * Changes are broadcast to other tabs (BroadcastChannel, with the `storage`
 * event as fallback) and to listeners in this tab.
 */

const STORAGE_KEY = "jb-demo-v1";
const CHANNEL = "jb-demo";

interface Overlay {
  donations: Record<string, Donation>;
  members: Record<string, Member>;
  committee: Record<string, CommitteePost>;
  bookings: Record<string, Booking>;
  demo: DemoSettings;
}

type TableName = "donations" | "members" | "committee" | "bookings";

const emptyOverlay = (): Overlay => ({
  donations: {},
  members: {},
  committee: {},
  bookings: {},
  demo: { upiManual: false },
});

function readStorage(): Overlay {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyOverlay();
    const parsed = JSON.parse(raw) as Partial<Overlay>;
    return { ...emptyOverlay(), ...parsed, demo: { ...emptyOverlay().demo, ...parsed.demo } };
  } catch {
    return emptyOverlay();
  }
}

function writeStorage(o: Overlay): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(o));
  } catch {
    // Storage full or blocked (private mode): the change still applies in memory for this tab.
  }
}

const SEEDS: { [K in TableName]: Overlay[K][string][] } = {
  donations: SEED_DONATIONS,
  members: SEED_MEMBERS,
  committee: SEED_COMMITTEE,
  bookings: SEED_BOOKINGS,
};

export class MockStore {
  private overlay: Overlay = emptyOverlay();
  private loaded = false;
  private listeners = new Map<ChangeTopic, Set<() => void>>();
  private channel: BroadcastChannel | null = null;

  constructor(private readonly persistent: boolean) {}

  private ensureLoaded(): void {
    if (this.loaded) return;
    this.loaded = true;
    if (!this.persistent) return;
    this.overlay = readStorage();
    try {
      this.channel = new BroadcastChannel(CHANNEL);
      this.channel.onmessage = (e: MessageEvent<{ topics: ChangeTopic[] }>) => {
        this.overlay = readStorage();
        e.data?.topics?.forEach((t) => this.emit(t));
      };
    } catch {
      this.channel = null;
    }
    try {
      window.addEventListener("storage", (e) => {
        if (e.key !== STORAGE_KEY || this.channel) return;
        this.overlay = readStorage();
        (["donations", "bookings", "members", "committee", "settings"] as const).forEach((t) => this.emit(t));
      });
    } catch {
      /* ignore */
    }
  }

  /** Seed rows merged with overlay rows (overlay wins by id). */
  all<K extends TableName>(table: K): Overlay[K][string][] {
    this.ensureLoaded();
    const over = this.overlay[table] as Record<string, Overlay[K][string]>;
    const seen = new Set<string>();
    const merged: Overlay[K][string][] = [];
    for (const row of SEEDS[table] as Overlay[K][string][]) {
      seen.add(row.id);
      merged.push(over[row.id] ?? row);
    }
    for (const [id, row] of Object.entries(over)) if (!seen.has(id)) merged.push(row);
    return merged;
  }

  demo(): DemoSettings {
    this.ensureLoaded();
    return { ...this.overlay.demo };
  }

  /**
   * Apply a change. Re-reads storage first so concurrent tabs don't clobber
   * each other, then persists, broadcasts and notifies.
   */
  mutate<T>(topic: ChangeTopic, fn: (o: Overlay) => T): T {
    this.ensureLoaded();
    if (this.persistent) this.overlay = readStorage();
    const result = fn(this.overlay);
    if (this.persistent) {
      writeStorage(this.overlay);
      try {
        this.channel?.postMessage({ topics: [topic] });
      } catch {
        /* ignore */
      }
    }
    this.emit(topic);
    return result;
  }

  subscribe(topic: ChangeTopic, cb: () => void): Unsubscribe {
    this.ensureLoaded();
    let set = this.listeners.get(topic);
    if (!set) this.listeners.set(topic, (set = new Set()));
    set.add(cb);
    return () => set.delete(cb);
  }

  private emit(topic: ChangeTopic): void {
    this.listeners.get(topic)?.forEach((cb) => {
      try {
        cb();
      } catch (err) {
        console.error(err);
      }
    });
  }

  /** Demo reset: clears every demo-created record. */
  reset(): void {
    this.mutate("donations", (o) => {
      Object.assign(o, emptyOverlay());
    });
    (["bookings", "members", "committee", "settings"] as const).forEach((t) => this.emit(t));
    try {
      this.channel?.postMessage({ topics: ["bookings", "members", "committee", "settings"] });
    } catch {
      /* ignore */
    }
  }
}
