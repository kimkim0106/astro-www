import type { APIRoute } from "astro";
import { buildIndexMarkdown } from "../lib/index-markdown";

export const GET: APIRoute = ({ site, url }) => {
  const baseUrl = site ?? new URL("/", url);

  return new Response(buildIndexMarkdown(baseUrl), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
};
