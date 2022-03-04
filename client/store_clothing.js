import * as alt from "alt-client";
import * as native from "natives";

import * as clothes from "./clothing.js";

const types = {
        pants: 4,
        shoes: 6,
        tops: 11,
        shirts: 8
    },
    checkout = {
        pants: 0,
        shoes: 0,
        tops: 0,
        shirts: 0
    };

alt.on("core:client:store:clothing:load", (data) => {
    native.setPedComponentVariation(
        alt.Player.local.scriptID,
        data.component,
        data.drawable,
        data.texture,
        2
    );
});

alt.on("core:client:store:clothing:cancel", () => {
    checkout.pants = checkout.shoes = checkout.tops = checkout.shirts = 0;

    alt.emitServer("core:server:character:loadSkin");
});

alt.onServer("core:client:store:clothing:loadMenu", (type) => {
    const maxValue = {
            drawable: native.getNumberOfPedDrawableVariations(
                alt.Player.local.scriptID,
                types[type]
            ),
            texture: native.getNumberOfPedTextureVariations(
                alt.Player.local.scriptID,
                0,
                types[type]
            )
        },
        items = [];

    for (let i = 0; i < maxValue.drawable; i++) {
        items.push({
            label: getClothingName(
                native.getEntityModel(alt.Player.local.scriptID),
                types[type],
                i,
                0
            ),
            type: "number",
            minValue: 0,
            maxValue: maxValue.texture - 1,
            clickData: {
                component: types[type],
                drawable: i,
                texture: 0
            },
            onClick: "core:client:store:clothing:load",
            onClickClient: true
        });
    }

    alt.emit("core:client:menu:create", {
        title: type.charAt(0).toUpperCase() + type.slice(1),
        items: items
    });
});

alt.onServer("core:client:store:clothing:checkout", (type) => {
    alt.emit("core:client:menu:create", {
        title: "Checkout",
        items: [
            {
                label: `Total: $${getCheckoutTotal()}`,
                type: "label"
            },
            {
                label: "Buy",
                type: "button",
                clickData: {
                    clothes: getClothesData(),
                    total: getCheckoutTotal()
                },
                onClick: "core:server:store:clothing:checkout"
            },
            {
                label: "Cancel",
                type: "button",
                clickData: {},
                onClick: "core:client:store:clothing:cancel",
                onClickClient: true
            }
        ]
    });
});

function getClothingName(sex, component, drawable, texture) {
    sex = sex === alt.hash("mp_m_freemode_01") ? "m" : "f";

    for (const clothing of clothes.data) {
        if (
            clothing.component === component.toString() &&
            clothing.drawable === drawable.toString() &&
            clothing.texture === texture.toString() &&
            clothing.sex === sex
        ) {
            return clothing.name;
        }
    }

    return "Unknown";
}

function getClothesData() {
    const clothes = {};

    for (const [k, v] of Object.entries(types)) {
        clothes[v] = {
            component: v,
            drawable: native.getPedDrawableVariation(
                alt.Player.local.scriptID,
                v
            ),
            texture: native.getPedTextureVariation(
                alt.Player.local.scriptID,
                0,
                v
            )
        };
    }

    return clothes;
}

function getCheckoutTotal() {
    let total = 0;

    for (const [k, cost] of Object.entries(checkout)) total += cost;

    return Number(total.toFixed(2));
}
