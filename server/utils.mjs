import * as alt from "alt-server";

export function generateLicensePlateText() {
    const pattern = "NLLLNNN",
        chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        currentStartNum = 8; // http://www.15q.net/ca.html

    let text = "";

    for (let i = 0; i < pattern.length; i++) {
        if (pattern[i] === "L")
            text += chars.charAt(Math.floor(Math.random() * chars.length));
        else text += i === 0 ? currentStartNum : Math.floor(Math.random() * 10);
    }

    return text;
}

export function getPlayerByName(name) {
    return alt.Player.all.filter((p) => p.name === name)[0];
}

export function getPlayerBySocialId(socialId) {
    return alt.Player.all.filter((p) => p.socialID === socialId)[0];
}
