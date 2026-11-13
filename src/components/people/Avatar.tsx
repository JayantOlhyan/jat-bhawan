import { initials } from "@/lib/format";

export function Avatar({ name, photo, size = "md" }: { name: string; photo?: string; size?: "md" | "lg" }) {
  const dim = size === "lg" ? "size-20 text-2xl" : "size-14 text-xl";
  if (photo) {
    // eslint-disable-next-line @next/next/no-img-element -- photos are optional client uploads; next/image needs known sizes
    return <img src={photo} alt="" className={`${dim} shrink-0 rounded-full object-cover`} />;
  }
  return (
    <span aria-hidden="true" className={`${dim} flex shrink-0 items-center justify-center rounded-full border border-gold bg-accent-tint font-serif text-accent`}>
      {initials(name)}
    </span>
  );
}
