const apiUrlEl = document.getElementById("apiUrl");
const apiKeyEl = document.getElementById("apiKey");
const statusEl = document.getElementById("status");

(async function init() {
  const { apiUrl, apiKey } = await chrome.storage.sync.get({ apiUrl: "", apiKey: "" });
  apiUrlEl.value = apiUrl;
  apiKeyEl.value = apiKey;
})();

document.getElementById("save").addEventListener("click", async () => {
  await chrome.storage.sync.set({ apiUrl: apiUrlEl.value.trim(), apiKey: apiKeyEl.value.trim() });
  statusEl.textContent = "Saved.";
  setTimeout(() => (statusEl.textContent = ""), 1500);
});