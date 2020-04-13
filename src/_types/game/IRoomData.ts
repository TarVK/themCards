export type IRoomData = {
    ID: string;
    playerIDs: string[];
    maxPlayerCount: number;
    judgeID: string | null;
    question: string;
    revealed: boolean;
    answer: string[] | null;
};
