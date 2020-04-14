export type IRoomData = {
    ID: string;
    accessibility: {privat: boolean; maxPlayerCount: number};
    handSize: number;
    playerIDs: string[];
    maxPlayerCount: number;
    judgeID: string | null;
    answeringPlayers: {playerID: string; revealed: boolean}[];
    question: string;
    answer: string[] | null;
};
