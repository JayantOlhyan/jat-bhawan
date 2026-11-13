/** Inner-page head: the title at section scale over the gold double rule, one lead line. */
export function PageHeader({ title, lead, children }: { title: string; lead?: string; children?: React.ReactNode }) {
  return (
    <div className="border-b-2 border-ink">
      <div className="container-site py-(--space-xl) lg:py-(--space-2xl)">
        <h1 className="text-[length:var(--text-section)]">{title}</h1>
        <hr className="rule-gold mt-(--space-md)" />
        {lead && <p className="lead mt-(--space-lg) text-ink-2">{lead}</p>}
        {children}
      </div>
    </div>
  );
}
