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

alt.on("anyResourceStop", (name) => {
    if (!commands[name]) return;

    if (commands[name]) for (const cmd of commands[name]) unregister(cmd, name);
});
