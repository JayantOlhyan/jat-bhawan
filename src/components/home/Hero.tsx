import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { brand, DIYA_FLAMES, HERO_FG_SIZE, heroBuilding, JHAROKHA_ARCH } from "@/lib/brand";
import { HeroMotion } from "./HeroMotion";

const ARCH = JHAROKHA_ARCH;

/**
 * The layered hero. Three planes share one coordinate box (`.hero-plane`, the
 * fg image's own aspect, cropped like object-cover), so the diya glows and the
 * building or frame always sit where the art expects them, at every width,
 * with no layout shift. Everything is in the server HTML; HeroMotion only adds
 * movement after hydration.
 */
export async function Hero() {
  const t = await getTranslations("Home");
  return (
    <section id="hero" aria-labelledby="hero-title" className="relative isolate overflow-hidden lg:h-[clamp(500px,44vw,700px)]">
      <div data-hero-bg className="absolute inset-0 -z-10 will-change-transform">
        {/* The sky is a soft, low-detail image: a small file upscaled looks the same, loads first, and leaves the H1 as the page's largest paint. */}
        <Image src={brand.heroBg} alt="" fill sizes="(min-width: 1024px) 60vw, 12vw" preload className="object-cover object-[75%_50%]" />
      </div>

      <div className="container-site relative z-10 flex h-full items-center pt-(--space-xl) pb-(--space-md) lg:py-0">
        <div className="max-w-[34rem] lg:w-[46%]">
          <p data-hero-sub className="inline-flex items-center gap-(--space-xs) rounded-(--radius-pill) border border-line bg-ivory px-(--space-sm) py-(--space-3xs) text-sm font-semibold text-maroon">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-brass" />
            {t("inauguration")}
          </p>
          <h1 id="hero-title" data-hero-title className="mt-(--space-md) max-w-none text-[length:var(--text-h1-hero)] leading-[1.25]">
            <span className="block">{t("titleLine1")}</span>
            <span className="sr-only">, </span>
            <span className="block">{t("titleLine2")}</span>
          </h1>
          <p className="lead mt-(--space-md) text-ink">{t("purpose")}</p>
          <div data-hero-sub className="mt-(--space-lg) flex flex-wrap gap-(--space-sm)">
            <Link href="/donate" className="btn btn-primary px-(--space-xl) text-lg">
              {t("donate")}
            </Link>
            <Link href="/hall" className="btn btn-outline bg-ivory/70 px-(--space-xl) text-lg">
              {t("bookHall")}
            </Link>
          </div>
        </div>
      </div>

      <div data-hero-art className="hero-art pointer-events-none relative aspect-[4/3] w-full sm:aspect-[16/10] lg:absolute lg:inset-0 lg:aspect-auto">
        <div data-hero-tilt className="absolute inset-0">
          <div data-hero-mid className="hero-plane">
            {heroBuilding ? (
              <div className="absolute left-[56%] top-[14%] h-[78%] w-[34%]">
                <Image src={heroBuilding} alt={t("heroPhoto")} fill preload sizes="(min-width: 1024px) 34vw, 55vw" className="object-contain object-bottom" />
              </div>
            ) : (
              <div data-hero-frame className="absolute left-[60%] top-[20%] h-[70%] w-[26%]">
                <svg aria-hidden="true" viewBox="0 0 100 150" preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible drop-shadow-[0_10px_18px_rgb(94_64_30/0.22)]">
                  <path d={ARCH} fill="var(--color-sand)" stroke="var(--color-brass)" strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
                  <path d={ARCH} transform="translate(50 76) scale(0.9) translate(-50 -76)" fill="none" stroke="var(--color-brass)" strokeWidth="1" strokeOpacity="0.7" vectorEffect="non-scaling-stroke" />
                </svg>
                <p className="absolute inset-x-[14%] top-[40%] text-center text-[clamp(0.85rem,1.2cqw,1.1rem)] font-medium text-muted">{t("heroPhoto")}</p>
              </div>
            )}
          </div>
          <div data-hero-fg className="hero-plane">
            {brand.heroFgParts.map(({ src, box: [x0, y0, x1, y1] }) => (
              <div
                key={src}
                className="absolute"
                style={{
                  left: `${(x0 / HERO_FG_SIZE.width) * 100}%`,
                  top: `${(y0 / HERO_FG_SIZE.height) * 100}%`,
                  width: `${((x1 - x0) / HERO_FG_SIZE.width) * 100}%`,
                  height: `${((y1 - y0) / HERO_FG_SIZE.height) * 100}%`,
                }}
              >
                <Image src={src} alt="" fill sizes={`(min-width: 1024px) ${Math.round(((x1 - x0) / HERO_FG_SIZE.width) * 100)}vw, ${Math.round(((x1 - x0) / HERO_FG_SIZE.width) * 140)}vw`} loading="eager" />
              </div>
            ))}
            {DIYA_FLAMES.map((f, i) => (
              <span key={i} data-diya-glow className="diya-glow" style={{ left: `${f.x * 100}%`, top: `${f.y * 100}%` }} />
            ))}
          </div>
        </div>
      </div>
      <HeroMotion />
    </section>
  );
}
