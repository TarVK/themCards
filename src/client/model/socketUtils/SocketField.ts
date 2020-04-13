import {Field, ActionState, IDataHook} from "model-react";
import {getSocket} from "../../AsyncSocketClient";
import {ISocketResponse} from "../_types/ISocketResponse";
import {ISerializer} from "../_types/ISerializer";

export class SocketField<T, S extends ISerializer<any, any> = ISerializer<T, T>> {
    protected field: Field<T>;
    protected changeState = new ActionState<ISocketResponse>();
    protected message: string;
    protected socket = getSocket();
    protected channel: S;

    /**
     * Creates a new socket field
     * @param message The message to synchronize over
     * @param initial The initial value of the field
     */
    public constructor(
        message: string,
        initial: T,
        channel: S = {
            serialize: d => d,
            deserialize: d => d,
        } as any
    ) {
        this.field = new Field(initial);
        this.message = message;
        this.socket.on(message, value => {
            this.field.set(channel.deserialize(value));
        });
        this.channel = channel;
    }

    /**
     * Retrieves the current value of the field
     * @param hook The hook to subscribe to changes
     * @returns The current value
     */
    public get(hook: IDataHook): T {
        this.changeState.getLatest(hook);
        return this.field.get(hook);
    }

    /**
     * Changes the value of this field
     * @param value The new value of the field
     */
    public async set(value: T): Promise<ISocketResponse> {
        return this.changeState.addAction(async () => {
            try {
                const resp = await this.socket.emitAsync(
                    this.message,
                    this.channel.serialize(value)
                );
                if (!resp.success) throw resp;
                return resp;
            } catch (e) {
                throw {
                    success: false,
                    errorMessage: "Something went wrong while connecting to the server",
                    errorID: 503,
                };
            }
        }, true);
    }
}
