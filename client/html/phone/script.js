window.onload = () => {
    const content = document.querySelector("div.phone div.phone-content"),
        iframe = document.querySelector("iframe");

    loadHome();

    if ("alt" in window) {
    }

    function loadHome() {
        loadBackground();

        iframe.src = "home.html";

        content.innerHTML = iframe.contentWindow.document;
    }

    function loadApp(app) {
        iframe.src = `apps/${app}.html`;

        content.innerHTML = iframe.contentWindow.document;
    }

    function loadBackground() {
        content.style["background-image"] =
            "url(https://media.idownloadblog.com/wp-content/uploads/2021/09/Light_Beams_Blue_Light-iPhone-13-Pro-official-apple-wallpaper-710x1536.jpg)";
        content.style["background-size"] = "cover";
        content.style["background-position"] = "center";
    }
};
