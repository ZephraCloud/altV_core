import * as alt from "alt-server";

import * as log from "./log.mjs";

export function setup(player, userId) {
    if (!player || !userId)
        return log.error("Player or userId is undefined", "CORE,CHARACTER");

    const exists = alt.emit(
        "sql:altv:query",
        `SELECT COUNT(*) AS count FROM characters WHERE userId = ${userId}`
    );

    if (exists[0].count > 0) {
        const character = alt.emit(
            "sql:altv:query",
            `SELECT * FROM characters WHERE userId = ${userId}`
        );

        player.model =
            character.sex === "female"
                ? "mp_f_freemode_01"
                : "mp_m_freemode_01";

        alt.emitClient(player, "chore:client:character:load", character[0]);
    } else alt.emitClient(player, "chore:client:character:create", userId);
}
