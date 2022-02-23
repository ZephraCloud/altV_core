import * as alt from "alt-server";

import config from "./../config.json";
import fetch from "node-fetch";
import * as log from "./log.mjs";
import * as cmd from "./commands.mjs";
import * as sql from "./sql.mjs";
import * as autoStart from "./autostart.mjs";
import * as character from "./character.mjs";

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
                character.setup(player, data.userId);
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

cmd.register("dimension", (player, args) => {
    if (!player.getSyncedMeta("admin")) {
        return cmd.sendChat(
            player,
            "{FF00FF}You don`t have enough permissions to use this command"
        );
    }

    if (args.length > 0) {
        const _player = alt.Player.all.filter((p) => p.name === args[0])[0];

        _player.dimension = Number(args[1]);
    }
});

cmd.register("tp", (player, args) => {
    if (!player.getSyncedMeta("admin")) {
        return cmd.sendChat(
            player,
            "{FF00FF}You don`t have enough permissions to use this command"
        );
    }

    if (args && !args[0]) {
        cmd.sendChat(player, "Usage: /tp (target player)");
        return;
    }

    const foundPlayers = alt.Player.all.filter((p) => p.name === args[0]);

    if (foundPlayers && foundPlayers.length > 0) {
        player.pos = foundPlayers[0].pos;
        cmd.sendChat(
            player,
            `You got teleported to {1cacd4}${foundPlayers[0].name}{ffffff}`
        );
    } else {
        cmd.sendChat(
            player,
            `{ff0000} Player {ff9500}${args[0]} {ff0000}not found..`
        );
    }
});

cmd.register("logout", (player) => {
    character.logout(player);
});

cmd.register("kick", (player, args) => {
    if (!player.getMeta("admin")) {
        return cmd.sendChat(
            player,
            "{FF00FF}You don`t have enough permissions to use this command"
        );
    }

    if (args.length > 0) {
        const _player = alt.Player.all.filter((p) => p.name === args[0])[0];

        cmd.sendChat(_player, `{FF0000}You were kicked from the server`);
        cmd.broadcastChat(`{5555AA}${_player.name} {FFFFFF}kicked`);
        _player.kick("You were kicked from the server");
    }
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
