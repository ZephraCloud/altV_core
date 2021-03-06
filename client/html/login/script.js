window.onload = () => {
    document.querySelector("#streamerMode")?.addEventListener("click", (e) => {
        e.preventDefault();

        const currentStreamerMode =
            document.querySelector("input[name=email]").getAttribute("type") ===
            "email"
                ? false
                : true;

        document
            .querySelector("input[name=email]")
            .setAttribute("type", currentStreamerMode ? "email" : "password");

        e.target.innerHTML = currentStreamerMode
            ? "Streamer Mode"
            : '<i class="fas fa-check"></i> Streamer Mode';
    });

    if ("alt" in window) {
        alt.on("webview:loginFailed", () => {
            document.getElementById("note").textContent =
                "Login fehlgeschlagen.";
        });

        alt.on("webview:localStorage:return", (value) => {
            document.querySelector("input[name=email]").value = value;
        });

        alt.emit("webview:localStorage:getItems");

        if (
            localStorage.getItem("core:login:password") &&
            parseInt(localStorage.getItem("core:login:lastLogin") ?? "0") >=
                Date.now() - 1000 * 60 * 60
        )
            document.querySelector("input[name=password]").value =
                localStorage.getItem("core:login:password");

        document.querySelector("form")?.addEventListener("submit", (e) => {
            e.preventDefault();

            const form = e.target,
                email = form.querySelector("input[name=email]").value,
                password = form.querySelector("input[name=password]").value;

            alt.emit("webview:localStorage:set", "email", email);
            localStorage.setItem("core:login:password", password);
            localStorage.setItem("core:login:lastLogin", Date.now());

            document.getElementById("note").textContent = "In Bearbeitung...";
            alt.emit("webview:login", email, password);
        });
    } else {
        document.getElementById("note").textContent =
            "Es ist ein Fehler aufgetreten. Bitte neu joinen.";
    }
};
