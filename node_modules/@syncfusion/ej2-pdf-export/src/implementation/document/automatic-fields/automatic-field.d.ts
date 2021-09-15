/**
 * PdfAutomaticField.ts class for EJ2-PDF
 */
import { RectangleF, SizeF, PointF } from './../../drawing/pdf-drawing';
import { PdfFont } from './../../graphics/fonts/pdf-font';
import { PdfBrush } from './../../graphics/brushes/pdf-brush';
import { PdfStringFormat } from './../../graphics/fonts/pdf-string-format';
import { PdfPen } from './../../graphics/pdf-pen';
import { PdfGraphics } from './../../graphics/pdf-graphics';
import { PdfGraphicsElement } from './../../graphics/figures/base/graphics-element';
import { PdfPage } from './../../pages/pdf-page';
/**
 * Represents a fields which is calculated before the document saves.
 */
export declare abstract class PdfAutomaticField extends PdfGraphicsElement {
    private internalBounds;
    private internalFont;
    private internalBrush;
    private internalPen;
    private internalStringFormat;
    private internalTemplateSize;
    protected constructor();
    bounds: RectangleF;
    size: SizeF;
    location: PointF;
    font: PdfFont;
    brush: PdfBrush;
    pen: PdfPen;
    stringFormat: PdfStringFormat;
    abstract getValue(graphics: PdfGraphics): string;
    abstract performDraw(graphics: PdfGraphics, location: PointF, scalingX: number, scalingY: number): void;
    performDrawHelper(graphics: PdfGraphics, location: PointF, scalingX: number, scalingY: number): void;
    draw(graphics: PdfGraphics): void;
    draw(graphics: PdfGraphics, location: PointF): void;
    draw(graphics: PdfGraphics, x: number, y: number): void;
    protected getSize(): SizeF;
    protected drawInternal(graphics: PdfGraphics): void;
    protected getBrush(): PdfBrush;
    protected getFont(): PdfFont;
    getPageFromGraphics(graphics: PdfGraphics): PdfPage;
}
