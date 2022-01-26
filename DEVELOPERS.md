# Ako by to mohlo fungovat

Myslim ze vsetko ohladom dsigneru sa opiera o dbridge_js - takze by malo stacit urobit mock pre dCommon a mohlo by to stacit

https://www.slovensko.sk/static/zep/dbridge_js/v1.0/dCommon.min.js

## Entry points

| entrypoint    | description                                                  |
| ------------- | ------------------------------------------------------------ |
| inject.ts     | inject into running page using content script and `<script>` |
| content.ts    | content script                                               |
| background.ts | background script                                            |

## Communication

There are multiple environments in which extension runs

- page context (inject.ts)
- extension content script (content.ts)
- extension background script (background.ts)

Communication between page context and content script is implemented using `CustomEvent`.
Communication between content script and background script is using messaging and `storage.local` .

## Options/Settings

Options are saved into `browser.storage.local`

## CSS

CSS is implemented using CSS modules inserted directly into page.

## Communication with Autogram

We are using @octosign/client as base, but it was missing some types so we don't use theirs.

## Browser support

Right now we are using `webextension-polyfill`, so extension should run in all browsers.
Because we want to support Firefox we need to use manifest version 2. If situation
arises we can create builds for every browser individually, but right now I don't see
reason to do that.


### Safari

Safari needs xcode project and associated app. We generate such app 


https://developer.apple.com/documentation/safariservices/safari_web_extensions/converting_a_web_extension_for_safari

https://developer.apple.com/documentation/safariservices/safari_web_extensions/running_your_safari_web_extension

https://developer.apple.com/documentation/safariservices/safari_web_extensions/assessing_your_safari_web_extension_s_browser_compatibility