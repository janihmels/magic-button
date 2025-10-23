// Create a context‑menu entry
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "extract-and-send",
    title: "Extract & Send Article",
    contexts: ["page", "selection"],
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== "extract-and-send" || !tab?.id) return;
  await extractAndSendFromTab(tab.id);
});

// this will not happen as long as we also have the popup!
chrome.action.onClicked.addListener(async (tab) => {
  console.log("Action is clicked");
  console.log("Tab:", tab);
  if (!tab?.id) return;
  await extractAndSendFromTab(tab.id);
});

console.log("Background script loaded");

async function extractAndSendFromTab(tabId) {
  // Ask content script for extracted payload
  const [response] = await chrome.tabs
    .sendMessage(tabId, { type: "EXTRACT_ARTICLE" })
    .catch(() => [null]);
  if (!response || response.error) {
    console.warn("Extraction failed", response?.error);
    return;
  }
  console.log("Response:", response);
  const result = response.result; // { title, byline, content, textContent, length, siteName, url }
  console.log("Result:", result);
  /*
    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {})
        },
        body: JSON.stringify(payload)
      });
      const ok = res.ok;
      const text = await res.text();
      console.log("API response:", ok, text);
      await chrome.action.setBadgeText({ text: ok ? "OK" : "ERR" });
      setTimeout(() => chrome.action.setBadgeText({ text: "" }), 2000);
    } catch (e) {
      console.error("API call failed", e);
      await chrome.action.setBadgeText({ text: "ERR" });
      setTimeout(() => chrome.action.setBadgeText({ text: "" }), 2000);
    }
      */
}
