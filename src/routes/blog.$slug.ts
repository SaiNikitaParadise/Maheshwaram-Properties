import { createFileRoute } from "@tanstack/react-router";
// Serve the existing static blog post shell at clean URLs like /blog/my-post
import postHtml from "../../public/blog/post.html?raw";

const SANITY_PROJECT_ID = "b70je72l";
const SANITY_DATASET = "production";
const SANITY_API_VERSION = "2024-01-01";
const SITE = "https://www.maheshwaramproperties.in";
const FALLBACK_IMAGE = `${SITE}/images/ventures_bg.jpg`;

const QUERY = `*[_type == "post" && slug.current == $slug][0]{
  title, excerpt, publishedAt, _createdAt, metaTitle, metaDescription,
  "category": category->title,
  "authorName": author->name,
  "imageUrl": mainImage.asset->url,
  body[]{
    ...,
    _type == "image" => { "assetUrl": asset->url }
  }
}`;

interface SanitySpan {
  text?: string;
  marks?: string[];
}

interface SanityMarkDef {
  _key?: string;
  _type?: string;
  href?: string;
}

interface SanityBlock {
  _type?: string;
  style?: string;
  listItem?: string;
  assetUrl?: string;
  alt?: string;
  children?: SanitySpan[];
  markDefs?: SanityMarkDef[];
}

interface SanityPost {
  title?: string;
  excerpt?: string;
  publishedAt?: string;
  _createdAt?: string;
  metaTitle?: string;
  metaDescription?: string;
  category?: string;
  authorName?: string;
  imageUrl?: string;
  body?: SanityBlock[];
}

function esc(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderSpan(span: SanitySpan, markDefs?: SanityMarkDef[]) {
  let text = esc(span.text || "");
  for (const mark of span.marks || []) {
    if (mark === "strong") text = `<strong>${text}</strong>`;
    else if (mark === "em") text = `<em>${text}</em>`;
    else {
      const def = (markDefs || []).find((d) => d._key === mark);
      if (def && def._type === "link" && def.href) {
        text = `<a href="${esc(def.href)}" target="_blank" rel="noopener noreferrer">${text}</a>`;
      }
    }
  }
  return text;
}

function renderBlock(block: SanityBlock) {
  if (block._type === "image" && block.assetUrl) {
    return `<img src="${esc(block.assetUrl)}" alt="${esc(block.alt || "")}" loading="lazy" style="width:100%;border-radius:12px;margin:24px 0;" />`;
  }
  if (block._type !== "block") return "";
  const inner = (block.children || [])
    .map((span) => renderSpan(span, block.markDefs))
    .join("");
  switch (block.style) {
    case "h2":
      return `<h2>${inner}</h2>`;
    case "h3":
      return `<h3>${inner}</h3>`;
    case "h4":
      return `<h4>${inner}</h4>`;
    case "blockquote":
      return `<blockquote>${inner}</blockquote>`;
    default:
      return `<p>${inner}</p>`;
  }
}

function renderPortableText(blocks?: SanityBlock[]) {
  if (!Array.isArray(blocks)) return "";
  let html = "";
  let listBuffer: string[] = [];
  let listType: string | null = null;

  const flushList = () => {
    if (listBuffer.length) {
      const tag = listType === "number" ? "ol" : "ul";
      html += `<${tag}>${listBuffer.join("")}</${tag}>`;
      listBuffer = [];
      listType = null;
    }
  };

  for (const block of blocks) {
    if (block._type === "block" && block.listItem) {
      const inner = (block.children || [])
        .map((span) => renderSpan(span, block.markDefs))
        .join("");
      listType = block.listItem;
      listBuffer.push(`<li>${inner}</li>`);
    } else {
      flushList();
      html += renderBlock(block);
    }
  }
  flushList();
  return html;
}

async function fetchPost(slug: string): Promise<SanityPost | null> {
  const url = new URL(
    `https://${SANITY_PROJECT_ID}.apicdn.sanity.io/v${SANITY_API_VERSION}/data/query/${SANITY_DATASET}`,
  );
  url.searchParams.set("query", QUERY);
  url.searchParams.set("$slug", JSON.stringify(slug));
  const res = await fetch(url.toString());
  if (!res.ok) return null;
  const json = (await res.json()) as { result?: SanityPost | null };
  return json.result ?? null;
}

function injectMetaAndContent(html: string, slug: string, post: SanityPost) {
  const rawTitle = post.title ?? "Article";
  const title = esc(post.metaTitle || `${rawTitle} | Maheshwaram Properties`);
  const description = esc(post.metaDescription || post.excerpt || "");
  const image = post.imageUrl ? esc(post.imageUrl) : FALLBACK_IMAGE;
  const canonical = `${SITE}/blog/${encodeURIComponent(slug)}`;

  const dateSource = post.publishedAt || post._createdAt;
  const dateStr = dateSource
    ? new Date(dateSource).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";
  const metaParts = [post.category || "Article"];
  if (post.authorName) metaParts.push(post.authorName);
  if (dateStr) metaParts.push(dateStr);

  const metaHtml = `<p class="blog-post-meta">${metaParts.map((p) => `<span>${esc(p)}</span>`).join("")}</p>`;
  const bodyHtml = renderPortableText(post.body);

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: rawTitle,
    description: post.metaDescription || post.excerpt || "",
    image: post.imageUrl || FALLBACK_IMAGE,
    datePublished: dateSource || undefined,
    author: {
      "@type": "Person",
      name: post.authorName || "Mahender",
    },
    publisher: {
      "@type": "Organization",
      name: "Maheshwaram Properties",
      url: SITE,
    },
    mainEntityOfPage: canonical,
  });

  let out = html
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
      `<meta name="twitter:image" content="${image}" />\n  <script type="application/ld+json">${jsonLd}</script>`,
    )
    .replace(
      /<h1 id="post-hero-title">[\s\S]*?<\/h1>/,
      `<h1 id="post-hero-title">${esc(rawTitle)}</h1>`,
    )
    .replace(
      /<span id="post-breadcrumb-title">[\s\S]*?<\/span>/,
      `<span id="post-breadcrumb-title">${esc(rawTitle)}</span>`,
    );

  if (post.imageUrl) {
    out = out.replace(
      /<div class="page-hero-bg" id="post-hero-bg" style="[^"]*"><\/div>/,
      `<div class="page-hero-bg" id="post-hero-bg" style="background-image: url('${esc(post.imageUrl)}');"></div>`,
    );
  }

  if (bodyHtml) {
    out = out
      .replace(/<p id="post-state"[^>]*>[\s\S]*?<\/p>\s*/, "")
      .replace(
        /<div id="post-content"><\/div>/,
        `<div id="post-content">${metaHtml}${bodyHtml}</div>`,
      );
  }

  return out;
}

export const Route = createFileRoute("/blog/$slug")({
  staticData: { sitemap: true },
  server: {
    handlers: {
      GET: async ({ params }: { params: { slug: string } }) => {
        let html = postHtml;
        try {
          const post = await fetchPost(params.slug);
          if (post) html = injectMetaAndContent(postHtml, params.slug, post);
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
