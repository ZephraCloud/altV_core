import * as alt from "alt-client";
import * as native from "natives";

import * as character from "./character.js";
import * as fuel from "./fuel.js";

const ignoredHats = [1, 27, 32, 33];

let webview = {},
    phoneState = false;

alt.onServer("core:client:login", () => {
    webview.login = new alt.WebView(
        "http://resource/client/html/login/index.html"
    );

    alt.showCursor(true);
    alt.toggleGameControls(false);
    webview.login.focus();

    webview.login.on("core:client:webview:login", (email, password) => {
        alt.emitServer("core:server:checkLogin", email, password);
    });
});

alt.on("keyup", (key) => {
    if (!phoneState && key === 112 && alt.gameControlsEnabled()) {
        phoneState = true;
        openPhone();
    } else if (phoneState && key === 112 && alt.gameControlsEnabled()) {
        phoneState = false;
        closePhone();
    }
});

alt.onServer("core:client:phone", (state) => {
    if (state) openPhone();
    else closePhone();
});

// alt.on("connectionComplete", () => {
//     webview.login = new alt.WebView(
//         "http://resource/client/html/login/index.html"
//     );

//     webview.login.on("core:client:webview:login", (email, password) => {
//         alt.emitServer("core:server:checkLogin", email, password);
//     });
// });

alt.onServer("core:client:loginStatus", (status) => {
    if (status) {
        console.log("Login successful.");

        webview.login.unfocus();
        webview.login.destroy();
        alt.showCursor(false);
        alt.toggleGameControls(true);
    } else {
        console.log("Login failed.");

        webview.login.emit("core:client:webview:loginFailed");
    }
});

alt.onServer("core:client:teleportToWaypoint", () => {
    const waypoint = native.getFirstBlipInfoId(8);

    if (!native.doesBlipExist(waypoint)) return;

    const player = alt.Player.local.scriptID;
    const pos = native.getBlipInfoIdCoord(waypoint);

    native.setFocusPosAndVel(pos.x, pos.y, pos.z, 0, 0, 0);
    native.requestCollisionAtCoord(pos.x, pos.y, pos.z);

    let z = Number(pos.z),
        IsGround = native.getGroundZFor3dCoord(
            pos.x,
            pos.y,
            pos.z,
            undefined,
            undefined
        )[0];

    setTimeout(() => {
        while (!IsGround) {
            IsGround = native.getGroundZFor3dCoord(
                pos.x,
                pos.y,
                z,
                undefined,
                undefined
            )[0];
            z++;
            if (z > 1000) break;
        }
    }, 1000);

    setTimeout(() => {
        if (!IsGround) return alt.logWarning("Couldn't find ground");

        native.setFocusEntity(player);
        alt.emitServer(
            "core:server:teleportToWaypoint",
            new alt.Vector3(pos.x, pos.y, z)
        );
    }, 1400);
});

alt.on("playerEnteringVehicle", (player, vehicle, seat) => {
    if (player.valid && vehicle.valid) {
        if (
            ignoredHats.includes(player.getProp(0).drawable) ||
            player.getProp(0).drawable == 255
        )
            return;

        player.setMeta("prop", {
            component: 0,
            drawable: player.getProp(0).drawable,
            texture: player.getProp(0).texture
        });
    }
});

alt.on("playerEnteredVehicle", (player, vehicle, seat) => {
    if (player.valid && vehicle.valid) {
        if (
            !player.hasMeta("prop") ||
            ignoredHats.includes(player.getMeta("prop").drawable)
        )
            return;

        player.setProp(
            player.getMeta("prop").component,
            player.getMeta("prop").drawable,
            player.getMeta("prop").texture
        );
    }
});

alt.onServer("core:client:notification", notification);
alt.onServer("core:client:advancedNotification", advancedNotification);

export function notification(message) {
    native.beginTextCommandThefeedPost("STRING");
    native.addTextComponentSubstringPlayerName(message);
    native.endTextCommandThefeedPostTicker(false, true);
}

export function advancedNotification(
    imageName,
    headerMsg,
    detailsMsg,
    message
) {
    native.beginTextCommandThefeedPost("STRING");
    native.addTextComponentSubstringPlayerName(message);
    native.endTextCommandThefeedPostMessagetextTu(
        imageName.toUpperCase(),
        imageName.toUpperCase(),
        false,
        4,
        headerMsg,
        detailsMsg,
        1.0,
        ""
    );
    native.endTextCommandThefeedPostTicker(false, false);
}

function openPhone() {
    console.log("Opening phone");

    phoneState = true;

    webview.phone = new alt.WebView(
        "http://resource/client/html/phone/index.html"
    );

    alt.showCursor(true);
    //alt.toggleGameControls(false);
    webview.phone.focus();

    webview.phone.on("core:client:webview:login", (email, password) => {
        alt.emitServer("core:server:checkLogin", email, password);
    });
}

function closePhone() {
    console.log("Closing phone");

    phoneState = false;

    webview.phone.unfocus();
    webview.phone.destroy();
    alt.showCursor(false);
    alt.toggleGameControls(true);
}

alt.everyTick(() => {
    if (phoneState) {
        native.disableControlAction(0, 24, true); // Attack
        native.disableControlAction(0, 257, true); // Attack2
        native.disableControlAction(0, 69, true); // Vehicle Attack
        native.disableControlAction(0, 92, true); // Passenger Attack
        native.disableControlAction(0, 25, true); // Aim
        native.disableControlAction(0, 45, true); // Reload
        native.disableControlAction(0, 144, true); // Parachute deploy
    } else {
        native.enableControlAction(0, 24, true); // Attack
        native.enableControlAction(0, 257, true); // Attack2
        native.enableControlAction(0, 69, true); // Vehicle Attack
        native.enableControlAction(0, 92, true); // Passenger Attack
        native.enableControlAction(0, 25, true); // Aim
        native.enableControlAction(0, 45, true); // Reload
        native.enableControlAction(0, 144, true); // Parachute deploy
    }
});

alt.setWeatherSyncActive(true);
