import * as alt from "alt-server";

import * as log from "./log.mjs";
import * as path from "path";
import * as fs from "fs";

const exclude = ["zephra_core"];

export function startAll(ignore = exclude) {
    log.log("Starting all scripts...");

    fs.readdir(path.join(__dirname, "../../"), function (err, files) {
        if (err) return log.log("Unable to scan directory: " + err);

        const dirPath = path.join(__dirname, "../../");

        files.forEach((file) => {
            if (
                !ignore[file] &&
                fs.statSync(`${dirPath}/${file}`).isDirectory()
            )
                alt.startResource(file);
        });
    });
}
