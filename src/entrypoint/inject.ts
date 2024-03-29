import { inject } from "../dbridge_js/inject-ditec";

type WindowWithDitec = Window & { ditec?: object };

const windowAny = window as WindowWithDitec;

inject(windowAny);

console.log("inject");

// chrome.runtime.onMessageExternal.addListener(function (
//   request,
//   sender,
//   sendResponse
// ) {
//   console.log(request);
//   console.log(sender);
// });

// chrome.runtime.onMessage.addListener(
//   function(request, sender, sendResponse) {
//     console.log(sender.tab ?
//                 "from a content script:" + sender.tab.url :
//                 "from the extension");
//     if (request.greeting === "hello")
//       sendResponse({farewell: "goodbye"});
//   }
// );

// chrome.runtime.sendMessage(
//   extensionId,
//   { greeting: "hello" },
//   function (response) {
//     console.log(response && response.farewell);
//   }
// );

// eslint-disable-next-line no-debugger
// debugger;
