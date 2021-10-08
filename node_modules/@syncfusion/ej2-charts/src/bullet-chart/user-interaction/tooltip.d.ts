import { BulletChart } from '../bullet-chart';
import { BulletChartAxis } from '../renderer/bullet-axis';
/**
 * `BulletTooltip` module is used to render the tooltip for bullet chart.
 */
export declare class BulletTooltip {
    private elementId;
    toolTipInterval: number;
    private control;
    private templateFn;
    /** @private */
    bulletAxis: BulletChartAxis;
    /**
     * Constructor for tooltip module.
     *
     * @private
     */
    constructor(bullet: BulletChart);
    /**
     * To create tooltip div element
     */
    _elementTooltip(e: PointerEvent, targetClass: string, targetId: string, mouseX: number): void;
    /**
     * To display the bullet chart tooltip
     */
    _displayTooltip(e: PointerEvent, targetClass: string, targetId: string, mouseX: number, mouseY: number): void;
    /**
     * To update template values in the tooltip
     */
    updateTemplateFn(): void;
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
