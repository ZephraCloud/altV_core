import * as fs from "fs";
import * as path from "path";
import config from "./../config.json";

const translation = JSON.parse(
    fs.readFileSync(
        path.join(
            path.resolve(),
            `resources/zephra_core/localization/${
                config.language
                    ? config.language.replace("en_US", "src")
                    : "src"
            }/default.json`
        )
    )
);

export function getString(string) {
    return translation[string] || string;
}
