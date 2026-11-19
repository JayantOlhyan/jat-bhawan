/* eslint-disable @next/next/no-img-element -- a fixed 1200 × 630 canvas for a screenshot; plain <img> loads every layer eagerly at its exact size. */
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { brand, heroBuilding, ICONS, JHAROKHA_ARCH } from "@/lib/brand";

/**
 * Dev-only: the composition `npm run og` screenshots to public/brand/og.png
 * (scripts/og.mjs). 404 in production. It never shows a demo/sample photo:
 * a share preview must not pass a sample off as the real building.
 */
export const dynamic = "force-dynamic";

function Rule() {
  return (
    <div aria-hidden="true" className="flex w-[132px] items-center gap-[8px]">
      <span className="h-[2px] flex-1 bg-brass" />
      <span className="h-[4px] w-[28px] rounded-full bg-maroon" />
      <span className="h-[2px] flex-1 bg-brass" />
    </div>
  );
}

export default async function OgTemplate() {
  if (process.env.NODE_ENV === "production") notFound();
  const hi = await getTranslations({ locale: "hi", namespace: "Meta" });
  const en = await getTranslations({ locale: "en", namespace: "Meta" });
  const [diyas] = brand.heroFgParts;
  const [x0, y0, x1, y1] = diyas.box;
  const diyaW = 600;
  const diyaH = Math.round((diyaW * (y1 - y0)) / (x1 - x0));

  return (
    <div id="og" className="relative h-[630px] w-[1200px] overflow-hidden">
      <img src={brand.heroBg} alt="" className="absolute inset-0 size-full object-cover object-[75%_50%]" />

      <div className={`absolute left-[84px] top-1/2 flex -translate-y-1/2 flex-col gap-[30px] ${heroBuilding ? "-mt-[24px]" : ""}`}>
        <Rule />
        <div>
          <p lang="hi" className="font-heading text-[66px] leading-[1.25] text-maroon">{hi("siteName")}</p>
          <p lang="en" className="mt-[10px] font-sans text-[34px] font-semibold leading-tight text-ink">{en("siteName")}</p>
        </div>
        {!heroBuilding && <Rule />}
      </div>

      {heroBuilding ? (
        <>
          {/* The façade as the main art, as in the home hero, resting on the bottom edge. */}
          <img src={heroBuilding} alt="" className="absolute bottom-0 left-[528px] h-[504px] w-[660px] object-contain object-bottom" />
        </>
      ) : (
        <>
          {/* The brass jharokha with a toran and a lit diya, until the façade cutout exists. */}
          <div className="absolute left-[790px] top-[36px] h-[456px] w-[304px]">
            <svg aria-hidden="true" viewBox="0 0 100 150" preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible drop-shadow-[0_12px_20px_rgb(94_64_30/0.25)]">
              <path d={JHAROKHA_ARCH} fill="var(--color-sand)" stroke="var(--color-brass)" strokeWidth="3" vectorEffect="non-scaling-stroke" />
              <path d={JHAROKHA_ARCH} transform="translate(50 76) scale(0.9) translate(-50 -76)" fill="none" stroke="var(--color-brass)" strokeWidth="1.5" strokeOpacity="0.75" vectorEffect="non-scaling-stroke" />
            </svg>
            <img src={ICONS.toran} alt="" className="absolute left-1/2 top-[16%] w-[74%] -translate-x-1/2" />
            <span className="absolute left-1/2 top-[64%] size-[220px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgb(255_214_120/0.75)_0%,rgb(255_170_60/0.28)_42%,transparent_70%)]" />
            <img src={ICONS.diya} alt="" className="absolute bottom-[12%] left-1/2 w-[46%] -translate-x-1/2" />
          </div>
          <img src={diyas.src} alt="" width={diyaW} height={diyaH} className="absolute bottom-0 right-[-8px]" style={{ width: diyaW, height: diyaH }} />
        </>
      )}
    </div>
  );
}
