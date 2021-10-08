/* eslint-disable @typescript-eslint/no-explicit-any */
import { createElement, append, closest, addClass } from '@syncfusion/ej2-base';
import { Tooltip } from '@syncfusion/ej2-popups';
import * as cls from '../base/css-constant';
/**
 * Tooltip for Kanban board
 */
var KanbanTooltip = /** @class */ (function () {
    /**
     * Constructor for tooltip module
     *
     * @param {Kanban} parent Accepts the kanban instance
     */
    function KanbanTooltip(parent) {
        this.parent = parent;
        this.renderTooltip();
    }
    KanbanTooltip.prototype.renderTooltip = function () {
        this.tooltipObj = new Tooltip({
            cssClass: this.parent.cssClass + ' ' + cls.TOOLTIP_CLASS,
            enableRtl: this.parent.enableRtl,
            mouseTrail: !this.parent.isAdaptive,
            offsetY: 5,
            position: 'BottomCenter',
            showTipPointer: true,
            target: '.' + cls.TOOLTIP_TEXT_CLASS,
            beforeRender: this.onBeforeRender.bind(this),
            beforeClose: this.onBeforeClose.bind(this)
        });
        this.tooltipObj.appendTo(this.parent.element);
        this.tooltipObj.isStringTemplate = true;
    };
    KanbanTooltip.prototype.onBeforeRender = function (args) {
        if (this.parent.dragAndDropModule.isDragging) {
            args.cancel = true;
            return;
        }
        var tooltipContent;
        if (this.parent.tooltipTemplate) {
            tooltipContent = createElement('div');
            var target = closest(args.target, '.' + cls.CARD_CLASS);
            var data = this.parent.getCardDetails(target);
            var templateId = this.parent.element.id + '_tooltipTemplate';
            var tooltipTemplate = this.parent.templateParser(this.parent.tooltipTemplate)(data, this.parent, 'tooltipTemplate', templateId, false);
            append(tooltipTemplate, tooltipContent);
            this.parent.renderTemplates();
        }
        else {
            tooltipContent = "<div class=\"e-card-header-caption\">" + args.target.innerText + "</div>";
        }
        this.tooltipObj.setProperties({ content: tooltipContent }, true);
    };
    KanbanTooltip.prototype.onBeforeClose = function () {
        this.parent.resetTemplates(['tooltipTemplate']);
    };
    KanbanTooltip.prototype.destroy = function () {
        this.tooltipObj.destroy();
        addClass([this.parent.element], 'e-control');
        this.tooltipObj = null;
    };
    return KanbanTooltip;
}());
export { KanbanTooltip };
