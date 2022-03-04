import * as alt from "alt-client";

const menus = [];

/**
 * @param {Object} data
 * @returns {string}
 */
export function createMenu(data) {
    const menuId = generateMenuId(),
        menu = {};

    menu.id = menuId;
    menu.title = data.title;
    menu.items = data.items;
    menu.webview = new alt.WebView(
        "http://resource/client/html/menu/index.html"
    );

    menus.push(menu);

    alt.showCursor(true);
    alt.toggleGameControls(false);
    menu.webview.focus();
    menu.webview.emit("webview:load", menu);

    menu.webview.on("webview:closeMenu", () => {
        closeMenu(menuId);
    });

    menu.webview.on("webview:emit", (e, args, client) => {
        if (client) alt.emit(e, args);
        else alt.emitServer(e, args);
    });

    return menuId;
}

export function closeMenu(menuId) {
    const menu = menus.find((m) => m.id === menuId);

    if (menu) {
        alt.showCursor(false);
        alt.toggleGameControls(true);
        menu.webview?.unfocus();
        menu.webview?.destroy();
        menus.splice(menus.indexOf(menu), 1);
    }
}

function generateMenuId() {
    return Math.random().toString(36).substring(2, 10);
}

alt.onServer("core:client:menu:create", createMenu);
alt.on("core:client:menu:create", createMenu);
