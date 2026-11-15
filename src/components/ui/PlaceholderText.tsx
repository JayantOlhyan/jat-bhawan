/**
 * Copy that still starts with a "[placeholder]" / "[प्लेसहोल्डर]" marker: the
 * bracketed part is set small and muted so it reads as a slot to fill, not as
 * designed text. The words themselves are unchanged.
 */
export function PlaceholderText({ text }: { text: string }) {
  const m = /^(\[[^\]]+\])\s*([\s\S]*)$/.exec(text);
  if (!m) return <>{text}</>;
  return (
    <>
      <span className="font-sans text-[0.8em] font-semibold opacity-70">{m[1]}</span> {m[2]}
    </>
  );
}
