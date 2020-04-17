import {AsyncSocketConnection} from "../AsyncSocketConnection";
import {uuid} from "uuidv4";
import {Room} from "./Room";
import {IPlayerData} from "../../_types/game/IPlayerData";
import {AnswerCard} from "./cards/AnswerCard";
import {withErrorHandling} from "../services/withErrorHandling";

export class Player {
    protected ID: string = uuid();
    protected socket: AsyncSocketConnection;

    // The name the player chose for him/her self
    protected name: string = "Guest" + Math.floor(Math.random() * 1e3);

    // The room this player is currently in
    protected room: Room | null;

    protected score = 0;
    protected hand = [] as AnswerCard[];
    protected selection = [] as AnswerCard[];

    /**
     * Creates a new player from a socket
     * @param socket The socket to create a player for
     */
    public constructor(socket: AsyncSocketConnection) {
        this.socket = socket;
        this.initSocketListener();
    }

    // Setup
    /**
     * Listens for socket events affecting the player's properties
     */
    protected initSocketListener() {
        this.socket.on(`players/${this.ID}/setName`, (name: string) =>
            withErrorHandling(() => {
                this.setName(name);
                return {success: true};
            })
        );
        this.socket.on(`players/${this.ID}/setSelection`, (selection: string[]) =>
            withErrorHandling(() => {
                this.setSelection(selection);
                return {success: true};
            })
        );

        // Make sure the player can request their own data
        this.share(this);
    }

    /**
     * Sets up listeners such that this player data can be retrieved by the other player
     * @param player The other player to share the data with
     */
    public share(player: Player): void {
        player.getSocket().on(
            `players/${this.ID}/retrieve`,
            (): IPlayerData =>
                withErrorHandling(() => ({
                    ID: this.ID,
                    name: this.name,
                    score: this.score,
                    selection: this.selection.map(card => card.getText()),
                    hand:
                        player == this
                            ? this.hand.map(card => card.getText())
                            : undefined,
                })),
            this.ID
        );
    }

    /**
     * Removes all the listeners from the given player related to this player
     * @param player The player to remove the listeners from
     */
    public unshare(player: Player): void {
        player.getSocket().off(`players/${this.ID}/retrieve`, this.ID);
    }

    // Getters
    /**
     * Retrieves the socket that can be used for communication with this player
     * @returns THe socket
     */
    public getSocket(): AsyncSocketConnection {
        return this.socket;
    }

    /**
     * Retrieves the identifier of this player
     * @returns The identifier
     */
    public getID(): string {
        return this.ID;
    }

    /**
     * Retrieves the current name of this player
     * @returns The name
     */
    public getName(): string {
        return this.name;
    }

    /**
     * Retrieves the score of this player
     * @returns The score
     */
    public getScore(): number {
        return this.score;
    }

    /**
     * Retrieves the hand of the player
     * @returns The hand
     */
    public getHand(): AnswerCard[] {
        return this.hand;
    }

    /**
     * Retrieves the selection of the player
     * @returns The selection
     */
    public getSelection(): AnswerCard[] {
        return this.selection;
    }

    /**
     * Retrieves the room that the player is currently in
     * @returns The room
     */
    public getRoom(): Room | null {
        return this.room;
    }

    // Setters
    /**
     * Sets the room the player is now in,
     * also removes the player from the previous room if he/she is still connected
     * and adds the player to the new room if he/she isn't yet added
     * @param room The room that the player was moved to
     */
    public setRoom(room: Room | null): void {
        if (room == this.room) return;

        if (this.room) this.room.removePlayer(this);
        this.room = room;
        this.setScore(0);
        if (this.room) this.room.addPlayer(this);
    }

    /**
     * Sets the name of this player
     * @param name The new name of the player
     */
    public setName(name: string): void {
        this.name = name;
        this.broadcast(`players/${this.ID}/setName`, name);
    }

    /**
     * Sets the score of this player
     * @param score The new score
     */
    public setScore(score: number): void {
        this.score = score;
        this.broadcast(`players/${this.ID}/setScore`, score);
    }

    /**
     * Sets the selected cards of the player
     * @param selection The new selection
     */
    public setSelection(selection: string[] | AnswerCard[]): void {
        const allCards = [...this.hand, ...this.selection];
        if (typeof selection[0] == "string") {
            this.selection = (selection as string[])
                .map(card => allCards.find(c => c.getText() == card))
                .filter(card => card != null) as AnswerCard[];
        } else {
            this.selection = (selection as AnswerCard[]).filter(card =>
                allCards.includes(card)
            );
        }

        this.broadcast(
            `players/${this.ID}/setSelection`,
            this.selection.map(card => card.getText())
        );

        // Update the hand to not include the selection
        this.setHand(allCards.filter(card => !this.selection.includes(card)));
    }

    /**
     * Clears the selected cards of the player
     */
    public clearSelection(): void {
        this.selection = [];
        this.broadcast(
            `players/${this.ID}/setSelection`,
            this.selection.map(card => card.getText())
        );
    }

    /**
     * Sets the hand of the player
     * @param hand The new hand
     */
    public setHand(hand: AnswerCard[]): void {
        this.hand = hand;
        this.getSocket().emit(
            `players/${this.ID}/setHand`,
            this.hand.map(card => card.getText())
        );
    }

    // Utility
    /**
     * Broadcasts a message to all players in the room this player is part of
     * @param message The message to be broadcasted
     * @param args The arguments to supply
     */
    protected broadcast<T extends any[]>(message: string, ...args: T): void {
        if (this.room) this.room.broadcast(message, ...args);
    }
}
