window.onload = () => {
    const content = document.querySelector("div.phone div.phone-content");

    loadHome();

    if ("alt" in window) {
    }

    function loadHome() {
        loadBackground();

        fetch("home.html")
            .then((response) => response.text())
            .then((text) => {
                document.getElementById("appStyle").href = "";
                document.getElementById("appScript").href = "";

                content.innerHTML = text;

                content.querySelectorAll("div.app[data-app]").forEach((app) => {
                    app.addEventListener("click", (event) => {
                        loadApp(app.getAttribute("data-app"));
                    });
                });
            });
    }

    function loadApp(app) {
        fetch(`apps/${app}/index.html`)
            .then((response) => response.text())
            .then((text) => {
                content.innerHTML = text;

                document.getElementById(
                    "appStyle"
                ).href = `apps/${app}/style.css`;

                document.getElementById(
                    "appScript"
                ).href = `apps/${app}/app.js`;
            });
    }

    function loadBackground() {
        content.style["background-image"] =
            "url(https://media.idownloadblog.com/wp-content/uploads/2021/09/Light_Beams_Blue_Light-iPhone-13-Pro-official-apple-wallpaper-710x1536.jpg)";
        content.style["background-size"] = "cover";
        content.style["background-position"] = "center";
    }
};
