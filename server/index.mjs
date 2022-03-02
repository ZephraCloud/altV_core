import * as alt from "alt-server";

import config from "./../config.json";
import fetch from "node-fetch";
import * as log from "./log.mjs";
import * as cmd from "./commands.mjs";
import * as sql from "./sql.mjs";
import * as autoStart from "./autostart.mjs";
import * as character from "./character.mjs";
import * as localization from "./localization.mjs";
import * as utils from "./utils.mjs";
import * as blips from "./blips.mjs";

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

cmd.register("revive", (player, args) => {
    if (!player.getSyncedMeta("admin")) {
        return cmd.sendChat(
            player,
            localization.getString("player.missingPermission")
        );
    }

    const _player = args[0] ? utils.getPlayerByName(args[0]) : player;

    _player.spawn(_player.pos.x, _player.pos.y, _player.pos.z, 0);
    _player.clearBloodDamage();
});

cmd.register("heal", (player, args) => {
    if (!player.getSyncedMeta("admin")) {
        return cmd.sendChat(
            player,
            localization.getString("player.missingPermission")
        );
    }

    const _player = args[1] ? utils.getPlayerByName(args[1]) : player;

    _player.health = args[0] ?? _player.maxHealth;
});

cmd.register("posInfo", (player) => {
    if (!player.getSyncedMeta("admin")) {
        return cmd.sendChat(
            player,
            localization.getString("player.missingPermission")
        );
    }

    cmd.sendChat(
        player,
        `x = ${player.pos.x}, y = ${player.pos.y}, z = ${player.pos.z}`
    );
});

cmd.register("dimension", (player, args) => {
    if (!player.getSyncedMeta("admin")) {
        return cmd.sendChat(
            player,
            localization.getString("player.missingPermission")
        );
    }

    const _player = args[0] ? utils.getPlayerByName(args[0]) : player;

    _player.dimension = Number(args[1]);
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

cmd.register("veh", (player, args) => {
    // if (!player.getSyncedMeta("admin")) {
    //     return cmd.sendChat(
    //         player,
    //         localization.getString("player.missingPermission")
    //     );
    // }

    if (args.length === 0)
        return cmd.sendChat(player, "Usage: /car (vehicleModel)");

    if (config.vehicleSpawnBlacklist.includes(args[0]))
        return cmd.sendChat(
            player,
            localization.getString("vehicle.spawnBlacklisted")
        );

    try {
        const vehicle = new alt.Vehicle(
            args[0],
            player.pos.x,
            player.pos.y,
            player.pos.z,
            0,
            0,
            0
        );

        vehicle.numberPlateText = utils.generateLicensePlateText();

        player.setIntoVehicle(vehicle, 1);
    } catch (e) {
        cmd.sendChat(
            player,
            `{ff0000} Vehicle Model {ff9500}${args[0]} {ff0000}does not exist..`
        );
        alt.log(e);
    }
});

cmd.register("dv", (player, args) => {
    if (!player.getSyncedMeta("admin")) {
        return cmd.sendChat(
            player,
            localization.getString("player.missingPermission")
        );
    }

    if (player.vehicle) player.vehicle.destroy();
});

cmd.register("repair", (player, args) => {
    if (!player.getSyncedMeta("admin")) {
        return cmd.sendChat(
            player,
            localization.getString("player.missingPermission")
        );
    }

    if (player.vehicle) player.vehicle.repair();
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

alt.on("playerConnect", (player) => {
    log.log(`${player.name} connected`);

    player.model = "mp_m_freemode_01";

    alt.emitClient(player, "core:client:login");
    alt.emitClient(player, "core:client:requestIpls");

    blips.sync(player);

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
        },
        userId = player.getSyncedMeta("userId");

    alt.emit(
        "sql:altv:query",
        `SELECT * FROM characters WHERE userId = ${userId}`,
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
                )}' WHERE userId = ${userId}`
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

// autoStart.startAll();

// async function shutdownProcess() {
//     try {
//         log.warn("Shutting down...", "CORE");

//         alt.Player.all.forEach((_player, i) => {
//             if (_player && _player.valid) character.save(_player);

//             if (i === alt.Player.all.length - 1) {
//                 setTimeout(() => {
//                     process.kill(process.pid, "SIGKILL");

//                     log.warn("Shutdown complete", "CORE");
//                 }, 1000);
//             }
//         });
//     } catch (err) {
//         console.log(err);
//     }
// }

// process.stdin.resume();
// process.on("SIGINT", shutdownProcess);
// process.on("SIGHUP", shutdownProcess);
// process.on("SIGQUIT", shutdownProcess);
// process.on("SIGTERM", shutdownProcess);

alt.on("resourceStop", () => {
    // for (const player of alt.Player.all) character.save(player);

    sql.remove("everything");
});
