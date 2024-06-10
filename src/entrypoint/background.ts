import { AvmWorker } from "../dbridge_js/autogram/avm-worker";

console.log("background");

chrome.runtime.sendMessage({ bgRuntimeEvent: "init" });

chrome.runtime.onStartup.addListener(() => {
  console.log(`onStartup()`);
  chrome.runtime.sendMessage({ bgRuntimeEvent: "onStartup" });
});

chrome.runtime.onSuspend.addListener(() => {
  console.log(`onSuspend()`);
  chrome.runtime.sendMessage({ bgRuntimeEvent: "onSuspend" });
});

chrome.runtime.onInstalled.addListener(() => {
  console.log(`onInstalled()`);
  chrome.runtime.sendMessage({ bgRuntimeEvent: "onInstalled" });
});

chrome.runtime.onRestartRequired.addListener(() => {
  console.log(`onRestartRequired()`);
  chrome.runtime.sendMessage({ bgRuntimeEvent: "onRestartRequired" });
});

chrome.runtime.onUpdateAvailable.addListener(() => {
  console.log(`onUpdateAvailable()`);
  chrome.runtime.sendMessage({ bgRuntimeEvent: "onUpdateAvailable" });
});

const avmWorker = new AvmWorker();
avmWorker.initListener();
