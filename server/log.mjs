import * as alt from "alt-server";

/**
 * Logs a message to the console.
 * @param {string} msg
 * @param {string} sender
 */
export function log(msg, sender) {
    alt.log(convertSender(sender), msg);
}

/**
 * Logs an error to the console.
 * @param {string} msg
 * @param {string} sender
 */
export function error(msg, sender) {
    alt.logError(convertSender(sender), msg);
}

/**
 * Logs a warning to the console.
 * @param {string} msg
 * @param {string} sender
 */
export function warn(msg, sender) {
    alt.logWarning(convertSender(sender), msg);
}

/**
 * Converts the sender parameter
 * @param {string} sender
 * @returns {string}
 * @example getSender("zephra,core") => "[ZEPHRA][CORE]"
 */
function convertSender(sender) {
    if (!sender) return "[CORE]";

    if (sender.startsWith("[") && sender.endsWith("]")) return sender;
    else if (sender.includes(",")) {
        let Return;

        for (const s of sender.split(",")) {
            if (!s) continue;

            Return += `[${s.trim().toUpperCase()}]`;
        }

        return Return.replace("undefined", "");
    } else return `[${sender.trim()}]`;
}
