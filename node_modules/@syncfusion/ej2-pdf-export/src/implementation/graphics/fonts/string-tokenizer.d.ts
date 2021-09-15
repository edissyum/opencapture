/**
 * StringTokenizer.ts class for EJ2-PDF
 * Utility class for working with strings.
 * @private
 */
export declare class StringTokenizer {
    /**
     * `Whitespace` symbol.
     * @private
     */
    static readonly whiteSpace: string;
    /**
     * `tab` symbol.
     * @private
     */
    static readonly tab: string;
    /**
     * Array of `spaces`.
     * @private
     */
    static readonly spaces: string[];
    /**
     * `Pattern` for WhiteSpace.
     * @private
     */
    private static readonly whiteSpacePattern;
    /**
     * `Text` data.
     * @private
     */
    private text;
    /**
     * Current `position`.
     * @private
     */
    private currentPosition;
    /**
     * Initializes a new instance of the `StringTokenizer` class.
     * @private
     */
    constructor(textValue: string);
    /**
     * Gets text `length`.
     * @private
     */
    readonly length: number;
    readonly end: boolean;
    /**
     * Gets or sets the position.
     * @private
     */
    position: number;
    /**
     * Returns number of symbols occurred in the text.
     * @private
     */
    static getCharsCount(text: string, symbols: string): number;
    /**
     * Returns number of symbols occurred in the text.
     * @private
     */
    static getCharsCount(text: string, symbols: string[]): number;
    /**
     * Reads line of the text.
     * @private
     */
    readLine(): string;
    /**
     * Reads line of the text.
     * @private
     */
    peekLine(): string;
    /**
     * Reads a word from the text.
     * @private
     */
    readWord(): string;
    /**
     * Peeks a word from the text.
     * @private
     */
    peekWord(): string;
    /**
     * Reads char form the data.
     * @private
     */
    read(): string;
    /**
     * Reads count of the symbols.
     * @private
     */
    read(count: number): string;
    /**
     * Peeks char form the data.
     * @private
     */
    peek(): string;
    /**
     * Closes a reader.
     * @private
     */
    close(): void;
    readToEnd(): string;
    /**
     * Checks whether array contains a symbol.
     * @private
     */
    private static contains;
}
