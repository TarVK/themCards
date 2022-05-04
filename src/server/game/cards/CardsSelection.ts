import {AnswerCard} from "./AnswerCard";
import {QuestionCard} from "./QuestionCard";
import {CardPack} from "./CardPack";
import {Room} from "../Room";
import {Player} from "../Player";
import {ICardSelectionData} from "../../../_types/game/ICardSelectionData";
import {ICardPackData} from "../../../_types/game/ICardPackData";
import {BlankQuestionCard} from "./BlankQuestionCard";
import {BlankAnswerCard} from "./BlankAnswerCard";
import {withErrorHandling} from "../../services/withErrorHandling";

export class CardsSelection {
    protected room: Room;
    protected selectedPacks = [] as CardPack[];
    protected availablePacks = CardPack.getAll();

    protected usedAnswers = [] as AnswerCard[];
    protected availableAnswers = [] as AnswerCard[];
    protected usedQuestions = [] as QuestionCard[];
    protected availableQuestions = [] as QuestionCard[];

    /**
     * Creates a new card selection for the given room
     * @param room The room to create the selection for
     */
    public constructor(room: Room) {
        this.room = room;

        // Select a standard pack
        this.selectedPacks = this.availablePacks.filter(
            p => p.getLanguage().toLowerCase() == "english"
        );
    }

    /**
     * Shares this pack's data with a player
     * @param player The player whom to share the data with
     */
    public share(player: Player): void {
        const socket = player.getSocket();
        socket.on(
            `cardSelection/${this.room.getID()}/retrieve`,
            (): ICardSelectionData =>
                withErrorHandling(() => ({
                    selection: this.selectedPacks.map(pack => pack.getData()),
                    availablePacks: this.availablePacks.map(pack => pack.getData()),
                })),
            this.room.getID()
        );
        socket.on(
            `cardSelection/${this.room.getID()}/selectionChange`,
            (selection: ICardPackData[]) =>
                withErrorHandling(() => {
                    if (this.room.getAdmin() != player)
                        return {errorMessage: "not permitted", errorCode: -1};

                    this.setSelection(selection);
                    return {success: true};
                }),
            this.room.getID()
        );
    }

    /**
     * Removes all the listeners that were added to the player's socket
     * @param player The player to remove the listeners from
     */
    public unshare(player: Player): void {
        const socket = player.getSocket();
        socket.off(`cardSelection/${this.room.getID()}/retrieve`, this.room.getID());
        socket.off(
            `cardSelection/${this.room.getID()}/selectionChange`,
            this.room.getID()
        );
    }

    // Selection management
    /**
     * Updates the card pack selection
     * @param packs The packs to be used
     */
    public setSelection(packs: CardPack[] | ICardPackData[]) {
        this.selectedPacks = this.availablePacks.filter(
            pack =>
                (packs as any[]).find(s => s.name == pack.getName()) ||
                packs.includes(pack as any)
        );
        this.room.broadcast(
            `cardSelection/${this.room.getID()}/selectionChange`,
            this.selectedPacks.map(pack => pack.getData())
        );
    }

    // Card usage
    /**
     * Draws a random question card, sequence is not predetermined
     * @returns The question card
     */
    public drawQuestion(): QuestionCard {
        if (this.availableQuestions.length == 0) this.resetQuestions();
        const index = Math.floor(Math.random() * this.availableQuestions.length);
        const card = this.availableQuestions[index];
        this.availableQuestions.splice(index, 1);
        return card || new BlankQuestionCard();
    }

    /**
     * Draws a random answer card, sequence is not predetermined
     * @returns The answer card
     */
    public drawAnswer(): AnswerCard {
        if (this.availableAnswers.length == 0) this.resetAnswers();
        const index = Math.floor(Math.random() * this.availableAnswers.length);
        const card = this.availableAnswers[index];
        this.availableAnswers.splice(index, 1);
        return card || new BlankAnswerCard();
    }

    /**
     * Moves a question card to the used pile
     * @param card The card that was used
     */
    public returnQuestion(card: QuestionCard): void {
        if (!(card instanceof BlankQuestionCard)) this.usedQuestions.push(card);
    }

    /**
     * Moves an answer card to the used pile
     * @param card The card that was used
     */
    public returnAnswer(card: AnswerCard): void {
        if (!(card instanceof BlankAnswerCard)) this.usedAnswers.push(card);
    }

    /**
     * Moves all of the drawn cards to the unused cards
     */
    public restock(): void {
        this.availableQuestions = [...this.availableQuestions, ...this.usedQuestions];
        this.availableAnswers = [...this.availableAnswers, ...this.usedAnswers];
        this.usedQuestions = [];
        this.usedAnswers = [];
    }

    /**
     * Resets the drawn cards and returned cards, to the new selection
     */
    public resetDeck(): void {
        this.resetAnswers();
        this.resetQuestions();
    }

    /**
     * Resets the question cards
     */
    protected resetQuestions(): void {
        this.availableQuestions = this.selectedPacks.reduce(
            (cards, pack) => [...cards, ...pack.getQuestions()],
            []
        );
        this.usedQuestions = [];
    }

    /**
     * Resets the answer cards
     */
    protected resetAnswers(): void {
        this.availableAnswers = this.selectedPacks.reduce(
            (cards, pack) => [...cards, ...pack.getAnswers()],
            []
        );
        this.usedAnswers = [];
    }
}
