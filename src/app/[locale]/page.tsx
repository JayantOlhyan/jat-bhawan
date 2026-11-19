import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { DonorTicker } from "@/components/donors/DonorTicker";
import { Hero } from "@/components/home/Hero";
import { Avatar } from "@/components/people/Avatar";
import { BrassRule } from "@/components/site/BrassRule";
import { PhotoSlot } from "@/components/site/PhotoSlot";
import { SampleChip } from "@/components/site/SampleChip";
import { LineIcon } from "@/components/ui/LineIcon";
import { PlaceholderText } from "@/components/ui/PlaceholderText";
import { TierBadge } from "@/components/ui/TierBadge";
import { Link } from "@/i18n/navigation";
import { ICONS, STORY_FOCUS } from "@/lib/brand";
import { getRepos } from "@/lib/data";
import { demoImage } from "@/lib/demo-images";
import { MAPS_URL, pick, type AppLocale } from "@/lib/format";
import { pageMetadata } from "@/lib/meta";
import { formatINR } from "@/lib/money";
import { sortTiers } from "@/lib/tiers";
import { inScript } from "@/lib/translit";

export async function generateMetadata({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  return pageMetadata(locale, "home", "");
}

/** A home section: the brass rule above, then the content. */
function Section({ id, children, className = "" }: { id: string; children: React.ReactNode; className?: string }) {
  return (
    <section aria-labelledby={id} className={`container-site pt-(--section-gap) ${className}`}>
      <BrassRule className="mb-(--space-xl)" />
      {children}
    </section>
  );
}

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const locale = (await params).locale as AppLocale;
  const t = await getTranslations("Home");
  const tc = await getTranslations("Common");
  const tf = await getTranslations("Footer");
  const tContact = await getTranslations("Contact");
  const repos = getRepos();
  const [latest, funds, tiers, committee, trust] = await Promise.all([
    repos.donations.latestPublic(20),
    repos.funds.list(),
    repos.tiers.list(),
    repos.committee.listPublic(),
    repos.trust.get(),
  ]);
  const hallPhoto = demoImage("hall");
  const leaders = committee.filter((c) => [1, 3, 5].includes(c.postRank));
  const contactRows = [
    { icon: "pin", label: tf("address"), value: <PlaceholderText text={pick(locale, trust.addressHi, trust.addressEn)} /> },
    { icon: "phone", label: tf("phone"), value: <a href={`tel:${trust.phone}`} className="no-underline hover:underline">{trust.phone}</a> },
    { icon: "mail", label: tf("email"), value: <a href={`mailto:${trust.email}`} className="break-all no-underline hover:underline">{trust.email}</a> },
    { icon: "clock", label: tContact("hours"), value: <PlaceholderText text={tContact("hoursValue")} /> },
  ] as const;

  return (
    <>
      <Hero />

      {/* Live donations under the brass rail. */}
      <div className="container-site pt-(--space-xl)">
        <DonorTicker initial={latest} funds={funds} />
      </div>

      {/* Donor tiers: medals, with the name and threshold below each. */}
      <Section id="tiers-title">
        <div className="text-center">
          <h2 id="tiers-title" className="mx-auto">{t("highlightsTitle")}</h2>
          <p className="lead mx-auto mt-(--space-xs)">{t("highlightsLead")}</p>
        </div>
        <ul data-rise className="mt-(--space-xl) flex flex-wrap items-end justify-center gap-x-(--space-lg) gap-y-(--space-xl) lg:gap-x-(--space-xl)">
          {sortTiers(tiers).map((tier) => (
            <li key={tier.id} data-lift className="flex w-[9.5rem] flex-col items-center text-center sm:w-[10.5rem]">
              <TierBadge tierId={tier.id} size={132} />
              <h3 className="mt-(--space-sm) text-[1.15rem] text-maroon">{pick(locale, tier.nameHi, tier.nameEn)}</h3>
              <p className="figure text-ink-soft">{formatINR(tier.minAmountPaise)}+</p>
            </li>
          ))}
        </ul>
        <p className="mt-(--space-lg) text-center">
          <Link href="/donors" className="link-ink">{t("viewAllDonors")}</Link>
        </p>
      </Section>

      {/* History: text left, photo right. */}
      <Section id="story-title">
        <div className="grid items-center gap-(--space-xl) lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-(--space-3xl)">
          <div>
            <h2 id="story-title">{t("stageIdea")}</h2>
            <p className="mt-(--space-xs) font-medium text-muted">{t("historyTitle")}</p>
            <p className="mt-(--space-lg) max-w-[60ch] text-lg"><PlaceholderText text={t("historyBody")} /></p>
            <Link href="/about" className="link-ink mt-(--space-md)">{t("readMore")}</Link>
          </div>
          <PhotoSlot slot="story" alt={t("storyPhoto")} label={tc("photoHere")} jaali objectPosition={STORY_FOCUS} sizes="(min-width: 1320px) 500px, (min-width: 1024px) 40vw, 100vw" className="aspect-[4/3] w-full" />
        </div>
      </Section>

      {/* Committee: the three office-bearers. */}
      <Section id="committee-title">
        <h2 id="committee-title">{t("committeeTitle")}</h2>
        <ul data-rise className="mt-(--space-lg) grid gap-(--space-md) md:grid-cols-3">
          {leaders.map((c) => {
            const name = inScript(pick(locale, c.nameHi ?? c.name, c.name), locale);
            return (
              <li key={c.id} data-lift className="card-raised flex items-center gap-(--space-md) p-(--space-md)">
                <Avatar name={name} photo={c.photo} />
                <span aria-hidden="true" className="h-14 w-px shrink-0 bg-line" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-maroon">{pick(locale, c.postHi, c.postEn)}</p>
                  <p className="text-lg font-semibold break-words">{name}</p>
                  <p className="text-sm text-ink-soft break-words">{tc("sonOf", { name: inScript(c.fatherName, locale) })}</p>
                </div>
              </li>
            );
          })}
        </ul>
        <Link href="/committee" className="link-ink mt-(--space-sm)">{t("viewCommittee")}</Link>
      </Section>

      {/* Hall teaser. */}
      <Section id="hall-title">
        <div className="group card-raised flex flex-col items-start gap-(--space-md) p-(--space-lg) sm:flex-row sm:items-center sm:gap-(--space-lg)">
          {hallPhoto ? (
            <div className="photo-slot aspect-[4/3] w-28 shrink-0 sm:w-44">
              <Image src={hallPhoto.src} alt="" fill sizes="(min-width: 640px) 176px, 112px" className="object-cover motion-safe:transition-transform motion-safe:duration-300 group-hover:scale-[1.03]" />
              {hallPhoto.isSample && <SampleChip label={tc("sampleImage")} small hidden />}
            </div>
          ) : (
            <Image src={ICONS.calendar} alt="" width={96} height={96} sizes="96px" className="size-20 shrink-0 sm:size-24" />
          )}
          <span aria-hidden="true" className="hidden h-16 w-px shrink-0 bg-line sm:block" />
          <div className="min-w-0 flex-1">
            <h2 id="hall-title" className="text-[length:var(--text-title)] leading-snug">{t("stageHall")}</h2>
            <p className="mt-(--space-2xs) text-ink-soft">{t("stageHallLead")}</p>
          </div>
          <Link href="/hall" className="btn btn-primary shrink-0">{t("bookHall")}</Link>
        </div>
      </Section>

      {/* Map + contact. */}
      <Section id="visit-title">
        <h2 id="visit-title" className="sr-only">{t("visitTitle")}</h2>
        <div className="grid gap-(--space-xl) md:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] md:items-center">
          <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="photo-slot group relative block aspect-[16/10] no-underline">
            <svg aria-hidden="true" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full text-ivory" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round">
              <path d="M-10 60 C60 50 110 90 180 70 S280 40 340 70M40 -10 C60 60 40 120 70 210M150 -10 C140 60 170 130 150 210M-10 150 C80 140 160 170 250 140 S310 130 340 150M230 -10 C240 50 220 120 260 210" />
              <path d="M-10 110 C50 100 120 120 200 105 S300 95 340 110" strokeWidth="2.5" />
            </svg>
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full text-maroon">
              <svg aria-hidden="true" viewBox="0 0 24 32" className="h-12 w-9 drop-shadow-[0_4px_4px_rgb(94_64_30/0.3)]"><path d="M12 31S1 18.6 1 11.5a11 11 0 0 1 22 0C23 18.6 12 31 12 31Z" fill="currentColor" /><circle cx="12" cy="11.5" r="4" fill="var(--color-ivory)" /></svg>
            </span>
            <span className="absolute inset-x-(--space-sm) bottom-(--space-sm) rounded-(--radius-pill) bg-ivory px-(--space-sm) py-(--space-2xs) text-center text-sm font-semibold text-maroon group-hover:underline">
              {tc("openMaps")}
            </span>
          </a>
          <ul className="space-y-(--space-md) md:border-l md:border-line md:pl-(--space-xl)">
            {contactRows.map((r) => (
              <li key={r.icon} className="flex gap-(--space-sm)">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-maroon text-ivory">
                  <LineIcon name={r.icon} className="size-[18px]" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-muted">{r.label}</p>
                  <p className="text-lg">{r.value}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Section>
    </>
  );
}
