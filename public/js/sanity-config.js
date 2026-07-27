/* ===========================================
   SANITY.IO CONFIG
   Fill these in from your Sanity project.
   Manage → sanity.io/manage → your project → Settings
   =========================================== */
const SANITY_CONFIG = {
  projectId: "b70je72l",       // Maheshwaram Properties Blog (Sanity project)
  dataset: "production",
  apiVersion: "2024-01-01",       // any date-formatted API version is fine
  useCdn: true                    // true = faster, cached; set false for instant updates after publishing
};

function sanityQueryUrl(groqQuery, params) {
  const base = SANITY_CONFIG.useCdn
    ? `https://${SANITY_CONFIG.projectId}.apicdn.sanity.io`
    : `https://${SANITY_CONFIG.projectId}.api.sanity.io`;
  const url = new URL(`${base}/v${SANITY_CONFIG.apiVersion}/data/query/${SANITY_CONFIG.dataset}`);
  url.searchParams.set("query", groqQuery);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(`$${key}`, JSON.stringify(value));
    });
  }
  return url.toString();
}

async function sanityFetch(groqQuery, params) {
  const res = await fetch(sanityQueryUrl(groqQuery, params));
  if (!res.ok) {
    throw new Error(`Sanity request failed: ${res.status}`);
  }
  const json = await res.json();
  return json.result;
}
