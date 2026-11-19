# Launch checklist status (Nov 2026)

Checked against the two supplied checklists: *SEO, GEO & AI-Search Optimization* (112 items) and *Website Launch & Growth* (300+ items).

**Legend:** ✅ done in code and verified · 🔓 built, switches on at launch (`NEXT_PUBLIC_SITE_INDEXABLE=true`) · 👤 needs you or the Trust (an account, a decision or real-world data; it can't be done in code) · ➖ not applicable to this site

**Why the site is still hidden from search.** The demo has placeholder address, phone, people and photos. Indexing it would publish wrong facts that Google and AI tools would keep repeating. Everything is ready behind one switch.

## How to launch
1. Replace the placeholders (see `CONTENT_TODO.md`).
2. In Netlify, set `NEXT_PUBLIC_SITE_URL=https://<real domain>` and `NEXT_PUBLIC_SITE_INDEXABLE=true`, then redeploy.
3. Optionally set `NEXT_PUBLIC_GA_ID` and `NEXT_PUBLIC_CLARITY_ID`, after adding them to the privacy policy.
4. Submit `https://<domain>/sitemap.xml` in Google Search Console and Bing Webmaster Tools.

## Technical SEO and AI-crawler access
| Item | Status |
|---|---|
| robots.txt explicitly allows GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-User, anthropic-ai, PerplexityBot, Google-Extended, Applebot-Extended, CCBot, Bingbot; admin, API, receipts and the payment-success page closed | 🔓 (verified: all three bot user-agents get 200) |
| Server-rendered, so crawlers see real text, not a blank div | ✅ (Next.js SSR/SSG; text visible with JS off) |
| `/llms.txt` and `/llms-full.txt` | ✅ generated from the site's own text in both languages, so they can't drift; placeholder facts are left out |
| WAF / bot protection doesn't block AI crawlers | ✅ locally; 👤 re-test on the live domain with `curl -A GPTBot` |
| sitemap.xml with hreflang (hi, en, x-default) | ✅ `/sitemap.xml`, 22 URLs |
| Sitemap submitted to Google Search Console and Bing | 👤 |
| Self-referencing canonical on every public page | ✅ |
| Real 404 status for unknown pages | ✅ |
| No redirect chains | ✅ (one hop: `/` → `/hi`) |
| Pagination and filters on the donor wall | ✅ filtered and paged views point their canonical to `/donors`, so they collapse into one page instead of competing |
| Clean, lowercase, hyphenated URLs; every page ≤ 2 clicks from home; no orphan pages | ✅ |
| Breadcrumbs + BreadcrumbList schema | ➖ the site is two levels deep; schema without visible breadcrumbs would break Google's rules |
| IndexNow | 👤 needs the live domain (Bing Webmaster Tools can generate the key) |
| Security headers: HSTS, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy | ✅ |
| Content-Security-Policy | ➖ for now: Next's inline scripts need nonces; worth doing with the real payment gateway |
| HTTPS, SSL, www redirect, DNS, domain auto-renew | 👤 Netlify + registrar |
| `npm audit` | ✅ 0 vulnerabilities |
| Admin not indexable | ✅ noindex header + robots Disallow + login |
| Custom 404 and error ("500") pages | ✅ both bilingual |

## On-page SEO and social sharing
| Item | Status |
|---|---|
| Unique title per page, hi + en (31–59 chars) | ✅ |
| Unique meta description per page, hi + en (≈115–165 chars) | ✅ |
| One H1 per page, logical heading order | ✅ |
| `<html lang>` and hreflang | ✅ |
| Alt text: descriptive on photos, empty on decoration | ✅ (Lighthouse a11y 100) |
| Open Graph (title, description, image 1200×630, url, type, site_name, locale) + Twitter card | ✅ |
| WhatsApp / LinkedIn preview test | 👤 needs the public URL (send the link to yourself) |
| twitter:site | 👤 once the Trust has an X handle |
| Keyword research, topic clusters, glossary, blog cadence | 👤 content work; suggested pillars: hall booking in Najafgarh, donations, community history |
| Thin pages (< 300 words) | 👤 About, Hall and Contact copy is still placeholder; real copy fixes this |

## Structured data
| Item | Status |
|---|---|
| Organization (home) | ✅ name in both scripts, logo, image, address (locality/PIN only until the street is real), area served |
| WebSite + SearchAction into the donor-wall search | ✅ |
| EventVenue (hall page) | ✅ |
| One shared component (`JsonLd`) + builders in `src/lib/schema.ts`, JSON-LD only | ✅ |
| Phone, email, street address, geo, opening hours in schema | 🔓 added automatically once the placeholders are replaced (the builder skips anything marked placeholder) |
| FAQPage | 👤 needs real FAQs (hall rules, timings, rates) visible on the page; schema should only mirror visible Q&A |
| sameAs (social profiles) | 👤 once profiles exist |
| No fake review/rating schema | ✅ none |
| Validate in Google Rich Results Test | 👤 on the live URL |

## GEO and AEO
| Item | Status |
|---|---|
| Key facts as standalone sentences (llms-full.txt; real text, not images) | ✅ |
| Key info readable with JS off | ✅ (verified) |
| Lists and tables use real markup | ✅ |
| Answers of 40–60 words under question headings | 👤 needs the real hall rules, rates and history |
| Area names in copy (Najafgarh, New Delhi 110043) | ✅; 👤 add nearby villages and landmarks in the real copy |
| Brand checked in ChatGPT, Perplexity, Gemini, Copilot | 👤 after launch (baseline on day one) |
| Justdial, Sulekha and sector directories with identical NAP | 👤 |

## Local SEO
| Item | Status |
|---|---|
| Google Business Profile (claim, verify, photos, hours, category "Community center" / "Wedding venue", posts, Q&A, reviews) | 👤 the highest-value item for the hall |
| Name, address and phone identical everywhere | 👤 once the real details are in; the site reads them from one place (`SEED_TRUST`) |
| Embedded map matching the GBP pin | 👤 the "Open in Google Maps" link uses a search query; swap in the GBP place link |

## Analytics and monitoring
| Item | Status |
|---|---|
| GA4, with conversions `donation_complete` and `hall_enquiry` | 🔓 code ready; 👤 needs a GA4 ID |
| Microsoft Clarity | 🔓 code ready; 👤 needs an ID |
| Search Console, Bing Webmaster Tools, GSC ↔ GA4 link | 👤 |
| Uptime monitor (UptimeRobot), error tracking (Sentry) | 👤 accounts |
| Cookie/consent | 👤 decide before turning analytics on (DPDP Act 2023); the privacy page already exists |

## Performance and accessibility
| Item | Status |
|---|---|
| WebP images, sized by next/image, lazy below the fold, explicit sizes, hero preloaded | ✅ |
| Font subsets (Devanagari + Latin only), `font-display: swap`, self-hosted | ✅ |
| CLS < 0.1 | ✅ 0 |
| Lighthouse mobile performance > 90 | ✅ inner pages 100; ➖ home 84, accepted for the demo (building is the LCP) |
| Accessibility: contrast, labels, keyboard, focus, skip link, `lang` | ✅ Lighthouse a11y 100 on the main pages |
| Reduced motion, no autoplaying media | ✅ |
| Favicon set, apple-touch icon, web manifest | ✅ |

## Legal and content
| Item | Status |
|---|---|
| Privacy, terms and refund pages linked in the footer | ✅ pages exist; 👤 the Trust must review the placeholder text |
| Copyright line with the current year | ✅ © 2026 |
| Image licences | ✅ brand art and samples generated for the project; 👤 replace samples and the façade with Trust-owned photos |
| Placeholder text / test data removed | 👤 deliberate in the demo (labelled `[placeholder]` and "Sample image") |

## Email (domain DNS)
| Item | Status |
|---|---|
| Professional email, SPF, DKIM, DMARC, deliverability test | 👤 at the domain's email provider |
| Newsletter | ➖ not in scope |

## Post-launch rhythm (all 👤)
Weekly: Search Console. Monthly: GA4 and Clarity review, AI-answer check, two GBP posts, reply to reviews within 48 h, `npm audit`. Quarterly: crawl for broken links, re-validate schema, re-test security headers, Lighthouse. Whenever a page is added: update `PUBLIC_PATHS` in `src/lib/site.ts`; the sitemap and llms.txt follow from it.
