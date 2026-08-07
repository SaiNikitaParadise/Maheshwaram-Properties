import { createFileRoute } from "@tanstack/react-router";
// Serve the existing static blog post shell at clean URLs like /blog/my-post
import postHtml from "../../public/blog/post.html?raw";

export const Route = createFileRoute("/blog/$slug")({
  server: {
    handlers: {
      GET: async () =>
        new Response(postHtml, {
          headers: {
            "content-type": "text/html; charset=utf-8",
            "cache-control": "public, max-age=0, must-revalidate",
          },
        }),
    },
  },
});
