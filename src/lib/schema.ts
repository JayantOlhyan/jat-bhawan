import "server-only";
import type { TrustSettings } from "./data/types";
import { siteUrl } from "./site";

/** Placeholder trust data is never published as structured data. */
const real = (s?: string | null) => (s && !/placeholder|प्लेसहोल्डर|XXXX|example\.org/i.test(s) ? s : undefined);

/** The postal parts that are known for certain; the street line is added once it is real. */
function address(trust: TrustSettings, locale: string) {
  const street = real(locale === "hi" ? trust.addressHi : trust.addressEn);
  return {
    "@type": "PostalAddress",
    ...(street ? { streetAddress: street } : {}),
    addressLocality: "Najafgarh",
    addressRegion: "Delhi",
    postalCode: "110043",
    addressCountry: "IN",
  };
}

/** Organization for the Trust (home page). */
export function organizationSchema(trust: TrustSettings, locale: string) {
  const base = siteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${base}/#organization`,
    name: locale === "hi" ? trust.nameHi : trust.nameEn,
    alternateName: locale === "hi" ? trust.nameEn : trust.nameHi,
    url: `${base}/${locale}`,
    logo: `${base}/icons/icon-512.png`,
    image: `${base}/brand/og.png`,
    address: address(trust, locale),
    ...(real(trust.phone) ? { telephone: trust.phone } : {}),
    ...(real(trust.email) ? { email: trust.email } : {}),
    areaServed: { "@type": "Place", name: "Najafgarh, New Delhi" },
  };
}

/** WebSite with a search action into the donor wall's name search. */
export function websiteSchema(locale: string, name: string) {
  const base = siteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${base}/#website`,
    name,
    url: `${base}/${locale}`,
    inLanguage: ["hi-IN", "en-IN"],
    publisher: { "@id": `${base}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${base}/${locale}/donors?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}

/** The hall as an event venue (hall page). */
export function venueSchema(trust: TrustSettings, locale: string, name: string, description: string) {
  const base = siteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "EventVenue",
    name,
    description,
    url: `${base}/${locale}/hall`,
    image: `${base}/brand/hero-building.webp`,
    address: address(trust, locale),
    ...(real(trust.phone) ? { telephone: trust.phone } : {}),
    containedInPlace: { "@id": `${base}/#organization` },
  };
}
