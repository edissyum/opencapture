import { ScrollBar } from './scrollbar';
import { Chart } from '../../chart/chart';
import { SvgRenderer } from '@syncfusion/ej2-svg-base';
/**
 * Create scrollbar svg.
 *
 * @returns {void}
 */
export declare function createScrollSvg(scrollbar: ScrollBar, renderer: SvgRenderer): void;
/**
 * Scrollbar elements renderer
 */
export declare class ScrollElements {
    /** @private */
    thumbRectX: number;
    /** @private */
    thumbRectWidth: number;
    /** @private */
    leftCircleEle: Element;
    /** @private */
    rightCircleEle: Element;
    /** @private */
    leftArrowEle: Element;
    /** @private */
    rightArrowEle: Element;
    /** @private */
    gripCircle: Element;
    /** @private */
    slider: Element;
    /** @private */
    chartId: string;
    /**
     * Constructor for scroll elements
     *
     * @param scrollObj
     * @param chart
     */
    constructor(chart: Chart);
    /**
     * Render scrollbar elements.
     *
     * @returns {void}
     * @private
     */
    renderElements(scroll: ScrollBar, renderer: SvgRenderer): Element;
    /**
     * Method to render back rectangle of scrollbar
     *
     * @param scroll
     * @param renderer
     * @param parent
     * @param renderer
     * @param parent
     */
    private backRect;
    /**
     * Method to render arrows
     *
     * @param scroll
     * @param renderer
     * @param parent
     * @param renderer
     * @param parent
     */
    private arrows;
    /**
     * Methods to set the arrow width
     *
     * @param thumbRectX
     * @param thumbRectWidth
     * @param height
     */
    setArrowDirection(thumbRectX: number, thumbRectWidth: number, height: number): void;
    /**
     * Method to render thumb
     *
     * @param scroll
     * @param renderer
     * @param parent
     */
    thumb(scroll: ScrollBar, renderer: SvgRenderer, parent: Element): void;
    /**
     *  Method to render circles
     *
     * @param scroll
     * @param renderer
     * @param parent
     */
    private renderCircle;
    /**
     * Method to render grip elements
     *
     * @param scroll
     * @param renderer
     * @param parent
     */
    private thumbGrip;
}
