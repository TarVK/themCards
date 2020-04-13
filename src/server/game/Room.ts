import {Player} from "./Player";
import {uuid} from "uuidv4";
import {IRoomData} from "../../_types/game/IRoomData";
import {CardsSelection} from "./cards/CardsSelection";
import {QuestionCard} from "./cards/QuestionCard";
import {AnswerCard} from "./cards/AnswerCard";

export class Room {
    protected ID: string;
    protected maxPlayerCount: number = 8;
    protected handSize: number = 12;
    protected isPrivat: boolean;

    protected players: Player[] = [];
    protected cardsSelection: CardsSelection;

    protected judge: Player;
    protected revealed: boolean;
    protected selectedQuestion: QuestionCard;
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

    /**
     * Retrieves whether the cards are currently revealed
     * @returns Whether the cards are revealed
     */
    public areCardsRevealed(): boolean {
        return this.revealed;
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
            (): IRoomData => ({
                ID: this.ID,
                playerIDs: this.players.map(p => p.getID()),
                maxPlayerCount: this.maxPlayerCount,
                judgeID: this.judge?.getID() || null,
                revealed: this.revealed,
                question: this.selectedQuestion?.getText() ?? "",
                answer: this.selectedAnswer?.map(card => card.getText()) || null,
            }),
            this.ID
        );
        socket.on(
            `rooms/${this.ID}/pickAnswer`,
            (playerID: string) => {
                if (this.getJudge() != player)
                    return {errorMessage: "not permitted", errorCode: -2};
                if (this.selectedAnswer != null)
                    return {errorMessage: "answer was already selected", errorCode: 1};

                const p = this.players.find(player => player.getID() == playerID);
                if (p) this.pickAnswer(p);
                return {success: true};
            },
            this.ID
        );
        socket.on(
            `rooms/${this.ID}/nextRound`,
            () => {
                if (this.getJudge() != player)
                    return {errorMessage: "not permitted", errorCode: -2};

                this.nextRound();
                return {success: true};
            },
            this.ID
        );
        socket.on(
            `rooms/${this.ID}/reveal`,
            () => {
                if (this.getJudge() != player)
                    return {errorMessage: "not permitted", errorCode: -2};

                this.setRevealed(true);
                return {success: true};
            },
            this.ID
        );
        socket.on(
            `rooms/${this.ID}/kickPlayer`,
            (playerID: string) => {
                if (this.getAdmin() != player)
                    return {errorMessage: "not permitted", errorCode: -1};

                const p = this.players.find(player => player.getID() == playerID);
                if (p) this.kickPlayer(p);
                return {success: true};
            },
            this.ID
        );
        socket.on(
            `rooms/${this.ID}/resetDeck`,
            () => {
                if (this.getAdmin() != player)
                    return {errorMessage: "not permitted", errorCode: -1};

                this.resetDeck();
                return {success: true};
            },
            this.ID
        );

        // Share components of this room
        this.cardsSelection.share(player);

        // Stock the hand of the new player
        this.updateHand(player);
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

        // unshare components of this room
        this.cardsSelection.unshare(player);

        // Remove the player's cards
        this.clearHand(player);
    }

    /**
     * Kicks the specified player from the room
     * @param player The player to be kicked
     * @param message An optional message
     */
    public kickPlayer(player: Player, message: string = ""): void {
        this.broadcast(`rooms/${this.ID}/kickPlayer`, player.getID(), message);
        player.setRoom(null);
        if (player == this.getAdmin()) this.nextRound();
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
        this.broadcast(`rooms/${this.ID}/setJudge`, judge.getID());
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
     * Reveals the selected cards
     * @param Revealed Whether or not the cards are revealed
     */
    public setRevealed(revealed: boolean): void {
        this.revealed = revealed;
        this.broadcast(`rooms/${this.ID}/setRevealed`, revealed);
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
        this.cardsSelection.returnQuestion(this.selectedQuestion);
        this.selectQuestion();

        // Choose a new judge and hide cards
        this.selectJudge();
        this.setRevealed(false);
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
        player.setSelection([]);
        player.setHand([]);
    }

    /**
     * Resets the deck, together with all scores
     */
    public resetDeck(): void {
        // Reset all players data
        this.players.forEach(player => {
            player.setScore(0);
            player.setSelection([]);
            player.setHand([]);
        });

        // Reset the deck
        this.cardsSelection.resetDeck();

        // Start the first round
        this.nextRound();
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
}
