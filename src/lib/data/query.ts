import type { PublicDonationQuery } from "./repos";

/** The filters that tier counts depend on (everything except tier, paging and sort). */
export function tierCountQuery(q: PublicDonationQuery): Omit<PublicDonationQuery, "tierId" | "page" | "pageSize" | "sort"> {
  return { search: q.search, fundId: q.fundId, fy: q.fy };
}
