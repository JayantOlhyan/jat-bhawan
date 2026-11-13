import { getTranslations } from "next-intl/server";
import { DonorTicker } from "@/components/donors/DonorTicker";
import { Slot, STAND_INS } from "@/components/site/Slot";
import { PlaceholderText } from "@/components/ui/PlaceholderText";
import { Link } from "@/i18n/navigation";
import { getRepos } from "@/lib/data";
import { pick, type AppLocale } from "@/lib/format";
import { pageMetadata } from "@/lib/meta";
import { formatINR } from "@/lib/money";
import { sortTiers } from "@/lib/tiers";

export async function generateMetadata({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  return pageMetadata(locale, "home", "");
}

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
      {/* Hero, Index posture: the live donation ledger is the visual. */}
      <section className="border-b border-rule">
        <div className="container-site grid items-center gap-(--space-xl) py-(--space-xl) lg:min-h-[calc(100dvh-10rem)] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-(--space-3xl) lg:py-(--space-xl)">
          <div>
            <h1 className="max-w-[12ch]">{t("title")}</h1>
            <p className="lead mt-(--space-lg) text-ink-2">{t("purpose")}</p>
            <div className="mt-(--space-xl) flex flex-wrap items-center gap-x-(--space-xl) gap-y-(--space-md)">
              <Link href="/donate" className="btn btn-primary text-lg">
                {t("donate")}
              </Link>
              <Link href="/hall" className="btn btn-outline text-lg">
                {t("bookHall")}
              </Link>
            </div>
          </div>
          <DonorTicker initial={latest} funds={funds} />
        </div>
      </section>

      <ol className="stages">
        {/* I. The idea */}
        <li className="stage">
          <section className="container-site grid items-center gap-(--space-xl) py-(--section-gap) lg:grid-cols-[minmax(0,6fr)_minmax(0,6fr)] lg:gap-(--space-3xl)">
            <Slot
              slot="story"
              alt={t("heroPhoto")}
              standIn={STAND_INS.harvest}
              objectPosition="25% 55%"
              className="aspect-[4/5] w-full max-lg:aspect-[4/3]"
            />
            <div>
              <h2>
                {t("stageIdea")}
              </h2>
              <hr className="rule-gold mt-(--space-md)" />
              <p className="mt-(--space-lg) text-lg"><PlaceholderText text={t("historyBody")} /></p>
              <Link href="/about" className="btn btn-outline mt-(--space-lg)">
                {t("readMore")}
              </Link>
            </div>
          </section>
        </li>

        {/* II. The villages' donations, by tier */}
        <li className="stage border-t-2 border-ink">
          <section className="container-site py-(--section-gap-s)">
            <div className="grid gap-(--space-md) lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end">
              <h2>
                {t("stageVillages")}
              </h2>
              <p className="lead text-ink-2">{t("highlightsLead")}</p>
            </div>
            <ul className="mt-(--space-2xl) border-t border-rule">
              {tierRows.map((tier) => (
                <li key={tier.id} className="grid gap-(--space-md) border-b border-rule py-(--space-lg) lg:grid-cols-[minmax(0,3fr)_minmax(0,9fr)] lg:gap-(--gap-columns)">
                  <div>
                    <h3 className="font-serif text-[clamp(1.5rem,1.2vw+1.1rem,2.1rem)]">{pick(locale, tier.nameHi, tier.nameEn)}</h3>
                    <p className="small-print mt-(--space-2xs)">
                      {formatINR(tier.minAmountPaise)}+
                    </p>
                  </div>
                  <ul className="grid gap-(--space-md) sm:grid-cols-3">
                    {(top[tier.id] ?? []).map((d) => (
                      <li key={d.id} className="min-w-0">
                        <p className="text-lg font-semibold break-words">{d.anonymous ? tc("anonymous") : d.donorName}</p>
                        {d.donorVillage && <p className="text-sm text-ink-2">{d.donorVillage}</p>}
                        <p className="font-serif text-xl tabular-nums">{formatINR(d.amountPaise ?? 0)}</p>
                      </li>
                    ))}
                    {!(top[tier.id] ?? []).length && <li className="text-ink-2">{t("noTop")}</li>}
                  </ul>
                </li>
              ))}
            </ul>
            <Link href="/donors" className="btn btn-outline mt-(--space-xl)">
              {t("viewAllDonors")}
            </Link>
          </section>
        </li>

        {/* III. The opening day, as a statement on the ink band */}
        <li className="stage band-ink">
          <section className="container-site py-(--section-gap-s)">
            <h2 className="max-w-[16ch] text-[length:var(--text-display)]">
              {t("stageOpening")}
            </h2>
            <hr className="rule-gold mt-(--space-lg)" />
            <div className="mt-(--space-lg) flex flex-wrap items-center gap-x-(--space-xl) gap-y-(--space-md)">
              <p className="lead text-paper">{t("stageOpeningLine")}</p>
              <Link href="/donate" className="btn btn-outline text-lg text-paper shadow-[inset_0_-2px_0_var(--color-gold)] hover:text-paper-2">
                {t("donate")}
              </Link>
            </div>
          </section>
        </li>

        {/* IV. The hall in service */}
        <li className="stage">
          <section className="container-site grid items-center gap-(--space-xl) py-(--section-gap) lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-(--space-3xl)">
            <div>
              <h2>
                {t("stageHall")}
              </h2>
              <hr className="rule-gold mt-(--space-md)" />
              <p className="lead mt-(--space-lg) text-ink-2">{t("stageHallLead")}</p>
              <Link href="/hall" className="btn btn-outline mt-(--space-lg) text-lg">
                {t("bookHall")}
              </Link>
            </div>
            <dl className="well ledger-rows px-(--space-lg) py-(--space-md) sm:px-(--space-xl) sm:py-(--space-lg)">
              {hallFacts.map(([k, v]) => (
                <div key={k} className="grid gap-(--space-2xs) py-(--space-md) sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] sm:gap-(--space-md)">
                  <dt className="font-semibold text-ink-2">{t(k)}</dt>
                  <dd className="font-serif text-xl">{t(v)}</dd>
                </div>
              ))}
            </dl>
          </section>
        </li>
      </ol>

      {/* Committee: the three office-bearers, set in type */}
      <section className="border-t-2 border-ink">
        <div className="container-site py-(--section-gap-s)">
          <h2>{t("committeeTitle")}</h2>
          <ul className="mt-(--space-2xl) grid gap-(--space-xl) sm:grid-cols-3 sm:gap-(--gap-columns)">
            {leaders.map((c) => (
              <li key={c.id} className="border-t border-rule pt-(--space-md)">
                <p className="font-serif text-[clamp(1.6rem,1.4vw+1.1rem,2.2rem)] leading-tight">{pick(locale, c.nameHi ?? c.name, c.name)}</p>
                <p className="mt-(--space-2xs) text-ink-2">{pick(locale, c.postHi, c.postEn)}</p>
              </li>
            ))}
          </ul>
          <Link href="/committee" className="btn btn-outline mt-(--space-xl)">
            {t("viewCommittee")}
          </Link>
        </div>
      </section>

    </>
  );
}
