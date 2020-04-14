import {Field, IDataHook} from "model-react";
import {Player} from "./Player";
import {IRoomData} from "../../../_types/game/IRoomData";
import {SocketModel} from "../socketUtils/SocketModel";
import {ISocketResponse} from "../_types/ISocketResponse";
import {CardsSelection} from "./CardsSelection";
import {SocketField} from "../socketUtils/SocketField";
import {IAnsweringPlayersData} from "../_types/IAnswerPlayersData";
import {IAnsweringPlayers} from "../_types/IAnswerPlayers";

export class Room extends SocketModel {
    protected ID: string;

    protected accessibility: SocketField<{privat: boolean; maxPlayerCount: number}>;
    protected handSize: SocketField<number>;

    protected players = new Field([] as Player[]);
    protected cardsSelection: CardsSelection;

    protected judge: SocketField<null | Player, any>;
    protected answeringPlayers: SocketField<{player: Player; revealed: boolean}[], any>;

    protected selectedQuestion: SocketField<string>;
    protected selectedAnswer: SocketField<null | string[]>;

    /**
     * Creates a new room with the given ID
     * @param ID The ID of the room
     */
    protected constructor(ID: string) {
        super();
        this.ID = ID;
    }

    /**
     * Initializes this room
     */
    protected async initialize(): Promise<void> {
        const roomData = (await this.socket.emitAsync(
            `rooms/${this.ID}/retrieve`
        )) as IRoomData;

        const players = await Promise.all(
            roomData.playerIDs.map(ID => Player.create(ID))
        );
        this.players.set([...players, ...this.players.get(null)]);
        this.cardsSelection = await CardsSelection.create(this);
        this.selectedQuestion = new SocketField(
            `rooms/${this.ID}/setQuestion`,
            roomData.question
        );
        this.selectedAnswer = new SocketField(
            `rooms/${this.ID}/setAnswer`,
            roomData.answer
        );
        this.handSize = new SocketField(
            `rooms/${this.ID}/setHandSize`,
            roomData.handSize
        );
        this.accessibility = new SocketField(
            `rooms/${this.ID}/setAccessibility`,
            roomData.accessibility
        );

        const deserializeAnsweringPlayers = (players: IAnsweringPlayersData) =>
            players
                .map(({playerID, revealed}) => ({
                    player: this.players.get(null).find(p => p.getID() == playerID),
                    revealed,
                }))
                .filter(({player}) => player) as IAnsweringPlayers;
        this.answeringPlayers = new SocketField(
            `rooms/${this.ID}/setAnsweringPlayers`,
            deserializeAnsweringPlayers(roomData.answeringPlayers),
            {
                serialize: (players: IAnsweringPlayers) =>
                    players.map(({player, revealed}) => ({
                        playerID: player.getID(),
                        revealed,
                    })),
                deserialize: (players: IAnsweringPlayersData) =>
                    deserializeAnsweringPlayers(players),
            }
        );
        this.judge = new SocketField(
            `rooms/${this.ID}/setJudge`,
            this.players.get(null).find(p => p.getID() == roomData.judgeID) || null,
            {
                serialize: (player: Player) => player.getID(),
                deserialize: (playerID: string) =>
                    this.players.get(null).find(p => p.getID() == playerID) || null,
            }
        );
    }

    /**
     * Sets up all the event listeners
     */
    protected setupListeners(): void {
        this.socket.on(`rooms/${this.ID}/addPlayer`, async (ID: string) => {
            const newPlayer = await Player.create(ID);
            this.players.set([...this.players.get(null), newPlayer]);
        });
        this.socket.on(`rooms/${this.ID}/removePlayer`, (ID: string) => {
            this.players.set(this.players.get(null).filter(p => p.getID() != ID));
        });
        this.socket.on(`rooms/${this.ID}/kickPlayer`, (ID: string) => {
            const player = this.players.get(null).find(p => p.getID() == ID);
            this.eventManager.emit("kick", player);
        });
    }

    /**
     * Creates a new instance of a room and joins it
     * @param ID The ID of the room to join
     * @returns The room that was joined
     */
    public static async joinRoom(ID: string): Promise<Room> {
        const room = new Room(ID);
        room.setupListeners();
        await room.initialize();
        return room;
    }

    // Getters
    /**
     * Retrieves the ID of this room
     * @returns The ID
     */
    public getID(): string {
        return this.ID;
    }

    /**
     * Retrieves the players currently in the room
     * @param hook The data hook to subscribe to changes
     * @returns The players
     */
    public getPlayers(hook: IDataHook): Player[] {
        return this.players.get(hook);
    }

    /**
     * Retrieves the other players in the room
     * @param me The player this client represents
     * @param hook The data hook to subscribe to changes
     * @return The players
     */
    public getOtherPlayers(me: Player, hook: IDataHook): Player[] {
        return this.players.get(hook).filter(p => p != me);
    }

    /**
     * Retrieves the player that is currently judging
     * @param hook The data hook to subscribe to changes
     * @returns The judge
     */
    public getJudge(hook: IDataHook): Player | null {
        return this.judge.get(hook);
    }

    /**
     * Retrieves the admin of the room
     * @param hook The data hook to subscribe to changes
     * @returns The admin
     */
    public getAdmin(hook: IDataHook): Player {
        return this.players.get(hook)[0];
    }

    /**
     * Retrieves the current question
     * @param hook The data hook to subscribe to changes
     * @returns The question
     */
    public getQuestion(hook: IDataHook): string {
        return this.selectedQuestion.get(hook);
    }

    /**
     * Retrieves the picked answer
     * @param hook The data hook to subscribe to changes
     * @returns The answer cards
     */
    public getAnswer(hook: IDataHook): string[] | null {
        return this.selectedAnswer.get(hook);
    }

    /**
     * Retrieves the picked answer filled into the question
     * @param hook The data hook to subscribe to changes
     * @returns The answer with questions
     */
    public getFilledInAnswer(hook: IDataHook): string | null {
        const answer = this.selectedAnswer.get(hook);
        if (answer == null) return null;
        const parts = [...answer];
        return this.selectedQuestion.get(hook).replace(/_/g, () => parts.shift() || "");
    }

    /**
     * Retrieves the selection of playing cards
     * @returns The cards selection
     */
    public getCardSelection(): CardsSelection {
        return this.cardsSelection;
    }

    /**
     * Retrieves whether any cards are revealed
     * @param hook The hook to track changes
     * @returns Whether cards are revealed
     */
    public isRevealed(hook: IDataHook): boolean {
        return this.answeringPlayers
            .get(hook)
            .reduce((anyRevealed, {revealed}) => anyRevealed || revealed, false);
    }

    /**
     * Retrieves whether all cards are revealed
     * @param hook The hook to track changes
     * @returns Whether cards are revealed
     */
    public areAllRevealed(hook: IDataHook): boolean {
        return this.answeringPlayers
            .get(hook)
            .reduce(
                (anyRevealed, {player, revealed}) =>
                    anyRevealed && (player.getSelection(hook).length == 0 || revealed),
                true
            );
    }

    /**
     * Retrieves the players that are currently answering, and whether their answer is revealed
     * @param hook The hook to subscribe to changes
     * @returns The answering players
     */
    public getAnsweringPlayers(hook: IDataHook): IAnsweringPlayers {
        return this.answeringPlayers.get(hook);
    }

    /**
     * Retrieves the number of answer cards that should be played
     * @param hook The hook to track changes
     * @returns The number of answer cards that should be played
     */
    public getRequiredAnswerCount(hook: IDataHook): number {
        return this.selectedQuestion.get(hook)?.match(/_/g)?.length || 0;
    }

    /**
     * Retrieves the number of players that played the correct number of cards
     * @param hook The hook to track changes
     * @returns The number of players that are ready
     */
    public getReadyCount(hook: IDataHook): number {
        const requiredCount = this.getRequiredAnswerCount(hook);
        return this.getPlayers(hook).reduce(
            (count, player) =>
                count + (player.getSelection(hook).length == requiredCount ? 1 : 0),
            0
        );
    }

    /**
     * Retrieves the hand size of all players
     * @param hook The hook to track changes
     * @returns The hand size
     */
    public getHandSize(hook: IDataHook): number {
        return this.handSize.get(hook);
    }

    /**
     * Retrieves whether this room is private
     * @param hook The hook to track changes
     * @returns Whether private
     */
    public isPrivate(hook: IDataHook): boolean {
        return this.accessibility.get(hook).privat;
    }

    /**
     * Retrieves the maximum number of players for this room
     * @param hook The hook to track changes
     * @returns The max number of players
     */
    public getMaxPlayerCount(hook: IDataHook): number {
        return this.accessibility.get(hook).maxPlayerCount;
    }

    // Actions
    /**
     * Kicks the specified player, only available if this client is admin
     * @param player The player to be kicked
     * @returns The server response
     */
    public async kick(player: Player): Promise<ISocketResponse> {
        return this.socket.emitAsync(`rooms/${this.ID}/kickPlayer`, player.getID());
    }

    /**
     * Selects the answer of the specified player, only available if this client is judging
     * @param player The player to select the answers of
     * @returns The server's response
     */
    public async pickAnswer(player: Player): Promise<ISocketResponse> {
        return this.socket.emitAsync(`rooms/${this.ID}/pickAnswer`, player.getID());
    }

    /**
     * Continues to the next round, only available if this client is judging
     * @returns The server's response
     */
    public async nextRound(): Promise<ISocketResponse> {
        return this.socket.emitAsync(`rooms/${this.ID}/nextRound`);
    }

    /**
     * Reveals the selected cards of a player, only available if this client is judging
     * @param player The player whose cards to reveal
     * @returns The server's response
     */
    public async revealAnswer(player: Player): Promise<ISocketResponse> {
        return this.socket.emitAsync(`rooms/${this.ID}/reveal`, player.getID());
    }

    /**
     * Continues to the next round,only available if this client is admin
     * @returns The server's response
     */
    public async resetDeck(): Promise<ISocketResponse> {
        return this.socket.emitAsync(`rooms/${this.ID}/resetDeck`);
    }

    /**
     * Sets the maximum number of players allowed in this room
     * @param count The maximum number of allowed players
     */
    public setMaxPlayerCount(count: number): void {
        this.accessibility.set({...this.accessibility.get(null), maxPlayerCount: count});
    }

    /**
     * Sets whether this room is private
     * @param private Whether private
     */
    public setPrivate(privat: boolean): void {
        this.accessibility.set({...this.accessibility.get(null), privat});
    }

    /**
     * Sets the hand size of all players
     * @param count The hand size
     */
    public setHandSize(size: number): void {
        this.handSize.set(size);
    }

    // Event handlers
    /**
     * Adds an event listener to detect when a player is kicked
     * @param eventType The kick event type
     * @param listener The listener to register
     * @param label A label for the listener
     */
    public on(
        eventType: "kick",
        listener: (player: Player) => void,
        label?: string
    ): void;
    public on(
        eventType: string,
        listener: (...args: any[]) => void,
        label?: string
    ): void {
        this.eventManager.on(eventType, listener, label);
    }

    /**
     * Removes a listener from the manager
     * @param eventType The type of event that was listened to
     * @param label The label of the listener
     * @returns Whether a listener was found and removed
     */
    public off(eventType: "kick", label: string): boolean;

    /**
     * Removes a listener from the manager
     * @param eventType The type of event that was listened to
     * @param listener The listener to be removed
     * @returns Whether a listener was found and removed
     */
    public off(eventType: "kick", listener: (...args: any[]) => void): boolean;
    public off(
        eventType: string,
        listener: ((...args: any[]) => void) | string
    ): boolean {
        return this.eventManager.off(eventType, listener as any);
    }
}
