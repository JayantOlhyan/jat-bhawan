/** Inner-page head, Banner posture: the title in the gothic over a five-point ink rule, one lead line. */
export function PageHeader({ title, lead, children }: { title: string; lead?: string; children?: React.ReactNode }) {
  return (
    <div className="border-b border-ink">
      <div className="container-site pt-(--space-xl) pb-(--space-xl) lg:pt-(--space-2xl)">
        <h1 className="max-w-[22ch] text-[length:var(--text-display-s)]">{title}</h1>
        <hr className="rule-bar mt-(--space-md) w-full max-w-[40rem]" />
        {lead && <p className="lead mt-(--space-lg) text-ink-2">{lead}</p>}
        {children}
      </div>
    </div>
  );
}
