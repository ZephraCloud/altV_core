import config from "./../config.json";

const translation = import(
    `./../localization/${config.language.replace("en_US", "src")}/default.json`
);

export function getString(string) {
    return translation[string] || string;
}
