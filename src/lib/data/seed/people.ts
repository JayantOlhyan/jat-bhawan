import type { Booking, BookingSlot, CommitteePost, Member, MemberType } from "../types";
import { FATHER_NAMES, FIRST_NAMES, GOTRAS, VILLAGES } from "./names";
import { createRng } from "./rng";

function buildMembers(): Member[] {
  const rng = createRng(4011);
  const types: MemberType[] = ["life", "life", "general", "general", "general", "founder", "honorary"];
  const out: Member[] = [];
  for (let i = 0; i < 40; i++) {
    const first = FIRST_NAMES[(i * 7) % FIRST_NAMES.length];
    const gotra = rng.pick(GOTRAS);
    const father = rng.pick(FATHER_NAMES);
    const village = rng.pick(VILLAGES);
    out.push({
      id: `mem-${String(i + 1).padStart(3, "0")}`,
      name: `${first.en} ${gotra.en}`,
      nameHi: `${first.hi} ${gotra.hi}`,
      fatherName: father.en,
      gotra: gotra.en,
      village: village.en,
      memberType: rng.pick(types),
      phone: `98XXXXXX${String(10 + i).padStart(2, "0")}`,
      phonePublic: rng.chance(0.55),
      consentDisplay: i !== 39, // one member has not consented to be listed
    });
  }
  return out;
}

export const SEED_MEMBERS: Member[] = buildMembers();

const POSTS: Array<[string, string]> = [
  ["प्रधान", "President"],
  ["उप-प्रधान", "Vice President"],
  ["महासचिव", "General Secretary"],
  ["सचिव", "Secretary"],
  ["कोषाध्यक्ष", "Treasurer"],
  ["संगठन मंत्री", "Organising Secretary"],
  ["सह-कोषाध्यक्ष", "Joint Treasurer"],
  ["कार्यकारिणी सदस्य", "Executive Member"],
  ["कार्यकारिणी सदस्य", "Executive Member"],
  ["कार्यकारिणी सदस्य", "Executive Member"],
  ["कार्यकारिणी सदस्य", "Executive Member"],
];

function buildCommittee(): CommitteePost[] {
  const rng = createRng(1111);
  return POSTS.map(([postHi, postEn], i) => {
    const first = FIRST_NAMES[(i * 5 + 2) % 27];
    const gotra = GOTRAS[i % GOTRAS.length];
    const father = rng.pick(FATHER_NAMES);
    return {
      id: `com-${String(i + 1).padStart(2, "0")}`,
      postHi,
      postEn,
      postRank: i + 1,
      name: `${first.en} ${gotra.en}`,
      nameHi: `${first.hi} ${gotra.hi}`,
      fatherName: father.en,
      termLabel: "2025-28",
      phone: `98XXXXXX${String(60 + i).padStart(2, "0")}`,
      phonePublic: i < 5,
    };
  });
}

export const SEED_COMMITTEE: CommitteePost[] = buildCommittee();

function buildBookings(): Booking[] {
  const rng = createRng(777);
  // Wedding season Nov 2026 to Feb 2027 (fixed dates so server and client agree).
  const confirmed: Array<[string, BookingSlot, "confirmed" | "tentative"]> = [
    ["2026-11-21", "full", "confirmed"], ["2026-11-23", "evening", "confirmed"],
    ["2026-11-26", "full", "tentative"], ["2026-11-29", "morning", "confirmed"],
    ["2026-12-08", "full", "confirmed"], ["2026-12-04", "full", "confirmed"],
    ["2026-12-11", "evening", "tentative"], ["2026-12-13", "full", "confirmed"],
    ["2026-12-14", "morning", "confirmed"], ["2026-12-14", "evening", "confirmed"],
    ["2027-01-18", "full", "confirmed"], ["2027-01-22", "evening", "tentative"],
    ["2027-01-25", "full", "confirmed"], ["2027-02-05", "full", "confirmed"],
    ["2027-02-10", "morning", "tentative"],
  ];
  const events = ["Wedding", "Engagement", "Community meeting", "Bhaat ceremony", "Birthday", "Retirement function"];
  const out: Booking[] = confirmed.map(([date, slot, status], i) => {
    const first = FIRST_NAMES[(i * 3) % FIRST_NAMES.length];
    const gotra = rng.pick(GOTRAS);
    return {
      id: `bk-${String(i + 1).padStart(3, "0")}`,
      date, slot, status,
      name: date === "2026-12-08" ? "Jat Bhawan Committee (Inauguration)" : `${first.en} ${gotra.en}`,
      mobile: `98XXXXXX${String(30 + i).padStart(2, "0")}`,
      eventType: date === "2026-12-08" ? "Inauguration" : rng.pick(events),
      guests: rng.int(150, 600),
      message: "",
      createdAt: "2026-10-01T06:00:00.000Z",
    };
  });
  const enquiries: Array<[string, BookingSlot]> = [
    ["2026-12-18", "full"], ["2026-12-20", "evening"], ["2027-01-10", "full"],
    ["2027-01-15", "morning"], ["2027-02-14", "full"], ["2027-02-20", "evening"],
  ];
  enquiries.forEach(([date, slot], i) => {
    const first = FIRST_NAMES[(i * 4 + 1) % FIRST_NAMES.length];
    out.push({
      id: `bk-${String(confirmed.length + i + 1).padStart(3, "0")}`,
      date, slot, status: "enquiry",
      name: `${first.en} ${rng.pick(GOTRAS).en}`,
      mobile: `98XXXXXX${String(50 + i).padStart(2, "0")}`,
      eventType: rng.pick(events),
      guests: rng.int(100, 500),
      message: "Please share the rate and availability. (sample)",
      createdAt: `2026-11-${String(2 + i).padStart(2, "0")}T07:30:00.000Z`,
    });
  });
  return out;
}

export const SEED_BOOKINGS: Booking[] = buildBookings();
