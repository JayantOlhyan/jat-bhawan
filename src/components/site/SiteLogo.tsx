/** Round logo placeholder until the Trust's own mark arrives: a maroon disc, brass ring, the name's first letter. */
export function SiteLogo({ letter, size = 44, tone = "maroon" }: { letter: string; size?: number; tone?: "maroon" | "ivory" }) {
  const fill = tone === "maroon" ? "bg-maroon text-ivory" : "bg-ivory text-maroon";
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-heading leading-none ring-2 ring-brass ring-offset-2 ${
        tone === "maroon" ? "ring-offset-ivory" : "ring-offset-maroon"
      } ${fill}`}
      style={{ width: size, height: size, fontSize: size * 0.48 }}
    >
      <span className="translate-y-[0.06em]">{letter}</span>
    </span>
  );
}
