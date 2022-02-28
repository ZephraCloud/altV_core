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

                        for (let weapon of character.weapons)
                            player.giveWeapon(weapon, 500, true);

                        const names = JSON.parse(character.name);

                        player.setSyncedMeta("firstname", names.firstname);
                        player.setSyncedMeta("middlename", names.middlename);
                        player.setSyncedMeta("surname", names.surname);

                        const permissions = JSON.parse(character.permissions);

                        player.setSyncedMeta(
                            "admin",
                            permissions.admin ?? false
                        );

                        player.setSyncedMeta("userId", character.userId);

                        if (permissions.admin)
                            log.warn(
                                `${player.name} logged in with admin permissions`,
                                "CORE,CHARACTER"
                            );

                        alt.emitClient(
                            player,
                            "chore:client:character:load",
                            character
                        );

                        alt.emitClient(
                            player,
                            "core:client:notification",
                            `Welcome back, ${player.name}!`
                        );

                        alt.emitClient(
                            player,
                            "core:client:notification",
                            `You are now playing as ${names.firstname} ${names.surname}`
                        );

                        if (character.position) {
                            const position = JSON.parse(character.position);

                            player.spawn(position.x, position.y, position.z);
                        }

                        const healthData = JSON.parse(character.health);

                        player.health = healthData.health;
                        player.armour = healthData.armour;

                        player.setSyncedMeta("bloodType", healthData.bloodType);
                    }
                );
            } else {
                const healthData = JSON.stringify({
                    health: 100,
                    bloodType: generateBloodType()
                });

                alt.emit(
                    "sql:altv:query",
                    `INSERT INTO characters (userId, name, sex, dob, health, skin) VALUES (${userId}, '${await generateNames(
                        "male"
                    )}', "male", '${generateDOB()}', '${healthData}','${generateSkin(
                        "male"
                    )}')`,
                    () => {
                        setup(player, userId);
                    }
                );
            }
        }
    );
}

export function save(player, logout = false) {
    if (!player.valid) return;

    alt.emit(
        "sql:altv:query",
        `SELECT * FROM characters WHERE userId = ${player.getSyncedMeta(
            "userId"
        )}`,
        (result) => {
            const character = result[0],
                health = JSON.stringify({
                    health: player.health,
                    armour: player.armour,
                    bloodType: JSON.parse(character.health).bloodType
                });

            alt.emit(
                "sql:altv:query",
                `UPDATE characters SET weapons = '${JSON.stringify(
                    player.weapons
                )}', health = '${health}', position = '${JSON.stringify(
                    player.pos
                )}' WHERE userId = ${player.getSyncedMeta("userId")}`
            );
        }
    );

    if (logout) {
        player.deleteMeta("firstname");
        player.deleteMeta("middlename");
        player.deleteMeta("surname");

        player.removeAllWeapons();

        alt.emitClient(player, "core:client:login");
    }
}

export function logout(player) {
    if (!player.valid) return;

    save(player, true);
}

export function getMoney(player, type) {
    if (!player.valid) return;

    let Return = undefined;

    alt.emit(
        "sql:altv:query",
        `SELECT money FROM characters WHERE userId = ${player.getSyncedMeta(
            "userId"
        )}`,
        (result) => {
            if (!result?.[0])
                return log.error("User not found", "CORE,CHARACTER");

            const money = JSON.parse(result[0].money);

            Return = type ? money[type] : money;
        }
    );

    return Return;
}

export function removeMoney(player, type, amount) {
    if (!player.valid || !type) return;

    alt.emit(
        "sql:altv:query",
        `SELECT money FROM characters WHERE userId = ${player.getSyncedMeta(
            "userId"
        )}`,
        (result) => {
            if (!result?.[0])
                return log.error("User not found", "CORE,CHARACTER");

            const money = JSON.parse(result[0].money);

            money[type] -= amount;

            alt.emit(
                "sql:altv:query",
                `UPDATE characters SET money = '${JSON.stringify(
                    money
                )}' WHERE userId = ${player.getSyncedMeta("userId")}`
            );
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

    let hairColor = Math.floor(
        Math.random() * (skin["hairColor1"].max - skin["hairColor1"].min + 1) +
            skin["hairColor1"].min
    );

    for (const key in skin) {
        if (skin.hasOwnProperty(key)) {
            if (typeof skin[key] === "object") {
                if (key.toLowerCase().includes("haircolor"))
                    skin[key] = hairColor;
                else {
                    skin[key] = Math.floor(
                        Math.random() * (skin[key].max - skin[key].min + 1) +
                            skin[key].min
                    );
                }
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

/**
 * Generate date of birthw
 * @param {Number} startY - Start year (current year - startY)
 * @param {Number} endY - End year (current year - endY)
 * @returns {Date}
 */
function generateDOB(startY = 40, endY = 18) {
    const current = new Date(),
        start = new Date(current.getFullYear() - startY, 0, 1),
        end = new Date(current.getFullYear() - endY, 11, 31),
        date = new Date(
            start.getTime() + Math.random() * (end.getTime() - start.getTime())
        );

    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

/**
 * Generate blood type
 * @returns {string}
 * @example generateBloodType() => "A+"
 */
function generateBloodType() {
    const num = Math.random() * 100;

    switch (true) {
        case num <= 1:
            return "AB-";
        case num <= 2:
            return "B-";
        case num <= 3:
            return "AB+";
        case num <= 7:
            return "A-";
        case num <= 8:
            return "0-";
        case num <= 9:
            return "B+";
        case num <= 33:
            return "A+";
        case num <= 37:
            return "0+";
        default:
            return "0+";
    }
}
