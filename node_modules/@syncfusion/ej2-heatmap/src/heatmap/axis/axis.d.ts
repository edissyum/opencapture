/**
 * HeatMap Axis file
 */
import { ChildProperty } from '@syncfusion/ej2-base';
import { Orientation } from '../utils/enum';
import { FontModel, TitleModel, AxisLabelBorderModel, MultiLevelLabelsModel } from '../model/base-model';
import { MultipleRow } from '../model/base';
import { Rect, Size } from '../utils/helper';
import { MultiLevelPosition } from '../utils/helper';
import { ValueType, IntervalType, LabelIntersectAction, LabelType } from '../utils/enum';
import { HeatMap } from '../heatmap';
export declare class Axis extends ChildProperty<Axis> {
    /**
     * Title of heat map axis
     *
     * @default ''
     */
    title: TitleModel;
    /**
     * If set to true, the axis will render at the opposite side of its default position.
     *
     * @default false
     */
    opposedPosition: boolean;
    /**
     * Options for label assignment.
     */
    labels: string[];
    /**
     * Options for customizing the label text.
     */
    textStyle: FontModel;
    /**
     * The angle to rotate the axis label
     *
     * @default 0
     */
    labelRotation: number;
    /**
     * It specifies whether the axis to be rendered in inversed manner or not.
     *
     * @default false
     */
    isInversed: boolean;
    /**
     * Specifies the type of data the axis is handling.
     * * Numeric:  Renders a numeric axis.
     * * DateTime: Renders a dateTime axis.
     * * Category: Renders a category axis.
     *
     * @default Category
     * @aspType Syncfusion.EJ2.HeatMap.ValueType
     * @isEnumeration true
     */
    valueType: ValueType;
    /**
     * Specifies the increment for an axis label.
     *
     * @default 1
     */
    increment: number;
    /**
     * Defines the axis label display type for date time axis.
     * * None: Axis labels displayed based on the value type.
     * * Years: Define the axis labels display in every year.
     * * Months: Define the axis labels display in every month.
     * * Days: Define the axis labels display in every day.
     * * Hours: Define the axis labels display in every hour.
     *
     * @default 'None'
     */
    showLabelOn: LabelType;
    /**
     * Specifies the minimum range of an axis.
     *
     * @default null
     */
    minimum: Object;
    /**
     * Specifies the maximum range of an axis.
     *
     * @default null
     */
    maximum: Object;
    /**
     * Specifies the interval for an axis.
     *
     * @default null
     */
    interval: number;
    /**
     * Used to format the axis label that accepts any global string format like 'C', 'n1', 'P' etc.
     * It also accepts placeholder like '{value}°C' in which value represent the axis label, e.g, 20°C.
     *
     * @default ''
     */
    labelFormat: string;
    /**
     * Specifies the types like `Years`, `Months`, `Days`, `Hours`, `Minutes` in date time axis.They are,
     * * Years: Defines the interval of the axis in years.
     * * Months: Defines the interval of the axis in months.
     * * Days: Defines the interval of the axis in days.
     * * Hours: Defines the interval of the axis in hours.
     * * Minutes: Defines the interval of the axis in minutes.
     *
     * @default 'Days'
     */
    intervalType: IntervalType;
    /**
     * Specifies the actions like `Rotate45`, `None` and `Trim` when the axis labels intersect with each other.They are,
     * * None: Shows all the labels.
     * * Rotate45: Rotates the label to 45 degree when it intersects.
     * * Trim : Trim the label when label text width exceed the label width
     *
     * @default Trim
     */
    labelIntersectAction: LabelIntersectAction;
    /**
     * Enable Trim for heatmap yAxis
     *
     * @default false
     */
    enableTrim: boolean;
    /**
     * Specifies the maximum length of an axis label.
     *
     * @default 35.
     */
    maxLabelLength: number;
    /**
     * Border of the axis labels.
     */
    border: AxisLabelBorderModel;
    /**
     * Specifies the multi level labels collection for the axis
     */
    multiLevelLabels: MultiLevelLabelsModel[];
    /** @private */
    orientation: Orientation;
    /** @private */
    multipleRow: MultipleRow[];
    /** @private */
    rect: Rect;
    /** @private */
    nearSizes: number[];
    /** @private */
    farSizes: number[];
    /** @private */
    maxLabelSize: Size;
    /** @private */
    titleSize: Size;
    /** @private */
    multilevel: number[];
    /** @private */
    axisLabels: string[];
    /** @private */
    tooltipLabels: string[];
    /** @private */
    labelValue: (string | number | Date)[];
    /** @private */
    axisLabelSize: number;
    /** @private */
    axisLabelInterval: number;
    /** @private */
    dateTimeAxisLabelInterval: number[];
    /** @private */
    maxLength: number;
    /** @private */
    min: number;
    /** @private */
    max: number;
    /** @private */
    format: Function;
    /** @private */
    angle: number;
    /** @private */
    isIntersect: boolean;
    /** @private */
    jsonCellLabel: string[];
    multiLevelSize: Size[];
    /** @private */
    xAxisMultiLabelHeight: number[];
    /** @private */
    yAxisMultiLabelHeight: number[];
    /** @private */
    multiLevelPosition: MultiLevelPosition[];
    /**
     * measure the axis title and label size
     *
     * @param axis
     * @param heatmap
     * @private
     */
    computeSize(axis: Axis, heatmap: HeatMap, rect: Rect): void;
    /**
     * calculating x, y position of multi level labels
     *
     * @private
     */
    multiPosition(axis: Axis, index: number): MultiLevelPosition;
    private multiLevelLabelSize;
    private getMultilevelLabelsHeight;
    private getTitleSize;
    private getMaxLabelSize;
    /**
     * Generate the axis lables for numeric axis
     *
     * @param heatmap
     * @private
     */
    calculateNumericAxisLabels(heatmap: HeatMap): void;
    /**
     * Generate the axis lables for category axis
     *
     * @private
     */
    calculateCategoryAxisLabels(): void;
    /**
     * Generate the axis labels for date time axis.
     *
     * @param heatmap
     * @private
     */
    calculateDateTimeAxisLabel(heatmap: HeatMap): void;
    private calculateLabelInterval;
    /**
     * @private
     */
    getSkeleton(): string;
    /** @private */
    getTotalLabelLength(min: number, max: number): number;
    /**
     * Clear the axis label collection
     *
     * @private
     */
    clearAxisLabel(): void;
    /**
     * Clear the axis label collection
     *
     * @private
     */
    clearMultipleRow(): void;
}
