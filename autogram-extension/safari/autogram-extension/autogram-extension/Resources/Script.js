function show(enabled) {
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
