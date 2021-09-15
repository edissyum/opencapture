import { ChildProperty } from '@syncfusion/ej2-base';
import { Tooltip, AnimationModel, Position } from '@syncfusion/ej2-popups';
import { BlazorTooltip } from '../blazor-tooltip/blazor-Tooltip';
import { TooltipRelativeMode, TooltipMode } from '../enum/enum';
import { Diagram } from '../diagram';
import { NodeModel } from './node-model';
import { ConnectorModel } from './connector-model';
/**
 * Defines the tooltip that should be shown when the mouse hovers over node.
 * An object that defines the description, appearance and alignments of tooltip
 */
export declare abstract class DiagramTooltip extends ChildProperty<DiagramTooltip> {
    /**
     * Defines the content of the Tooltip
     *
     * @default ''
     */
    content: string | HTMLElement;
    /**
     * Defines the position of the Tooltip
     *
     * @default 'TopLeft'
     * @aspDefaultValueIgnore
     * @blazorType Syncfusion.Blazor.Popups.Position
     * @blazorDefaultValue Syncfusion.Blazor.Popups.Position.TopLeft
     * @isEnumeration true
     */
    position: Position;
    /**
     * Defines the relative mode of the Tooltip
     * * Object - sets the tooltip position relative to the node
     * * Mouse - sets the tooltip position relative to the mouse
     *
     * @default 'Mouse'
     */
    relativeMode: TooltipRelativeMode;
    /**
     * Defines if the Tooltip has tip pointer or not
     *
     * @default true
     */
    showTipPointer: boolean;
    /**
     * Sets the width of the Tooltip
     *
     * @default 'auto'
     */
    width: number | string;
    /**
     * Sets the height of the Tooltip
     *
     * @default 'auto'
     */
    height: number | string;
    /**
     * Sets how to open the Tooltip
     *
     * @default 'Auto'
     */
    openOn: TooltipMode;
    /**
     * Allows to set the same or different animation option for the Tooltip, when it is opened or closed.
     * ```html
     * <div id='diagram'></div>
     * ```
     * ```typescript
     * let diagram: Diagram = new Diagram({
     * ...
     * constraints: DiagramConstraints.Default | DiagramConstraints.Tooltip,
     * tooltip: { content: getcontent(), position: 'TopLeft', relativeMode: 'Object',
     * animation: { open: { effect: 'FadeZoomIn', delay: 0 },
     * close: { effect: 'FadeZoomOut', delay: 0 } } },
     * ...
     * });
     * diagram.appendTo('#diagram');
     * function getcontent(): => {
     * ...
     * }
     * ```
     *
     * @aspDefaultValueIgnore
     * @blazorType Syncfusion.Blazor.Popups.AnimationModel
     * @default { open: { effect: 'FadeIn', duration: 150, delay: 0 }, close: { effect: 'FadeOut', duration: 150, delay: 0 } }
     */
    animation: AnimationModel;
}
/**
 * initTooltip method \
 *
 * @returns { Tooltip | BlazorTooltip } initTooltip method .\
 * @param {Diagram} diagram - provide the points value.
 *
 * @private
 */
export declare function initTooltip(diagram: Diagram): Tooltip | BlazorTooltip;
/**
 * updateTooltip method \
 *
 * @returns { Tooltip } updateTooltip method .\
 * @param {Diagram} diagram - provide the points value.
 * @param {NodeModel | ConnectorModel} node - provide the points value.
 *
 * @private
 */
export declare function updateTooltip(diagram: Diagram, node?: NodeModel | ConnectorModel): Tooltip;
