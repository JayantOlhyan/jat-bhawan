import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { NOT_FOUND_FLAME } from "@/lib/brand";
import { sceneImage } from "@/lib/demo-images";

export default async function NotFound() {
  const t = await getTranslations("NotFound");
  const tc = await getTranslations("Common");
  const scene = sceneImage("not-found");
  return (
    <div className="container-site max-w-xl py-20 text-center">
      {scene && (
        // Decorative: a gateway with a lit diya. The glow sits on the flame and flickers (SiteMotion, [data-flicker]).
        <div data-fade="16" aria-hidden="true" className="relative mx-auto mb-(--space-md) size-[220px]">
          <Image src={scene} alt="" width={768} height={768} sizes="220px" className="size-full" loading="eager" />
          <span data-flicker className="diya-glow" style={{ left: `${NOT_FOUND_FLAME.x * 100}%`, top: `${NOT_FOUND_FLAME.y * 100}%`, width: "12%" }} />
        </div>
      )}
      <h1 className="text-[2rem]">{t("title")}</h1>
      <p className="mt-3 text-lg text-ink-soft">{t("body")}</p>
      <Link href="/" className="btn btn-primary mt-6">{tc("backHome")}</Link>
    </div>
  );
}
