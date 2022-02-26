import * as alt from "alt-client";
import * as native from "natives";

setInterval(() => {
    if (!alt.Player.local.vehicle) return;

    const vehicle = alt.Player.local.vehicle;

    if (!vehicle.getMeta("fuel"))
        vehicle.setMeta("fuel", getVehicleFuel(vehicle));
    if (!vehicle.getMeta("consumption"))
        vehicle.setMeta("consumption", getVehicleFuelConsumption(vehicle));

    const fuel = vehicle.getMeta("fuel"),
        consumption = vehicle.getMeta("consumption"),
        vehSpeed =
            vehicle.speed === 0
                ? native.getEntitySpeed(vehicle)
                : vehicle.speed,
        multiply = native.shouldUseMetricMeasurements() ? 3.6 : 2.236936,
        kmh = (vehSpeed * multiply).toFixed(1);

    if (fuel > 0) {
        if (kmh > 0) {
            const oldPos = vehicle.pos;

            setTimeout(() => {
                const newPos = vehicle.pos,
                    distance = native.getDistanceBetweenCoords(
                        oldPos.x,
                        oldPos.y,
                        oldPos.z,
                        newPos.x,
                        newPos.y,
                        newPos.z,
                        false
                    ),
                    fuelConsumption = distance * 3.6 * (consumption / 1000);

                vehicle.setMeta("fuel", fuel - fuelConsumption);

                vehicle.setMeta(
                    "distance",
                    vehicle.getMeta("distance") ?? 0 + distance
                );
            }, 1000);
        }
    } else vehicle.engineOn = false;
}, 1000);

export function getVehicleFuel(vehicle) {
    if (!vehicle.valid) return;

    const list = {
        types: {
            0: 45, // Cars (Compacts)
            1: 50, // Cars (Sedans)
            2: 80, // Cars (SUVs)
            3: 80, // Cars (Coupes)
            4: 70, // Cars (Muscle)
            5: 80, // Cars (Sports Classic)
            6: 65, // Cars (Sports)
            7: 110, // Cars (Super)
            8: 20, // Motorcycles
            9: 60, // Off-road
            10: 110, // Industrial
            11: 70, // Utility
            12: 70, // Vans
            14: 150, // Boats
            15: 150, // Helicopters
            16: 150, // Planes
            17: 60, // Bus, Taxi, trash ... (Service)
            18: 80, // Emergency
            19: 120, // Military
            20: 400 // Trucks (Commercial)
        },
        models: {
            bus: 500,
            airbus: 500,
            coach: 600,
            brickade: 400,
            pbus2: 400,
            rallytruck: 350,
            trash: 350,
            trash2: 350,
            wastelander: 100,
            veto: 15,
            veto2: 15,
            ripley: 200,
            sadler: 80,
            sadler2: 80,
            scrap: 250,
            towtruck: 100,
            towtruck2: 100,
            tractor: 50,
            tractor2: 200,
            tractor3: 200,
            utillitruck: 200,
            utillitruck2: 200,
            utillitruck3: 50,
            slamtruck: 75,
            blazer: 20,
            blazer2: 20,
            blazer3: 20,
            blazer4: 20,
            blazer5: 20,
            verus: 20
        }
    };

    return (
        list.models[
            native.getDisplayNameFromVehicleModel(vehicle.model).toLowerCase()
        ] ??
        list.types[native.getVehicleClass(vehicle)] ??
        80
    );
}

export function getVehicleFuelConsumption(vehicle) {
    if (!vehicle.valid) return;

    const list = {
        types: {
            0: 0.08, // Cars (Compacts)
            1: 0.075, // Cars (Sedans)
            2: 0.13, // Cars (SUVs)
            3: 0.1, // Cars (Coupes)
            4: 0.2, // Cars (Muscle)
            5: 0.154, // Cars (Sports Classic)
            6: 0.102, // Cars (Sports)
            7: 0.116, // Cars (Super)
            8: 0.07, // Motorcycles
            9: 0.1, // Off-road
            10: 0.25, // Industrial
            11: 0.04, // Utility
            12: 0.15, // Vans
            14: 0.21, // Boats
            15: 0.9, // Helicopters
            16: 1.0, // Planes
            17: 0.07, // Bus, Taxi, trash ... (Service)
            18: 0.125, // Emergency
            19: 0.5, // Military
            20: 0.35 // Trucks (Commercial)
        },
        models: {
            bus: 0.37,
            airbus: 0.37,
            coach: 0.4,
            brickade: 0.4,
            pbus: 0.5,
            rallytruck: 0.3,
            trash: 0.36,
            trash2: 0.36,
            wastelander: 0.2,
            veto: 0.01,
            veto2: 0.015,
            ripley: 0.1,
            sadler: 0.8,
            sadler2: 0.8,
            scrap: 0.28,
            towtruck: 0.3,
            towtruck2: 0.3,
            tractor: 0.275,
            tractor2: 0.25,
            tractor3: 0.255,
            utillitruck: 0.33,
            utillitruck2: 0.33,
            utillitruck3: 0.08,
            slamtruck: 0.1
        }
    };

    return (
        list.models[
            native.getDisplayNameFromVehicleModel(vehicle.model).toLowerCase()
        ] ??
        list.types[native.getVehicleClass(vehicle)] ??
        0
    );
}
