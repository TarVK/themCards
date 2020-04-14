import {Player} from "./game/Player";
import {Room} from "./game/Room";
import {ActionState, IDataHook, DataLoader} from "model-react";
import {SocketModel} from "./socketUtils/SocketModel";

export class ApplicationClass extends SocketModel {
    protected player = new DataLoader<Player | undefined>(async () => {
        const ID = (await this.socket.emitAsync("players/me")) as string;
        return await Player.create(ID);
    }, undefined);

    protected room = new ActionState<Room>();

    /**
     * Joins a room with the given ID, or a random room if no ID is specified
     * @param ID The room ID
     */
    public async joinRoom(ID?: string): Promise<Room> {
        const room = this.getRoom(null);
        if (room && room?.getID() == ID) return room;

        return this.room.addAction(async () => {
            const resp = await this.socket.emitAsync("rooms/connect", ID);
            if (resp.success) {
                location.hash = resp.ID;
                return Room.joinRoom(resp.ID);
            } else {
                throw resp;
            }
        }, true);
    }

    // Getters
    /**
     * Retrieves the player that this client is representing
     * @param hook The data hook
     * @returns The player or undefined if still loading
     */
    public getPlayer(hook: IDataHook): Player | undefined {
        return this.player.get(hook);
    }

    /**
     * Retrieves the room that is currently connected to
     * @param hook The data hook
     * @returns The room
     */
    public getRoom(hook: IDataHook): Room | undefined {
        return this.room.getLatest(hook);
    }

    /**
     * Retrieves whether this client is an admin
     * @param hook The data hook to subscribe to changes
     * @returns Whether player is admin
     */
    public isAdmin(hook: IDataHook): boolean {
        const room = this.getRoom(hook);
        const admin = room?.getAdmin(hook);
        const player = this.getPlayer(hook);
        return player?.is(admin) || false;
    }

    /**
     * Retrieves whether this client is currently the judge
     * @param hook The data hook to subscribe to changes
     * @returns Whether player is judge
     */
    public isJudge(hook: IDataHook): boolean {
        const room = this.getRoom(hook);
        const judge = room?.getJudge(hook);
        const player = this.getPlayer(hook);
        return player?.is(judge) || false;
    }
}

export const Application = new ApplicationClass();
(window as any).a = Application; // For easy debugging
