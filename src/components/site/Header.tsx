import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { DesktopNav } from "./DesktopNav";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { MobileMenu } from "./MobileMenu";
import { SiteLogo } from "./SiteLogo";

/**
 * Sticky ivory bar: logo + name, the sections (desktop), the text language
 * toggle and the maroon Donate pill, which stays visible at every width,
 * beside the menu button on phones.
 */
export async function Header() {
  const t = await getTranslations("Nav");
  const tm = await getTranslations("Meta");
  const th = await getTranslations("Home");
  return (
    <header className="no-print sticky top-0 z-(--z-sticky-nav) border-b border-line bg-ivory">
      <div className="container-site flex min-h-16 items-center gap-(--space-sm) py-(--space-xs) lg:min-h-20 xl:gap-(--space-lg)">
        <Link href="/" className="flex min-w-0 shrink items-center gap-(--space-sm) no-underline">
          <SiteLogo letter={th("titleLine1").slice(0, 1)} size={40} />
          <span className="min-w-0 font-heading text-[1.12rem] leading-tight text-maroon sm:text-[1.3rem] xl:whitespace-nowrap">
            <span className="sm:hidden">{th("titleLine1")}</span>
            <span className="max-sm:hidden">{tm("siteName")}</span>
          </span>
        </Link>
        <div className="hidden min-w-0 flex-1 lg:block">
          <DesktopNav />
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-(--space-sm) lg:ml-0">
          <LanguageSwitcher className="max-sm:hidden" />
          <Link href="/donate" className="btn btn-primary min-h-11 px-(--space-lg) max-sm:px-(--space-md)" data-testid="header-donate">
            {t("donate")}
          </Link>
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
