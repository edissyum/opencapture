/**
 * Sparkline base API Class declarations.
 */
import { ChildProperty } from '@syncfusion/ej2-base';
import { SparklineBorderModel, LineSettingsModel, SparklineFontModel, LabelOffsetModel, TrackLineSettingsModel } from './base-model';
import { VisibleType, EdgeLabelMode } from './enum';
/**
 * Configures the borders in the Sparkline.
 */
export declare class SparklineBorder extends ChildProperty<SparklineBorder> {
    /**
     * The color of the border that accepts value in hex and rgba as a valid CSS color string.
     */
    color: string;
    /**
     * The width of the border in pixels.
     */
    width: number;
}
/**
 * Configures the fonts in sparklines.
 */
export declare class SparklineFont extends ChildProperty<SparklineFont> {
    /**
     * Font size for the text.
     */
    size: string;
    /**
     * Color for the text.
     */
    color: string;
    /**
     * FontFamily for the text.
     */
    fontFamily: string;
    /**
     * FontWeight for the text.
     */
    fontWeight: string;
    /**
     * FontStyle for the text.
     */
    fontStyle: string;
    /**
     * Opacity for the text.
     *
     * @default 1
     */
    opacity: number;
}
/**
 * To configure the tracker line settings.
 */
export declare class TrackLineSettings extends ChildProperty<TrackLineSettings> {
    /**
     * Toggle the tracker line visibility.
     *
     * @default false
     */
    visible: boolean;
    /**
     * To config the tracker line color.
     */
    color: string;
    /**
     * To config the tracker line width.
     *
     * @default 1
     */
    width: number;
}
/**
 * To configure the tooltip settings for sparkline.
 */
export declare class SparklineTooltipSettings extends ChildProperty<SparklineTooltipSettings> {
    /**
     * Toggle the tooltip visibility.
     *
     * @default false
     */
    visible: boolean;
    /**
     * To customize the tooltip fill color.
     */
    fill: string;
    /**
     * To customize the tooltip template.
     */
    template: string;
    /**
     * To customize the tooltip format.
     */
    format: string;
    /**
     * To configure tooltip border color and width.
     */
    border: SparklineBorderModel;
    /**
     * To configure tooltip text styles.
     */
    textStyle: SparklineFontModel;
    /**
     * To configure the tracker line options.
     */
    trackLineSettings: TrackLineSettingsModel;
}
/**
 * To configure the sparkline container area customization
 */
export declare class ContainerArea extends ChildProperty<ContainerArea> {
    /**
     * To configure Sparkline background color.
     *
     * @default 'transparent'
     */
    background: string;
    /**
     * To configure Sparkline border color and width.
     */
    border: SparklineBorderModel;
}
/**
 * To configure axis line settings
 */
export declare class LineSettings extends ChildProperty<LineSettings> {
    /**
     * To toggle the axis line visibility.
     *
     * @default `false`
     */
    visible: boolean;
    /**
     * To configure the sparkline axis line color.
     */
    color: string;
    /**
     * To configure the sparkline axis line dashArray.
     *
     * @default ''
     */
    dashArray: string;
    /**
     * To configure the sparkline axis line width.
     *
     * @default 1.
     */
    width: number;
    /**
     * To configure the sparkline axis line opacity.
     *
     * @default 1.
     */
    opacity: number;
}
/**
 * To configure the sparkline rangeband
 */
export declare class RangeBandSettings extends ChildProperty<RangeBandSettings> {
    /**
     * To configure sparkline start range
     *
     * @aspDefaultValueIgnore
     */
    startRange: number;
    /**
     * To configure sparkline end range
     *
     * @aspDefaultValueIgnore
     */
    endRange: number;
    /**
     * To configure sparkline rangeband color
     */
    color: string;
    /**
     * To configure sparkline rangeband opacity
     *
     * @default 1
     */
    opacity: number;
}
/**
 * To configure the sparkline axis
 */
export declare class AxisSettings extends ChildProperty<AxisSettings> {
    /**
     * To configure Sparkline x axis min value.
     *
     * @aspDefaultValueIgnore
     */
    minX: number;
    /**
     * To configure Sparkline x axis max value.
     *
     * @aspDefaultValueIgnore
     */
    maxX: number;
    /**
     * To configure Sparkline y axis min value.
     *
     * @aspDefaultValueIgnore
     */
    minY: number;
    /**
     * To configure Sparkline y axis max value.
     *
     * @aspDefaultValueIgnore
     */
    maxY: number;
    /**
     * To configure Sparkline horizontal axis line position.
     *
     * @default 0
     */
    value: number;
    /**
     * To configure Sparkline axis line settings.
     */
    lineSettings: LineSettingsModel;
}
/**
 * To configure the sparkline padding.
 */
export declare class Padding extends ChildProperty<Padding> {
    /**
     * To configure Sparkline left padding.
     *
     * @default 5
     */
    left: number;
    /**
     * To configure Sparkline right padding.
     *
     * @default 5
     */
    right: number;
    /**
     * To configure Sparkline bottom padding.
     *
     * @default 5
     */
    bottom: number;
    /**
     * To configure Sparkline top padding.
     *
     * @default 5
     */
    top: number;
}
/**
 * To configure the sparkline marker options.
 */
export declare class SparklineMarkerSettings extends ChildProperty<SparklineMarkerSettings> {
    /**
     * To toggle the marker visibility.
     *
     * @default `[]`.
     */
    visible: VisibleType[];
    /**
     * To configure the marker opacity.
     *
     * @default 1
     */
    opacity: number;
    /**
     * To configure the marker size.
     *
     * @default 5
     */
    size: number;
    /**
     * To configure the marker fill color.
     *
     * @default '#00bdae'
     */
    fill: string;
    /**
     * To configure Sparkline marker border color and width.
     */
    border: SparklineBorderModel;
}
/**
 * To configure the datalabel offset
 */
export declare class LabelOffset extends ChildProperty<LabelOffset> {
    /**
     * To move the datalabel horizontally.
     */
    x: number;
    /**
     * To move the datalabel vertically.
     */
    y: number;
}
/**
 * To configure the sparkline dataLabel options.
 */
export declare class SparklineDataLabelSettings extends ChildProperty<SparklineDataLabelSettings> {
    /**
     * To toggle the dataLabel visibility.
     *
     * @default `[]`.
     */
    visible: VisibleType[];
    /**
     * To configure the dataLabel opacity.
     *
     * @default 1
     */
    opacity: number;
    /**
     * To configure the dataLabel fill color.
     *
     * @default 'transparent'
     */
    fill: string;
    /**
     * To configure the dataLabel format the value.
     *
     * @default ''
     */
    format: string;
    /**
     * To configure Sparkline dataLabel border color and width.
     */
    border: SparklineBorderModel;
    /**
     * To configure Sparkline dataLabel text styles.
     */
    textStyle: SparklineFontModel;
    /**
     * To configure Sparkline dataLabel offset.
     */
    offset: LabelOffsetModel;
    /**
     * To change the edge dataLabel placement.
     *
     * @default 'None'.
     */
    edgeLabelMode: EdgeLabelMode;
}
