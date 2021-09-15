/**
 * PdfAutomaticFieldInfo.ts class for EJ2-PDF
 * @private
 */
import { PointF } from './../../drawing/pdf-drawing';
import { PdfAutomaticField } from './automatic-field';
/**
 * Represents information about the automatic field.
 * @private
 */
export declare class PdfAutomaticFieldInfo {
    /**
     * Internal variable to store location of the field.
     * @private
     */
    private pageNumberFieldLocation;
    /**
     * Internal variable to store field.
     * @private
     */
    private pageNumberField;
    /**
     * Internal variable to store x scaling factor.
     * @private
     */
    private scaleX;
    /**
     * Internal variable to store y scaling factor.
     * @private
     */
    private scaleY;
    /**
     * Initializes a new instance of the 'PdfAutomaticFieldInfo' class.
     * @private
     */
    constructor(field: PdfAutomaticFieldInfo);
    /**
     * Initializes a new instance of the 'PdfAutomaticFieldInfo' class.
     * @private
     */
    constructor(field: PdfAutomaticField, location: PointF);
    /**
     * Initializes a new instance of the 'PdfAutomaticFieldInfo' class.
     * @private
     */
    constructor(field: PdfAutomaticField, location: PointF, scaleX: number, scaleY: number);
    /**
     * Gets or sets the location.
     * @private
     */
    location: PointF;
    /**
     * Gets or sets the field.
     * @private
     */
    field: PdfAutomaticField;
    /**
     * Gets or sets the scaling X factor.
     * @private
     */
    scalingX: number;
    /**
     * Gets or sets the scaling Y factor.
     * @private
     */
    scalingY: number;
}
