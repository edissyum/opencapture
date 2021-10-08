/**
 * MultiLevel Labels src
 */
import { Chart } from '../chart';
import { Axis } from '../axis/axis';
import { FontModel } from '../../common/model/base-model';
import { TextOption, Rect } from '@syncfusion/ej2-svg-base';
import { IAxisMultiLabelRenderEventArgs, IMultiLevelLabelClickEventArgs } from '../../chart/model/chart-interface';
import { Alignment } from '../../common/utils/enum';
/**
 * `MultiLevelLabel` module is used to render the multi level label in chart.
 */
export declare class MultiLevelLabel {
    /** @private */
    chart: Chart;
    /** @private */
    xAxisPrevHeight: number[];
    /** @private */
    xAxisMultiLabelHeight: number[];
    /** @private */
    yAxisPrevHeight: number[];
    /** @private */
    yAxisMultiLabelHeight: number[];
    /** @private */
    multiElements: Element;
    /** @private */
    labelElement: Element;
    /** @private */
    multiLevelLabelRectXRegion: Rect[];
    /** @private */
    xLabelCollection: TextOption[];
    /**
     * Constructor for the logerithmic module.
     *
     * @private
     */
    constructor(chart: Chart);
    /**
     * Binding events for multi level module.
     */
    private addEventListener;
    /**
     * Finds multilevel label height
     *
     * @returns {void}
     */
    getMultilevelLabelsHeight(axis: Axis): void;
    /**
     * render x axis multi level labels
     *
     * @private
     * @returns {void}
     */
    renderXAxisMultiLevelLabels(axis: Axis, index: number, parent: Element, axisRect: Rect): void;
    /**
     * render x axis multi level labels border
     *
     * @private
     * @returns {void}
     */
    private renderXAxisLabelBorder;
    /**
     * render y axis multi level labels
     *
     * @private
     * @returns {void}
     */
    renderYAxisMultiLevelLabels(axis: Axis, index: number, parent: Element, rect: Rect): void;
    /**
     * render y axis multi level labels border
     *
     * @private
     * @returns {void}
     */
    private renderYAxisLabelBorder;
    /**
     * create cliprect
     *
     * @returns {void}
     * @private
     */
    createClipRect(x: number, y: number, height: number, width: number, clipId: string, axisId: string): void;
    /**
     * create borer element
     *
     * @returns {void}
     * @private
     */
    createBorderElement(borderIndex: number, axisIndex: number, axis: Axis, path: string, pointIndex?: number): void;
    /**
     * Triggers the event.
     *
     * @returns {void}
     * @private
     */
    triggerMultiLabelRender(axis: Axis, text: string, textStyle: FontModel, textAlignment: Alignment, customAttributes: object): IAxisMultiLabelRenderEventArgs;
    /**
     * Triggers the event.
     *
     * @returns {void}
     * @private
     */
    MultiLevelLabelClick(labelIndex: string, axisIndex: number): IMultiLevelLabelClickEventArgs;
    /**
     * To click the multi level label
     *
     * @returns {void}
     * @private
     */
    click(event: Event): void;
    /**
     * To get the module name for `MultiLevelLabel`.
     *
     * @private
     */
    getModuleName(): string;
    /**
     * To destroy the `MultiLevelLabel` module.
     *
     * @private
     */
    destroy(): void;
}
