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
            position: new alt.Vector3(123.6, -219.4, 53.6),
            markers: {
                pants: new alt.Vector3(123.204, -229.45, 53.554),
                shoes: new alt.Vector3(119.419, -222.382, 53.554),
                tops: new alt.Vector3(126.184, -220.008, 53.554),
                shirts: new alt.Vector3(120.501, -216.395, 53.554),
                checkout: new alt.Vector3(123.34, -223.595, 53.554)
            }
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
            markers: {
                pants: new alt.Vector3(1190.624, 2715.402, 37.227),
                shoes: new alt.Vector3(1193.103, 2704.443, 37.21),
                tops: new alt.Vector3(1190.769, 2707.635, 37.227),
                shirts: new alt.Vector3(1189.621, 2710.101, 31.21),
                checkout: new alt.Vector3(1199.907, 2707.767, 37.21)
            }
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
    },
    colshapes = {};

stores.forEach((store, i) => {
    blips.create(
        `store_clothing_${i}`,
        localization.getString(`blip.store.clothing.${store.type}`),
        store.position,
        blipInfo[store.type].sprite,
        blipInfo[store.type].color,
        blipInfo[store.type].scale,
        true,
        "zephra_core"
    );

    if (store.markers) {
        for (const [k, v] of Object.entries(store.markers)) {
            const colshape = new alt.ColshapeCircle(v.x, v.y, 1);

            colshape.id = `store_clothing_${i}_${k}`;
            colshape.playersOnly = true;

            colshapes[colshape.id] = colshape;
        }
    }
});

alt.on("entityEnterColshape", (colshape, player) => {
    if (colshapes[colshape.id].id !== colshape.id) return;

    if (colshape.id.includes("checkout"))
        return alt.emitClient(player, "core:client:store:clothing:checkout");

    alt.emitClient(
        player,
        "core:client:store:clothing:loadMenu",
        colshape.id.split("_")[3]
    );
});

alt.onClient("core:server:store:clothing:checkout", (player, data) => {
    alt.emit(
        "sql:altv:query",
        `SELECT * FROM characters WHERE userId = ${player.getSyncedMeta(
            "userId"
        )}`,
        (result) => {
            const character = result[0];

            character.skin = JSON.parse(character.skin);

            character.skin.clothes = data.clothes;

            alt.emit(
                "sql:altv:query",
                `UPDATE characters SET skin = '${JSON.stringify(
                    character.skin
                )}' WHERE userId = ${player.getSyncedMeta("userId")}`
            );
        }
    );
});

alt.on("resourceStop", () => {
    for (const colshape in colshapes) colshapes[colshape].destroy();
});
