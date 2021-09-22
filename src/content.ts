// import content from "./inject?astext";

console.log("content");

// console.log(content);

const url = chrome.runtime.getURL("inject.bundle.js");
console.log(url);

const script = document.createElement("script");
// script.src = "/inject.bundle.js";
script.src = url;
script.type = "text/javascript";
// script.textContent = content;
// script.dataset.findme = "findme";

script.onload = function () {
  console.log("script load");
  // setUrl(chrome.runtime.getURL(""))
};

(window as any).extension_url = "this isurl"

window.addEventListener("load", () => {
  console.log("DOMContentLoaded");
  console.log(script);
  console.log(script.src);
  document.head.appendChild(script);
});

// var s = document.createElement('script');
// s.src = chrome.runtime.getURL('script.js');
// s.onload = function() {
//     this.remove();
// };
// (document.head || document.documentElement).appendChild(s);

// function getTitle() {
//   return document.title;
// }

// const tabId = getTabId();
// chrome.tabs.getCurrent().then((tabInfo) => {
//   chrome.scripting.executeScript({
//     target: { tabId: tabInfo.id },
//     function: getTitle,
//   });
// });
