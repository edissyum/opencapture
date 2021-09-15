import { RectangleF } from './../drawing/pdf-drawing';
import { PdfAction } from './../actions/action';
import { PdfLinkAnnotation } from './link-annotation';
/**
 * Represents base class for `link annotations` with associated action.
 * @private
 */
export declare abstract class PdfActionLinkAnnotation extends PdfLinkAnnotation {
    /**
     * Internal variable to store annotation's `action`.
     * @default null
     * @private
     */
    private pdfAction;
    /**
     * Internal variable to store annotation's `Action`.
     * @private
     */
    abstract action: PdfAction;
    /**
     * Specifies the constructor for `ActionLinkAnnotation`.
     * @private
     */
    constructor(rectangle: RectangleF);
    /**
     * get and set the `action`.
     * @hidden
     */
    getSetAction(value?: PdfAction): PdfAction | void;
}
