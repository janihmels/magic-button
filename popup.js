async function getActiveTabId() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return tab?.id;
  }
  
  const statusComponent = document.getElementById("status");
  
  document.getElementById("extractSend").addEventListener("click", async () => {
    statusComponent.textContent = "Extracting…";
    const tabId = await getActiveTabId();
    console.log("Active tab ID:", tabId);
    if (!tabId) {
      statusComponent.textContent = "No active tab found.";
      return;
    }
    
    let response;
    try {
      response = await chrome.tabs.sendMessage(tabId, { type: "EXTRACT_ARTICLE" });
    } catch (error) {
      console.error("Error sending message:", error);
      statusComponent.textContent = "Content script not available.";
      return;
    }
    if (!response || response.error) {
      statusComponent.textContent = "Extraction failed.";
      return;
    }
    const result = response.result;
    
    try {
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
      
      const urlencoded = new URLSearchParams();
      urlencoded.append("text", result.textContent);
      urlencoded.append("html", result.content);
      urlencoded.append("url", result.url);
      urlencoded.append("headline", result.title);
      
      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: urlencoded,
        redirect: "follow"
      };
      
      fetch("https://berrynoweb.lingoberry.co/articles/insert", requestOptions)
        .then((response) => response.text())
        .then((result) => {
          statusComponent.textContent = "Sent!";
        })
        .catch((error) => console.error(error));
    } catch (e) {
      statusComponent.textContent = `Network error.`;
    }

  });
  
  document.getElementById("openOptions").addEventListener("click", () => {
    chrome.runtime.openOptionsPage();
  });