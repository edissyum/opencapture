import { Component, INotifyPropertyChanged } from '@syncfusion/ej2-base';
import { ModuleDeclaration } from '@syncfusion/ej2-base';
import { EmitType } from '@syncfusion/ej2-base';
import { SmithchartRect, SmithchartSize } from '../smithchart/utils/utils';
import { SmithchartMarginModel, SmithchartBorderModel, SmithchartFontModel } from '../smithchart/utils/utils-model';
import { TitleModel } from '../smithchart/title/title-model';
import { SmithchartLegendSettingsModel } from '../smithchart/legend/legend-model';
import { SmithchartAxisModel } from '../smithchart/axis/axis-model';
import { TooltipRender } from '../smithchart/series/tooltip';
import { ISmithchartLoadedEventArgs, ISmithchartLoadEventArgs, ISmithchartThemeStyle } from '../smithchart/model/interface';
import { ISmithchartLegendRenderEventArgs, ITitleRenderEventArgs, ISubTitleRenderEventArgs } from '../smithchart/model/interface';
import { ISmithchartAxisLabelRenderEventArgs, ISmithchartPrintEventArgs, ISmithChartTooltipEventArgs } from '../smithchart/model/interface';
import { ISmithchartSeriesRenderEventArgs, ISmithchartAnimationCompleteEventArgs } from '../smithchart/model/interface';
import { ISmithchartTextRenderEventArgs } from '../smithchart/model/interface';
import { SmithchartSeriesModel } from '../smithchart/series/series-model';
import { SmithchartLegend } from '../smithchart/legend/legendrender';
import { SeriesRender } from '../smithchart/series/seriesrender';
import { SmithchartTheme, RenderType } from '../smithchart/utils/enum';
import { SvgRenderer } from '@syncfusion/ej2-svg-base';
import { SmithchartExportType } from '../smithchart/utils/enum';
import { PdfPageOrientation } from '@syncfusion/ej2-pdf-export';
import { SmithchartModel } from '../smithchart/smithchart-model';
/**
 * Represents the Smithchart control.
 * ```html
 * <div id="smithchart"/>
 * <script>
 *   var chartObj = new Smithchart({ isResponsive : true });
 *   chartObj.appendTo("#smithchart");
 * </script>
 * ```
 */
export declare class Smithchart extends Component<HTMLElement> implements INotifyPropertyChanged {
    /**
     * legend bounds
     */
    legendBounds: SmithchartRect;
    /**
     * area bounds
     */
    bounds: SmithchartRect;
    /**
     * `smithchartLegendModule` is used to add legend to the smithchart.
     */
    smithchartLegendModule: SmithchartLegend;
    /**
     * `tooltipRenderModule` is used to add tooltip to the smithchart.
     */
    tooltipRenderModule: TooltipRender;
    /**
     * render type of smithchart.
     *
     * @default Impedance
     */
    renderType: RenderType;
    /**
     * width for smithchart.
     *
     * @default ''
     */
    width: string;
    /**
     * height for smithchart.
     *
     * @default ''
     */
    height: string;
    /**
     * theme for smithchart.
     *
     * @default Material
     */
    theme: SmithchartTheme;
    /** @private */
    seriesrender: SeriesRender;
    /** @private */
    themeStyle: ISmithchartThemeStyle;
    /** @private */
    availableSize: SmithchartSize;
    /**
     *  options for customizing margin
     */
    margin: SmithchartMarginModel;
    /**
     *  options for customizing margin
     */
    font: SmithchartFontModel;
    /**
     *  options for customizing border
     */
    border: SmithchartBorderModel;
    /**
     *  options for customizing title
     */
    title: TitleModel;
    /**
     *  options for customizing series
     */
    series: SmithchartSeriesModel[];
    /**
     *  options for customizing legend
     */
    legendSettings: SmithchartLegendSettingsModel;
    /**
     * Options to configure the horizontal axis.
     */
    horizontalAxis: SmithchartAxisModel;
    /**
     * Options to configure the vertical axis.
     */
    radialAxis: SmithchartAxisModel;
    /**
     * svg renderer object.
     *
     * @private
     */
    renderer: SvgRenderer;
    /** @private */
    svgObject: Element;
    /** @private */
    animateSeries: boolean;
    /** @private */
    seriesColors: string[];
    chartArea: SmithchartRect;
    /**
     * Resize the smithchart
     */
    private resizeTo;
    private isTouch;
    private fadeoutTo;
    /**
     * The background color of the smithchart.
     */
    background: string;
    /**
     *  Spacing between elements
     *
     * @default 10
     */
    elementSpacing: number;
    /**
     *  Spacing between elements
     *
     * @default 1
     */
    radius: number;
    /**
     * Triggers before the prints gets started.
     *
     * @event beforePrint
     */
    beforePrint: EmitType<ISmithchartPrintEventArgs>;
    /**
     * Triggers after the animation completed.
     *
     * @event animationComplete
     */
    animationComplete: EmitType<ISmithchartAnimationCompleteEventArgs>;
    /**
     * Triggers before smithchart rendered.
     *
     * @event load
     */
    load: EmitType<ISmithchartLoadEventArgs>;
    /**
     * Triggers after smithchart rendered.
     *
     * @event loaded
     */
    loaded: EmitType<ISmithchartLoadedEventArgs>;
    /**
     * Triggers before the legend is rendered.
     *
     * @event legendRender
     */
    legendRender: EmitType<ISmithchartLegendRenderEventArgs>;
    /**
     * Triggers before the title is rendered.
     *
     * @event titleRender
     */
    titleRender: EmitType<ITitleRenderEventArgs>;
    /**
     * Triggers before the sub-title is rendered.
     *
     * @event subtitleRender
     */
    subtitleRender: EmitType<ISubTitleRenderEventArgs>;
    /**
     * Triggers before the datalabel text is rendered.
     *
     * @event textRender
     */
    textRender: EmitType<ISmithchartTextRenderEventArgs>;
    /**
     * Triggers before the axis label is rendered
     *
     * @event axisLabelRender
     */
    axisLabelRender: EmitType<ISmithchartAxisLabelRenderEventArgs>;
    /**
     * Triggers before the series is rendered.
     *
     * @event seriesRender
     */
    seriesRender: EmitType<ISmithchartSeriesRenderEventArgs>;
    /**
     * Triggers before the tooltip rendering
     *
     * @event tooltipRender
     */
    tooltipRender: EmitType<ISmithChartTooltipEventArgs>;
    /**
     * Get component name
     */
    getModuleName(): string;
    /**
     * Get the properties to be maintained in the persisted state.
     *
     * @private
     */
    getPersistData(): string;
    /**
     * Method to create SVG element.
     */
    private createChartSvg;
    private renderTitle;
    private renderSubtitle;
    /**
     * Render the smithchart border
     *
     * @private
     */
    private renderBorder;
    /**
     * Called internally if any of the property value changed.
     *
     * @private
     */
    onPropertyChanged(newProp: SmithchartModel, oldProp: SmithchartModel): void;
    /**
     * Constructor for creating the Smithchart widget
     */
    constructor(options?: SmithchartModel, element?: string | HTMLElement);
    /**
     * Initialize the event handler.
     */
    protected preRender(): void;
    private initPrivateVariable;
    /**
     * To Initialize the control rendering.
     */
    private setTheme;
    protected render(): void;
    private createSecondaryElement;
    /**
     * To destroy the widget
     *
     * @returns {void}.
     */
    destroy(): void;
    /**
     * To bind event handlers for smithchart.
     */
    private wireEVents;
    mouseMove(e: PointerEvent): void;
    mouseEnd(e: PointerEvent): void;
    /**
     * To handle the click event for the smithchart.
     */
    smithchartOnClick(e: PointerEvent): void;
    /**
     * To unbind event handlers from smithchart.
     */
    private unWireEVents;
    print(id?: string[] | string | Element): void;
    /**
     * Handles the export method for chart control.
     */
    export(type: SmithchartExportType, fileName: string, orientation?: PdfPageOrientation): void;
    /**
     * To handle the window resize event on smithchart.
     */
    smithchartOnResize(): boolean;
    /**
     * To provide the array of modules needed for smithchart rendering
     *
     * @private
     */
    requiredModules(): ModuleDeclaration[];
    /**
     * To Remove the SVG.
     *
     * @private
     */
    removeSvg(): void;
}
