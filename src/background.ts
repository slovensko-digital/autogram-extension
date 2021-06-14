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
