import { AvmWorker } from "../dbridge_js/autogram/avm-worker";
import browser from "webextension-polyfill";

console.log("background");

// browser.runtime.sendMessage({ bgRuntimeEvent: "init" });

browser.runtime.onStartup.addListener(() => {
  console.log(`onStartup()`);
  // browser.runtime.sendMessage({ bgRuntimeEvent: "onStartup" });
});

// if (chrome.runtime.onSuspend) {
//   chrome.runtime.onSuspend.addListener(() => {
//     console.log(`onSuspend()`);
//     browser.runtime.sendMessage({ bgRuntimeEvent: "onSuspend" });
//   });
// }
// if (chrome.runtime.onRestartRequired) {
//   chrome.runtime.onRestartRequired.addListener(() => {
//     console.log(`onRestartRequired()`);
//     browser.runtime.sendMessage({ bgRuntimeEvent: "onRestartRequired" });
//   });
// }

browser.runtime.onInstalled.addListener(() => {
  console.log(`onInstalled()`);
  // browser.runtime.sendMessage({ bgRuntimeEvent: "onInstalled" });
});

browser.runtime.onUpdateAvailable.addListener(() => {
  console.log(`onUpdateAvailable()`);
  // browser.runtime.sendMessage({ bgRuntimeEvent: "onUpdateAvailable" });
});

const avmWorker = new AvmWorker();
avmWorker.initListener();
