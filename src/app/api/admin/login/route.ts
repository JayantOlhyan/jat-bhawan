import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, adminToken, configuredPassword } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const password = String(form.get("password") ?? "");
  const expected = configuredPassword();
  const back = new URL("/admin/login", request.url);

  if (!expected) {
    back.searchParams.set("error", "config");
    return NextResponse.redirect(back, 303);
  }
  if (password !== expected) {
    back.searchParams.set("error", "1");
    return NextResponse.redirect(back, 303);
  }

  const res = NextResponse.redirect(new URL("/admin", request.url), 303);
  res.cookies.set(ADMIN_COOKIE, await adminToken(expected), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return res;
}
