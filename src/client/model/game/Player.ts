import {SocketField} from "../socketUtils/SocketField";
import {SocketModel} from "../socketUtils/SocketModel";
import {IPlayerData} from "../../../_types/game/IPlayerData";
import {IDataHook} from "model-react";
import {ISocketResponse} from "../_types/ISocketResponse";

export class Player extends SocketModel {
    protected ID: string;
    protected name: SocketField<string>;

    protected score: SocketField<number>;
    protected hand: SocketField<string[]>;
    protected selection: SocketField<string[]>;

    /**
     * Creates a new player
     * @param ID The ID of the player
     */
    protected constructor(ID: string) {
        super();
        this.ID = ID;
    }

    /**
     * Initializes this player
     */
    protected async initialize(): Promise<void> {
        const playerData = (await this.socket.emitAsync(
            `players/${this.ID}/retrieve`
        )) as IPlayerData;
        this.name = new SocketField(`players/${this.ID}/setName`, playerData.name);
        this.score = new SocketField(`players/${this.ID}/setScore`, playerData.score);
        this.hand = new SocketField(`players/${this.ID}/setHand`, playerData.hand || []);
        this.selection = new SocketField(
            `players/${this.ID}/setSelection`,
            playerData.selection
        );
    }

    /**
     * Creates a new player with the given ID
     * @param ID The ID of the player
     * @returns The created player
     */
    public static async create(ID: string): Promise<Player> {
        const player = new Player(ID);
        await player.initialize();
        return player;
    }

    // Getters
    /**
     * Retrieves the ID of the player
     * @returns The ID
     */
    public getID(): string {
        return this.ID;
    }

    /**
     * Retrieves the name of the player
     * @param hook The hook to subscribe to changes
     * @returns The name of the player
     */
    public getName(hook: IDataHook): string {
        return this.name.get(hook);
    }

    /**
     * Retrieves the score of the player
     * @param hook The hook to subscribe to changes
     * @returns The score of the player
     */
    public getScore(hook: IDataHook): number {
        return this.score.get(hook);
    }

    /**
     * Retrieves the hand of the player
     * @param hook The hook to subscribe to changes
     * @returns The hand of the player
     */
    public getHand(hook: IDataHook): string[] {
        return this.hand.get(hook);
    }

    /**
     * Retrieves the selection of the player
     * @param hook The hook to subscribe to changes
     * @returns The selection of the player
     */
    public getSelection(hook: IDataHook): string[] {
        return this.selection.get(hook);
    }

    /**
     * Checks whether this player is equivalent to the passed player
     * @param player The player to compare with
     * @returns Whether these players are the same
     */
    public is(player: Player | undefined | null): boolean {
        return this.getID() == player?.getID();
    }

    /**
     * Retrieves whether the passed cards correspond to the user's selection
     * @param cards The cards to check
     * @param hook The hook to subscribe to changes
     * @returns Whether they correspond
     */
    public hasSelection(cards: string[], hook: IDataHook): boolean {
        const selection = this.getSelection(hook);
        return (
            cards.length > 0 &&
            selection.length == cards.length &&
            cards.reduce((same, card, i) => same && card == selection[i], true)
        );
    }

    // Setters
    /**
     * Sets the name of the player
     * @param name The name of the player
     * @returns The response of the server
     */
    public async setName(name: string): Promise<ISocketResponse> {
        return this.name.set(name);
    }

    /**
     * Sets the selection of the player
     * @param selection The selection
     * @returns The response of the server
     */
    public async setSelection(selection: string[]): Promise<ISocketResponse> {
        return this.selection.set(selection);
    }
}
