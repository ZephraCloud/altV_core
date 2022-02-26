import config from "./../config.json";

const translation = import(`./../localization/${config.language}.json`);

export function getString(string) {
    return translation[string] || string;
}
