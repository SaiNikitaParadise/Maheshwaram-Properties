/* ===========================================
   Single blog post — fetches one post from Sanity
   by ?slug= in the URL
   =========================================== */
document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("post-content");
  const stateEl = document.getElementById("post-state");
  if (!container) return;

  if (SANITY_CONFIG.projectId === "YOUR_PROJECT_ID") {
    stateEl.innerHTML = `Blog isn't connected yet — add your Sanity project ID in <code>../js/sanity-config.js</code>.`;
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");
  if (!slug) {
    stateEl.textContent = "No article specified.";
    return;
  }

  const query = `*[_type == "post" && slug.current == $slug][0]{
    title,
    excerpt,
    publishedAt,
    "category": category->title,
    "authorName": author->name,
    "imageUrl": mainImage.asset->url,
    body[]{
      ...,
      _type == "image" => { "assetUrl": asset->url }
    }
  }`;

  try {
    const post = await sanityFetch(query, { slug });
    if (!post) {
      stateEl.textContent = "This article couldn't be found — it may have been unpublished.";
      return;
    }
    document.title = `${post.title} | Maheshwaram Properties`;
    const dateStr = post.publishedAt
      ? new Date(post.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
      : "";

    document.getElementById("post-hero-title").textContent = post.title || "";
    document.getElementById("post-breadcrumb-title").textContent = post.title || "";
    if (post.imageUrl) {
      document.getElementById("post-hero-bg").style.backgroundImage = `url('${post.imageUrl}')`;
    }
    stateEl.remove();
    const metaParts = [post.category || "Article"];
    if (post.authorName) metaParts.push(post.authorName);
    if (dateStr) metaParts.push(dateStr);
    container.innerHTML = `
      <p class="blog-post-meta">${metaParts.map(p => `<span>${escapeHtml(p)}</span>`).join("")}</p>
      ${renderPortableText(post.body)}
    `;
  } catch (err) {
    console.error(err);
    stateEl.textContent = "Couldn't load this article right now. Please try again shortly.";
  }
});
