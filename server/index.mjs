import * as alt from "alt-server";

import config from "./../config.json";
import fetch from "node-fetch";
import * as log from "./log.mjs";
import * as cmd from "./commands.mjs";
import * as sql from "./sql.mjs";
import * as autoStart from "./autostart.mjs";
import * as character from "./character.mjs";
import * as localization from "./localization.mjs";

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
    for (const player of alt.Player.all) {
        if (!player.getSyncedMeta("userId"))
            alt.emitClient(player, "core:client:login");
    }
}, 5000);

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
        let data = await response.text();

        try {
            JSON.parse(data);

            data = JSON.parse(data);

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
        } catch (e) {
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
            localization.getString("player.missingPermission")
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
            localization.getString("player.missingPermission")
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
    if (!player.getSyncedMeta("admin")) {
        return cmd.sendChat(
            player,
            localization.getString("player.missingPermission")
        );
    }

    if (args.length > 0) {
        const _player = alt.Player.all.filter((p) => p.name === args[0])[0];

        cmd.sendChat(_player, localization.getString("player.kick"));
        cmd.broadcastChat(`{5555AA}${_player.name} {FFFFFF}kicked`);
        _player.kick(localization.getString("player.kick"));
    }
});

cmd.register("ban", (player, args) => {
    if (!player.getSyncedMeta("admin")) {
        return cmd.sendChat(
            player,
            localization.getString("player.missingPermission")
        );
    }

    if (args.length > 0) {
        const _player = alt.Player.all.filter((p) => p.name === args[0])[0],
            bannedUntil = new Date();

        bannedUntil.setDate(bannedUntil.getDate() + Number(args[1]));

        alt.emit(
            "sql:altv:query",
            `INSERT INTO bans (userId, reason, bannedBy, until) VALUES (${_player.getSyncedMeta(
                "userId"
            )}, 'Banned by admin', ${player.getSyncedMeta(
                "userId"
            )}, '${bannedUntil.getFullYear()}-${bannedUntil.getMonth()}-${bannedUntil.getDate()}')`
        );

        cmd.sendChat(_player, localization.getString("player.ban"));
        cmd.broadcastChat(`{5555AA}${_player.name} {FFFFFF} got banned`);
        _player.kick(localization.getString("player.ban"));
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
alt.on("playerConnect", (player) => {
    log.log(`${player.name} connected`);

    player.model = "mp_m_freemode_01";

    alt.emitClient(player, "core:client:login");
    alt.emitClient(player, "core:client:requestIpls");

    cmd.broadcastChat(
        localization
            .getString("player.join")
            .replace("{0}", player.name)
            .replace("{1}", alt.Player.all.length)
    );
});

alt.on("playerDisconnect", (player, reason) => {
    const weapons = player.weapons,
        pos = player.pos,
        health = {
            health: player.health,
            armour: player.armour,
            bloodType: null
        };

    alt.emit(
        "sql:altv:query",
        `SELECT * FROM characters WHERE userId = ${player.getSyncedMeta(
            "userId"
        )}`,
        (result) => {
            const character = result[0];

            health.bloodType = JSON.parse(character.health).bloodType;

            alt.emit(
                "sql:altv:query",
                `UPDATE characters SET weapons = '${JSON.stringify(
                    weapons
                )}', health = '${JSON.stringify(
                    health
                )}', position = '${JSON.stringify(
                    pos
                )}' WHERE userId = ${player.getSyncedMeta("userId")}`
            );
        }
    );

    cmd.broadcastChat(
        localization
            .getString("player.left")
            .replace("{0}", player.name)
            .replace("{1}", alt.Player.all.length - 1)
    );
});


alt.on("resourceStop", () => {
    sql.remove("everything");
});
