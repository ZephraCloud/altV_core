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

    log.log(`Registered blip: ${blip.id}`);
});

alt.onServer("core:client:blips:remove", (blip) => {
    if (!blips[blip.id]) return log.error(`Blip ${blip.id} doesn't exist`);

    blips[blip.id].destroy();

    delete blips[blip.id];

    log.log(`Unregistered blip: ${blip.id}`);
});
