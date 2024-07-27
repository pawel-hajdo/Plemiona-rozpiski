interface Command {
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
    attackTime: string | null;
    commandCount: string
    deleted: boolean;
}
