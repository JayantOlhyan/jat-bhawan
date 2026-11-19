"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { track } from "@/lib/analytics";
import { BrassRule } from "@/components/site/BrassRule";
import { LineIcon } from "@/components/ui/LineIcon";
import { Link } from "@/i18n/navigation";
import { ICONS } from "@/lib/brand";
import { getRepos } from "@/lib/data";
import type { Donation } from "@/lib/data/types";
import { whatsappLink } from "@/lib/format";
import { gsap, useGSAP } from "@/lib/gsap";
import { formatINR } from "@/lib/money";
import { DUR, EASE, lowPower, MQ } from "@/lib/motion";

const PETALS = 30;

export function SuccessView() {
  const t = useTranslations("Success");
  const locale = useLocale();
  const id = useSearchParams().get("id");
  const [state, setState] = useState<{ loading: boolean; donation: Donation | null }>({ loading: true, donation: null });
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- no id means nothing to load
      setState({ loading: false, donation: null });
      return;
    }
    getRepos().donations.get(id).then((donation) => setState({ loading: false, donation }));
  }, [id]);

  const verified = state.donation?.status === "verified";

  // GA4 conversion (only when GA is configured): one event per verified donation shown.
  useEffect(() => {
    if (verified && state.donation) track("donation_complete", { value: state.donation.amountPaise / 100, currency: "INR" });
  }, [verified, state.donation]);

  // The site's one signature moment: the toran swings in, marigold petals fall
  // once (then leave the DOM), the diya lights and the receipt number types in.
  // The number is always whole in the DOM; a mask over it is what moves.
  useGSAP(
    () => {
      const el = root.current;
      if (!el || !verified) return;
      const q = gsap.utils.selector(el);
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        const tl = gsap.timeline({ defaults: { ease: EASE.enter } });
        tl.from(q("[data-toran]"), { rotation: -8, yPercent: -60, opacity: 0, transformOrigin: "50% 0%", duration: DUR.long, ease: EASE.celebrate }, 0)
          .fromTo(q("[data-glow]"), { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, duration: DUR.medium }, 0.3)
          .from(q("[data-diya]"), { scale: 0.9, duration: DUR.medium, ease: EASE.celebrate }, 0.3);

        const mask = q("[data-type-mask]")[0] as HTMLElement | undefined;
        const chars = Number(mask?.dataset.chars) || 12;
        if (mask) tl.fromTo(mask, { scaleX: 1 }, { scaleX: 0, duration: DUR.long, ease: `steps(${chars})` }, 0.5);

        const layer = q("[data-petals]")[0] as HTMLElement | undefined;
        if (layer && !lowPower()) {
          const w = layer.offsetWidth;
          const h = window.innerHeight * 0.7;
          for (let i = 0; i < PETALS; i++) {
            const p = document.createElement("span");
            p.className = "absolute top-0 block h-3 w-2 rounded-[60%_40%_60%_40%] bg-marigold";
            p.style.left = `${gsap.utils.random(0, w)}px`;
            layer.appendChild(p);
            gsap.fromTo(
              p,
              { y: gsap.utils.random(-60, -10), rotation: gsap.utils.random(0, 360), opacity: 1 },
              {
                y: gsap.utils.random(h * 0.5, h),
                x: `+=${gsap.utils.random(-40, 40)}`,
                rotation: `+=${gsap.utils.random(120, 360)}`,
                opacity: 0,
                duration: gsap.utils.random(1, 1.5),
                delay: gsap.utils.random(0, 0.25),
                ease: "power1.in",
                onComplete: () => p.remove(),
              },
            );
          }
        }
        return () => layer?.replaceChildren();
      });
      return () => mm.revert();
    },
    { dependencies: [verified], scope: root },
  );

  if (state.loading) return <p className="py-10 text-center text-ink-soft">…</p>;
  const d = state.donation;
  if (!d || (d.status !== "verified" && d.status !== "pending")) {
    return (
      <div className="card-raised p-(--space-lg) text-center">
        <p className="text-lg">{t("notFound")}</p>
        <Link href="/donate" className="btn btn-primary mt-4">{t("donateAgain")}</Link>
      </div>
    );
  }

  const url = typeof window !== "undefined" ? `${window.location.origin}/${locale}/donate` : "";
  const shareText =
    d.display === "full"
      ? t("shareTextFull", { amount: formatINR(d.amountPaise), url })
      : t("shareText", { url });

  if (d.status === "pending") {
    return (
      <div className="flex flex-col items-center text-center" data-testid="success-pending">
        <Image src={ICONS.receipt} alt="" width={120} height={120} sizes="120px" className="size-28" />
        <h1 className="mx-auto mt-(--space-md)">{t("pendingTitle")}</h1>
        <p className="lead mx-auto mt-(--space-sm)">{t("pendingLead")}</p>
        <BrassRule className="mt-(--space-lg) w-full" />
        <Link href="/" className="btn btn-outline mt-(--space-lg)">{t("donateAgain")}</Link>
      </div>
    );
  }

  return (
    <div ref={root} className="relative flex flex-col items-center text-center" data-testid="success">
      <div data-petals aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-10 h-0 overflow-visible" />
      <Image data-toran src={ICONS.toran} alt="" width={256} height={256} sizes="220px" className="-mb-(--space-xl) h-auto w-[220px]" />
      <div className="relative">
        <span data-glow aria-hidden="true" className="absolute left-1/2 top-[22%] size-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgb(255_214_120/0.7)_0%,rgb(255_170_60/0.25)_40%,transparent_70%)]" />
        <Image data-diya src={ICONS.diya} alt="" width={256} height={256} sizes="180px" className="relative size-[180px]" loading="eager" />
      </div>
      <h1 className="mx-auto mt-(--space-sm)">{t("title")}</h1>
      <p className="lead mx-auto mt-(--space-sm)">{t("lead")}</p>

      <dl className="mt-(--space-xl) w-full rounded-(--radius-card) border border-brass bg-surface p-(--space-lg)">
        <dt className="font-semibold text-muted">{t("receiptNo")}</dt>
        <dd className="mx-auto mt-(--space-sm) w-fit max-w-full rounded-(--radius-card) border border-brass px-(--space-lg) py-(--space-sm)">
          <span className="relative inline-block">
            <span className="figure text-[clamp(1.35rem,4vw,1.9rem)] tracking-wide text-ink" data-testid="receipt-no">{d.receiptNo}</span>
            <span
              data-type-mask
              data-chars={d.receiptNo?.length}
              aria-hidden="true"
              className="pointer-events-none absolute -inset-y-1 -right-1 left-0 origin-right bg-surface"
              style={{ transform: "scaleX(0)" }}
            />
          </span>
        </dd>
      </dl>

      <div className="mt-(--space-lg) grid w-full gap-(--space-sm)">
        <Link href={`/receipt/${d.id}`} className="btn btn-primary min-h-14 text-lg" data-testid="view-receipt">
          {t("viewReceipt")}
        </Link>
        <a href={whatsappLink(shareText)} target="_blank" rel="noopener noreferrer" className="btn btn-outline min-h-14 text-lg">
          <LineIcon name="chat" className="size-6 text-success" />
          {t("share")}
        </a>
      </div>
    </div>
  );
}
