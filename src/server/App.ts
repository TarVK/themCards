import {Server as HTTPServer} from "http";
import {AsyncSocketConnection} from "./AsyncSocketConnection";
import {Room} from "./game/Room";
import {Player} from "./game/Player";
import {CardPack} from "./game/cards/CardPack";

// All the rooms currently being used
const rooms: {
    all: {[ID: string]: Room};
    available: {[ID: string]: Room};
} = {all: {}, available: {}};

/**
 * Retrieves a room with the given ID, or a random room if no ID was specified
 * @param ID The ID of the room to get
 * @param private Whether the room should be private
 * @returns The requested room
 */
function getRoom(ID?: string, privat: boolean = false): Room {
    if (ID) {
        // If the ID was specified, return that room, creating it if needed
        let room = rooms.all[ID];
        if (!room) {
            room = rooms.all[ID] = new Room(ID, privat);
            if (!privat) rooms.available[ID] = room;
        }
        return room;
    } else {
        // If no ID was specified, return the first available room, creating one if needed
        const availableRooms = Object.values(rooms.available);
        let room = availableRooms[Math.floor(Math.random() * availableRooms.length)];
        if (!room) {
            room = new Room();
            const ID = room.getID();
            rooms.all[ID] = room;
            if (!privat) rooms.available[ID] = room;
        }
        return room;
    }
}

/**
 * Updates the 'state' of a room;
 *  Deletes it if empty
 *  Removes from available if full
 *  Adds to available if not full
 * @param room The room to be updated
 */
function updateRoomState(room: Room): void {
    const ID = room.getID();
    const players = room.getPlayers();

    if (players.length == 0) {
        delete rooms.all[ID];
        delete rooms.available[ID];
    } else if (players.length < room.getMaxPlayerCount()) {
        if (!room.isPrivate()) rooms.available[ID] = room;
    } else {
        delete rooms.available[ID];
    }
}

/**
 * Starts the socket server
 * @param server The http server to use, or undefined to let the socket create its own server
 */
export async function startApplication(server?: HTTPServer): Promise<void> {
    // Initialize the cards
    await CardPack.load();

    // Start the socket server
    AsyncSocketConnection.startServer((con: AsyncSocketConnection) => {
        // Create a player using this connection
        const player = new Player(con);
        console.log("Connected", player.getID());

        // Setup room related event listeners
        con.on("disconnect", () => {
            const room = player.getRoom();
            if (room) {
                room.removePlayer(player);
                updateRoomState(room);
            }
            console.log("Disconnected", player.getID());
        });
        con.on("players/me", () => {
            return player.getID();
        });
        con.on("rooms/connect", (ID?: string) => {
            // Make sure there is space in the room
            const newRoom = getRoom(ID);
            if (newRoom.getPlayers().length >= newRoom.getMaxPlayerCount())
                return {errorMessage: "Room already full", errorCode: 1};

            // Disconnect from the old room
            const oldRoom = player.getRoom();
            if (oldRoom) {
                oldRoom.removePlayer(player);
                updateRoomState(oldRoom);
            }

            // Connect to the new room
            newRoom.addPlayer(player);
            updateRoomState(newRoom);
            return {success: true, ID: newRoom.getID()};
        });
    }, server);
}
