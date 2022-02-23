import * as alt from "alt-server";

import * as log from "./log.mjs";
import fetch from "node-fetch";

export function setup(player, userId) {
    if (!player || !userId)
        return log.error("Player or userId is undefined", "CORE,CHARACTER");

    alt.emit(
        "sql:altv:query",
        `SELECT COUNT(*) AS count FROM characters WHERE userId = ${userId}`,
        async (result) => {
            if (result?.[0].count > 0) {
                alt.emit(
                    "sql:altv:query",
                    `SELECT * FROM characters WHERE userId = ${userId}`,
                    (result) => {
                        if (!result?.[0])
                            return log.error(
                                "Character not found",
                                "CORE,CHARACTER"
                            );

                        const character = result[0];

                        player.model =
                            character.sex === "female"
                                ? "mp_f_freemode_01"
                                : "mp_m_freemode_01";

                        alt.emitClient(
                            player,
                            "chore:client:character:load",
                            character
                        );
                    }
                );
            } else {
                alt.emit(
                    "sql:altv:query",
                    `INSERT INTO characters (userId, name, sex, skin) VALUES (${userId}, '${await generateNames(
                        "male"
                    )}', "male", '${generateSkin("male")}')`,
                    () => {
                        setup(player, userId);
                    }
                );
            }
        }
    );
}

/**
 * Generate skin data
 * @param {string} sex
 * @returns {JSON}
 */
function generateSkin(sex) {
    const skin = {
        faceFather: {
            min: 0,
            max: 45
        },
        faceMother: {
            min: 0,
            max: 45
        },
        skinFather: {
            min: 0,
            max: 45
        },
        skinMother: {
            min: 0,
            max: 45
        },
        faceMix: 0.5,
        skinMix: 0.5,
        hair: {
            min: 0,
            max: sex === "male" ? 73 : 77
        },
        hairColor1: {
            min: 0,
            max: 63
        },
        hairColor2: {
            min: 0,
            max: 63
        },
        facialHair: {
            min: 0,
            max: 28
        },
        facialHairOpacity: {
            min: 0,
            max: 1
        },
        facialHairColor1: {
            min: 0,
            max: 78
        },
        eyebrows: {
            min: 0,
            max: 33
        },
        eyebrowsColor1: {
            min: 0,
            max: 64
        },
        eyes: {
            min: 1,
            max: 85
        }
    };

    for (const key in skin) {
        if (skin.hasOwnProperty(key)) {
            if (typeof skin[key] === "object") {
                skin[key] = Math.floor(
                    Math.random() * (skin[key].max - skin[key].min + 1) +
                        skin[key].min
                );
            }
        }
    }

    return JSON.stringify(skin);
}

/**
 * Generate first and last name
 * @param {string} sex
 * @returns {Promise<JSON>}
 */
async function generateNames(sex) {
    const names = await fetch(
        `https://namey.muffinlabs.com/name.json?with_surname=true&type=${sex}`
    )
        .then((response) => response.json())
        .then((response) => response[0].split(" "));

    return JSON.stringify({
        firstname: names[0],
        surname: names[1]
    });
}
