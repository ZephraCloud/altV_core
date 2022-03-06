import * as alt from "alt-client";
import * as native from "natives";

import * as character from "./character.js";
import * as fuel from "./fuel.js";
import * as menu from "./menu.js";
import * as blips from "./blips.js";
import * as storeClothing from "./store_clothing.js";

const ignoredHats = [1, 27, 32, 33];

let webview = {},
    phoneState = false;

alt.onServer("core:client:login", () => {
    webview.login = new alt.WebView(
        "http://resource/client/html/login/index.html"
    );

    alt.showCursor(true);
    alt.toggleGameControls(false);
    webview.login.focus();

    webview.login.on("webview:login", (email, password) => {
        alt.emitServer("core:server:checkLogin", email, password);
    });

    webview.login.on("webview:localStorage:getItems", () => {
        webview.login.emit(
            "webview:localStorage:return",
            alt.LocalStorage.get("core:login:email")
        );
    });

    webview.login.on("webview:localStorage:set", (key, value) => {
        alt.LocalStorage.set(key, value);
        alt.LocalStorage.save();
    });
});

alt.onServer("core:client:weather:setTime", (date) => {
    native.setClockTime(date.hour, date.minute, date.second);
});

alt.onServer("core:client:bridge", (toState) => {
    const bridge = native.getClosestObjectOfType(
            353.3317,
            -2315.838,
            13.72306,
            50.0,
            alt.hash("po1_09_brig_m"),
            false,
            true,
            true
        ),
        bridgeLOD = native.getClosestObjectOfType(
            353.3297,
            -2316.402,
            13.59048,
            50.0,
            alt.hash("po1_09_brig_m_lod"),
            false,
            true,
            true
        ),
        bridgeRoadDecor = native.getClosestObjectOfType(
            351.0259,
            -2318.766,
            9.23275,
            50.0,
            alt.hash("po1_09_brig_m_glue"),
            false,
            true,
            true
        ),
        bridgeFences = [
            native.getClosestObjectOfType(
                353.294,
                -2299.624,
                9.797024,
                1.0,
                alt.hash("po1_09_brig_det_05"),
                false,
                true,
                true
            ),
            native.getClosestObjectOfType(
                353.3542,
                -2316.406,
                9.903923,
                1.0,
                alt.hash("po1_09_brig_det_03"),
                false,
                true,
                true
            ),
            native.getClosestObjectOfType(
                353.3321,
                -2332.591,
                9.788223,
                1.0,
                alt.hash("po1_09_brig_det_04"),
                false,
                true,
                true
            )
        ],
        bridgeToCoords =
            toState === "up"
                ? [353.3317, -2315.838, 48.0]
                : [353.3317, -2315.838, 13.72306];

    if (toState === "up") native.deleteObject(bridgeRoadDecor);
    else {
        native.createObject(
            alt.hash("po1_09_brig_m_glue"),
            351.0259,
            -2318.766,
            9.23275,
            false,
            false,
            false
        );
    }

    setInterval(() => {
        const state = native.slideObject(
            bridge,
            bridgeToCoords[0],
            bridgeToCoords[1],
            bridgeToCoords[2],
            0.0,
            0.0,
            20.0,
            true
        );

        native.slideObject(
            bridgeLOD,
            bridgeToCoords[0],
            bridgeToCoords[1],
            bridgeToCoords[2],
            0.0,
            0.0,
            20.0,
            true
        );

        bridgeFences.forEach((fence) => {
            native.slideObject(
                fence,
                bridgeToCoords[0],
                bridgeToCoords[1],
                bridgeToCoords[2],
                0.0,
                0.0,
                20.0,
                true
            );
        });

        if (state) clearInterval(this), console.log("FINISHED");
    }, 1);
});

let vehFlashLight = {};

alt.on("keydown", (key) => {
    const vehicle = alt.Player.local.vehicle;

    // Key: L
    if (key === 76 && alt.gameControlsEnabled() && vehicle) {
        const currentLight = native
                .getVehicleLightsState(vehicle)
                .toString()
                .split(","),
            isLightOn = currentLight[1] === "1",
            isHighBeamOn = currentLight[2] === "1";

        if (!isHighBeamOn) native.setVehicleLights(vehicle, 2);
        if (isLightOn) native.setVehicleFullbeam(vehicle, true);

        vehFlashLight = {
            currentLight,
            isLightOn
        };
    }
});

alt.on("keyup", (key) => {
    const vehicle = alt.Player.local.vehicle;

    // Key: F1
    if (!phoneState && key === 112 && alt.gameControlsEnabled()) {
        phoneState = true;
        openPhone();
    } else if (phoneState && key === 112 && alt.gameControlsEnabled()) {
        phoneState = false;
        closePhone();
    }

    // Key: L
    if (
        key === 76 &&
        alt.gameControlsEnabled() &&
        vehicle &&
        vehFlashLight.currentLight
    ) {
        native.setVehicleLights(
            vehicle,
            vehFlashLight.currentLight[1] === "0"
                ? vehFlashLight.isLightOn
                    ? 1
                    : 0
                : vehFlashLight.currentLight[1]
        );

        if (vehFlashLight.isLightOn) native.setVehicleFullbeam(vehicle, false);

        vehFlashLight = {};
    }

    // Key: Enter
    if (key === 13 && alt.gameControlsEnabled() && vehicle) {
        native.setVehicleEngineOn(
            vehicle,
            !native.getIsVehicleEngineRunning(vehicle),
            true,
            true
        );
    }
});

alt.onServer("core:client:phone", (state) => {
    if (state) openPhone();
    else closePhone();
});

alt.on("connectionComplete", () => {
    // webview.login = new alt.WebView(
    //     "http://resource/client/html/login/index.html"
    // );

    // webview.login.on("core:client:webview:login", (email, password) => {
    //     alt.emitServer("core:server:checkLogin", email, password);
    // });
    alt.emitServer("core:server:weather:setClientTime");

    const blip = new alt.PointBlip(5943.5679611650485, -6272.114833599767, 2);

    blip.alpha = 0;
});

alt.onServer("core:client:loginStatus", (status) => {
    if (status) {
        console.log("Login successful.");

        webview.login.unfocus();
        webview.login.destroy();
        alt.showCursor(false);
        alt.toggleGameControls(true);
    } else {
        console.log("Login failed.");

        webview.login.emit("webview:loginFailed");
    }
});

alt.onServer("core:client:teleportToWaypoint", () => {
    const waypoint = native.getFirstBlipInfoId(8);

    if (!native.doesBlipExist(waypoint)) return;

    const player = alt.Player.local.scriptID;
    const pos = native.getBlipInfoIdCoord(waypoint);

    native.setFocusPosAndVel(pos.x, pos.y, pos.z, 0, 0, 0);
    native.requestCollisionAtCoord(pos.x, pos.y, pos.z);

    let z = Number(pos.z),
        IsGround = native.getGroundZFor3dCoord(
            pos.x,
            pos.y,
            pos.z,
            undefined,
            undefined
        )[0];

    setTimeout(() => {
        while (!IsGround) {
            IsGround = native.getGroundZFor3dCoord(
                pos.x,
                pos.y,
                z,
                undefined,
                undefined
            )[0];
            z++;
            if (z > 1000) break;
        }
    }, 1000);

    setTimeout(() => {
        if (!IsGround) return alt.logWarning("Couldn't find ground");

        native.setFocusEntity(player);
        alt.emitServer(
            "core:server:teleportToWaypoint",
            new alt.Vector3(pos.x, pos.y, z)
        );
    }, 1400);
});

alt.onServer("core:client:enterVehicle", (vehicle, flag) => {
    native.taskEnterVehicle(
        native.getPlayerPed(alt.Player),
        vehicle,
        -1,
        -1,
        1.0,
        flag,
        0
    );
});

alt.on("playerEnteringVehicle", (player, vehicle, seat) => {
    if (player.valid && vehicle.valid) {
        if (
            ignoredHats.includes(player.getProp(0).drawable) ||
            player.getProp(0).drawable == 255
        )
            return;

        player.setMeta("prop", {
            component: 0,
            drawable: player.getProp(0).drawable,
            texture: player.getProp(0).texture
        });
    }
});

alt.on("playerEnteredVehicle", (player, vehicle, seat) => {
    if (player.valid && vehicle.valid) {
        if (
            !player.hasMeta("prop") ||
            ignoredHats.includes(player.getMeta("prop").drawable)
        )
            return;

        player.setProp(
            player.getMeta("prop").component,
            player.getMeta("prop").drawable,
            player.getMeta("prop").texture
        );
    }
});

// Source: https://github.com/Stuyk/altV-Open-Roleplay/blob/5ccdeb9e960a7e0fde758cc89c366ed2953cc639/resources/orp/client/systems/interiors.mjs
alt.onServer("core:client:requestIpls", () => {
    alt.requestIpl("ex_dt1_02_office_02b");
    alt.requestIpl("chop_props");
    alt.requestIpl("FIBlobby");
    alt.removeIpl("FIBlobbyfake");
    alt.requestIpl("FBI_colPLUG");
    alt.requestIpl("FBI_repair");
    alt.requestIpl("v_tunnel_hole");
    alt.requestIpl("TrevorsMP");
    alt.requestIpl("TrevorsTrailer");
    alt.requestIpl("TrevorsTrailerTidy");
    alt.removeIpl("farm_burnt");
    alt.removeIpl("farm_burnt_lod");
    alt.removeIpl("farm_burnt_props");
    alt.removeIpl("farmint_cap");
    alt.removeIpl("farmint_cap_lod");
    alt.requestIpl("farm");
    alt.requestIpl("farmint");
    alt.requestIpl("farm_lod");
    alt.requestIpl("farm_props");
    alt.requestIpl("facelobby");
    alt.removeIpl("CS1_02_cf_offmission");
    alt.requestIpl("CS1_02_cf_onmission1");
    alt.requestIpl("CS1_02_cf_onmission2");
    alt.requestIpl("CS1_02_cf_onmission3");
    alt.requestIpl("CS1_02_cf_onmission4");
    alt.requestIpl("v_rockclub");
    alt.requestIpl("v_janitor");
    alt.removeIpl("hei_bi_hw1_13_door");
    alt.requestIpl("bkr_bi_hw1_13_int");
    alt.requestIpl("ufo");
    alt.requestIpl("ufo_lod");
    alt.requestIpl("ufo_eye");
    alt.removeIpl("v_carshowroom");
    alt.removeIpl("shutter_open");
    alt.removeIpl("shutter_closed");
    alt.removeIpl("shr_int");
    alt.requestIpl("csr_afterMission");
    alt.requestIpl("v_carshowroom");
    alt.requestIpl("shr_int");
    alt.requestIpl("shutter_closed");
    alt.requestIpl("smboat");
    alt.requestIpl("smboat_distantlights");
    alt.requestIpl("smboat_lod");
    alt.requestIpl("smboat_lodlights");
    alt.requestIpl("cargoship");
    alt.requestIpl("railing_start");
    alt.removeIpl("sp1_10_fake_interior");
    alt.removeIpl("sp1_10_fake_interior_lod");
    alt.requestIpl("sp1_10_real_interior");
    alt.requestIpl("sp1_10_real_interior_lod");
    alt.removeIpl("id2_14_during_door");
    alt.removeIpl("id2_14_during1");
    alt.removeIpl("id2_14_during2");
    alt.removeIpl("id2_14_on_fire");
    alt.removeIpl("id2_14_post_no_int");
    alt.removeIpl("id2_14_pre_no_int");
    alt.removeIpl("id2_14_during_door");
    alt.requestIpl("id2_14_during1");
    alt.removeIpl("Coroner_Int_off");
    alt.requestIpl("coronertrash");
    alt.requestIpl("Coroner_Int_on");
    alt.removeIpl("bh1_16_refurb");
    alt.removeIpl("jewel2fake");
    alt.removeIpl("bh1_16_doors_shut");
    alt.requestIpl("refit_unload");
    alt.requestIpl("post_hiest_unload");
    alt.requestIpl("Carwash_with_spinners");
    alt.requestIpl("KT_CarWash");
    alt.requestIpl("ferris_finale_Anim");
    alt.removeIpl("ch1_02_closed");
    alt.requestIpl("ch1_02_open");
    alt.requestIpl("AP1_04_TriAf01");
    alt.requestIpl("CS2_06_TriAf02");
    alt.requestIpl("CS4_04_TriAf03");
    alt.removeIpl("scafstartimap");
    alt.requestIpl("scafendimap");
    alt.removeIpl("DT1_05_HC_REMOVE");
    alt.requestIpl("DT1_05_HC_REQ");
    alt.requestIpl("DT1_05_REQUEST");
    alt.requestIpl("dt1_05_hc_remove");
    alt.requestIpl("dt1_05_hc_remove_lod");
    alt.requestIpl("FINBANK");
    alt.removeIpl("DT1_03_Shutter");
    alt.removeIpl("DT1_03_Gr_Closed");
    alt.requestIpl("golfflags");
    alt.requestIpl("airfield");
    alt.requestIpl("v_garages");
    alt.requestIpl("v_foundry");
    alt.requestIpl("hei_yacht_heist");
    alt.requestIpl("hei_yacht_heist_Bar");
    alt.requestIpl("hei_yacht_heist_Bedrm");
    alt.requestIpl("hei_yacht_heist_Bridge");
    alt.requestIpl("hei_yacht_heist_DistantLights");
    alt.requestIpl("hei_yacht_heist_enginrm");
    alt.requestIpl("hei_yacht_heist_LODLights");
    alt.requestIpl("hei_yacht_heist_Lounge");
    alt.requestIpl("hei_carrier");
    alt.requestIpl("hei_Carrier_int1");
    alt.requestIpl("hei_Carrier_int2");
    alt.requestIpl("hei_Carrier_int3");
    alt.requestIpl("hei_Carrier_int4");
    alt.requestIpl("hei_Carrier_int5");
    alt.requestIpl("hei_Carrier_int6");
    alt.requestIpl("hei_carrier_LODLights");
    alt.requestIpl("bkr_bi_id1_23_door");
    alt.requestIpl("lr_cs6_08_grave_closed");
    alt.requestIpl("hei_sm_16_interior_v_bahama_milo_");
    alt.requestIpl("CS3_07_MPGates");
    alt.requestIpl("cs5_4_trains");
    alt.requestIpl("v_lesters");
    alt.requestIpl("v_trevors");
    alt.requestIpl("v_michael");
    alt.requestIpl("v_comedy");
    alt.requestIpl("v_cinema");
    alt.requestIpl("V_Sweat");
    alt.requestIpl("V_35_Fireman");
    alt.requestIpl("redCarpet");
    alt.requestIpl("triathlon2_VBprops");
    alt.requestIpl("jetstenativeurnel");
    alt.requestIpl("Jetsteal_ipl_grp1");
    alt.removeIpl("RC12B_Default");
    alt.removeIpl("RC12B_Fixed");
    alt.requestIpl("canyonriver01");
    alt.requestIpl("canyonriver01_lod");
    alt.requestIpl("cs3_05_water_grp1");
    alt.requestIpl("cs3_05_water_grp1_lod");
    alt.requestIpl("trv1_trail_start");
    alt.requestIpl("CanyonRvrShallow");

    // CASINO
    native.requestIpl("vw_casino_penthouse");
    native.requestIpl("vw_casino_main");

    // Pillbox v2
    native.requestIpl("gabz_pillbox_milo_");
});

alt.on("taskChange", (oldTask, newTask) => {
    if (newTask === 160) overrideVehicleEntrance(); // 160 === ENTERING_VEHICLE
});

alt.onServer("core:client:notification", notification);
alt.onServer("core:client:advancedNotification", advancedNotification);

export function notification(message) {
    native.beginTextCommandThefeedPost("STRING");
    native.addTextComponentSubstringPlayerName(message);
    native.endTextCommandThefeedPostTicker(false, true);
}

export function advancedNotification(
    imageName,
    headerMsg,
    detailsMsg,
    message
) {
    native.beginTextCommandThefeedPost("STRING");
    native.addTextComponentSubstringPlayerName(message);
    native.endTextCommandThefeedPostMessagetextTu(
        imageName.toUpperCase(),
        imageName.toUpperCase(),
        false,
        4,
        headerMsg,
        detailsMsg,
        1.0,
        ""
    );
    native.endTextCommandThefeedPostTicker(false, false);
}

function openPhone() {
    console.log("Opening phone");

    phoneState = true;

    if (!webview.phone) {
        webview.phone = new alt.WebView(
            "http://resource/client/html/phone/index.html"
        );
    } else webview.phone.isVisible = true;

    alt.showCursor(true);
    //alt.toggleGameControls(false);
    webview.phone.focus();

    webview.phone.on("webview:login", (email, password) => {
        alt.emitServer("core:server:checkLogin", email, password);
    });
}

function closePhone() {
    console.log("Closing phone");

    phoneState = false;

    webview.phone.unfocus();
    webview.phone.isVisible = false;
    alt.showCursor(false);
    alt.toggleGameControls(true);
}

export function sqrtDistance(playerPos, secondPos) {
    return Math.sqrt(
        (playerPos.x - secondPos.x) * (playerPos.x - secondPos.x) +
            (playerPos.y - secondPos.y) * (playerPos.y - secondPos.y) +
            (playerPos.z - secondPos.z) * (playerPos.z - secondPos.z)
    );
}

export function getClosestVehicle() {
    const obj = {
        distance: null,
        vehicle: null
    };

    for (const vehicle of alt.Vehicle.streamedIn) {
        const distance = sqrtDistance(alt.Player.local.pos, vehicle.pos);
        if (obj.distance == null || obj.distance > distance) {
            obj.distance = distance;
            obj.vehicle = vehicle;
        }
    }

    return obj.vehicle;
}

function getClosestVehicleDoor(vehicle) {
    const _vehicle = vehicle == null ? getClosestVehicle() : vehicle;
    if (!_vehicle) return -1;

    const obj = { distance: null, door: -1 };

    for (let i = 0, l = native.getNumberOfVehicleDoors(_vehicle); i < l; i++) {
        const distance = sqrtDistance(
            alt.Player.local.pos,
            native.getEntryPositionOfDoor(_vehicle, i)
        );
        if (obj.distance == null || obj.distance > distance) {
            obj.distance = distance;
            obj.door = i;
        }
    }

    return obj.door;
}

function overrideVehicleEntrance() {
    const vehicle = getClosestVehicle();
    if (!vehicle) return;

    const vehicledDoor = getClosestVehicleDoor(vehicle);
    if (vehicledDoor > -1) {
        native.taskEnterVehicle(
            alt.Player.local.scriptID,
            vehicle,
            -1,
            vehicledDoor - 1,
            1,
            1,
            0
        );
    }
}

const islandCenter = new alt.Vector3(4840.571, -5174.425, 2.0);

let nearIsland = false;

alt.everyTick(() => {
    if (phoneState) {
        native.disableControlAction(0, 24, true); // Attack
        native.disableControlAction(0, 257, true); // Attack2
        native.disableControlAction(0, 69, true); // Vehicle Attack
        native.disableControlAction(0, 92, true); // Passenger Attack
        native.disableControlAction(0, 25, true); // Aim
        native.disableControlAction(0, 45, true); // Reload
        native.disableControlAction(0, 144, true); // Parachute deploy
    } else {
        native.enableControlAction(0, 24, true); // Attack
        native.enableControlAction(0, 257, true); // Attack2
        native.enableControlAction(0, 69, true); // Vehicle Attack
        native.enableControlAction(0, 92, true); // Passenger Attack
        native.enableControlAction(0, 25, true); // Aim
        native.enableControlAction(0, 45, true); // Reload
        native.enableControlAction(0, 144, true); // Parachute deploy
    }

    const distance = alt.Player.local.pos.distanceTo(islandCenter);

    if (nearIsland) {
        native.setRadarAsExteriorThisFrame();
        native.setRadarAsInteriorThisFrame(
            alt.hash("h4_fake_islandx"),
            4700.0,
            -5145.0,
            0,
            0
        );

        if (distance >= 3000) {
            nearIsland = false;
            native.setIslandHopperEnabled("HeistIsland", false);
            native.setScenarioGroupEnabled("Heist_Island_Peds", false);
            native.setAudioFlag("PlayerOnDLCHeist4Island", false);
            native.setAmbientZoneListStatePersistent(
                "AZL_DLC_Hei4_Island_Zones",
                false,
                false
            );
            native.setAmbientZoneListStatePersistent(
                "AZL_DLC_Hei4_Island_Disabled_Zones",
                false,
                false
            );
        }
    } else if (distance < 2000 && !nearIsland) {
        nearIsland = true;
        native.setIslandHopperEnabled("HeistIsland", true);
        native.setScenarioGroupEnabled("Heist_Island_Peds", true);
        native.setAudioFlag("PlayerOnDLCHeist4Island", true);
        native.setAmbientZoneListStatePersistent(
            "AZL_DLC_Hei4_Island_Zones",
            true,
            true
        );
        native.setAmbientZoneListStatePersistent(
            "AZL_DLC_Hei4_Island_Disabled_Zones",
            false,
            true
        );
    }
});

alt.setWeatherSyncActive(true);
alt.setMsPerGameMinute(60000);

alt.emitServer("core:server:weather:setClientTime");
