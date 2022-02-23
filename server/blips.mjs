import * as alt from "alt-server";
import * as log from "./log.mjs";

const blips = {};

/**
 * Create a blip
 * @param {string} id
 * @param {string} label
 * @param {alt.Vector3} position
 * @param {number} sprite
 * @param {number} color
 * @param {number} scale
 * @param {boolean} shortRange
 * @param {string} sender
 */
export function create(
    id,
    label,
    position,
    sprite,
    color,
    scale,
    shortRange = false,
    sender = "zephra_core"
) {
    if (blips[id]) return log.error(`Blip ${id} already exists`);

    const blip = {
        id,
        label,
        position,
        sprite,
        color,
        scale,
        shortRange,
        sender
    };
    blips[id] = blip;

    alt.emitAllClients("core:client:blips:create", blip);
}

/**
 * Destroys a blip
 * @param {string} id
 */
export function remove(id) {
    if (!blips[id]) return log.error(`Blip ${id} doesn't exist`);

    alt.emitAllClients("core:client:blips:remove", blips[id]);

    delete blips[id];
}

export function sync(player) {
    if (!player) return;

    for (const id in blips) {
        const blip = blips[id];

        alt.emitClient(player, "core:client:blips:create", blip);
    }
}

alt.on("anyResourceStop", (name) => {
    for (const id in blips) {
        const blip = blips[id];

        if (blip.sender === name) remove(id);
    }
});
