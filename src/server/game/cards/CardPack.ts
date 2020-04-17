import {QuestionCard} from "./QuestionCard";
import {AnswerCard} from "./AnswerCard";
import {promisify} from "util";
import FS from "fs";
import Path from "path";
import {ICardPackData} from "../../../_types/game/ICardPackData";

const cardDir = Path.join(process.cwd(), "cardPacks");

export class CardPack {
    protected name: string;
    protected description: string;
    protected language: string;
    protected questions: QuestionCard[];
    protected answers: AnswerCard[];

    /**
     * Creates a new card pack
     * @param name The name of the pack, should be a pack in the cardPacks folder
     */
    protected constructor(name: string) {
        this.name = name;
    }

    /**
     * Loads the cards of the deck and other data
     */
    protected async load(): Promise<void> {
        const dataString = await promisify(FS.readFile)(
            Path.join(cardDir, `${this.name}.json`),
            "utf8"
        );
        const data = JSON.parse(dataString);
        this.description = data.description;
        this.name = data.name;
        this.language = data.language;
        this.questions = data.questions.map(q => new QuestionCard(q));
        this.answers = data.answers.map(a => new AnswerCard(a));
    }

    /**
     * Creates a new card pack instance with the given name
     * @param name The name of the pack, should be a pack in the cardPacks folder
     */
    protected static async create(name: string): Promise<CardPack> {
        const pack = new CardPack(name);
        await pack.load();
        return pack;
    }

    // Getters
    /**
     * Retrieves the name of the pack
     * @returns The name
     */
    public getName(): string {
        return this.name;
    }

    /**
     * Retrieves the description of this pack
     * @returns The description
     */
    public getDescription(): string {
        return this.description;
    }

    /**
     * Retrieves the language of this pack
     * @returns The language
     */
    public getLanguage(): string {
        return this.language;
    }

    /**
     * Retrieves the answer cards of this pack
     * @returns The cards
     */
    public getAnswers(): AnswerCard[] {
        return this.answers;
    }

    /**
     * Retrieves the question cards of this pack
     * @returns The cards
     */
    public getQuestions(): QuestionCard[] {
        return this.questions;
    }

    /**
     * Retrieves the data relevant for the client
     * @returns The card pack data
     */
    public getData(): ICardPackData {
        return {
            name: this.name,
            description: this.description,
            language: this.language,
        };
    }

    // Pack management
    protected static packs: CardPack[] = [];

    /**
     * Retrieves all of the available card packs
     * @returns The card packs
     */
    public static getAll(): CardPack[] {
        return this.packs;
    }

    /**
     * Loads all of the card packs
     */
    public static async load(): Promise<void> {
        const files = await promisify(FS.readdir)(cardDir);
        this.packs = await Promise.all(
            files
                .filter(f => f.split(".").pop() == "json")
                .map(f => {
                    const parts = f.split(".");
                    parts.pop();
                    const extensionLess = parts.join(".");
                    return this.create(extensionLess);
                })
        );
    }
}
