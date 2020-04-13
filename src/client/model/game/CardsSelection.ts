import {Room} from "./Room";
import {SocketModel} from "../socketUtils/SocketModel";
import {ICardSelectionData} from "../../../_types/game/ICardSelectionData";
import {ICardPackData} from "../../../_types/game/ICardPackData";
import {SocketField} from "../socketUtils/SocketField";
import {IDataHook} from "model-react";
import {ISocketResponse} from "../_types/ISocketResponse";

export class CardsSelection extends SocketModel {
    protected room: Room;
    protected availablePacks: ICardPackData[];
    protected selectedPacks: SocketField<ICardPackData[]>;

    /**
     * Creates a new cards selection
     * @param room The room that this selection is for
     */
    protected constructor(room: Room) {
        super();
        this.room = room;
    }

    /**
     * Initializes this room
     */
    protected async initialize(): Promise<void> {
        const selectionData = (await this.socket.emitAsync(
            `cardSelection/${this.room.getID()}/retrieve`
        )) as ICardSelectionData;

        this.availablePacks = selectionData.availablePacks;
        this.selectedPacks = new SocketField(
            `cardSelection/${this.room.getID()}/selectionChange`,
            selectionData.selection
        );
    }

    /**
     * Creates a new instance of a cards selection
     * @param room The room this selection is for
     * @returns The created selection
     */
    public static async create(room: Room): Promise<CardsSelection> {
        const cardsSelection = new CardsSelection(room);
        await cardsSelection.initialize();
        return cardsSelection;
    }

    // Getters
    /**
     * Retrieves the selected packs
     * @param hook The data hook to subscribe to changes
     * @returns The selected card packs
     */
    public getSelection(hook: IDataHook): ICardPackData[] {
        return this.selectedPacks.get(hook);
    }

    /**
     * Retrieves the available packs
     * @returns The available packs
     */
    public getAvailable(): ICardPackData[] {
        return this.availablePacks;
    }

    // Setters
    /**
     * Sets the new selection
     * @param selection The new pack selection
     * @returns The server response
     */
    public async setSelection(selection: ICardPackData[]): Promise<ISocketResponse> {
        return this.selectedPacks.set(selection);
    }
}
