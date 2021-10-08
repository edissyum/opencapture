/**
 * PdfBrush.ts class for EJ2-PDF
 */
import { PdfStreamWriter } from './../../input-output/pdf-stream-writer';
import { GetResourceEventHandler } from './../pdf-graphics';
import { PdfColorSpace } from './../enum';
import { PdfColor } from './../pdf-color';
import { ICloneable } from './../../../interfaces/i-pdf-clonable';
/**
 * `PdfBrush` class provides objects used to fill the interiors of graphical shapes such as rectangles,
 * ellipses, pies, polygons, and paths.
 * @private
 */
export declare abstract class PdfBrush implements ICloneable {
    /**
     * Creates instanceof `PdfBrush` class.
     * @hidden
     * @private
     */
    constructor();
    /**
     * Stores the instance of `PdfColor` class.
     * @private
     */
    color: PdfColor;
    /**
     * `MonitorChanges` abstract method overload.
     * @hidden
     * @private
     */
    abstract monitorChanges(brush: PdfBrush, streamWriter: PdfStreamWriter, getResources: GetResourceEventHandler, saveChanges: boolean, currentColorSpace: PdfColorSpace): boolean;
    /**
     * `MonitorChanges` abstract method overload.
     * @hidden
     * @private
     */
    abstract monitorChanges(brush: PdfBrush, streamWriter: PdfStreamWriter, getResources: GetResourceEventHandler, saveChanges: boolean, currentColorSpace: PdfColorSpace, check: boolean): boolean;
    /**
     * `MonitorChanges` abstract method overload.
     * @hidden
     * @private
     */
    abstract monitorChanges(brush: PdfBrush, streamWriter: PdfStreamWriter, getResources: GetResourceEventHandler, saveChanges: boolean, currentColorSpace: PdfColorSpace, check: boolean, iccBased: boolean): boolean;
    /**
     * `MonitorChanges` abstract method overload.
     * @hidden
     * @private
     */
    abstract monitorChanges(brush: PdfBrush, streamWriter: PdfStreamWriter, getResources: GetResourceEventHandler, saveChanges: boolean, currentColorSpace: PdfColorSpace, check: boolean, iccBased: boolean, indexed: boolean): boolean;
    /**
     * `MonitorChanges` abstract method overload.
     * @hidden
     * @private
     */
    abstract resetChanges(streamWriter: PdfStreamWriter): void;
    clone(): PdfBrush;
}
