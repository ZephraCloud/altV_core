window.onload = () => {
    if ("alt" in window) {
        let subMenuMemory = [],
            title = "";

        alt.on("webview:load", createMenu);

        function createMenu(menu) {
            title = convertText(menu.title);
            document.querySelector(".header__title").innerHTML = title;

            document
                .querySelector(".header__close span")
                .addEventListener("click", () => {
                    alt.emit("webview:closeMenu");
                });

            loadMenuItems(menu.items);
        }

        function loadMenuItems(items) {
            const menuItems = document.querySelector(".menu_items");

            menuItems.innerHTML = "";

            items.forEach((item) => {
                const menuItem = document.createElement("div"),
                    menuItemText = document.createElement("span");

                menuItem.className = "items__item";
                menuItemText.className = "item___text";

                menuItemText.innerHTML = convertText(item.label);

                if (item.action) {
                    if (item.action === "close") {
                        menuItem.addEventListener("click", () => {
                            alt.emit("webview:closeMenu");
                        });
                    }
                }

                menuItem.appendChild(menuItemText);

                if (item.rightText) {
                    const menuItemRightText = document.createElement("span");

                    menuItemRightText.classList.add("item___text", "right");
                    menuItemRightText.innerHTML = convertText(item.rightText);

                    menuItem.appendChild(menuItemRightText);
                }

                if (item.type === "submenu") {
                    menuItem.addEventListener("click", () => {
                        subMenuMemory = items;

                        loadMenuItems(item.items);
                        loadGoBack();

                        if (item.menuTitle) {
                            document.querySelector(".header__title").innerHTML =
                                convertText(item.menuTitle);
                        }
                    });
                }

                if (item.onClick) {
                    menuItem.addEventListener("click", () => {
                        alt.emit(
                            "webview:emitServer",
                            item.onClick,
                            item.clickData
                        );
                    });
                }

                menuItems.appendChild(menuItem);
            });
        }

        function convertText(text) {
            if (!text) return "";

            return text.replace(/\{[a-zA-Z0-9- ]*\}/g, (match) => {
                return `<i class="${match.replace(/\{|\}/g, "")}"></i>`;
            });
        }

        function loadGoBack() {
            const goBack = document.getElementById("backMenu");

            goBack.style.display = "unset";

            goBack.addEventListener("click", (e) => {
                document.querySelector(".header__title").innerHTML = title;
                loadMenuItems(subMenuMemory);
                goBack.style.display = "none";
            });
        }
    }
};
