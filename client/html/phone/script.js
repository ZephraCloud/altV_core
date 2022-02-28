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

                loadNav();
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

                loadNav();
            });
    }

    function loadBackground() {
        content.style["background-image"] =
            "url(https://media.idownloadblog.com/wp-content/uploads/2021/09/Light_Beams_Blue_Light-iPhone-13-Pro-official-apple-wallpaper-710x1536.jpg)";
        content.style["background-size"] = "cover";
        content.style["background-position"] = "center";
    }

    function loadNav() {
        const nav = document.createElement("div");

        nav.classList.add("nav");

        nav.addEventListener("click", loadHome);

        content.appendChild(nav);

        loadSignals();
        loadClock();
    }

    function loadClock() {
        const clock = document.createElement("div");

        clock.classList.add("clock");

        let date = new Date().toLocaleTimeString().split(":");

        date = `${date[0]}:${date[1]}`;

        clock.innerHTML = date;

        content.appendChild(clock);

        setInterval(() => {
            if (!clock) clearInterval(this);
            else {
                date = new Date().toLocaleTimeString().split(":");
                date = `${date[0]}:${date[1]}`;

                clock.innerHTML = date;
            }
        }, 1000);
    }

    function loadSignals() {
        const signals = document.createElement("div"),
            wifi = document.createElement("i"),
            battery = document.createElement("i");

        signals.classList.add("signals");
        wifi.classList.add("wifi", "fa-solid", "fa-wifi");
        battery.classList.add("battery", "fa-solid", "fa-battery-full");

        signals.appendChild(wifi);
        signals.appendChild(battery);

        content.appendChild(signals);
    }
};
