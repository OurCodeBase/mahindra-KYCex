const onMessage = (message: any) => {
  if (message.type == 'FIND_TOKENS') {
    console.log("Listened a web request for tokens...");
    const data: Record<string, string> = {}
    const onBeforeSendHeaders = (details: chrome.webRequest.OnBeforeSendHeadersDetails) => {
      console.log("Found a web request at url:", details.url);
      if (!details.requestHeaders) return details;
      for (const header of details.requestHeaders) {
        if (['userid', 'accesstoken', 'authorization'].includes(header.name)) {
          data[header.name] = header.value || "";
        }
      }
      chrome.webRequest.onBeforeSendHeaders.removeListener(onBeforeSendHeaders);
      if (Object.keys(data).length == 3) {
        console.log("Saved tokens in session storage:", data);
        chrome.storage.session.set({ "robin-authtokens": JSON.stringify(data) })
      }
      return details;
    }
    chrome.webRequest.onBeforeSendHeaders.addListener(
      onBeforeSendHeaders, {
        urls: [
          "http://localhost:5000/api/*",
          "https://api.mahindradealerrise.com/otf/vehicleinvoice/*"
        ]
      }, ["requestHeaders"]
    );
  }
  return true;
}

chrome.runtime.onMessage.addListener(onMessage)
