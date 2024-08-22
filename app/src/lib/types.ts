export interface Command {
    id: number;
    commandNumberId: number;
    minTime: string;
    maxTime: string;
    source: string;
    sourceId: string;
    target: string;
    targetId: string;
    type: string;
    playerId: string;
    world: string;
    link: string;
    attackTime: string | null;
    commandCount: string
    deleted: boolean;
}

export type ColumnNames = {
    [K in keyof Command]?: string;
}

export interface NobleData {
    source: string;
    count: number;
}

export enum AccountSittingStatus {
    PENDING = "PENDING",
    ACTIVE = "ACTIVE",
    REJECTED = "REJECTED",
    CANCELED = "CANCELED",
    ENDED = "ENDED"
}

export interface Sitting {
    id: number,
    playerId: number,
    playerName: string,
    sitterId: number,
    sitterName: string,
    world: string,
    startDate: string,
    endDate: string,
    status: AccountSittingStatus
}
