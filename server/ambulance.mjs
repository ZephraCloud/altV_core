import * as alt from "alt-server";

import * as log from "./log.mjs";
import * as cmd from "./commands.mjs";
import * as utils from "./utils.mjs";

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

alt.on("playerDeath", (player, killer, weaponHash) => {
    log.log(
        `${player.name} died. Respawning at ${player.pos.x}, ${player.pos.y}, ${player.pos.z}`
    );

    player.spawn(player.pos.x, player.pos.y, player.pos.z, 0);
});
