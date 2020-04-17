import {Player} from "./Player";
import {uuid} from "uuidv4";
import {IRoomData} from "../../_types/game/IRoomData";
import {CardsSelection} from "./cards/CardsSelection";
import {QuestionCard} from "./cards/QuestionCard";
import {AnswerCard} from "./cards/AnswerCard";
import {shuffleArray} from "../services/shuffleArray";
import {EventManager} from "../../services/EventManager";
import {withErrorHandling} from "../services/withErrorHandling";

export class Room {
    protected eventManager: EventManager = new EventManager();

    protected ID: string;
    protected maxPlayerCount: number = 8;
    protected handSize: number = 12;
    protected isPrivat: boolean;

    protected players: Player[] = [];
    protected cardsSelection: CardsSelection;

    // The roles players currently have
    protected answeringPlayers: {player: Player; revealed: boolean}[] = [];
    protected judge: Player;

    // The drawn question, and answer picked by the judge
    protected selectedQuestion: QuestionCard | null;
    protected selectedAnswer: AnswerCard[] | null;

    /**
     * Creates a new room for players
     * @param ID The ID of the room
     * @param isPrivate Whether this is a private room
     */
    public constructor(ID: string = uuid(), isPrivat: boolean = false) {
        this.ID = ID;
        this.isPrivat = isPrivat;
        this.cardsSelection = new CardsSelection(this);
    }

    // Getters
    /**
     * Retrieves the identifier of this room
     * @returns The identifier
     */
    public getID(): string {
        return this.ID;
    }

    /**
     * Retrieves whether this room is private
     * @returns Whether this room is private
     */
    public isPrivate(): boolean {
        return this.isPrivat;
    }

    /**
     * Retrieves the players that are in this room
     * @returns The players
     */
    public getPlayers(): Player[] {
        return this.players;
    }

    /**
     * Retrieves the current judge
     * @returns The judge
     */
    public getJudge(): Player {
        return this.judge;
    }

    /**
     * Retrieves the player that is the administrator of this room
     * @returns The administrator
     */
    public getAdmin(): Player | undefined {
        return this.players[0];
    }

    /**
     * Retrieves what the maximum number of players allowed for this room s
     * @returns The maximal number of allowed players in this room
     */
    public getMaxPlayerCount(): number {
        return this.maxPlayerCount;
    }

    // Player management
    /**
     * Adds a player to this room
     * @param player The player to be added
     */
    public addPlayer(player: Player): void {
        if (this.players.includes(player)) return;
        this.players.push(player);

        // Make sure the player knows he/she is added to this room
        player.setRoom(this);
        this.players.forEach(p => {
            if (p == player) return;
            p.share(player);
            player.share(p);
        });
        this.broadcast(`rooms/${this.ID}/addPlayer`, player.getID());

        // Setup socket listeners for the player
        const socket = player.getSocket();
        socket.on(
            `rooms/${this.ID}/retrieve`,
            (): IRoomData =>
                withErrorHandling(() => ({
                    accessibility: {
                        privat: this.isPrivat,
                        maxPlayerCount: this.maxPlayerCount,
                    },
                    handSize: this.handSize,
                    ID: this.ID,
                    playerIDs: this.players.map(p => p.getID()),
                    maxPlayerCount: this.maxPlayerCount,
                    judgeID: this.judge?.getID() || null,
                    answeringPlayers: serializeAnsweringPlayers(this.answeringPlayers),
                    question: this.selectedQuestion?.getText() ?? "",
                    answer: this.selectedAnswer?.map(card => card.getText()) || null,
                })),
            this.ID
        );

        const onlyIfJudge = (func: () => any) => {
            if (this.getJudge() != player)
                return {errorMessage: "not permitted", errorCode: -2};

            const res = withErrorHandling(func);
            if (res) return res;
            return {success: true};
        };
        socket.on(
            `rooms/${this.ID}/pickAnswer`,
            (playerID: string) =>
                onlyIfJudge(() => {
                    if (this.selectedAnswer != null)
                        return {
                            errorMessage: "answer was already selected",
                            errorCode: 1,
                        };

                    const p = this.players.find(player => player.getID() == playerID);
                    if (p) this.pickAnswer(p);
                }),
            this.ID
        );
        socket.on(
            `rooms/${this.ID}/nextRound`,
            () =>
                onlyIfJudge(() => {
                    this.nextRound();
                }),
            this.ID
        );
        socket.on(
            `rooms/${this.ID}/reveal`,
            (playerID: string) =>
                onlyIfJudge(() => {
                    const p = this.players.find(player => player.getID() == playerID);
                    if (p) this.revealAnswer(p);
                }),
            this.ID
        );

        const onlyIfAdmin = (func: () => any) => {
            if (this.getAdmin() != player)
                return {errorMessage: "not permitted", errorCode: -1};

            const res = withErrorHandling(func);
            if (res) return res;
            return {success: true};
        };
        socket.on(
            `rooms/${this.ID}/kickPlayer`,
            (playerID: string) =>
                onlyIfAdmin(() => {
                    const p = this.players.find(player => player.getID() == playerID);
                    if (p) this.kickPlayer(p);
                }),
            this.ID
        );
        socket.on(
            `rooms/${this.ID}/resetDeck`,
            () =>
                onlyIfAdmin(() => {
                    this.resetDeck();
                }),
            this.ID
        );
        socket.on(
            `rooms/${this.ID}/setAccessibility`,
            ({privat, maxPlayerCount}) =>
                onlyIfAdmin(() => {
                    this.setAccessibility(privat, Math.max(2, maxPlayerCount));
                }),
            this.ID
        );
        socket.on(
            `rooms/${this.ID}/setHandSize`,
            handSize =>
                onlyIfAdmin(() => {
                    this.setHandSize(Math.min(Math.max(2, handSize), 50));
                }),
            this.ID
        );

        // Share components of this room
        this.cardsSelection.share(player);

        this.emitAccesibilityChange();
    }

    /**
     * Removes a player from this room
     * @param client The client to be removed
     */
    public removePlayer(player: Player): void {
        const index = this.players.indexOf(player);
        if (index == -1) return;
        this.players.splice(index, 1);

        // Make sure the player knows he/she is removed from this room
        player.setRoom(null);
        this.players.forEach(p => {
            p.unshare(player);
            player.unshare(p);
        });
        this.broadcast(`rooms/${this.ID}/removePlayer`, player.getID());

        // Remove all socket listeners of this room
        const socket = player.getSocket();
        socket.off(`rooms/${this.ID}/retrieve`, this.ID);
        socket.off(`rooms/${this.ID}/pickAnswer`, this.ID);
        socket.off(`rooms/${this.ID}/nextRound`, this.ID);
        socket.off(`rooms/${this.ID}/reveal`, this.ID);
        socket.off(`rooms/${this.ID}/kickPlayer`, this.ID);
        socket.off(`rooms/${this.ID}/resetDeck`, this.ID);
        socket.off(`rooms/${this.ID}/setAccessibility`, this.ID);
        socket.off(`rooms/${this.ID}/setHandSize`, this.ID);

        // unshare components of this room
        this.cardsSelection.unshare(player);

        // Remove the player's cards
        this.clearHand(player);

        // Remove the player from answering players, and potentially move to the next round
        this.setAnsweringPlayers(
            this.answeringPlayers.filter(({player}) => this.players.includes(player))
        );
        if (player == this.getJudge()) this.nextRound();

        this.emitAccesibilityChange();
    }

    /**
     * Kicks the specified player from the room
     * @param player The player to be kicked
     * @param message An optional message
     */
    public kickPlayer(player: Player, message: string = ""): void {
        this.broadcast(`rooms/${this.ID}/kickPlayer`, player.getID(), message);
        player.setRoom(null);
        if (player == this.getJudge()) this.nextRound();
    }

    // Game
    /**
     * Updates the judge, automatically goes to the next in line if no judge is specified
     * @param judge The new judge
     */
    public selectJudge(judge?: Player): void {
        if (!judge) {
            const currentIndex = this.players.indexOf(this.judge);
            judge = this.players[(currentIndex + 1) % this.players.length];
        }

        this.judge = judge;
        this.broadcast(`rooms/${this.ID}/setJudge`, judge?.getID());
    }

    /**
     * Updates the question, automatically draws a question if none is specified
     * @param question The question to select
     */
    public selectQuestion(question?: QuestionCard): void {
        if (!question) question = this.cardsSelection.drawQuestion();
        if (this.selectedQuestion)
            this.cardsSelection.returnQuestion(this.selectedQuestion);

        this.selectedQuestion = question;
        this.broadcast(`rooms/${this.ID}/setQuestion`, question.getText());
    }

    /**
     * Selects the specified answers
     * @param answer The answer cards
     */
    public selectAnswer(answer: AnswerCard[] | null): void {
        this.selectedAnswer = answer;
        this.broadcast(
            `rooms/${this.ID}/setAnswer`,
            answer ? answer.map(card => card.getText()) : null
        );
    }

    /**
     * Sets the players that are currently answering, and whether their answer is revealed
     * @param players The answering players
     */
    public setAnsweringPlayers(players?: {player: Player; revealed: boolean}[]): void {
        if (!players) {
            players = this.players
                .filter(p => p != this.judge)
                .map(p => ({player: p, revealed: false}));
            shuffleArray(players);
        }

        this.answeringPlayers = players;
        this.broadcast(
            `rooms/${this.ID}/setAnsweringPlayers`,
            serializeAnsweringPlayers(players)
        );
    }

    /**
     * Reveals the answer of a given player
     * @param player The player whose answer to reveal
     */
    public revealAnswer(player: Player): void {
        this.setAnsweringPlayers(
            this.answeringPlayers.map(({player: p, revealed}) => ({
                player: p,
                revealed: p == player ? true : revealed,
            }))
        );
    }

    /**
     * Selects the specified player to have given the best answer
     * @param player The player whose answer was chosen
     */
    public pickAnswer(player: Player): void {
        player.setScore(player.getScore() + 1);
        this.selectAnswer(player.getSelection());
    }

    /**
     * Goes to the next round, taking care of resetting cards etc
     */
    public nextRound(): void {
        // Return the played cards
        this.players.forEach(player => {
            // Return used cards
            player
                .getSelection()
                .forEach(answer => this.cardsSelection.returnAnswer(answer));
            player.clearSelection();

            // Draw new cards
            this.updateHand(player);
        });

        // Clear the answer
        this.selectAnswer(null);

        // Return the question card, and choose a new question
        if (this.selectedQuestion)
            this.cardsSelection.returnQuestion(this.selectedQuestion);
        this.selectQuestion();

        // Choose a new judge and answering players
        this.selectJudge();
        this.setAnsweringPlayers();
    }

    /**
     * Updates the hand of a given player to have the correct number of cards
     * @param player The player whose hand to fill
     */
    protected updateHand(player: Player): void {
        const drawn = [] as AnswerCard[];
        for (var i = this.handSize - player.getHand().length; i > 0; i--) {
            const card = this.cardsSelection.drawAnswer();
            if (card) drawn.push(card);
            else {
                // No pack was selected yet, or all cards are in hands
            }
        }
        player.setHand([...player.getHand(), ...drawn]);
    }

    /**
     * Removes all the cards a player posses
     * @param player The player whose hand to clear
     */
    protected clearHand(player: Player): void {
        player.getHand().forEach(card => this.cardsSelection.returnAnswer(card));
        player.getSelection().forEach(card => this.cardsSelection.returnAnswer(card));
        player.clearSelection();
        player.setHand([]);
    }

    /**
     * Resets the deck, together with all scores
     */
    public resetDeck(): void {
        // Return the question card
        if (this.selectedQuestion)
            this.cardsSelection.returnQuestion(this.selectedQuestion);
        this.selectedQuestion = null;

        // Reset all players data
        this.players.forEach(player => {
            player.setScore(0);
            this.clearHand(player);
        });

        // Reset the deck
        this.cardsSelection.resetDeck();

        // Start the first round
        this.nextRound();
    }

    /**
     * Sets the number of cards each player has in their hand
     * @param handSize The number of cards
     */
    public setHandSize(handSize: number): void {
        this.handSize = handSize;
        this.broadcast(`rooms/${this.ID}/setHandSize`, handSize);
        this.players.forEach(player => {
            if (player.getHand().length > 0) {
                this.clearHand(player);
                this.updateHand(player);
            }
        });
    }

    /**
     * Updates the accessibility data
     * @param privat Whether this room is private
     * @param maxPlayerCount The maximal number of players in this room
     */
    public setAccessibility(privat: boolean, maxPlayerCount: number): void {
        this.isPrivat = privat;
        this.maxPlayerCount = maxPlayerCount;
        this.broadcast(`rooms/${this.ID}/setAccessibility`, {privat, maxPlayerCount});
        this.emitAccesibilityChange();
    }

    /**
     * Notifies listeners about a potential accessibility change
     */
    protected emitAccesibilityChange(): void {
        this.eventManager.emit(
            "accessibilityChange",
            this.isPrivat,
            this.maxPlayerCount,
            this.players.length
        );
    }

    // Utility
    /**
     * Broadcasts a message to all players in this room
     * @param message The message to be broadcasted
     * @param args The arguments to supply
     */
    public broadcast<T extends any[]>(message: string, ...args: T): void {
        this.players.forEach(player => {
            player.getSocket().emit(message, ...args);
        });
    }

    // Event handlers
    /**
     * Adds an event listener to detect when room data is altered
     * @param eventType The accessibility change event
     * @param listener The listener to register
     * @param label A label for the listener
     */
    public on(
        eventType: "accessibilityChange",
        listener: (privat: boolean, maxPlayerCount: number, playerCount: number) => void,
        label?: string
    ): void;
    public on(
        eventType: string,
        listener: (...args: any[]) => void,
        label?: string
    ): void {
        this.eventManager.on(eventType, listener, label);
    }

    /**
     * Removes a listener from the manager
     * @param eventType The type of event that was listened to
     * @param label The label of the listener
     * @returns Whether a listener was found and removed
     */
    public off(eventType: "accessibilityChange", label: string): boolean;

    /**
     * Removes a listener from the manager
     * @param eventType The type of event that was listened to
     * @param listener The listener to be removed
     * @returns Whether a listener was found and removed
     */
    public off(
        eventType: "accessibilityChange",
        listener: (...args: any[]) => void
    ): boolean;
    public off(
        eventType: string,
        listener: ((...args: any[]) => void) | string
    ): boolean {
        return this.eventManager.off(eventType, listener as any);
    }
}

const serializeAnsweringPlayers = (players: {player: Player; revealed: boolean}[]) =>
    players.map(({player, revealed}) => ({playerID: player.getID(), revealed}));
