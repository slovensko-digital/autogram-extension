import content from "./inject?astext";

console.log("content");

// console.log(content);

const script = document.createElement("script");
// script.src = "/inject.bundle.js";
script.type = "text/javascript";
script.textContent = content;
document.addEventListener("DOMContentLoaded", () => {
  document.head.appendChild(script);
});
