import { createFileRoute } from "@tanstack/react-router";
import { getRouterInstance } from "@tanstack/react-start";
import {
  isSitemapRouteIncluded,
  sitemapPathForLocation,
  sitemapStaticPaths,
  sitemapXML,
  type SitemapEntry,
} from "@/lib/sitemap";

const BASE_URL = "https://www.maheshwaramproperties.in";

// Static HTML pages served from public/ (not TanStack routes, so listed here).
const STATIC_PAGES: string[] = [
  "/index.html",
  "/about.html",
  "/ventures.html",
  "/services.html",
  "/contact.html",
  "/customers.html",
  "/privacy-policy.html",
  "/blog.html",
  "/ventures/chalapathi-estates-kandukur.html",
  "/ventures/chalapathi-garden.html",
  "/ventures/chalapathi-melbourne-kadthal.html",
  "/ventures/chalapathi-paradise.html",
  "/ventures/cyber-space.html",
  "/ventures/east-gate-nagaram.html",
  "/ventures/vision-meadows-spandana.html",
  "/ventures/green-city-elite.html",
  "/ventures/karvy-nova.html",
  "/ventures/magadha-riviera.html",
  "/ventures/meher-crown-city.html",
  "/ventures/palm-meadows.html",
  "/ventures/rich-green-bagh-mankhal.html",
  "/ventures/sai-nikita-paradise.html",
  "/ventures/shreya-green-meadows.html",
  "/ventures/song-of-the-south.html",
  "/ventures/vision-meadows.html",
  "/ventures/vision-palm-meadows.html",
];

const SANITY_PROJECT_ID = "b70je72l";
const SANITY_DATASET = "production";
const SANITY_API_VERSION = "2024-01-01";
const PAGE_SIZE = 100;

interface SanityPost {
  slug: string;
  publishedAt?: string;
  _updatedAt?: string;
}

async function fetchAllPosts(): Promise<SanityPost[]> {
  const posts: SanityPost[] = [];
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const url = new URL(
      `https://${SANITY_PROJECT_ID}.apicdn.sanity.io/v${SANITY_API_VERSION}/data/query/${SANITY_DATASET}`,
    );
    url.searchParams.set(
      "query",
      `*[_type == "post" && defined(slug.current)] | order(slug.current asc)[$offset...$end]{ "slug": slug.current, publishedAt, _updatedAt }`,
    );
    url.searchParams.set("$offset", JSON.stringify(offset));
    url.searchParams.set("$end", JSON.stringify(offset + PAGE_SIZE));
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`Sanity sitemap query failed: ${res.status}`);
    const json = (await res.json()) as { result?: SanityPost[] | null };
    const batch = json.result ?? [];
    posts.push(...batch);
    if (batch.length < PAGE_SIZE) break;
  }
  return posts;
}

export const Route = createFileRoute("/sitemap.xml")({
  staticData: { sitemap: false },
  server: {
    handlers: {
      GET: async () => {
        const router = await getRouterInstance();
        const entries: SitemapEntry[] = sitemapStaticPaths(router).map((path) => ({ path }));
        entries.push(...STATIC_PAGES.map((path) => ({ path })));

        // Blog posts from Sanity — every published post is included automatically.
        const routeId = "/blog/$slug" as const;
        const blogRoute = router.routesById[routeId];
        if (isSitemapRouteIncluded(blogRoute)) {
          const posts = await fetchAllPosts();
          for (const post of posts) {
            const location = router.buildLocation({
              to: "/blog/$slug",
              params: { slug: post.slug },
              search: () => ({}),
              hash: "",
            });
            const path = sitemapPathForLocation(router, location, routeId);
            if (path) {
              const lastmod = post._updatedAt || post.publishedAt;
              entries.push({ path, lastmod: lastmod ? lastmod.slice(0, 10) : undefined });
            }
          }
        }

        if (entries.length === 0) {
          return new Response("No pages are included in this sitemap.", {
            status: 404,
            headers: { "Cache-Control": "no-store" },
          });
        }
        return new Response(sitemapXML(BASE_URL, entries), {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
