import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import { ADMIN_COOKIE, isValidAdminCookie } from "@/lib/admin-auth";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  // Defence in depth: the proxy already gates /admin, this re-checks on the server.
  const ok = await isValidAdminCookie((await cookies()).get(ADMIN_COOKIE)?.value);
  if (!ok) redirect("/admin/login");
  return (
    <>
      <AdminNav />
      <main className="container-site max-w-7xl py-6">{children}</main>
    </>
  );
}
