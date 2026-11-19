import { llmsTxt } from "@/lib/llms";

/** /llms.txt: a curated page list for AI tools (https://llmstxt.org). */
export function GET() {
  return new Response(llmsTxt(), { headers: { "Content-Type": "text/markdown; charset=utf-8" } });
}
