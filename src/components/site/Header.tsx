import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { DesktopNav } from "./DesktopNav";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { MobileMenu } from "./MobileMenu";

/**
 * Masthead: the wordmark centred over a gold double rule, the language switch
 * on the left, Donate on the right; the section links run beneath on desktop.
 */
export async function Header() {
  const t = await getTranslations("Nav");
  const tm = await getTranslations("Meta");
  return (
    <header className="no-print sticky top-0 z-(--z-sticky-nav) border-b border-rule bg-paper">
      <div className="container-site grid min-h-16 grid-cols-[auto_minmax(0,1fr)_auto] sm:grid-cols-[1fr_auto_1fr] items-center gap-(--space-sm) py-(--space-xs) lg:min-h-20">
        <div className="flex items-center gap-(--space-xs)">
          {/* The visible switcher comes first in the DOM; the menu button is moved before it visually. */}
          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>
          <div className="order-first">
            <MobileMenu />
          </div>
        </div>
        <Link
          href="/"
          aria-label={tm("siteName")}
          className="min-w-0 justify-self-center text-center font-serif text-[1.3rem] leading-[1.15] text-balance text-ink no-underline sm:whitespace-nowrap sm:text-[1.7rem] sm:leading-none lg:text-[2.1rem]"
        >
          {tm("siteName")}
        </Link>
        <div className="flex justify-end">
          <Link href="/donate" className="btn btn-primary min-h-11 px-(--space-lg) max-sm:px-(--space-md)" data-testid="header-donate">
            {t("donate")}
          </Link>
        </div>
      </div>
      <div className="hidden border-t-[5px] border-double border-gold lg:block">
        <div className="container-site">
          <DesktopNav />
        </div>
      </div>
    </header>
  );
}
