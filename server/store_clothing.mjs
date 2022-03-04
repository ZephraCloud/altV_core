import * as alt from "alt-server";

import * as character from "./character.mjs";
import * as localization from "./localization.mjs";
import * as blips from "./blips.mjs";

const stores = [
        {
            name: "Clothing Store",
            type: "discount",
            position: new alt.Vector3(72.3, -1399.1, 28.4)
        },
        {
            name: "Clothing Store",
            type: "ponsonbys",
            position: new alt.Vector3(-703.8, -152.3, 36.4)
        },
        {
            name: "Clothing Store",
            type: "ponsonbys",
            position: new alt.Vector3(-167.9, -299.0, 38.7)
        },
        {
            name: "Clothing Store",
            type: "binco",
            position: new alt.Vector3(428.7, -800.1, 28.5)
        },
        {
            name: "Clothing Store",
            type: "binco",
            position: new alt.Vector3(-829.4, -1073.7, 10.3)
        },
        {
            name: "Clothing Store",
            type: "ponsonbys",
            position: new alt.Vector3(-1447.8, -242.5, 48.8)
        },
        {
            name: "Clothing Store",
            type: "discount",
            position: new alt.Vector3(11.6, 6514.2, 30.9)
        },
        {
            name: "Clothing Store",
            type: "suburban",
            position: new alt.Vector3(123.6, -219.4, 53.6)
        },
        {
            name: "Clothing Store",
            type: "discount",
            position: new alt.Vector3(1696.3, 4829.3, 41.1)
        },
        {
            name: "Clothing Store",
            type: "suburban",
            position: new alt.Vector3(618.1, 2759.6, 41.1)
        },
        {
            name: "Clothing Store",
            type: "discount",
            position: new alt.Vector3(1190.6, 2713.4, 37.2),
        },
        {
            name: "Clothing Store",
            type: "suburban",
            position: new alt.Vector3(-1193.4, -772.3, 16.3)
        },
        {
            name: "Clothing Store",
            type: "suburban",
            position: new alt.Vector3(-3172.5, 1048.1, 19.9)
        },
        {
            name: "Clothing Store",
            type: "discount",
            position: new alt.Vector3(-1108.4, 2708.9, 18.1)
        }
    ],
    blipInfo = {
        suburban: {
            color: 43,
            sprite: 73,
            scale: 0.75
        },
        ponsonbys: {
            color: 4,
            sprite: 73,
            scale: 0.75
        },
        discount: {
            color: 26,
            sprite: 73,
            scale: 0.75
        },
        binco: {
            color: 47,
            sprite: 73,
            scale: 0.75
        }
    };

stores.forEach((store, i) => {
    blips.create(
        `store_clothing_${i}`,
        localization.get(`blip.store.clothing.${store.type}`),
        store.position,
        blipInfo[store.type].sprite,
        blipInfo[store.type].color,
        blipInfo[store.type].scale,
        false,
        "zephra_core"
    );
});
