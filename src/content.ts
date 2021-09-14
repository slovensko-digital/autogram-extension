import content from "./inject?astext";

console.log("content");

// console.log(content);

// const script = document.createElement("script");
// // script.src = "/inject.bundle.js";
// script.type = "text/javascript";
// script.textContent = content;
// script.dataset.findme = "findme";
// window.addEventListener("load", () => {
//   console.log("DOMContentLoaded");
//   document.head.appendChild(script);
// });

function getTitle() {
  return document.title;
}

// const tabId = getTabId();
chrome.tabs.getCurrent().then((tabInfo) => {
  chrome.scripting.executeScript({
    target: { tabId: tabInfo.id },
    function: getTitle,
  });
});
