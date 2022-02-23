import * as alt from "alt-server";
import * as chat from "chat";

import * as log from "./log.mjs";

const commands = {};

/**
 * Registers a command.
 * @param {string} cmd
 * @param {Function} callback
 * @param {string} register
 */
export function register(cmd, callback, register = "zephra_core") {
    if (typeof cmd !== "string")
        throw new TypeError("Command (cmd) must be a string.");
    if (typeof callback !== "function")
        throw new TypeError("callback must be a function.");

    log.log(`Registered command: ${cmd} (${register})`);

    chat.registerCmd(cmd, callback);

    if (!commands[register]) commands[register] = [];
    commands[register].push(cmd);
}

/**
 * Unregisters a command.
 * @param {string} cmd
 * @param {string} register
 */
export function unregister(cmd, register = "zephra_core") {
    if (typeof cmd !== "string")
        throw new TypeError("Command (cmd) must be a string.");

    log.log(`Unregistered command: ${cmd} (${register})`);

    chat.unregisterCmd(cmd);

    commands[register].splice(commands[register].indexOf(cmd), 1);
}

/**
 * Unregisters all commands.
 * @param {string} cmd
 * @param {string} register
 */
export function unregisterAll(register = "zephra_core") {
    if (!commands[register]) return;

    for (const cmd of commands[register]) {
        log.log(`Unregistered command: ${cmd} (${register})`);

        chat.unregisterCmd(cmd);
    }

    delete commands[register];
}

/**
 * Sends a message to a player
 * @param {alt.Player} player
 * @param {string} message
 */
export function sendChat(player, message) {
    chat.send(player, message);
}

/**
 * Sends a message to all players
 * @param {string} message
 */
export function broadcastChat(message) {
    chat.broadcast(message);
}

alt.on("anyResourceStop", (name) => {
    if (!commands[name]) return;

    if (commands[name]) unregisterAll(name);
});
