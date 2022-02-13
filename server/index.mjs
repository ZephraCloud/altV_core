import * as alt from "alt-server";
import * as chat from "chat";

import * as config from "./../config.json";
import fetch from "node-fetch";
import * as Password from "node-php-password";
import * as log from "./log.mjs";
import * as sql from "./sql.mjs";

if (!config) log.log("Couldn't load config file.");

sql.create({
    altv: {
        host: config.sql.host,
        user: config.sql.user,
        password: config.sql.password,
        database: config.sql.database,
    },
    zephra: {
        host: config.sql.host,
        user: config.sql.user,
        password: config.sql.password,
        database: "zephra",
    },
});

// setTimeout(() => {
//     alt.emitAllClients("core:client:login");
// }, 5000);

// alt.on("playerConnect", (player) => {
//     console.log(
//         `[${new Date().toLocaleString()}][CORE]`,
//         `${player.name} connected`
//     );
//     alt.emitClient(player, "core:client:login");
// });

alt.onClient("core:server:checkLogin", async (player, email, password) => {
    if (!email || !password)
        return log.log("Login check failed. No email or password provided.");

    await fetch("https://api.zephra.cloud/altv/login", {
        method: "POST",
        headers: {
            email: email,
            password: password,
            "Content-Type": "application/json",
        },
    }).then(async (response) => {
        const data = await response.json();

        if (data.success) {
            log.log(`${email} logged in.`);

            if (player.valid) {
                alt.emitClient(player, "core:client:loginStatus", true);
                // alt.emit("core:server:setupPlayer", player);
            }
        } else {
            log.log(`Login check failed. ${email}`);

            alt.emitClient(player, "core:client:loginStatus", false);
        }
    });
});

alt.on("core:server:setupPlayer", (player) => {
    if (!player.email) return log.log("Player setup failed. No email found.");

    sqlZephra.query(
        `SELECT userid FROM accounts WHERE email = '${player.email}'`,
        (error, result) => {
            if (error) throw error;
            if (result.length === 0)
                return log.log("Player setup failed. No user found.");

            player.userId = result.userid;
        }
    );
});

chat.registerCmd("revive", (player) => {
    player.spawn(player.pos.x, player.pos.y, player.pos.z, 0);
});

chat.registerCmd("logout", (player) => {
    alt.emitClient(player, "core:client:login");
});

alt.on("playerDeath", (player, killer, weaponHash) => {
    log.log(
        `${player.name} died. Respawning at ${player.pos.x}, ${player.pos.y}, ${player.pos.z}`
    );

    player.spawn(player.pos.x, player.pos.y, player.pos.z, 0);
});

// chat.registerCmd("poweroff", player => {
//     alt.emitAllClients("blackouton");
// });

// chat.registerCmd("poweron", player => {
//     alt.emitAllClients("blackoutoff");
// });

alt.on("resourceStop", () => {
    chat.unregisterCmd("revive");
    chat.unregisterCmd("logout");

    sql.remove("everything");
});

function isJson(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}
