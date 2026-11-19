import { llmsFullTxt } from "@/lib/llms";

/** /llms-full.txt: the page list plus the site's key facts, as plain sentences. */
export async function GET() {
  return new Response(await llmsFullTxt(), { headers: { "Content-Type": "text/markdown; charset=utf-8" } });
}
