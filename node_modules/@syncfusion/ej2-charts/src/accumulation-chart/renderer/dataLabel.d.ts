import { Rect, Size } from '@syncfusion/ej2-svg-base';
import { AccPoints, AccumulationSeries } from '../model/acc-base';
import { IAccTextRenderEventArgs } from '../model/pie-interface';
import { AccumulationDataLabelSettingsModel } from '../model/acc-base-model';
import { AccumulationChart } from '../accumulation';
import { AccumulationBase } from './accumulation-base';
/**
 * AccumulationDataLabel module used to render `dataLabel`.
 */
export declare class AccumulationDataLabel extends AccumulationBase {
    /** @private */
    titleRect: Rect;
    /** @private */
    areaRect: Rect;
    /** @private */
    clearTooltip: number;
    private id;
    marginValue: number;
    /**
     * This varaible indicated the change of angle direction.
     * Such as increase/decrease the label angle while doing smart label arrangements.
     */
    private isIncreaseAngle;
    private rightSideRenderingPoints;
    private leftSideRenderingPoints;
    constructor(accumulation: AccumulationChart);
    /**
     * Method to get datalabel text location.
     *
     * @private
     */
    getDataLabelPosition(point: AccPoints, dataLabel: AccumulationDataLabelSettingsModel, textSize: Size, points: AccPoints[]): void;
    /**
     * Method to get datalabel bound.
     */
    private getLabelRegion;
    /**
     * Method to get datalabel smart position.
     */
    private getSmartLabel;
    /**
     * To find trimmed datalabel tooltip needed.
     *
     * @returns {void}
     * @private
     */
    move(e: Event, x: number, y: number, isTouch?: boolean): void;
    /**
     * To find previous valid label point
     *
     * @returns {AccPoints} Find the previous value of accumulation point.
     */
    private findPreviousPoint;
    /**
     * To find current point datalabel is overlapping with other points
     *
     * @returns {boolean} It returns boolean value of overlapping.
     */
    private isOverlapping;
    /**
     * To get text trimmed while exceeds the accumulation chart area.
     */
    private textTrimming;
    /**
     * To set point label visible and region to disable.
     */
    private setPointVisibileFalse;
    /**
     * To set point label visible to enable.
     */
    private setPointVisibleTrue;
    /**
     * To set datalabel angle position for outside labels
     */
    private setOuterSmartLabel;
    /**
     * Sets smart label positions for funnel and pyramid series
     *
     * @returns {void} setSmartLabelForSegments.
     */
    private setSmartLabelForSegments;
    /**
     * To find connector line overlapping.
     *
     * @returns {boolean} To find connector line overlapping or not.
     */
    private isConnectorLineOverlapping;
    /**
     * To find two rectangle intersect
     *
     * @returns {boolean} To find line rectangle intersect value.
     */
    private isLineRectangleIntersect;
    /**
     * To find two line intersect
     *
     * @returns {boolean} To find line intersect or not.
     */
    private isLinesIntersect;
    /**
     * To get two rectangle overlapping angles.
     *
     * @returns {number} Get overlapped angle.
     */
    private getOverlappedAngle;
    /**
     * To get connector line path
     *
     * @returns {string} Get connector line path.
     */
    private getConnectorPath;
    /**
     * Finds the curved path for funnel/pyramid data label connectors
     *
     * @returns {string} Get poly line path.
     */
    private getPolyLinePath;
    /**
     * Finds the bezier point for funnel/pyramid data label connectors
     *
     * @returns {ChartLocation} Get bazier point.
     */
    private getBezierPoint;
    /**
     * To get label edges based on the center and label rect position.
     *
     * @returns {ChartLocation} Get label edge value.
     */
    private getEdgeOfLabel;
    /**
     * Finds the distance between the label position and the edge/center of the funnel/pyramid
     *
     * @returns {number} Get label distance.
     */
    private getLabelDistance;
    /**
     * Finds the label position / beginning of the connector(ouside funnel labels)
     *
     * @returns {ChartLocation} Get label location.
     */
    private getLabelLocation;
    /**
     * Finds the beginning of connector line
     *
     * @returns {ChartLocation} Staring point of connector line.
     */
    private getConnectorStartPoint;
    /**
     * To find area rect based on margin, available size.
     *
     * @private
     */
    findAreaRect(): void;
    /**
     * To render the data labels from series points.
     */
    renderDataLabel(point: AccPoints, dataLabel: AccumulationDataLabelSettingsModel, parent: Element, points: AccPoints[], series: number, templateElement?: HTMLElement, redraw?: boolean): void;
    /**
     * To calculate label size
     */
    calculateLabelSize(isTemplate: boolean, childElement: HTMLElement, point: AccPoints, points: AccPoints[], argsData: IAccTextRenderEventArgs, datalabelGroup: Element, id: string, dataLabel: AccumulationDataLabelSettingsModel, redraw?: boolean, clientRect?: ClientRect, isReactCallback?: boolean): void;
    /**
     * @private
     */
    drawDataLabels(series: AccumulationSeries, dataLabel: AccumulationDataLabelSettingsModel, parent: HTMLElement, templateElement?: HTMLElement, redraw?: boolean): void;
    /**
     * In this method datalabels region checked with legebdBounds and areaBounds.
     * Trimming of datalabel and point's visibility again changed here.
     *
     * @param {AccPoints} point current point in which trimming and visibility to be checked
     * @param {AccPoints[]} points finalized points
     * @param {AccumulationDataLabelSettingsModel} dataLabel datalabel model
     */
    private finalizeDatalabels;
    /**
     * To find the template element size
     *
     * @param {HTMLElement} element To get a template element.
     * @param {AccPoints} point Template of accumulation points.
     * @param {IAccTextRenderEventArgs} argsData Arguments of accumulation points.
     * @param {boolean} redraw redraw value.
     * @returns {Size} Size of a template.
     */
    private getTemplateSize;
    /**
     * To set the template element style
     *
     * @param {HTMLElement} childElement Set a child element of template.
     * @param {AccPoints} point Template point.
     * @param {parent} parent Parent element of template.
     * @param {labelColor} labelColor Template label color.
     * @param {string} fill Fill color of template.
     */
    private setTemplateStyle;
    /**
     * To find saturated color for datalabel
     *
     * @returns {string} Get a saturated color.
     */
    private getSaturatedColor;
    /**
     * Animates the data label template.
     *
     * @returns {void}
     * @private
     */
    doTemplateAnimation(accumulation: AccumulationChart, element: Element): void;
    /**
     * To find background color for the datalabel
     *
     * @returns {string} AccPoints
     */
    private getLabelBackground;
    /**
     * To correct the padding between datalabel regions.
     */
    private correctLabelRegion;
    /**
     * To get the dataLabel module name
     *
     * @returns {string} module name
     */
    protected getModuleName(): string;
    /**
     * To destroy the data label.
     *
     * @returns {void}
     * @private
     */
    destroy(): void;
    private extendedLabelsCalculation;
    /**
     * Rightside points alignments calculation
     *
     * @param {AccumulationSeries} series To get a proper series.
     */
    private arrangeRightSidePoints;
    /**
     * Leftside points alignments calculation
     *
     * @param {AccumulationSeries} series To get a proper series.
     */
    private arrangeLeftSidePoints;
    private decreaseAngle;
    private increaseAngle;
    private changeLabelAngle;
    private isOverlapWithPrevious;
    private isOverlapWithNext;
    private skipPoints;
    private getPerpendicularDistance;
}
