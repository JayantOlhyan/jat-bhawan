/** Permanent bilingual demo notice shown on every page (public and admin). */
export function DemoBanner() {
  return (
    <div role="note" className="no-print bg-ink px-(--space-sm) py-(--space-2xs) text-center text-[0.8rem] leading-snug text-paper sm:text-[0.9rem]">
      <span lang="hi">डेमो साइट: सभी नाम, राशियाँ और विवरण नमूना हैं</span>
      <span aria-hidden="true"> / </span>
      <span lang="en">Demo site: all names, amounts and details are sample data</span>
    </div>
  );
}
