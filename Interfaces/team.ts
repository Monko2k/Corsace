import { UserOpenInfo } from "./user";
import { QualifierLobby } from "./qualifier";
export interface TeamInfo {
    id: number;
    name: string;
    captain: number;
    averageBWS: number;
    averagePp: number;
    teamAvatarUrl: string;
    slug: string;
    seed: "A" | "B" | "C" | "D" | null;
    rank: number;
    members: UserOpenInfo[] ;
    qualifier?: QualifierLobby | null;
}

export const nameFilter = /(nigg|fa?gg?o?t|retard|coon|pedo|gay|lesbian|fuck|sex|penis|vag)/i;