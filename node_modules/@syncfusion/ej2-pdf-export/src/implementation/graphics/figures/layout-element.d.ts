/**
 * PdfLayoutElement.ts class for EJ2-PDF
 */
import { PdfPage } from './../../pages/pdf-page';
import { RectangleF, PointF } from './../../drawing/pdf-drawing';
import { PdfLayoutParams, PdfLayoutFormat, PdfLayoutResult } from './base/element-layouter';
import { PdfGridBeginPageLayoutEventArgs, PdfGridEndPageLayoutEventArgs } from './../../structured-elements/grid/layout/grid-layouter';
import { BeginPageLayoutEventArgs, EndPageLayoutEventArgs } from './../../structured-elements/grid/layout/grid-layouter';
/**
 * `PdfLayoutElement` class represents the base class for all elements that can be layout on the pages.
 * @private
 */
export declare abstract class PdfLayoutElement {
    /**
     * Indicating whether [`embed fonts`]
     * @private
     */
    private bEmbedFonts;
    endPageLayout: Function;
    beginPageLayout: Function;
    /**
     * Gets a value indicating whether the `start page layout event` should be raised.
     * @private
     */
    readonly raiseBeginPageLayout: boolean;
    /**
     * Gets a value indicating whether the `ending page layout event` should be raised.
     * @private
     */
    readonly raiseEndPageLayout: boolean;
    onBeginPageLayout(args: PdfGridBeginPageLayoutEventArgs | BeginPageLayoutEventArgs): void;
    onEndPageLayout(args: PdfGridEndPageLayoutEventArgs | EndPageLayoutEventArgs): void;
    /**
     * `Draws` the element on the page with the specified page and "PointF" class
     * @private
     */
    drawHelper(page: PdfPage, location: PointF): PdfLayoutResult;
    /**
     * `Draws` the element on the page with the specified page and pair of coordinates
     * @private
     */
    drawHelper(page: PdfPage, x: number, y: number): PdfLayoutResult;
    /**
     * `Draws` the element on the page with the specified page and "RectangleF" class
     * @private
     */
    drawHelper(page: PdfPage, layoutRectangle: RectangleF): PdfLayoutResult;
    /**
     * `Draws` the element on the page with the specified page, "PointF" class and layout format
     * @private
     */
    drawHelper(page: PdfPage, location: PointF, format: PdfLayoutFormat): PdfLayoutResult;
    /**
     * `Draws` the element on the page with the specified page, pair of coordinates and layout format
     * @private
     */
    drawHelper(page: PdfPage, x: number, y: number, format: PdfLayoutFormat): PdfLayoutResult;
    /**
     * `Draws` the element on the page.
     * @private
     */
    drawHelper(page: PdfPage, layoutRectangle: RectangleF, embedFonts: boolean): PdfLayoutResult;
    /**
     * `Draws` the element on the page with the specified page, "RectangleF" class and layout format
     * @private
     */
    drawHelper(page: PdfPage, layoutRectangle: RectangleF, format: PdfLayoutFormat): PdfLayoutResult;
    /**
     * `Layouts` the specified param.
     * @private
     */
    protected abstract layout(param: PdfLayoutParams): PdfLayoutResult;
}
