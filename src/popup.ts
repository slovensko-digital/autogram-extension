function getSignerReplaceCheckbox() {
  return document.getElementById("signerSkSk") as HTMLInputElement;
}

function handleSignerReplaceCheckboxChange() {
  // eslint-disable-next-line prefer-rest-params
  console.log(arguments);
  const checkbox = getSignerReplaceCheckbox();
  if (checkbox.checked) {
    chrome.runtime.sendMessage({ greeting: "hello" }, function (response) {
      console.log(response.farewell);
    });
  } else {
    //pass
  }
}

function watchSignerReplaceCheckboxChange() {
  const checkbox = getSignerReplaceCheckbox();
  checkbox.addEventListener("change", handleSignerReplaceCheckboxChange);
}

watchSignerReplaceCheckboxChange();




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