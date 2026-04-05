chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "translateText",
        title: "Translate to Darija",
        contexts: ["selection"]
    });
});

// When user right-clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "translateText") {

        const selectedText = info.selectionText;

        // Store text temporarily
        chrome.storage.local.set({ textToTranslate: selectedText });

        // Open side panel
        chrome.sidePanel.open({ tabId: tab.id });

        chrome.sidePanel.setOptions({
            tabId: tab.id,
            path: "sidepanel.html",
            enabled: true
        });

    }
});