/**
 * PdfTilingBrush.ts class for EJ2-PDF
 */
import { PdfStreamWriter } from './../../input-output/pdf-stream-writer';
import { GetResourceEventHandler } from './../pdf-graphics';
import { PdfColorSpace } from './../enum';
import { PdfBrush } from './pdf-brush';
import { PointF, SizeF, Rectangle } from './../../drawing/pdf-drawing';
import { IPdfWrapper } from '../../../interfaces/i-pdf-wrapper';
import { PdfGraphics } from './../pdf-graphics';
import { PdfResources } from './../pdf-resources';
import { PdfPage } from './../../pages/pdf-page';
import { IPdfPrimitive } from './../../../interfaces/i-pdf-primitives';
/**
 * `PdfTilingBrush` Implements a colored tiling brush.
 */
export declare class PdfTilingBrush extends PdfBrush implements IPdfWrapper {
    /**
     * Local variable to store rectanble box.
     * @private
     */
    private mBox;
    /**
     * Local variable to store graphics.
     * @private
     */
    private mGraphics;
    /**
     * Local variable to store brush Stream.
     * @private
     */
    private brushStream;
    /**
     * Local variable to store brush Stream.
     * @private
     */
    private tempBrushStream;
    /**
     * Local variable to store resources.
     * @private
     */
    private mResources;
    /**
     * Local variable to store Stroking.
     * @private
     */
    private mStroking;
    /**
     * Local variable to store the page.
     * @private
     */
    private mPage;
    /**
     * Local variable to store the tile start location.
     * @private
     */
    private mLocation;
    /**
     * Local variable to store the Matrix.
     * @private
     */
    private mTransformationMatrix;
    /**
     * Local variable to store the dictionary properties.
     * @private
     */
    private mDictionaryProperties;
    /**
     * Initializes a new instance of the `PdfTilingBrush` class.
     * @public
     */
    constructor(rectangle: Rectangle);
    /**
     * Initializes a new instance of the `PdfTilingBrush` class.
     * @public
     */
    constructor(size: SizeF);
    /**
     * Initializes a new instance of the `PdfTilingBrush` class.
     * @public
     */
    constructor(size: SizeF, page: PdfPage);
    /**
     * Initializes a new instance of the `PdfTilingBrush` class.
     * @public
     */
    constructor(rectangle: Rectangle, page: PdfPage);
    /**
     * Initializes a new instance of the `PdfTilingBrush` class.
     * @private
     * @param rectangle The size of the smallest brush cell.
     * @param page The Current Page Object.
     * @param location The Tile start location.
     * @param matrix The matrix.
     */
    private initialize;
    /**
     * Location representing the start position of the tiles.
     * @public
     */
    location: PointF;
    /**
     * Sets the obligatory fields.
     * @private
     */
    private setObligatoryFields;
    /**
     * Sets the BBox coordinates.
     * @private
     */
    private setBox;
    /**
     * Gets the boundary box of the smallest brush cell.
     * @public
     */
    readonly rectangle: Rectangle;
    /**
     * Gets the size of the smallest brush cell.
     * @public
     */
    readonly size: SizeF;
    /**
     * Gets Graphics context of the brush.
     */
    readonly graphics: PdfGraphics;
    /**
     * Gets the resources and modifies the template dictionary.
     * @public
     */
    getResources(): PdfResources;
    /**
     * Gets or sets a value indicating whether this PdfTilingBrush
     * is used for stroking operations.
     */
    stroking: boolean;
    /**
     * Creates a new copy of a brush.
     * @public
     */
    clone(): PdfBrush;
    /**
     * Monitors the changes of the brush and modify PDF state respectfully.
     * @param brush The brush
     * @param streamWriter The stream writer
     * @param getResources The get resources delegate.
     * @param saveChanges if set to true the changes should be saved anyway.
     * @param currentColorSpace The current color space.
     */
    monitorChanges(brush: PdfBrush, streamWriter: PdfStreamWriter, getResources: GetResourceEventHandler, saveChanges: boolean, currentColorSpace: PdfColorSpace): boolean;
    /**
     * Resets the changes, which were made by the brush.
     * In other words resets the state to the initial one.
     * @param streamWriter The stream writer.
     */
    resetChanges(streamWriter: PdfStreamWriter): void;
    /**
     * Gets the `element`.
     * @public
     */
    readonly element: IPdfPrimitive;
}
