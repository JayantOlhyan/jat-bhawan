import Image from "next/image";
import { ICONS, type IconName } from "@/lib/brand";
import { sceneImage, type SceneName } from "@/lib/demo-images";
import { BrassRule } from "./BrassRule";

export type HeaderScene = Exclude<SceneName, "not-found">;

/**
 * Inner-page head: H1, one line of intro, the brass rule. An optional icon sits above a centred head.
 * An optional `scene` (public/brand/scenes/<scene>.webp, decorative) sits to the right on ≥ 768px;
 * its square is reserved whether or not the file exists, so the header height never changes.
 * Phones don't show it. SiteMotion gives it a rise-in and a slow parallax ([data-scene]).
 */
export function PageHeader({
  title,
  lead,
  icon,
  centered = false,
  scene,
  children,
}: {
  title: string;
  lead?: string;
  icon?: IconName;
  centered?: boolean;
  scene?: HeaderScene;
  children?: React.ReactNode;
}) {
  const withScene = Boolean(scene) && !centered;
  const sceneSrc = withScene && scene ? sceneImage(scene) : null;
  const text = (
    <div className={centered ? "mx-auto flex max-w-[40rem] flex-col items-center text-center" : "min-w-0"}>
      {icon && <Image src={ICONS[icon]} alt="" width={72} height={72} sizes="72px" className="mb-(--space-xs) size-[72px]" loading="eager" />}
      <h1 className={centered ? "mx-auto" : ""}>{title}</h1>
      {lead && <p className={`lead mt-(--space-sm) ${centered ? "mx-auto" : ""}`}>{lead}</p>}
      {children}
    </div>
  );
  return (
    <div data-page-header className="container-site pt-(--space-xl) pb-(--space-lg) lg:pt-(--space-2xl)">
      {withScene ? (
        <div className="md:grid md:min-h-[240px] md:grid-cols-[minmax(0,1fr)_240px] md:items-center md:gap-(--space-xl) xl:min-h-[280px] xl:grid-cols-[minmax(0,1fr)_280px]">
          {text}
          {sceneSrc && (
            <div data-scene aria-hidden="true" className="hidden size-[240px] md:block xl:size-[280px]">
              <div data-scene-art className="size-full">
                <Image src={sceneSrc} alt="" width={1024} height={1024} sizes="(min-width: 1280px) 280px, 240px" className="size-full object-contain" />
              </div>
            </div>
          )}
        </div>
      ) : (
        text
      )}
      <BrassRule align={centered ? "center" : "start"} className="mt-(--space-lg)" />
    </div>
  );
}
