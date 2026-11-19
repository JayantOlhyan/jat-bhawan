/**
 * "Sample image" label in the bottom-left corner of a generated stand-in
 * photo. Not focusable. When the image's alt already says it is a sample,
 * pass `hidden` so screen readers don't hear it twice.
 */
export function SampleChip({ label, small = false, hidden = false }: { label: string; small?: boolean; hidden?: boolean }) {
  return (
    <span
      aria-hidden={hidden || undefined}
      className={`sample-chip ${small ? "sample-chip-sm" : ""}`}
    >
      {label}
    </span>
  );
}
