console.log("background");

// chrome.webRequest.onBeforeRequest.addListener(
//   (details) => {
//     console.log(details);
//     return {
//       cancel: details.url.indexOf("/Content/jscript/DSignerMulti.js") != -1,
//     };
//   },
//   { urls: ["<all_urls>", "https://schranka.slovensko.sk/Content/jscript/DSignerMulti.js*"] },
//   ["blocking", "extraHeaders"]
// );

// UNUSED

chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['inject.bundle.js']
  });
});


chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  chrome.tabs.sendMessage(tabs[0].id, {greeting: "hello"}, function(response) {
    console.log(response.farewell);
  });
});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
    if (request.greeting === "hello")
      sendResponse({farewell: "goodbye"});
  }
);