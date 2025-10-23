/**
 * Content script:
 *  - Waits for message {type: 'EXTRACT_ARTICLE'} from background/popup
 *  - Uses Readability to parse the current document
 *  - Falls back to <article> or main body text if needed
 */

function basicFallbackExtract() {
  const articleEl =
    document.querySelector("article") ||
    document.querySelector("main") ||
    document.body;
  const clones = articleEl.cloneNode(true);
  // Remove obvious non‑content stuff including navigation elements
  clones
    .querySelectorAll(
      "script, style, nav, header, footer, aside, noscript, iframe, " +
      "[role='navigation'], [role='menu'], [role='menubar'], " +
      ".nav, .navigation, .menu, .breadcrumb, .breadcrumbs, " +
      ".sidebar, .sidebar-content, .sidebar-nav, " +
      ".pagination, .pager, .page-nav"
    )
    .forEach((n) => n.remove());
  const text = clones.innerText.replace(/\n{3,}/g, "\n\n").trim();
  return {
    title: document.title,
    byline: "",
    content: clones.innerHTML,
    textContent: text,
    length: text.length,
    siteName: location.hostname,
    url: location.href,
  };
}

function extractWithReadability() {
  try {
    // Some sites mutate DOM—clone for stability
    const docClone = document.cloneNode(true);
    const reader = new Readability(docClone, { 
      keepClasses: false,
      // More aggressive filtering to avoid navigation elements
      charThreshold: 300,  // Lower threshold to be more selective
      linkDensityModifier: 0.1,  // Penalize high link density more
      debug: false  // Set to true if you want to see what's being filtered
    });
    const article = reader.parse();
    if (!article) return null;
    return {
      title: article.title || document.title,
      byline: article.byline || "",
      content: article.content || "",
      textContent: article.textContent || "",
      length: (article.textContent || "").length,
      siteName:
        article.siteName ||
        document.querySelector('meta[property="og:site_name"]')?.content ||
        location.hostname,
      url: location.href,
    };
  } catch (e) {
    console.warn("Readability failed:", e);
    return null;
  }
}

async function extractResult() {
  // Try Readability first
  const withR = extractWithReadability();
  if (withR && withR.textContent && withR.textContent.length > 200)
    return withR;
  // Fallback
  return basicFallbackExtract();
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  console.log("Message received:", msg);
  if (msg?.type === "EXTRACT_ARTICLE") {
    extractResult().then(result => {
      console.log("Result:", result);
      sendResponse({ ok: true, result });
    }).catch(error => {
      console.error("Extraction error:", error);
      sendResponse({ ok: false, error: String(error) });
    });
    return true; // keep port open for async
  }
});
