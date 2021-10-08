/**
 * PdfPageTemplateElement.ts class for EJ2-Pdf
 */
import { PdfDockStyle, PdfAlignmentStyle, TemplateType } from './enum';
import { PointF, SizeF } from './../drawing/pdf-drawing';
import { PdfGraphics } from './../graphics/pdf-graphics';
import { PdfTemplate } from './../graphics/figures/pdf-template';
import { PdfPageLayer } from './pdf-page-layer';
import { PdfPage } from './pdf-page';
import { PdfDocument } from './../document/pdf-document';
import { RectangleF } from './../drawing/pdf-drawing';
/**
 * Describes a `page template` object that can be used as header/footer, watermark or stamp.
 */
export declare class PdfPageTemplateElement {
    /**
     * `Layer type` of the template.
     * @private
     */
    private isForeground;
    /**
     * `Docking style`.
     * @private
     */
    private dockStyle;
    /**
     * `Alignment style`.
     * @private
     */
    private alignmentStyle;
    /**
     * `PdfTemplate` object.
     * @private
     */
    private pdfTemplate;
    /**
     * Usage `type` of this template.
     * @private
     */
    private templateType;
    /**
     * `Location` of the template on the page.
     * @private
     */
    private currentLocation;
    /**
     * Gets or sets the `dock style` of the page template element.
     * @private
     */
    dock: PdfDockStyle;
    /**
     * Gets or sets `alignment` of the page template element.
     * @private
     */
    alignment: PdfAlignmentStyle;
    /**
     * Indicates whether the page template is located `in front of the page layers or behind of it`.
     * @private
     */
    foreground: boolean;
    /**
     * Indicates whether the page template is located `behind of the page layers or in front of it`.
     * @private
     */
    background: boolean;
    /**
     * Gets or sets `location` of the page template element.
     * @private
     */
    location: PointF;
    /**
     * Gets or sets `X` co-ordinate of the template element on the page.
     * @private
     */
    x: number;
    /**
     * Gets or sets `Y` co-ordinate of the template element on the page.
     * @private
     */
    y: number;
    /**
     * Gets or sets `size` of the page template element.
     * @private
     */
    size: SizeF;
    /**
     * Gets or sets `width` of the page template element.
     * @private
     */
    width: number;
    /**
     * Gets or sets `height` of the page template element.
     * @private
     */
    height: number;
    /**
     * Gets `graphics` context of the page template element.
     * @private
     */
    readonly graphics: PdfGraphics;
    /**
     * Gets Pdf `template` object.
     * @private
     */
    readonly template: PdfTemplate;
    /**
     * Gets or sets `type` of the usage of this page template.
     * @private
     */
    type: TemplateType;
    /**
     * Gets or sets `bounds` of the page template.
     * @public
     */
    bounds: RectangleF;
    /**
     * Creates a new page template.
     * @param bounds Bounds of the template.
     */
    constructor(bounds: RectangleF);
    /**
     * Creates a new page template.
     * @param bounds Bounds of the template.
     * @param page Page of the template.
     */
    constructor(bounds: RectangleF, page: PdfPage);
    /**
     * Creates a new page template.
     * @param location Location of the template.
     * @param size Size of the template.
     */
    constructor(location: PointF, size: SizeF);
    /**
     * Creates a new page template.
     * @param location Location of the template.
     * @param size Size of the template.
     * @param page Page of the template.
     */
    constructor(location: PointF, size: SizeF, page: PdfPage);
    /**
     * Creates a new page template.
     * @param size Size of the template.
     */
    constructor(size: SizeF);
    /**
     * Creates a new page template.
     * @param width Width of the template.
     * @param height Height of the template.
     */
    constructor(width: number, height: number);
    /**
     * Creates a new page template.
     * @param width Width of the template.
     * @param height Height of the template.
     * @param page The Current Page object.
     */
    constructor(width: number, height: number, page: PdfPage);
    /**
     * Creates a new page template.
     * @param x X co-ordinate of the template.
     * @param y Y co-ordinate of the template.
     * @param width Width of the template.
     * @param height Height of the template.
     */
    constructor(x: number, y: number, width: number, height: number);
    /**
     * Creates a new page template.
     * @param x X co-ordinate of the template.
     * @param y Y co-ordinate of the template.
     * @param width Width of the template.
     * @param height Height of the template.
     * @param page The Current Page object.
     */
    constructor(x: number, y: number, width: number, height: number, page: PdfPage);
    /**
     * `Initialize Bounds` Initialize the bounds value of the template.
     * @private
     */
    private InitiateBounds;
    /**
     * `Updates Dock` property if template is used as header/footer.
     * @private
     */
    private updateDocking;
    /**
     * `Resets alignment` of the template.
     * @private
     */
    private resetAlignment;
    /**
     * `Sets alignment` of the template.
     * @private
     */
    private setAlignment;
    /**
     * Draws the template.
     * @private
     */
    draw(layer: PdfPageLayer, document: PdfDocument): void;
    /**
     * Calculates bounds of the page template.
     * @private
     */
    private calculateBounds;
    /**
     * Calculates bounds according to the alignment.
     * @private
     */
    private getAlignmentBounds;
    /**
     * Calculates bounds according to the alignment.
     * @private
     */
    private getSimpleAlignmentBounds;
    /**
     * Calculates bounds according to the alignment.
     * @private
     */
    private getTemplateAlignmentBounds;
    /**
     * Calculates bounds according to the docking.
     * @private
     */
    private getDockBounds;
    /**
     * Calculates bounds according to the docking.
     * @private
     */
    private getSimpleDockBounds;
    /**
     * Calculates template bounds basing on docking if template is a page template.
     * @private
     */
    private getTemplateDockBounds;
}
