import { initials } from "@/lib/format";

/** A person's photo, or their initials in maroon on a sand disc. */
export function Avatar({ name, photo, size = "md" }: { name: string; photo?: string; size?: "md" | "lg" }) {
  const dim = size === "lg" ? "size-20 text-2xl" : "size-14 text-xl";
  if (photo) {
    // eslint-disable-next-line @next/next/no-img-element -- photos are optional client uploads; next/image needs known sizes
    return <img src={photo} alt="" className={`${dim} shrink-0 rounded-full object-cover ring-1 ring-brass`} />;
  }
  return (
    <span aria-hidden="true" className={`${dim} flex shrink-0 items-center justify-center rounded-full bg-sand font-semibold text-maroon ring-1 ring-brass`}>
      {initials(name)}
    </span>
  );
}
