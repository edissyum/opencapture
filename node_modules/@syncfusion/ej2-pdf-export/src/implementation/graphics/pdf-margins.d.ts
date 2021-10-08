/**
 * PdfMargins.ts class for EJ2-PDF
 * A class representing PDF page margins.
 */
export declare class PdfMargins {
    /**
     * Represents the `Left margin` value.
     * @private
     */
    private leftMargin;
    /**
     * Represents the `Top margin` value.
     * @private
     */
    private topMargin;
    /**
     * Represents the `Right margin` value.
     * @private
     */
    private rightMargin;
    /**
     * Represents the `Bottom margin` value.
     * @private
     */
    private bottomMargin;
    /**
     * Represents the `Default Page Margin` value.
     * @default 0.0
     * @private
     */
    private readonly pdfMargin;
    /**
     * Initializes a new instance of the `PdfMargins` class.
     * @private
     */
    constructor();
    /**
     * Gets or sets the `left margin` size.
     * @private
     */
    left: number;
    /**
     * Gets or sets the `top margin` size.
     * @private
     */
    top: number;
    /**
     * Gets or sets the `right margin` size.
     * @private
     */
    right: number;
    /**
     * Gets or sets the `bottom margin` size.
     * @private
     */
    bottom: number;
    /**
     * Sets the `margins`.
     * @private
     */
    all: number;
    /**
     * Sets the `margins`.
     * @private
     */
    setMargins(margin1: number): void;
    /**
     * Sets the `margins`.
     * @private
     */
    setMargins(margin1: number, margin2: number): void;
    /**
     * Sets the `margins`.
     * @private
     */
    setMargins(margin1: number, margin2: number, margin3: number, margin4: number): void;
    /**
     * `Clones` the object.
     * @private
     */
    clone(): PdfMargins;
}
