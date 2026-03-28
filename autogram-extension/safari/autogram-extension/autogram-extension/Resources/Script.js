function show(enabled, useSettingsInsteadOfPreferences) {
    if (useSettingsInsteadOfPreferences) {
        document.getElementsByClassName('state-on')[0].innerText = "autogram-extension's extension is currently on. You can turn it off in the Extensions section of Safari Settings.";
        document.getElementsByClassName('state-off')[0].innerText = "autogram-extension's extension is currently off. You can turn it on in the Extensions section of Safari Settings.";
        document.getElementsByClassName('state-unknown')[0].innerText = "You can turn on autogram-extension's extension in the Extensions section of Safari Settings.";
        document.getElementsByClassName('open-preferences')[0].innerText = "Quit and Open Safari Settings…";
    }

    if (typeof enabled === "boolean") {
        document.body.classList.toggle(`state-on`, enabled);
        document.body.classList.toggle(`state-off`, !enabled);
    } else {
        document.body.classList.remove(`state-on`);
        document.body.classList.remove(`state-off`);
    }
}

function showIOS() {
    document.body.classList.add('state-ios');
}

function openPreferences() {
    webkit.messageHandlers.controller.postMessage("open-preferences");
}

function openSafari() {
    webkit.messageHandlers.controller.postMessage("open-safari");
}

document.addEventListener('DOMContentLoaded', function() {
    const preferencesButton = document.querySelector("button.open-preferences");
    if (preferencesButton) {
        preferencesButton.addEventListener("click", openPreferences);
    }
    
    const safariButton = document.querySelector("button.open-safari");
    if (safariButton) {
        safariButton.addEventListener("click", openSafari);
    }
});
