export class AnswerCard {
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
}
