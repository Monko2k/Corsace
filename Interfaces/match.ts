import { Team } from "discord.js";
import { MappoolMap } from "./mappool";

export enum PickStatus {
    picked,
    banned
}

/**
 * Obtained from https://github.com/ppy/osu-api/wiki#mods
 */
export enum Mods {
    None           = 0,
    NoFail         = 1,
    Easy           = 2,
    TouchDevice    = 4,
    Hidden         = 8,
    HardRock       = 16,
    SuddenDeath    = 32,
    DoubleTime     = 64,
    Relax          = 128,
    HalfTime       = 256,
    Nightcore      = 512,
    Flashlight     = 1024,
    Autoplay       = 2048,
    SpunOut        = 4096,
    Autopilot      = 8192,
    Perfect        = 16384,
    Key4           = 32768,
    Key5           = 65536,
    Key6           = 131072,
    Key7           = 262144,
    Key8           = 524288,
    FadeIn         = 1048576,
    Random         = 2097152,
    Cinema         = 4194304,
    Target         = 8388608,
    Key9           = 16777216,
    KeyCoop        = 33554432,
    Key1           = 67108864,
    Key3           = 134217728,
    Key2           = 268435456,
    ScoreV2        = 536870912,
    Mirror         = 1073741824,
    KeyMod = Key1 | Key2 | Key3 | Key4 | Key5 | Key6 | Key7 | Key8 | Key9 | KeyCoop,
    FreeModAllowed = NoFail | Easy | Hidden | HardRock | SuddenDeath | Flashlight | FadeIn | Relax | Autopilot | SpunOut | KeyMod,
    ScoreIncreaseMods = Hidden | HardRock | DoubleTime | Flashlight | FadeIn,
}

const modStrings: string[] = [
    "NF",
    "EZ",
    "NV",
    "HD",
    "HR",
    "SD",
    "DT",
    "RX",
    "HT",
    "NC",
    "FL",
    "AU",
    "SO",
    "AP",
    "PF",
    "K4",
    "K5",
    "K6",
    "K7",
    "K8",
    "FI",
    "RN",
    "CN",
    "TR",
    "K9",
    "KC",
    "K1",
    "K3",
    "K2",
    "V2",
];

export function modsToString (m: Mods): string {
    if (m === 0)
        return "NM";

    let stringBuilder = "";
    for (let i = 0; i < modStrings.length; i ++) {
        if ((1 & m) === 1)
            stringBuilder += modStrings[i];
        m >>= 1;
    }
    if (stringBuilder.includes("NC"))
        stringBuilder = stringBuilder.replace("DT", "");
    if (stringBuilder.includes("PF"))
        stringBuilder = stringBuilder.replace("SD", "");

    return stringBuilder;
}

export interface Match {
    bestOf: number
    mp?: string
    matchID: string
    id: string
    sets: MatchSet[]
    bans: MatchMap[]
    time: Date
    teamA: Team
    teamB: Team
    first?: Team
}

export interface MatchSet {
    bans: MatchMap[]
    picks: MatchMap[]
}

export interface MatchMap {
    map: MappoolMap
    mapMod: "NM" | "HD" | "HR" | "DT" | "FM" | "TB"
    mapPosition: number
}

