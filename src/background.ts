const onMessage = (message: any) => {
  if (message.type == 'FIND_TOKENS') {
    const data: { [key: string]: string } = {}
    const onBeforeSendHeaders = (details: chrome.webRequest.OnBeforeSendHeadersDetails) => {
      if (!details.requestHeaders) return details;
      for (const header of details.requestHeaders) {
        if (['userid', 'accesstoken', 'authorization'].includes(header.name)) {
          data[header.name] = header.value || "";
        }
      }
      chrome.webRequest.onBeforeSendHeaders.removeListener(onBeforeSendHeaders);
      if (Object.keys(data).length == 3) {
        chrome.storage.session.set({ "robin-authtokens": JSON.stringify(data) })
      }
      return details;
    }
    chrome.webRequest.onBeforeSendHeaders.addListener(
      onBeforeSendHeaders,
      { urls: ["http://localhost:5000/api/*"] },
      ["requestHeaders"]
    );
  }
  return true;
}

chrome.runtime.onMessage.addListener(onMessage)
