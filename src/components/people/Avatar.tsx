import { initials } from "@/lib/format";

/**
 * A person's photo; without one, either their initials in maroon on a sand
 * disc, or (`fallback="portrait"`, the committee) a quiet head-and-shoulders
 * figure that shows where the photo goes, as in the reference layout.
 */
export function Avatar({
  name,
  photo,
  size = "md",
  fallback = "initials",
}: {
  name: string;
  photo?: string;
  size?: "md" | "lg";
  fallback?: "initials" | "portrait";
}) {
  const dim = size === "lg" ? "size-20 text-2xl" : "size-14 text-xl";
  if (photo) {
    // eslint-disable-next-line @next/next/no-img-element -- photos are optional client uploads; next/image needs known sizes
    return <img src={photo} alt="" className={`${dim} shrink-0 rounded-full object-cover ring-1 ring-brass`} />;
  }
  if (fallback === "portrait") {
    return (
      <span aria-hidden="true" className={`${dim} relative shrink-0 overflow-hidden rounded-full bg-sand ring-1 ring-brass`}>
        <svg viewBox="0 0 64 64" className="absolute inset-0 size-full text-[#b9a88f]" fill="currentColor">
          <circle cx="32" cy="25" r="11" />
          <path d="M10 64c0-13 9.8-21 22-21s22 8 22 21Z" />
        </svg>
      </span>
    );
  }
  return (
    <span aria-hidden="true" className={`${dim} flex shrink-0 items-center justify-center rounded-full bg-sand font-semibold text-maroon ring-1 ring-brass`}>
      {initials(name)}
    </span>
  );
}
