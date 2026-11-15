import { getTranslations } from "next-intl/server";
import { DonorTicker } from "@/components/donors/DonorTicker";
import { FitLine } from "@/components/site/FitLine";
import { Slot, STAND_INS } from "@/components/site/Slot";
import { PlaceholderText } from "@/components/ui/PlaceholderText";
import { Link } from "@/i18n/navigation";
import { getRepos } from "@/lib/data";
import { pick, type AppLocale } from "@/lib/format";
import { pageMetadata } from "@/lib/meta";
import { formatINR, rupeesToPaise } from "@/lib/money";
import { sortTiers } from "@/lib/tiers";
import { inScript } from "@/lib/translit";

export async function generateMetadata({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  return pageMetadata(locale, "home", "");
}

/** The slip's amounts, in rupees; each opens the donate form with it chosen. */
const SLIP_AMOUNTS = [1100, 2100, 5100, 11000, 21000, 51000] as const;

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const locale = (await params).locale as AppLocale;
  const t = await getTranslations("Home");
  const tc = await getTranslations("Common");
  const repos = getRepos();
  const [latest, funds, tiers, top, committee] = await Promise.all([
    repos.donations.latestPublic(20),
    repos.funds.list(),
    repos.tiers.list(),
    repos.donations.publicTopByTier(3),
    repos.committee.listPublic(),
  ]);
  const leaders = committee.filter((c) => [1, 3, 5].includes(c.postRank));
  const tierRows = sortTiers(tiers).slice(0, 4);
  const hallFacts = [
    ["hallSlots", "hallSlotsValue"],
    ["hallCapacity", "hallCapacityValue"],
    ["hallHow", "hallHowValue"],
  ] as const;

  return (
    <>
      {/* Hero, Counter posture: the opening bill beside the donation slip. */}
      <section className="border-b border-ink">
        <div className="container-site grid items-center gap-(--space-xl) py-(--space-xl) lg:min-h-[calc(100dvh-8.5rem)] lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-(--space-3xl) lg:py-(--space-lg)">
          <div className="min-w-0">
            <h1 className="max-w-[min(100%,34rem)] [container-type:inline-size]">
              <FitLine max={208} fallback="min(var(--text-display), 24cqi)">{t("titleLine1")}</FitLine>
              <span className="sr-only">, </span>
              <FitLine max={150} fallback="min(var(--text-display-s), 18cqi)" className="text-ink-2">{t("titleLine2")}</FitLine>
            </h1>
            <p className="display mt-(--space-sm) max-w-[min(100%,34rem)] text-accent [container-type:inline-size]">
              <FitLine max={60} fallback="min(var(--text-section), 8cqi)">{t("inauguration")}</FitLine>
            </p>
            <p className="lead mt-(--space-lg) max-w-[34rem] text-ink-2">{t("purpose")}</p>
            <Link href="/hall" className="btn btn-outline mt-(--space-xl)">
              {t("seeDates")}
            </Link>
          </div>

          <div className="frame grained p-(--space-lg) 2xl:p-(--space-xl)">
            <h2 className="text-(length:--text-title)">{t("slipTitle")}</h2>
            <p className="mt-(--space-xs) text-sm font-semibold text-muted" id="slip-choose">{t("slipChoose")}</p>
            <ul className="mt-(--space-sm) grid grid-cols-2 border-t border-l border-ink sm:grid-cols-3" aria-labelledby="slip-choose">
              {SLIP_AMOUNTS.map((r) => (
                <li key={r} className="border-r border-b border-ink">
                  <Link
                    href={{ pathname: "/donate", query: { amount: String(r) } }}
                    className="figure flex min-h-14 items-center justify-center px-(--space-xs) text-[1.9rem] text-ink no-underline transition-colors duration-(--dur-short) hover:bg-ink hover:text-paper"
                  >
                    {formatINR(rupeesToPaise(r))}
                  </Link>
                </li>
              ))}
            </ul>
            <Link href="/donate" className="link-ink mt-(--space-sm)">
              {t("slipOther")}
            </Link>
            <Link href="/donate" className="btn btn-primary mt-(--space-md) w-full text-lg">
              {t("donate")}
            </Link>
            <p className="mt-(--space-sm) text-sm text-muted">{t("slipNote")}</p>
          </div>
        </div>
      </section>

      {/* The live register, full width: the newest donations as they arrive. */}
      <div className="container-site py-(--section-gap-s)">
        <DonorTicker initial={latest} funds={funds} />
      </div>

      {/* The idea: the photograph beside the elders' story. */}
      <section className="border-t border-ink">
        <div className="container-site grid items-center gap-(--space-xl) py-(--section-gap) lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-(--space-3xl)">
          <figure className="frame-photo grained">
            <Slot
              slot="story"
              alt={t("heroPhoto")}
              standIn={{ src: STAND_INS.harvest, alt: t("harvestAlt") }}
              objectPosition="25% 55%"
              className="aspect-[4/5] w-full max-lg:aspect-[4/3]"
            />
          </figure>
          <div>
            <h2 className="max-w-[16ch] text-(length:--text-section)">{t("stageIdea")}</h2>
            <p className="mt-(--space-lg) max-w-[56ch] text-lg"><PlaceholderText text={t("historyBody")} /></p>
            <Link href="/about" className="link-ink mt-(--space-md)">
              {t("readMore")}
            </Link>
          </div>
        </div>
      </section>

      {/* The villages' donations, by tier: particulars as rows. */}
      <section className="border-t border-ink">
        <div className="container-site py-(--section-gap-s)">
          <div className="grid gap-(--space-md) lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end lg:gap-(--gap-columns)">
            <h2 className="max-w-[18ch]">{t("stageVillages")}</h2>
            <p className="lead text-ink-2">{t("highlightsLead")}</p>
          </div>
          <ul className="rule-bar mt-(--space-2xl)">
            {tierRows.map((tier) => (
              <li key={tier.id} className="grid gap-(--space-md) border-b border-rule py-(--space-lg) lg:grid-cols-[minmax(0,3fr)_minmax(0,9fr)] lg:gap-(--gap-columns)">
                <div>
                  <h3>{pick(locale, tier.nameHi, tier.nameEn)}</h3>
                  <p className="figure mt-(--space-2xs) text-2xl text-muted">{formatINR(tier.minAmountPaise)}+</p>
                </div>
                <ul className="grid gap-(--space-md) sm:grid-cols-3 sm:gap-(--gap-columns)">
                  {(top[tier.id] ?? []).map((d) => (
                    <li key={d.id} className="min-w-0 border-t border-rule pt-(--space-sm) sm:border-t-0 sm:border-l sm:pt-0 sm:pl-(--space-md)">
                      <p className="text-lg font-semibold break-words">{d.anonymous ? tc("anonymous") : inScript(d.donorName, locale)}</p>
                      {d.donorVillage && <p className="text-ink-2">{inScript(d.donorVillage, locale)}</p>}
                      <p className="figure mt-(--space-2xs) text-(length:--text-figure)">{formatINR(d.amountPaise ?? 0)}</p>
                    </li>
                  ))}
                  {!(top[tier.id] ?? []).length && <li className="text-ink-2">{t("noTop")}</li>}
                </ul>
              </li>
            ))}
          </ul>
          <Link href="/donors" className="link-ink mt-(--space-lg)">
            {t("viewAllDonors")}
          </Link>
        </div>
      </section>

      {/* The opening day, fitted on the one vermilion band. */}
      <section className="band-accent grained">
        <div className="container-site grid gap-(--space-lg) py-(--section-gap-s) lg:grid-cols-[minmax(0,8fr)_minmax(0,4fr)] lg:items-end lg:gap-(--gap-columns)">
          <h2 className="display min-w-0 text-accent-ink [container-type:inline-size]">
            <FitLine max={170} fallback="min(var(--text-display-s), 8cqi)">{t("stageOpening")}</FitLine>
          </h2>
          <div>
            <p className="lead text-accent-ink">{t("stageOpeningLine")}</p>
            <Link href="/donate" className="btn mt-(--space-lg) border-accent-ink text-accent-ink hover:bg-accent-ink hover:text-accent">
              {t("donate")}
            </Link>
          </div>
        </div>
      </section>

      {/* The hall: its particulars as rows. */}
      <section>
        <div className="container-site grid gap-(--space-xl) py-(--section-gap) lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-(--gap-columns)">
          <div>
            <h2 className="max-w-[14ch]">{t("stageHall")}</h2>
            <p className="lead mt-(--space-lg) text-ink-2">{t("stageHallLead")}</p>
            <Link href="/hall" className="btn btn-outline mt-(--space-xl)">
              {t("bookHall")}
            </Link>
          </div>
          <dl className="rule-bar self-start">
            {hallFacts.map(([k, v]) => (
              <div key={k} className="grid gap-(--space-2xs) border-b border-rule py-(--space-lg) sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] sm:gap-(--gap-columns)">
                <dt className="slab text-lg">{t(k)}</dt>
                <dd className="text-lg font-semibold">{t(v)}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Committee: the three office-bearers, a column each under the five-point rule. */}
      <section className="border-t border-ink">
        <div className="container-site py-(--section-gap-s)">
          <h2>{t("committeeTitle")}</h2>
          <ul className="rule-bar mt-(--space-xl) grid sm:grid-cols-3">
            {leaders.map((c, i) => (
              <li key={c.id} className={`py-(--space-lg) sm:px-(--space-lg) ${i ? "border-t border-rule sm:border-t-0 sm:border-l-[5px] sm:border-ink" : "sm:pl-0"}`}>
                <p className="text-ink-2">{pick(locale, c.postHi, c.postEn)}</p>
                <p className="slab mt-(--space-2xs) text-[clamp(1.4rem,1.2vw+1rem,2rem)] leading-tight">
                  {inScript(pick(locale, c.nameHi ?? c.name, c.name), locale)}
                </p>
              </li>
            ))}
          </ul>
          <Link href="/committee" className="link-ink mt-(--space-md)">
            {t("viewCommittee")}
          </Link>
        </div>
      </section>
    </>
  );
}
