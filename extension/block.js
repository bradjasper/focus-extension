function updateState() {
    try {
        const quoteEl = document.getElementById("quote");
        const authorEl = document.getElementById("author");
        const urlEl = document.getElementById("url");

        const params = new URLSearchParams(window.location.search);
        const url = new URL(params.get("url"));

        const quote = params.get("quote");
        const author = params.get("author");

        if (quote) {
            quoteEl.innerHTML = quote;
            if (author) {
                authorEl.innerHTML = `—${author}`;
            } else {
                authorEl.style.display = "none";
            }
        } else {
            quoteEl.innerHTML = "Yesterday you said Today";
        }

        if (url && url.host) {
            urlEl.innerHTML = url.hostname;
            urlEl.href = url.toString();

            if (params.get("loaded") == 1) {
                document.location.href = url.toString();
            } else {
                params.set("loaded", 1);
                history.replaceState(
                    null,
                    null,
                    "?" + params.toString()
                );
            }
        } else {
            throw new Error("no url found");
        }
    } catch (e) {
        document.write(`<div id="host">blocked by Focus</div>`);
    }
}

// reload on browser cache
window.onpageshow = function (event) {
    if (event.persisted) {
        window.location.reload()
    }
};

function toggleTheme() {
    var isDark = document.querySelector("body").classList.toggle("dark")
    localStorage.removeItem("FocusIsDarkTheme");
    localStorage.setItem("FocusIsDarkTheme", isDark);
}

function initialize() {
    document.getElementById("toggle-theme").addEventListener("click", function (e) {
        e.preventDefault();
        toggleTheme();
    });

    var isDarkTheme = false;

    try {
        isDarkTheme = JSON.parse(localStorage.getItem("FocusIsDarkTheme"));
    } catch (e) { }

    if (isDarkTheme) {
        toggleTheme();
    }

    updateState();
}

initialize();