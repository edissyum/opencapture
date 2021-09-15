var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Property, ChildProperty, isBlazor } from '@syncfusion/ej2-base';
import { Tooltip } from '@syncfusion/ej2-popups';
import { BlazorTooltip } from '../blazor-tooltip/blazor-Tooltip';
/**
 * Defines the tooltip that should be shown when the mouse hovers over node.
 * An object that defines the description, appearance and alignments of tooltip
 */
var DiagramTooltip = /** @class */ (function (_super) {
    __extends(DiagramTooltip, _super);
    function DiagramTooltip() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property('')
    ], DiagramTooltip.prototype, "content", void 0);
    __decorate([
        Property('TopLeft')
    ], DiagramTooltip.prototype, "position", void 0);
    __decorate([
        Property('Mouse')
    ], DiagramTooltip.prototype, "relativeMode", void 0);
    __decorate([
        Property(true)
    ], DiagramTooltip.prototype, "showTipPointer", void 0);
    __decorate([
        Property('auto')
    ], DiagramTooltip.prototype, "width", void 0);
    __decorate([
        Property('auto')
    ], DiagramTooltip.prototype, "height", void 0);
    __decorate([
        Property('Auto')
    ], DiagramTooltip.prototype, "openOn", void 0);
    __decorate([
        Property()
    ], DiagramTooltip.prototype, "animation", void 0);
    return DiagramTooltip;
}(ChildProperty));
export { DiagramTooltip };
/**
 * initTooltip method \
 *
 * @returns { Tooltip | BlazorTooltip } initTooltip method .\
 * @param {Diagram} diagram - provide the points value.
 *
 * @private
 */
export function initTooltip(diagram) {
    var tooltip;
    if (!isBlazor()) {
        var tooltipOption = new Tooltip;
        tooltipOption = updateTooltipContent(diagram.tooltip, tooltipOption);
        tooltip = new Tooltip(tooltipOption);
        tooltip.beforeCollision = beforeCollision;
        tooltip.beforeOpen = beforeOpen;
        tooltip.cssClass = 'e-diagram-tooltip';
        tooltip.opensOn = 'custom';
        tooltip.appendTo('#' + diagram.element.id);
        tooltip.close();
    }
    else {
        tooltip = new BlazorTooltip(diagram);
        tooltip = updateTooltipContent(diagram.tooltip, tooltip);
    }
    return tooltip;
}
/**
 * beforeOpen method \
 *
 * @returns { void } beforeOpen method .\
 * @param {TooltipEventArgs} args - provide the points value.
 *
 * @private
 */
function beforeOpen(args) {
    if ((this.content === '' || this.content === undefined)) {
        args.element.style.display = 'none';
    }
}
/**
 * beforeCollision method \
 *
 * @returns { void } beforeCollision method .\
 * @param {TooltipEventArgs} args - provide the points value.
 *
 * @private
 */
function beforeCollision(args) {
    if ((args.collidedPosition && args.collidedPosition !== this.position)) {
        args.element.style.display = 'none';
    }
}
/**
 * updateTooltip method \
 *
 * @returns { Tooltip } updateTooltip method .\
 * @param {Diagram} diagram - provide the points value.
 * @param {NodeModel | ConnectorModel} node - provide the points value.
 *
 * @private
 */
export function updateTooltip(diagram, node) {
    //let tooltip: DiagramTooltipModel;
    var tooltipObject = diagram.tooltipObject;
    var tooltip = node ? node.tooltip : diagram.tooltip;
    updateTooltipContent(tooltip, tooltipObject);
    return tooltipObject;
}
/**
 * updateTooltipContent method \
 *
 * @returns { Tooltip | BlazorTooltip } updateTooltipContent method .\
 * @param {DiagramTooltipModel} tooltip - provide the points value.
 * @param {Tooltip | BlazorTooltip} tooltipObject - provide the points value.
 *
 * @private
 */
function updateTooltipContent(tooltip, tooltipObject) {
    if (tooltip.content) {
        tooltipObject.content = tooltip.content;
        tooltipObject.position = tooltip.position;
        tooltipObject.showTipPointer = tooltip.showTipPointer;
        tooltipObject.width = tooltip.width;
        tooltipObject.height = tooltip.height;
        if (!tooltip.animation) {
            tooltipObject.animation = { close: { effect: 'None' } };
        }
        else {
            tooltipObject.animation = tooltip.animation;
        }
    }
    else {
        tooltipObject.close();
    }
    return tooltipObject;
}
