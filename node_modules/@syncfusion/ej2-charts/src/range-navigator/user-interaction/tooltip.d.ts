import { RangeNavigator, RangeSlider } from '../../range-navigator';
import { Tooltip as SVGTooltip } from '@syncfusion/ej2-svg-base';
/**
 * `Tooltip` module is used to render the tooltip for chart series.
 */
export declare class RangeTooltip {
    leftTooltip: SVGTooltip;
    rightTooltip: SVGTooltip;
    private elementId;
    toolTipInterval: number;
    private control;
    /**
     * Constructor for tooltip module.
     *
     * @private
     */
    constructor(range: RangeNavigator);
    /**
     * Left tooltip method called here
     *
     * @param {RangeSlider} rangeSlider RangeSlider
     */
    renderLeftTooltip(rangeSlider: RangeSlider): void;
    /**
     * get the content size
     *
     * @param {string[]} value value
     */
    private getContentSize;
    /**
     * Right tooltip method called here
     *
     * @param {RangeSlider} rangeSlider RangeSlider
     */
    renderRightTooltip(rangeSlider: RangeSlider): void;
    /**
     * Tooltip element creation
     *
     * @param {string} id element id
     */
    private createElement;
    /**
     * Tooltip render called here
     *
     * @param {Rect} bounds bounds
     * @param {Element} parent parent
     * @param {number} pointX pointX
     * @param {string[]} content content
     */
    private renderTooltip;
    /**
     * Tooltip content processed here
     *
     * @param {number} value tooltip value
     */
    private getTooltipContent;
    /**
     * Fadeout animation performed here
     */
    private fadeOutTooltip;
    /**
     * Get module name.
     */
    protected getModuleName(): string;
    /**
     * To destroy the tooltip.
     *
     * @returns {void}
     * @private
     */
    destroy(): void;
}
