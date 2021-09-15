import { IPdfWrapper } from './../../interfaces/i-pdf-wrapper';
import { IPdfPrimitive } from './../../interfaces/i-pdf-primitives';
import { PdfColor } from './../graphics/pdf-color';
import { RectangleF } from './../drawing/pdf-drawing';
import { PdfPage } from './../pages/pdf-page';
import { PdfPageBase } from './../pages/pdf-page-base';
import { PdfDictionary } from './../primitives/pdf-dictionary';
import { DictionaryProperties } from './../input-output/pdf-dictionary-properties';
import { PdfBrush } from './../graphics/brushes/pdf-brush';
import { PdfFont } from './../graphics/fonts/pdf-font';
import { PdfStringFormat } from './../graphics/fonts/pdf-string-format';
/**
 * `PdfAnnotation` class represents the base class for annotation objects.
 * @private
 */
export declare abstract class PdfAnnotation implements IPdfWrapper {
    /**
     * Specifies the Internal variable to store fields of `PdfDictionaryProperties`.
     * @private
     */
    protected dictionaryProperties: DictionaryProperties;
    /**
     * `Color` of the annotation
     * @private
     */
    private pdfColor;
    /**
     * `Bounds` of the annotation.
     * @private
     */
    private rectangle;
    /**
     * Parent `page` of the annotation.
     * @private
     */
    private pdfPage;
    /**
     * `Brush of the text` of the annotation.
     * @default new PdfSolidBrush(new PdfColor(0, 0, 0))
     * @private
     */
    private textBrush;
    /**
     * `Font of the text` of the annotation.
     * @default new PdfStandardFont(PdfFontFamily.TimesRoman, 10)
     * @private
     */
    private textFont;
    /**
     * `StringFormat of the text` of the annotation.
     * @default new PdfStringFormat(PdfTextAlignment.Left)
     * @private
     */
    private format;
    /**
     * `Text` of the annotation.
     * @private
     */
    private content;
    /**
     * Internal variable to store `dictionary`.
     * @private
     */
    private pdfDictionary;
    /**
     * To specifying the `Inner color` with which to fill the annotation
     * @private
     */
    private internalColor;
    /**
     * `opacity or darkness` of the annotation.
     * @private
     * @default 1.0
     */
    private darkness;
    /**
     * `Color` of the annotation
     * @private
     */
    color: PdfColor;
    /**
     * To specifying the `Inner color` with which to fill the annotation
     * @private
     */
    innerColor: PdfColor;
    /**
     * `bounds` of the annotation.
     * @private
     */
    bounds: RectangleF;
    /**
     * Parent `page` of the annotation.
     * @private
     */
    readonly page: PdfPage;
    /**
     * To specifying the `Font of the text` in the annotation.
     * @private
     */
    font: PdfFont;
    /**
     * To specifying the `StringFormat of the text` in the annotation.
     * @private
     */
    stringFormat: PdfStringFormat;
    /**
     * To specifying the `Brush of the text` in the annotation.
     * @private
     */
    brush: PdfBrush;
    /**
     * `Text` of the annotation.
     * @private
     */
    text: string;
    /**
     * Internal variable to store `dictionary`.
     * @hidden
     */
    dictionary: PdfDictionary;
    /**
     * Object initialization for `Annotation` class
     * @private
     */
    constructor();
    constructor(bounds: RectangleF);
    /**
     * `Initialize` the annotation event handler and specifies the type of the annotation.
     * @private
     */
    protected initialize(): void;
    /**
     * Sets related `page` of the annotation.
     * @private
     */
    setPage(page: PdfPageBase): void;
    /**
     * Handles the `BeginSave` event of the Dictionary.
     * @private
     */
    beginSave(): void;
    /**
     * `Saves` an annotation.
     * @private
     */
    protected save(): void;
    /**
     * Gets the `element`.
     * @private
     */
    readonly element: IPdfPrimitive;
}
