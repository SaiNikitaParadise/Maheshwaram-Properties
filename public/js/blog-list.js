/* ===========================================
   Blog listing — fetches posts from Sanity
   =========================================== */
document.addEventListener("DOMContentLoaded", async () => {
  const grid = document.getElementById("blog-grid");
  const stateEl = document.getElementById("blog-state");
  if (!grid) return;

  if (SANITY_CONFIG.projectId === "YOUR_PROJECT_ID") {
    stateEl.innerHTML = `Blog isn't connected yet — add your Sanity project ID in <code>js/sanity-config.js</code>.`;
    return;
  }

  const query = `*[_type == "post"] | order(publishedAt desc){
    title,
    "slug": slug.current,
    excerpt,
    publishedAt,
    "category": category->title,
    "authorName": author->name,
    "imageUrl": mainImage.asset->url
  }`;

  try {
    const posts = await sanityFetch(query);
    if (!posts || posts.length === 0) {
      stateEl.textContent = "No blog posts published yet — check back soon.";
      return;
    }
    stateEl.remove();
    grid.innerHTML = posts.map(postCardHtml).join("");
  } catch (err) {
    console.error(err);
    stateEl.textContent = "Couldn't load blog posts right now. Please try again shortly.";
  }
});

function postCardHtml(post) {
  const dateStr = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "";
  const metaParts = [post.category || "Article"];
  if (post.authorName) metaParts.push(post.authorName);
  if (dateStr) metaParts.push(dateStr);
  const img = post.imageUrl || "../images/ventures_bg.jpg";
  return `
    <div class="blog-card">
      <div class="blog-card-img-wrap">
        <img src="${img}" alt="${escapeHtml(post.title || "")}" class="blog-card-img" />
      </div>
      <div class="blog-card-body">
        <span class="blog-meta">${escapeHtml(metaParts.join(" · "))}</span>
        <h3>${escapeHtml(post.title || "Untitled")}</h3>
        <p class="blog-excerpt">${escapeHtml(post.excerpt || "")}</p>
        <a href="/blog/${encodeURIComponent(post.slug)}" class="btn btn-gold-sm">Read Article →</a>
      </div>
    </div>
  `;
}
