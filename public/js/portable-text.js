/* ===========================================
   Minimal Portable Text renderer
   Handles: normal/h2/h3/h4 blocks, bullet & number
   lists, and strong/em/link marks. Enough for
   typical blog body content with no build step.
   =========================================== */
function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function renderSpan(span, markDefs) {
  let text = escapeHtml(span.text || "");
  const marks = span.marks || [];
  marks.forEach((mark) => {
    if (mark === "strong") text = `<strong>${text}</strong>`;
    else if (mark === "em") text = `<em>${text}</em>`;
    else {
      const def = (markDefs || []).find((d) => d._key === mark);
      if (def && def._type === "link" && def.href) {
        text = `<a href="${escapeHtml(def.href)}" target="_blank" rel="noopener noreferrer">${text}</a>`;
      }
    }
  });
  return text;
}

function renderBlock(block) {
  if (block._type === "image" && block.assetUrl) {
    return `<img src="${escapeHtml(block.assetUrl)}" alt="${escapeHtml(block.alt || "")}" style="width:100%;border-radius:12px;margin:24px 0;" />`;
  }
  if (block._type !== "block") return "";
  const inner = (block.children || [])
    .map((span) => renderSpan(span, block.markDefs))
    .join("");
  switch (block.style) {
    case "h2": return `<h2>${inner}</h2>`;
    case "h3": return `<h3>${inner}</h3>`;
    case "h4": return `<h4>${inner}</h4>`;
    case "blockquote": return `<blockquote>${inner}</blockquote>`;
    default: return `<p>${inner}</p>`;
  }
}

function renderPortableText(blocks) {
  if (!Array.isArray(blocks)) return "";
  let html = "";
  let listBuffer = [];
  let listType = null;

  const flushList = () => {
    if (listBuffer.length) {
      const tag = listType === "number" ? "ol" : "ul";
      html += `<${tag}>${listBuffer.join("")}</${tag}>`;
      listBuffer = [];
      listType = null;
    }
  };

  blocks.forEach((block) => {
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
  });
  flushList();
  return html;
}
