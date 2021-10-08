import { Component, INotifyPropertyChanged } from '@syncfusion/ej2-base';
import { SvgRenderer } from '@syncfusion/ej2-svg-base';
import { L10n, Internationalization, EmitType, ModuleDeclaration } from '@syncfusion/ej2-base';
import { SparklineBorderModel, SparklineTooltipSettingsModel, ContainerAreaModel, AxisSettingsModel } from './model/base-model';
import { SparklineMarkerSettingsModel, SparklineDataLabelSettingsModel, RangeBandSettingsModel, PaddingModel } from './model/base-model';
import { SparklineType, SparklineValueType, SparklineRangePadding, SparklineTheme } from './model/enum';
import { Size } from './utils/helper';
import { ISparklineLoadedEventArgs, ISparklineLoadEventArgs, IDataLabelRenderingEventArgs, IPointRegionEventArgs } from './model/interface';
import { IMarkerRenderingEventArgs, ISparklinePointEventArgs, ISparklineMouseEventArgs } from './model/interface';
import { IAxisRenderingEventArgs, ISparklineResizeEventArgs, ITooltipRenderingEventArgs } from './model/interface';
import { ISeriesRenderingEventArgs, IThemes } from './model/interface';
import { SparklineRenderer } from './rendering/sparkline-renderer';
import { SparklineTooltip } from './rendering/sparkline-tooltip';
import { SparklineModel } from './sparkline-model';
import { DataManager, Query } from '@syncfusion/ej2-data';
/**
 * Represents the Sparkline control.
 * ```html
 * <div id="sparkline"/>
 * <script>
 *   var sparkline = new Sparkline();
 *   sparkline.appendTo("#sparkline");
 * </script>
 * ```
 */
export declare class Sparkline extends Component<HTMLElement> implements INotifyPropertyChanged {
    sparklineTooltipModule: SparklineTooltip;
    /**
     * To configure Sparkline width.
     */
    width: string;
    /**
     * To configure Sparkline height.
     */
    height: string;
    /**
     * To configure Sparkline points border color and width.
     */
    border: SparklineBorderModel;
    /**
     * To configure Sparkline series type.
     * @default 'Line'
     */
    type: SparklineType;
    /**
     * To configure Sparkline series type.
     * @default 'None'
     */
    rangePadding: SparklineRangePadding;
    /**
     * To configure sparkline data source.
     * @isGenericType true
     * @default null
     */
    dataSource: Object[] | DataManager;
    /**
     * Specifies the query for filter the data.
     * @default null
     */
    query: Query;
    /**
     * To configure sparkline series value type.
     * @default 'Numeric'
     */
    valueType: SparklineValueType;
    /**
     * To configure sparkline series xName.
     * @default null
     */
    xName: string;
    /**
     * To configure sparkline series yName.
     * @default null
     */
    yName: string;
    /**
     * To configure sparkline series fill.
     * @default '#00bdae'
     */
    fill: string;
    /**
     * To configure sparkline series highest y value point color.
     * @default ''
     */
    highPointColor: string;
    /**
     * To configure sparkline series lowest y value point color.
     * @default ''
     */
    lowPointColor: string;
    /**
     * To configure sparkline series first x value point color.
     * @default ''
     */
    startPointColor: string;
    /**
     * To configure sparkline series last x value point color.
     * @default ''
     */
    endPointColor: string;
    /**
     * To configure sparkline series negative y value point color.
     * @default ''
     */
    negativePointColor: string;
    /**
     * To configure sparkline winloss series tie y value point color.
     * @default ''
     */
    tiePointColor: string;
    /**
     * To configure sparkline series color palette. It applicable to column and pie type series.
     * @default []
     */
    palette: string[];
    /**
     * To configure sparkline line series width.
     * @default '1'
     */
    lineWidth: number;
    /**
     * To configure sparkline line series opacity.
     * @default '1'
     */
    opacity: number;
    /**
     * To apply internationalization for sparkline.
     * @default null
     */
    format: string;
    /**
     * To enable the separator
     * @default false
     */
    useGroupingSeparator: boolean;
    /**
     * To configure Sparkline tooltip settings.
     */
    tooltipSettings: SparklineTooltipSettingsModel;
    /**
     * To configure Sparkline container area customization.
     */
    containerArea: ContainerAreaModel;
    /**
     * To configure Sparkline axis line customization.
     */
    rangeBandSettings: RangeBandSettingsModel[];
    /**
     * To configure Sparkline container area customization.
     */
    axisSettings: AxisSettingsModel;
    /**
     * To configure Sparkline marker configuration.
     */
    markerSettings: SparklineMarkerSettingsModel;
    /**
     * To configure Sparkline dataLabel configuration.
     */
    dataLabelSettings: SparklineDataLabelSettingsModel;
    /**
     * To configure Sparkline container area customization.
     */
    padding: PaddingModel;
    /**
     * To configure sparkline theme.
     * @default 'Material'
     */
    theme: SparklineTheme;
    /**
     * Triggers after sparkline rendered.
     * @event
     */
    loaded: EmitType<ISparklineLoadedEventArgs>;
    /**
     * Triggers before sparkline render.
     * @event
     */
    load: EmitType<ISparklineLoadEventArgs>;
    /**
     * Triggers before sparkline tooltip render.
     * @event
     */
    tooltipInitialize: EmitType<ITooltipRenderingEventArgs>;
    /**
     * Triggers before sparkline series render.
     * @event
     */
    seriesRendering: EmitType<ISeriesRenderingEventArgs>;
    /**
     * Triggers before sparkline axis render.
     * @event
     */
    axisRendering: EmitType<IAxisRenderingEventArgs>;
    /**
     * Triggers before sparkline points render.
     * @event
     */
    pointRendering: EmitType<ISparklinePointEventArgs>;
    /**
     * Triggers while mouse move on the sparkline point region.
     * @event
     */
    pointRegionMouseMove: EmitType<IPointRegionEventArgs>;
    /**
     * Triggers while mouse click on the sparkline point region.
     * @event
     */
    pointRegionMouseClick: EmitType<IPointRegionEventArgs>;
    /**
     * Triggers while mouse move on the sparkline container.
     * @event
     */
    sparklineMouseMove: EmitType<ISparklineMouseEventArgs>;
    /**
     * Triggers while mouse click on the sparkline container.
     * @event
     */
    sparklineMouseClick: EmitType<ISparklineMouseEventArgs>;
    /**
     * Triggers before the sparkline datalabel render.
     * @event
     */
    dataLabelRendering: EmitType<IDataLabelRenderingEventArgs>;
    /**
     * Triggers before the sparkline marker render.
     * @event
     */
    markerRendering: EmitType<IMarkerRenderingEventArgs>;
    /**
     * Triggers on resizing the sparkline.
     * @event
     */
    resize: EmitType<ISparklineResizeEventArgs>;
    /**
     * SVG renderer object.
     * @private
     */
    renderer: SvgRenderer;
    /**
     * Sparkline renderer object.
     * @private
     */
    sparklineRenderer: SparklineRenderer;
    /**
     * Sparkline SVG element's object
     * @private
     */
    svgObject: Element;
    /** @private */
    isDevice: Boolean;
    /** @private */
    intervalDivs: number[];
    /** @private */
    isTouch: Boolean;
    /** @private */
    mouseX: number;
    /** @private */
    mouseY: number;
    /**
     * resize event timer
     * @private
     */
    resizeTo: number;
    /**
     * Sparkline available height, width
     * @private
     */
    availableSize: Size;
    /**
     * Sparkline theme support
     *  @private
     */
    sparkTheme: IThemes;
    /**
     * localization object
     * @private
     */
    localeObject: L10n;
    /**
     * To process sparkline data internally.
     * @private
     */
    sparklineData: Object[] | DataManager;
    /**
     * It contains default values of localization values
     */
    private defaultLocalConstants;
    /**
     * Internal use of internationalization instance.
     * @private
     */
    intl: Internationalization;
    /**
     * Constructor for creating the Sparkline widget
     */
    constructor(options?: SparklineModel, element?: string | HTMLElement);
    /**
     * Initializing pre-required values for sparkline.
     */
    protected preRender(): void;
    /**
     * Sparkline Elements rendering starting.
     */
    protected render(): void;
    /**
     * @private
     */
    processSparklineData(): void;
    /**
     * To render sparkline elements
     */
    renderSparkline(): void;
    /**
     * Create secondary element for the tooltip
     */
    private createDiv;
    /**
     * To set the left and top position for data label template for sparkline
     */
    private setSecondaryElementPosition;
    /**
     * @private
     * Render the sparkline border
     */
    private renderBorder;
    /**
     * To create svg element for sparkline
     */
    private createSVG;
    /**
     * To Remove the Sparkline SVG object
     */
    private removeSvg;
    /**
     * Method to set culture for sparkline
     */
    private setCulture;
    /**
     * To provide the array of modules needed for sparkline rendering
     * @return {ModuleDeclaration[]}
     * @private
     */
    requiredModules(): ModuleDeclaration[];
    /**
     * Method to unbind events for sparkline chart
     */
    private unWireEvents;
    /**
     * Method to bind events for the sparkline
     */
    private wireEvents;
    /**
     * Sparkline resize event.
     * @private
     */
    sparklineResize(e: Event): boolean;
    /**
     * Handles the mouse move on sparkline.
     * @return {boolean}
     * @private
     */
    sparklineMove(e: PointerEvent): boolean;
    /**
     * Handles the mouse click on sparkline.
     * @return {boolean}
     * @private
     */
    sparklineClick(e: PointerEvent): boolean;
    /**
     * To check mouse event target is point region or not.
     */
    private isPointRegion;
    /**
     * Handles the mouse end.
     * @return {boolean}
     * @private
     */
    sparklineMouseEnd(e: PointerEvent): boolean;
    /**
     * Handles the mouse leave on sparkline.
     * @return {boolean}
     * @private
     */
    sparklineMouseLeave(e: PointerEvent): boolean;
    /**
     * Method to set mouse x, y from events
     */
    private setSparklineMouseXY;
    /**
     * To change rendering while property value modified.
     * @private
     */
    onPropertyChanged(newProp: SparklineModel, oldProp: SparklineModel): void;
    /**
     * To render sparkline series and appending.
     */
    private refreshSparkline;
    /**
     * Get component name
     */
    getModuleName(): string;
    /**
     * Destroy the component
     */
    destroy(): void;
    /**
     * Get the properties to be maintained in the persisted state.
     * @private
     */
    getPersistData(): string;
}
