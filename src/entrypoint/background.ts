// import { enabledUrls } from "../constants";
// import browser from "webextension-polyfill";
import { AvmWorker } from "../dbridge_js/autogram/avm-worker";

console.log("background");

const avmWorker = new AvmWorker();
avmWorker.initListener();
