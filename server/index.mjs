import * as alt from "alt-server";
import * as chat from "chat";

import * as config from "./../config.json";
import fetch from "node-fetch";
import * as log from "./log.mjs";
import * as cmd from "./commands.mjs";
import * as sql from "./sql.mjs";
import * as autoStart from "./autostart.mjs";

if (!config) log.error("Couldn't load config file.");

sql.create({
    altv: {
        host: config.sql.host,
        user: config.sql.user,
        password: config.sql.password,
        database: config.sql.database
    },
    zephra: {
        host: config.sql.host,
        user: config.sql.user,
        password: config.sql.password,
        database: "zephra"
    }
});

setTimeout(() => {
    alt.emitAllClients("core:client:login");
}, 5000);

alt.on("playerConnect", (player) => {
    log.log(`${player.name} connected`);
    alt.emitClient(player, "core:client:login");
});

alt.onClient("core:server:checkLogin", async (player, email, password) => {
    if (!email || !password)
        return log.warn("Login check failed. No email or password provided.");

    await fetch("https://api.zephra.cloud/altv/login", {
        method: "POST",
        headers: {
            email: email,
            password: password,
            "Content-Type": "application/json"
        }
    }).then(async (response) => {
        const data = await response.json();

        if (data.success) {
            log.log(`${email} logged in.`);

            if (player.valid) {
                alt.emitClient(player, "core:client:loginStatus", true);
            }
        } else {
            log.log(`Login check failed. ${email}`);

            alt.emitClient(player, "core:client:loginStatus", false);
        }
    });
});

cmd.register("revive", (player) => {
    player.spawn(player.pos.x, player.pos.y, player.pos.z, 0);
});

cmd.register("logout", (player) => {
    alt.emitClient(player, "core:client:login");
});

// cmd.register("poweroff", player => {
//     alt.emitAllClients("blackouton");
// });

// cmd.register("poweron", player => {
//     alt.emitAllClients("blackoutoff");
// });

alt.on("playerDeath", (player, killer, weaponHash) => {
    log.log(
        `${player.name} died. Respawning at ${player.pos.x}, ${player.pos.y}, ${player.pos.z}`
    );

    player.spawn(player.pos.x, player.pos.y, player.pos.z, 0);
});

autoStart.startAll();

alt.on("resourceStop", () => {
    sql.remove("everything");
});