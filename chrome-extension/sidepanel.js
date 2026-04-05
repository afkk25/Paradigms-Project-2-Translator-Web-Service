
async function translateText(text, username, password) {
    const response = await fetch("http://localhost:8080/Project2-1.0-SNAPSHOT/api/translator", {
        method: "POST",
        headers: {
            "Content-Type": "text/plain",
            "Authorization": "Basic " + btoa(username + ":" + password)
        },
        body: text
    });

    const result = await response.text();

    if (!response.ok) {
        const error = new Error();
        error.status = response.status;
        error.statusText = response.statusText;
        throw error;
    }

    return result;
}

async function persistCredentials(username, password, shouldRemember) {
    if (shouldRemember) {
        await chrome.storage.local.set({
            apiUsername: username,
            apiPassword: password
        });
    } else {
        await chrome.storage.local.remove(["apiUsername", "apiPassword"]);
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const rememberCredsInput = document.getElementById("rememberCreds");
    const authStatusEl = document.getElementById("authStatus");
    const translateBtn = document.getElementById("translateBtn");
    const errorModal = document.getElementById("errorModal");
    const errorMessage = document.getElementById("errorMessage");
    const errorCloseBtn = document.getElementById("errorCloseBtn");

    function showErrorModal(message) {
        errorMessage.innerText = message;
        errorModal.classList.add("modal-visible");
    }

    function closeErrorModal() {
        errorModal.classList.remove("modal-visible");
    }

    errorCloseBtn.addEventListener("click", closeErrorModal);

    const data = await chrome.storage.local.get([
        "textToTranslate",
        "apiUsername",
        "apiPassword"
    ]);

    const text = data.textToTranslate || "";

    if (data.apiUsername) {
        usernameInput.value = data.apiUsername;
    }

    if (data.apiPassword) {
        passwordInput.value = data.apiPassword;
        rememberCredsInput.checked = true;
    }

    translateBtn.addEventListener("click", async () => {
        const username = usernameInput.value.trim();
        const password = passwordInput.value;

        if (!text) {
            authStatusEl.innerText = "No selected text found. Highlight text and use the context menu again.";
            return;
        }

        if (!username || !password) {
            authStatusEl.innerText = "Please enter username and password.";
            return;
        }

        authStatusEl.innerText = "Authenticating and translating...";

        try {
            const result = await translateText(text, username, password);
            await persistCredentials(username, password, rememberCredsInput.checked);

            await chrome.storage.local.set({
                translatedOriginal: text,
                translatedResult: result,
                authAccepted: true
            });

            window.location.href = "translation.html";
        } catch (error) {
            authStatusEl.innerText = "";
            if (error.status === 401) {
                showErrorModal("Credentials are wrong. Please check your username and password.");
            } else {
                showErrorModal("An error occurred. Please try again.");
            }
        }
    });
});