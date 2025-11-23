const onMessage = (message: any) => {
  if (message.type == 'ORCHID-AUTHORIZATION') {
    const data: Record<string, string> = {}
    const onBeforeSendHeaders = (details: chrome.webRequest.OnBeforeSendHeadersDetails) => {
      if (!details.requestHeaders) return details;
      for (const header of details.requestHeaders) {
        const name = header.name.toLowerCase();
        if (['userid', 'accesstoken', 'authorization'].includes(name)) {
          data[name] = header.value || "";
        }
      }
      chrome.webRequest.onBeforeSendHeaders.removeListener(onBeforeSendHeaders);
      if (Object.keys(data).length == 3) {
        chrome.storage.session.set({ "orchid-authorization": JSON.stringify(data) })
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
