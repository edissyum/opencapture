import { PdfAction } from './action';
/**
 * `PdfUriAction` class for initialize the uri related internals.
 * @private
 */
export declare class PdfUriAction extends PdfAction {
    /**
     * Specifies the `uri` string.
     * @default ''.
     * @private
     */
    private uniformResourceIdentifier;
    /**
     * Initialize instance of `PdfUriAction` class.
     * @private
     */
    constructor();
    /**
     * Initialize instance of `PdfUriAction` class.
     * @private
     */
    constructor(uri: string);
    /**
     * Gets and Sets the value of `Uri`.
     * @private
     */
    uri: string;
    /**
     * `Initialize` the internals.
     * @private
     */
    protected initialize(): void;
}
