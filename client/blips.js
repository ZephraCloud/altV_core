import * as alt from "alt-client";
import * as log from "./log.js";

const blips = {};

alt.onServer("core:client:blips:create", (blip) => {
    const blipObject = new alt.PointBlip(
        blip.position.x,
        blip.position.y,
        blip.position.z
    );

    blipObject.sprite = blip.sprite;
    blipObject.color = blip.color;
    blipObject.scale = blip.scale;
    blipObject.shortRange = blip.shortRange;
    blipObject.name = blip.label;

    blips[blip.id] = blipObject;

    alt.LocalStorage.set("blips", JSON.stringify(blips));
    alt.LocalStorage.save();

    log.log(`Registered blip: ${blip.id}`);
});

alt.onServer("core:client:blips:remove", (blip) => {
    if (!blips[blip.id] && !alt.LocalStorage.get("core:client:blips"))
        return log.error(`Blip ${blip.id} doesn't exist`);
    else if (!blips[blip.id]) {
        const blips = JSON.parse(alt.LocalStorage.get("core:client:blips"));

        delete blips[blip.id];

        log.log(`Unregistered blip: ${blip.id}`);

        alt.LocalStorage.set("core:client:blips", JSON.stringify(blips));
        alt.LocalStorage.save();

        return;
    }

    blips[blip.id].destroy();

    delete blips[blip.id];

    log.log(`Unregistered blip: ${blip.id}`);
});
