import {AnswerCard} from "./AnswerCard";

export class QuestionCard {
    protected text: string;

    /**
     * Creates a new answer card
     * @param text The text of the card
     */
    public constructor(text: string) {
        this.text = text;
    }

    /**
     * Retrieves the text of the card
     * @returns The text
     */
    public getText(): string {
        return this.text;
    }

    /**
     * Check how many answers need to be given
     * @returns The number of answers
     */
    public getAnswerCount(): number {
        return this.text.match(/_/g)?.length || 0;
    }

    /**
     * Retrieves the text with answers filled in
     * @param answers The answer cards to fill in
     * @returns The text with the answers filled in
     */
    public getFilledText(...answers: AnswerCard[]): string {
        return this.text.replace(/_/g, () => answers.shift()?.getText() || "");
    }
}
