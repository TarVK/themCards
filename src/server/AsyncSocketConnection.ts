import {listen} from "socket.io";
import {domain} from "../config";
import {Server as HTTPServer} from "http";
import {ISome} from "../_types/ISome";

export class AsyncSocketConnection {
    protected socket: SocketIO.Socket;

    // A mapping from listeners passed to the on and off events of this class
    // to listeners passed to the socket
    protected listenerMapping: {
        [message: string]: [
            (...args: any[]) => void,
            (...args: any[]) => any | Promise<any>,
            string
        ][];
    };

    /**
     * Creates a new socket connection
     * @param socket The socket.io socket
     */
    protected constructor(socket: SocketIO.Socket) {
        this.socket = socket;
        this.listenerMapping = {};
    }

    /**
     * Adds a listener to a specific message
     * @param message The message to add the listener to
     * @param listener The listener to be added
     * @param label A label for the added listener
     */
    public on<T extends any[], R extends ISome>(
        message: string,
        listener: (...args: T) => void | R | Promise<R>,
        label: string = ""
    ): void {
        // Create the listener for the socket
        const l = (...args: T) => {
            // Forward the event
            const resp = listener(...args);

            // If the response is not undefined, return this as through a callback as a response
            if (resp !== undefined) {
                const last = args[args.length - 1];
                if (last instanceof Function) {
                    if (resp instanceof Promise) {
                        resp.then(last);
                    } else {
                        last(resp);
                    }
                }
            }
        };

        // Add the listener to the socket
        this.socket.on(message, l);

        // Store the mapping in case the listener should later be removed
        if (!this.listenerMapping[message]) this.listenerMapping[message] = [];
        this.listenerMapping[message].push([l, listener, label]);
    }

    /**
     * Removes a listener from a specific message
     * @param message The message to remove the listener from
     * @param listener The listener to be removed
     */
    public off<T extends any[]>(message: string, listener: (...args: T) => void): void;

    /**
     * Removes a listener from a specific message
     * @param message The message to remove the listener from
     * @param label The label of the listener to be removed
     */
    public off<T extends any[]>(message: string, label: string): void;
    public off<T extends any[]>(
        message: string,
        listener: string | ((...args: T) => void)
    ): void {
        // Look up the listener function that maps to this
        const mappings = this.listenerMapping[message];
        if (!mappings) return;

        const mapping =
            typeof listener == "string"
                ? mappings.find(([, , label]) => label == listener)
                : mappings.find(([, source]) => source == listener);
        if (!mapping) return;

        // Remove the function that maps to the listener
        this.socket.off(message, mapping[0]);
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
     * Starts a socket server
     * @param listener The callback for when a connection is created
     * @param server The http server to use
     */
    public static startServer(
        listener: (connection: AsyncSocketConnection) => void,
        server?: HTTPServer
    ): void {
        const io = listen(server || domain.socket.port, {path: "/cards"});
        io.on("connection", client => {
            listener(new AsyncSocketConnection(client));
        });
    }
}
