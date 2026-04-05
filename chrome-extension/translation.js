document.addEventListener("DOMContentLoaded", async () => {
    const originalTextEl = document.getElementById("originalText");
    const translatedTextEl = document.getElementById("translatedText");
    const backBtn = document.getElementById("backBtn");

    const data = await chrome.storage.local.get([
        "translatedOriginal",
        "translatedResult",
        "authAccepted"
    ]);

    if (!data.authAccepted) {
        window.location.href = "sidepanel.html";
        return;
    }

    originalTextEl.innerText = data.translatedOriginal || "No original text available.";
    translatedTextEl.innerText = data.translatedResult || "No translation available.";

    backBtn.addEventListener("click", async () => {
        await chrome.storage.local.remove(["authAccepted"]);
        window.location.href = "sidepanel.html";
    });
});
