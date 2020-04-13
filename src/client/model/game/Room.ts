import {Field, IDataHook} from "model-react";
import {Player} from "./Player";
import {IRoomData} from "../../../_types/game/IRoomData";
import {SocketModel} from "../socketUtils/SocketModel";
import {ISocketResponse} from "../_types/ISocketResponse";
import {CardsSelection} from "./CardsSelection";
import {SocketField} from "../socketUtils/SocketField";

export class Room extends SocketModel {
    protected ID: string;

    protected players = new Field([] as Player[]);
    protected cardsSelection: CardsSelection;

    protected judge: SocketField<null | Player, any>;
    protected selectedQuestion: SocketField<string>;
    protected selectedAnswer: SocketField<null | string[]>;
    protected revealed: SocketField<boolean>;

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
        this.revealed = new SocketField(
            `rooms/${this.ID}/setRevealed`,
            roomData.revealed
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
     * Retrieves whether cards are revealed
     * @param hook The hook to track changes
     * @returns Whether cards are revealed
     */
    public isRevealed(hook: IDataHook): boolean {
        return this.revealed.get(hook);
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
     * Reveals all the selected cards, only available if this client is judging
     * @returns The server's response
     */
    public async reveal(): Promise<ISocketResponse> {
        return this.socket.emitAsync(`rooms/${this.ID}/reveal`);
    }

    /**
     * Continues to the next round,only available if this client is admin
     * @returns The server's response
     */
    public async resetDeck(): Promise<ISocketResponse> {
        return this.socket.emitAsync(`rooms/${this.ID}/resetDeck`);
    }
}
