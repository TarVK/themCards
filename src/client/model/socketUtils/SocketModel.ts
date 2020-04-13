import {getSocket} from "../../AsyncSocketClient";

export class SocketModel {
    protected socket = getSocket();
}
