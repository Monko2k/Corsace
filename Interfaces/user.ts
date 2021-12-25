import { Beatmapset } from "./beatmap";
import { Eligibility } from "./eligibility";
import { GuestRequest } from "./requests";
import { TeamInfo } from "./team";
import { TeamInvitationInfo } from "./teaminvitation";

export interface UserMCAInfo extends UserInfo {
    guestRequests: GuestRequest[];
    eligibility: Eligibility[];
    mcaStaff: {
        standard: boolean;
        taiko: boolean;
        fruits: boolean;
        mania: boolean;
        storyboard: boolean;
    }
}

export interface UserOpenInfo extends UserInfo {
    invites?: TeamInvitationInfo[];
    team: TeamInfo | null;
    pickemPoints: number;
    rank: number;
    badges: number;
    pp: number;
    openStaff: {
        scheduler: boolean;
        mappooler: boolean;
        mapper: boolean;
        testplayer: boolean;
        scrim: boolean;
        advisor: boolean;
        streamer: boolean;
        referee: boolean;
    }
}

export interface UserInfo {
    corsaceID: number;
    discord: {
        avatar: string;
        userID: string;
        username: string;
    };
    osu: {
        avatar: string;
        userID: string;
        username: string;
        otherNames: string[];
    };
    staff: {
        corsace: boolean;
        headStaff: boolean;
        staff: boolean;
    };
    joinDate: Date;
    lastLogin: Date;
    canComment: boolean;
}

export interface UserChoiceInfo {
    corsaceID: number;
    username: string;
    avatar: string;
    userID: string;
    otherNames: string[];
    chosen: boolean;
}

export interface User {
    ID: number;
    discord: OAuth;
    osu: OAuth;
    registered: Date;
    lastLogin: Date;
    mcaEligibility: Eligibility[];
    beatmapsets: Beatmapset[];
    canComment: boolean;
}

export interface OAuth {
    userID: string;
    username: string;
    avatar: string;
    dateAdded: Date;
    lastVerified: Date;
}
