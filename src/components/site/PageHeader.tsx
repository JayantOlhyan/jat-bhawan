import Image from "next/image";
import { ICONS, type IconName } from "@/lib/brand";
import { BrassRule } from "./BrassRule";

/** Inner-page head: H1, one line of intro, the brass rule. An optional icon sits above a centred head. */
export function PageHeader({
  title,
  lead,
  icon,
  centered = false,
  children,
}: {
  title: string;
  lead?: string;
  icon?: IconName;
  centered?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="container-site pt-(--space-xl) pb-(--space-lg) lg:pt-(--space-2xl)">
      <div className={centered ? "mx-auto flex max-w-[40rem] flex-col items-center text-center" : ""}>
        {icon && <Image src={ICONS[icon]} alt="" width={72} height={72} sizes="72px" className="mb-(--space-xs) size-[72px]" loading="eager" />}
        <h1 className={centered ? "mx-auto" : ""}>{title}</h1>
        {lead && <p className={`lead mt-(--space-sm) ${centered ? "mx-auto" : ""}`}>{lead}</p>}
        {children}
      </div>
      <BrassRule align={centered ? "center" : "start"} className="mt-(--space-lg)" />
    </div>
  );
}
