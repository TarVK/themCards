import {domain} from "../config";
import {connect} from "socket.io-client";

export class AsyncSocketClient {
    protected socket: SocketIOClient.Socket;

    /**
     * Creates a new asynchronous socket client
     */
    public constructor() {
        this.socket = connect(
            domain.socket.port
                ? `${domain.socket.address}:${domain.socket.port}`
                : domain.socket.address,
            {path: "/cards"}
        );
    }

    /**
     * Adds a listener to a specific message
     * @param message The message to add the listener to
     * @param listener The listener to be added
     */
    public on<T extends any[]>(message: string, listener: (...args: T) => void): void {
        this.socket.on(message, listener);
    }

    /**
     * Removes a listener from a specific message
     * @param message The message to remove the listener from
     * @param listener The listener to be removed
     */
    public off<T extends any[]>(message: string, listener: (...args: T) => void): void {
        this.socket.off(message, listener);
    }

    /**
     * Emits data to the server
     * @param message The message to emit data to
     * @param args The arguments to pass to the message
     */
    public emit<T extends any[]>(message: string, ...args: T): void {
        this.socket.emit(message, ...args);
    }

    /**
     * Emits data to the server
     * @param message The message to emit data to
     * @param args The arguments to pass to the message
     * @returns The response message
     */
    public async emitAsync<T extends any[], R extends any>(
        message: string,
        ...args: T
    ): Promise<R> {
        return new Promise((res, rej) => {
            try {
                this.socket.emit(message, ...args, res);
            } catch (e) {
                rej(e);
            }
        });
    }
}

let socket: AsyncSocketClient;
/**
 * Retrieves a socket connection
 * @returns The socket
 */
export const getSocket = () => {
    if (!socket) socket = new AsyncSocketClient();
    return socket;
};
