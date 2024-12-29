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
    deleted: boolean;
    attackSequenceNumber: number;
    totalCommandsFromSource: number;
}

export type ColumnNames = {
    commandNumberId: string,
    minTime: string,
    maxTime: string,
    attackTime: string,
    source: string,
    target: string,
    type: string,
    commandCount: string,
    link: string,
    world: string,
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

export interface Report {
    id: number;
    playerId: number;
    reportId: string;
    createdAt: string;
}

export interface PaginatedReportsResponse {
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    content: Report[];
}

export interface Player {
    playerId: string;
    playerName: string;
}


