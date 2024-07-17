interface Command {
    id: number;
    commandNumberId: number;
    customId: string | null;
    minTime: string;
    maxTime: string;
    source: string;
    sourceId: string | null;
    target: string;
    targetId: string | null;
    type: string;
    link: string;
    linkSitting: string | null;
    playerId: string;
    playerName: string | null;
    world: string | null;
    attackTime: string | null;
    deleted: boolean;
}
