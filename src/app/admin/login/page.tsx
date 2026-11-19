import type { Metadata } from "next";
import { configuredPassword } from "@/lib/admin-auth";

export const metadata: Metadata = { title: "Sign in" };

export default async function AdminLogin({ searchParams }: PageProps<"/admin/login">) {
  const { error } = await searchParams;
  const missing = !configuredPassword();
  return (
    <main className="container-site flex max-w-md flex-col py-16">
      <h1 className="text-[2rem]">Admin sign in</h1>
      <hr className="rule-mark mt-2" />
      {missing && (
        <p role="alert" className="mt-6 rounded-md border border-error bg-error-tint p-3 text-error">
          DEMO_ADMIN_PASSWORD is not set (min. 6 characters). Add it to .env.local or the Netlify environment.
        </p>
      )}
      {error === "1" && (
        <p role="alert" className="mt-6 rounded-md border border-error bg-error-tint p-3 text-error">
          Wrong password. Try again.
        </p>
      )}
      <form method="post" action="/api/admin/login" className="card mt-6 space-y-4 p-6">
        <div>
          <label htmlFor="password" className="field-label">Demo password</label>
          <input id="password" name="password" type="password" required autoComplete="current-password" className="field" />
        </div>
        <button type="submit" className="btn btn-primary w-full">Sign in</button>
      </form>
    </main>
  );
}
