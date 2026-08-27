import { createFileRoute } from "@tanstack/react-router";
// Serve the existing static blog post shell at clean URLs like /blog/my-post
import postHtml from "../../public/blog/post.html?raw";

const SANITY_PROJECT_ID = "b70je72l";
const SANITY_DATASET = "production";
const SANITY_API_VERSION = "2024-01-01";
const SITE = "https://www.maheshwaramproperties.in";
const FALLBACK_IMAGE = `${SITE}/images/ventures_bg.jpg`;

const QUERY = `*[_type == "post" && slug.current == $slug][0]{
  title, excerpt, metaTitle, metaDescription,
  "imageUrl": mainImage.asset->url
}`;

function esc(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function fetchPost(slug: string) {
  const url = new URL(
    `https://${SANITY_PROJECT_ID}.apicdn.sanity.io/v${SANITY_API_VERSION}/data/query/${SANITY_DATASET}`,
  );
  url.searchParams.set("query", QUERY);
  url.searchParams.set("$slug", JSON.stringify(slug));
  const res = await fetch(url.toString());
  if (!res.ok) return null;
  const json = (await res.json()) as { result?: Record<string, string> | null };
  return json.result ?? null;
}

function injectMeta(html: string, slug: string, post: Record<string, string>) {
  const title = esc(post.metaTitle || `${post.title ?? "Article"} | Maheshwaram Properties`);
  const description = esc(post.metaDescription || post.excerpt || "");
  const image = post.imageUrl ? esc(post.imageUrl) : FALLBACK_IMAGE;
  const canonical = `${SITE}/blog/${encodeURIComponent(slug)}`;

  return html
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`)
    .replace(
      /<meta name="description" content="[\s\S]*?" \/>/,
      `<meta name="description" content="${description}" />`,
    )
    .replace(
      /<link rel="canonical" href="[\s\S]*?" \/>/,
      `<link rel="canonical" href="${canonical}" />`,
    )
    .replace(
      /<meta property="og:url" content="[\s\S]*?" \/>/,
      `<meta property="og:url" content="${canonical}" />`,
    )
    .replace(
      /<meta property="og:title" content="[\s\S]*?" \/>/,
      `<meta property="og:title" content="${title}" />`,
    )
    .replace(
      /<meta property="og:description" content="[\s\S]*?" \/>/,
      `<meta property="og:description" content="${description}" />`,
    )
    .replace(
      /<meta property="og:image" content="[\s\S]*?" \/>/,
      `<meta property="og:image" content="${image}" />\n  <meta property="og:image:width" content="1200" />\n  <meta property="og:image:height" content="630" />`,
    )
    .replace(
      /<meta property="og:image:alt" content="[\s\S]*?" \/>/,
      `<meta property="og:image:alt" content="${title}" />`,
    )
    .replace(
      /<meta name="twitter:title" content="[\s\S]*?" \/>/,
      `<meta name="twitter:title" content="${title}" />`,
    )
    .replace(
      /<meta name="twitter:description" content="[\s\S]*?" \/>/,
      `<meta name="twitter:description" content="${description}" />`,
    )
    .replace(
      /<meta name="twitter:image" content="[\s\S]*?" \/>/,
      `<meta name="twitter:image" content="${image}" />`,
    );
}

export const Route = createFileRoute("/blog/$slug")({
  server: {
    handlers: {
      GET: async ({ params }: { params: { slug: string } }) => {
        let html = postHtml;
        try {
          const post = await fetchPost(params.slug);
          if (post) html = injectMeta(postHtml, params.slug, post);
        } catch {
          // fall back to the static shell
        }
        return new Response(html, {
          headers: {
            "content-type": "text/html; charset=utf-8",
            "cache-control": "public, max-age=0, must-revalidate",
          },
        });
      },
    },
  },
});
