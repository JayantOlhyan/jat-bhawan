/**
 * The house ornament: a thin brass line with a short maroon bar. `center`
 * between sections, `start` under a left-aligned heading, `step` for the
 * donate form's numbered sections. Decorative; the lines draw themselves in
 * when scrolled into view (SiteMotion, data-draw).
 */
function Line({ dir }: { dir: "left" | "right" }) {
  return (
    <svg className="h-[6px] min-w-0 flex-1 overflow-visible" viewBox="0 0 100 6" preserveAspectRatio="none" focusable="false">
      <line
        data-draw
        x1={dir === "left" ? 100 : 0}
        x2={dir === "left" ? 0 : 100}
        y1="3"
        y2="3"
        stroke="var(--color-brass)"
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export function BrassRule({
  align = "center",
  step,
  className = "",
}: {
  align?: "center" | "start";
  /** Numbered variant: a brass disc with this number, then the line. */
  step?: number;
  className?: string;
}) {
  if (step !== undefined) {
    return (
      <div aria-hidden="true" className={`flex items-center gap-(--space-sm) ${className}`}>
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brass text-[0.95rem] font-bold text-ink shadow-[inset_0_1px_0_rgb(255_240_205/0.6)]">
          {step}
        </span>
        <Line dir="right" />
      </div>
    );
  }
  const bar = <span data-rule-bar className="h-[5px] w-14 shrink-0 rounded-full bg-maroon" />;
  return (
    <div aria-hidden="true" className={`flex items-center ${align === "center" ? "gap-(--space-md)" : "gap-(--space-sm)"} ${className}`}>
      {align === "center" ? <Line dir="left" /> : null}
      {bar}
      <Line dir="right" />
    </div>
  );
}
