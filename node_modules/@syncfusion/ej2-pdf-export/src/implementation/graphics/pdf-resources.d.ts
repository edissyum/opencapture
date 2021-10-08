/**
 * PdfResources.ts class for EJ2-PDF
 */
import { PdfDictionary } from './../primitives/pdf-dictionary';
import { TemporaryDictionary } from './../collections/object-object-pair/dictionary';
import { PdfName } from './../primitives/pdf-name';
import { IPdfPrimitive } from './../../interfaces/i-pdf-primitives';
import { IPdfWrapper } from './../../interfaces/i-pdf-wrapper';
import { PdfDocument } from './../document/pdf-document';
import { PdfFont } from './fonts/pdf-font';
import { PdfTemplate } from './figures/pdf-template';
import { PdfBrush } from './brushes/pdf-brush';
import { PdfTransparency } from './pdf-transparency';
import { PdfBitmap } from './../graphics/images/pdf-bitmap';
import { PdfImage } from './../graphics/images/pdf-image';
/**
 * `PdfResources` class used to set resource contents like font, image.
 * @private
 */
export declare class PdfResources extends PdfDictionary {
    /**
     * Dictionary for the `objects names`.
     * @private
     */
    private pdfNames;
    /**
     * Dictionary for the `properties names`.
     * @private
     */
    private properties;
    /**
     * `Font name`.
     * @private
     */
    private fontName;
    /**
     * Stores instance of `parent document`.
     * @private
     */
    private pdfDocument;
    /**
     * Initializes a new instance of the `PdfResources` class.
     * @private
     */
    constructor();
    /**
     * Initializes a new instance of the `PdfResources` class.
     * @private
     */
    constructor(baseDictionary: PdfDictionary);
    /**
     * Gets the `font names`.
     * @private
     */
    private readonly names;
    /**
     * Get or set the `page document`.
     * @private
     */
    document: PdfDocument;
    /**
     * `Generates name` for the object and adds to the resource if the object is new.
     * @private
     */
    getName(obj: IPdfWrapper): PdfName;
    /**
     * Gets `resource names` to font dictionaries.
     * @private
     */
    getNames(): TemporaryDictionary<IPdfPrimitive, PdfName>;
    /**
     * Add `RequireProcedureSet` into procset array.
     * @private
     */
    requireProcedureSet(procedureSetName: string): void;
    /**
     * `Remove font` from array.
     * @private
     */
    removeFont(name: string): void;
    /**
     * Generates `Unique string name`.
     * @private
     */
    private generateName;
    /**
     * `Adds object` to the resources.
     * @private
     */
    add(font: PdfFont, name: PdfName): void;
    /**
     * `Adds object` to the resources.
     * @private
     */
    add(template: PdfTemplate, name: PdfName): void;
    /**
     * `Adds object` to the resources.
     * @private
     */
    add(brush: PdfBrush, name: PdfName): void;
    /**
     * `Adds object` to the resources.
     * @private
     */
    add(transparency: PdfTransparency, name: PdfName): void;
    /**
     * `Adds object` to the resources.
     * @private
     */
    add(image: PdfImage | PdfBitmap, name: PdfName): void;
}
/**
 * Used to create new guid for resources.
 * @private
 */
export declare class Guid {
    /**
     * Generate `new GUID`.
     * @private
     */
    static getNewGuidString(): string;
}
