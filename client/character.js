import * as alt from "alt-client";
import * as native from "natives";

import * as log from "./log.js";

const model = {
    female: alt.hash("mp_f_freemode_01"),
    male: alt.hash("mp_m_freemode_01")
};

native.requestModel(model.female);
native.requestModel(model.male);

alt.onServer("chore:client:character:load", (character) => {
    if (!character)
        return log.error("Character data not provided", "CORE,CHARACTER");

    const scriptID = alt.Player.local.scriptID,
        skin = JSON.parse(character.skin);

    native.clearPedBloodDamage(scriptID);
    native.clearPedDecorations(scriptID);
    native.setPedHeadBlendData(scriptID, 0, 0, 0, 0, 0, 0, 0, 0, 0, false);
    native.setPedHeadBlendData(
        scriptID,
        skin.faceFather,
        skin.faceMother,
        0,
        skin.skinFather,
        skin.skinMother,
        0,
        parseFloat(skin.faceMix),
        parseFloat(skin.skinMix),
        0,
        false
    );

    native.setPedHeadOverlay(
        scriptID,
        1,
        skin.facialHair,
        skin.facialHairOpacity
    );
    native.setPedHeadOverlayColor(
        scriptID,
        1,
        1,
        skin.facialHairColor1,
        skin.facialHairColor1
    );

    native.setPedHeadOverlay(scriptID, 2, skin.eyebrows, 1);
    native.setPedHeadOverlayColor(
        scriptID,
        2,
        1,
        skin.eyebrowsColor1,
        skin.eyebrowsColor1
    );

    native.setPedEyeColor(scriptID, skin.eyes);
});

alt.onServer("chore:client:character:create", (userId) => {});
