import type { MetadataRoute } from "next";
import { SITE_INDEXABLE, siteUrl } from "@/lib/site";

/** Search and AI crawlers that are allowed explicitly once the site is live (each a deliberate choice). */
const AI_BOTS = ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-User", "anthropic-ai", "PerplexityBot", "Google-Extended", "Applebot-Extended", "CCBot", "Bingbot"];
const PRIVATE = ["/admin", "/api/", "/og-template", "/hi/receipt/", "/en/receipt/", "/hi/donate/success", "/en/donate/success"];

/** Demo: everything disallowed. Live (NEXT_PUBLIC_SITE_INDEXABLE=true): open to all, private paths closed. */
export default function robots(): MetadataRoute.Robots {
  if (!SITE_INDEXABLE) return { rules: [{ userAgent: "*", disallow: "/" }] };
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: PRIVATE },
      { userAgent: AI_BOTS, allow: "/", disallow: PRIVATE },
    ],
    sitemap: `${siteUrl()}/sitemap.xml`,
    host: siteUrl(),
  };
}
