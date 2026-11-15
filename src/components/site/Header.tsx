import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { DesktopNav } from "./DesktopNav";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { MobileMenu } from "./MobileMenu";

/**
 * Slab: one buff bar over a five-point ink rule. The wordmark in the slab face
 * on the left, the sections in the middle on desktop, the language switch and
 * Donate (the framed control; the filled one belongs to each page) on the right.
 */
export async function Header() {
  const t = await getTranslations("Nav");
  const tm = await getTranslations("Meta");
  const th = await getTranslations("Home");
  return (
    <header className="no-print sticky top-0 z-(--z-sticky-nav) border-b-[5px] border-ink bg-paper">
      <div className="container-site flex min-h-16 items-center gap-(--space-md) py-(--space-xs) lg:min-h-20 xl:gap-(--space-xl)">
        <Link
          href="/"
          aria-label={tm("siteName")}
          className="slab min-w-0 shrink text-[1.1rem] leading-tight text-ink no-underline sm:text-[1.3rem] xl:text-[1.45rem] xl:whitespace-nowrap"
        >
          <span className="sm:hidden">{th("titleLine1")}</span>
          <span className="max-sm:hidden">{tm("siteName")}</span>
        </Link>
        <div className="hidden min-w-0 flex-1 lg:block">
          <DesktopNav />
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-(--space-xs) lg:ml-0">
          {/* The visible switcher comes first in the DOM; on phones the menu button sits after Donate. */}
          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>
          <Link href="/donate" className="btn btn-outline min-h-11 px-(--space-lg) max-sm:px-(--space-md)" data-testid="header-donate">
            {t("donate")}
          </Link>
          <div className="order-last">
            <MobileMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
