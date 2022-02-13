import * as alt from "alt-server";

export function log(msg, sender) {
    alt.log(`${getSender(sender)}`, msg);
}

export function error(msg, sender) {
    alt.logError(`${getSender(sender)}`, msg);
}

export function warn(msg, sender) {
    alt.logWarning(`${getSender(sender)}`, msg);
}

function getSender(sender) {
    if (!sender) return "[CORE]";

    if (sender.startsWith("[") && sender.endsWith("]")) return sender;
    else if (sender.includes(",")) {
        let Return;

        for (const s of sender.split(",")) {
            if (!s) continue;

            Return += `[${s.trim()}]`;
        }

        return Return.replace("undefined", "");
    } else return `[${sender.trim()}]`;
}
