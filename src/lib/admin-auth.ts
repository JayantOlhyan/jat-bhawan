/**
 * Demo-only admin gate: a shared password from DEMO_ADMIN_PASSWORD, and an
 * httpOnly cookie holding a SHA-256 digest of it. The real version uses
 * Supabase Auth with 2-factor. Works in both the proxy and route handlers.
 */

export const ADMIN_COOKIE = "jb_demo_admin";

export async function adminToken(password: string): Promise<string> {
  const data = new TextEncoder().encode(`jat-bhawan-demo:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

export function configuredPassword(): string | null {
  const p = process.env.DEMO_ADMIN_PASSWORD;
  return p && p.length >= 6 ? p : null;
}

export async function isValidAdminCookie(value: string | undefined): Promise<boolean> {
  const password = configuredPassword();
  if (!password || !value) return false;
  return value === (await adminToken(password));
}
