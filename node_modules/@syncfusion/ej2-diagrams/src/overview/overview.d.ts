import { RenderingMode } from '../diagram/enum/enum';
import { DiagramRenderer } from '../diagram/rendering/renderer';
import { INotifyPropertyChanged, Component, EmitType } from '@syncfusion/ej2-base';
import { OverviewModel } from './overview-model';
/**
 * Overview control allows you to see a preview or an overall view of the entire content of a Diagram.
 * This helps you to look at the overall picture of a large Diagram
 * To navigate, pan, or zoom, on a particular position of the page.
 * ```html
 * <div id='diagram'/>
 * <div id="overview"></div>
 * ```
 * ```typescript
 * let overview: Overview;
 * let diagram: Diagram = new Diagram({
 * width:'1000px', height:'500px' });
 * diagram.appendTo('#diagram');
 * let options: OverviewModel = {};
 * options.sourceID = 'diagram';
 * options.width = '250px';
 * options.height = '500px';
 * overview = new Overview(options);
 * overview.appendTo('#overview');
 * ```
 */
export declare class Overview extends Component<HTMLElement> implements INotifyPropertyChanged {
    /**
     * Defines the width of the overview
     *
     * @default '100%'
     */
    width: string | number;
    /**
     * Defines the height of the overview
     *
     * @default '100%'
     */
    height: string | number;
    /**
     * Defines the ID of the overview
     *
     * @default ''
     */
    sourceID: string;
    /**
     * Triggers after render the diagram elements
     *
     * @event
     * @blazorProperty 'Created'
     */
    created: EmitType<Object>;
    private parent;
    private canvas;
    private svg;
    /** @private */
    mode: RenderingMode;
    /** @private */
    id: string;
    private actionName;
    private startPoint;
    private currentPoint;
    private prevPoint;
    private resizeDirection;
    private scale;
    private inAction;
    private viewPortRatio;
    private horizontalOffset;
    private verticalOffset;
    /** @private */
    contentWidth: number;
    /** @private */
    contentHeight: number;
    /** @private */
    diagramLayer: HTMLCanvasElement | SVGGElement;
    private diagramLayerDiv;
    private model;
    private helper;
    private resizeTo;
    private event;
    private overviewid;
    /**   @private  */
    diagramRenderer: DiagramRenderer;
    constructor(options?: OverviewModel, element?: HTMLElement | string);
    /**
     * Updates the overview control when the objects are changed
     *
     * @param {OverviewModel} newProp - Lists the new values of the changed properties
     * @param {OverviewModel} oldProp - Lists the old values of the changed properties
     */
    onPropertyChanged(newProp: OverviewModel, oldProp: OverviewModel): void;
    /**
     * Get the properties to be maintained in the persisted state.
     *
     * @returns {string}  Get the properties to be maintained in the persisted state.
     */
    getPersistData(): string;
    /**
     * Initializes the values of private members.
     *
     * @returns {void}  Initializes the values of private members.
     * @private
     */
    protected preRender(): void;
    protected render(): void;
    private getSizeValue;
    private renderCanvas;
    private setParent;
    private getDiagram;
    private unWireEvents;
    private wireEvents;
    /**
     * renderDocument method\
     *
     * @returns {  void }    renderDocument method .\
     * @param {Overview} view - provide the angle value.
     * @private
     */
    renderDocument(view: Overview): void;
    /**
     * removeDocument method\
     *
     * @returns {  void }    removeDocument method .\
     * @param {Overview} view - provide the angle value.
     * @private
     */
    removeDocument(view: Overview): void;
    private renderHtmlLayer;
    private renderNativeLayer;
    private addOverviewRectPanel;
    private renderOverviewCorner;
    private updateOverviewRectangle;
    private updateHelper;
    private updateOverviewrect;
    private updateOverviewCorner;
    private translateOverviewRectangle;
    private renderOverviewRect;
    private scrollOverviewRect;
    private updateParentView;
    updateHtmlLayer(view: Overview): void;
    /** @private */
    /**
     * updateView method\
     *
     * @returns {  void }    removeDocument method .\
     * @param {Overview} view - provide the angle value.
     * @private
     */
    updateView(view: Overview): void;
    private scrolled;
    private updateCursor;
    private mouseMove;
    private documentMouseUp;
    private windowResize;
    /**
     * mouseDown method\
     *
     * @returns {  void }    mouseDown method .\
     * @param {PointerEvent | TouchEvent} evt - provide the angle value.
     * @private
     */
    mouseDown(evt: PointerEvent | TouchEvent): void;
    private mouseUp;
    private initHelper;
    private mousePosition;
    /**
     *To destroy the overview
     *
     * @returns {void} To destroy the overview
     */
    destroy(): void;
    /**
     * Core method to return the component name.
     *
     * @returns {string}  Core method to return the component name.
     * @private
     */
    protected getModuleName(): string;
}
