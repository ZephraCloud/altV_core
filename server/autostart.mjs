import * as alt from "alt-server";

import config from "./../config.json";
import * as log from "./log.mjs";
import * as path from "path";
import * as fs from "fs";

const resourcePath = path.join(process.env.PWD, "resources/");

export function startAll(ignore = config.autostart.exclude) {
    log.log("Starting all scripts...");

    fs.readdir(resourcePath, function (err, files) {
        if (err) return log.error("Unable to scan directory: " + err);

        files.forEach((file) => {
            if (
                !ignore[file] &&
                fs.statSync(path.join(resourcePath, file)).isDirectory()
            )
                alt.startResource(file);
        });
    });
}
