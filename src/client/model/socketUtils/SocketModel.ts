import {getSocket} from "../../AsyncSocketClient";
import {EventManager} from "../../../services/EventManager";

export class SocketModel {
    protected socket = getSocket();
    protected eventManager: EventManager = new EventManager();
}
