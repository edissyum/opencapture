import { isNullOrUndefined as isNOU } from '@syncfusion/ej2-base';
import * as events from '../base/constant';
import { ServiceLocator } from '../services/service-locator';
import { RendererFactory } from '../services/renderer-factory';
/**
 * `ToolbarAction` module is used to toolbar click action
 */
var ToolbarAction = /** @class */ (function () {
    function ToolbarAction(parent) {
        this.parent = parent;
        this.addEventListener();
        this.serviceLocator = new ServiceLocator;
        this.serviceLocator.register('rendererFactory', new RendererFactory);
    }
    ToolbarAction.prototype.addEventListener = function () {
        this.parent.on(events.toolbarClick, this.toolbarClick, this);
        this.parent.on(events.dropDownSelect, this.dropDownSelect, this);
        this.parent.on(events.colorPickerChanged, this.renderSelection, this);
        this.parent.on(events.destroy, this.removeEventListener, this);
    };
    ToolbarAction.prototype.toolbarClick = function (args) {
        if (isNOU(args.item)) {
            return;
        }
        if (!isNOU(args.item.controlParent)) {
            // eslint-disable-next-line
            var activeEle = args.item.controlParent
                .activeEle;
            if (activeEle) {
                activeEle.tabIndex = -1;
            }
        }
        if (args.item.command === 'NumberFormatList' || args.item.command === 'BulletFormatList') {
            if (args.originalEvent.target.classList.contains('e-order-list') || args.originalEvent.target.classList.contains('e-unorder-list')) {
                args.item.command = 'Lists';
                args.item.subCommand = args.item.subCommand === 'NumberFormatList' ? 'OL' : 'UL';
            }
        }
        if (args.item.command === 'Lists') {
            if (args.originalEvent.target.classList.contains('e-caret') &&
                (args.originalEvent.target.parentElement.classList.contains('e-rte-bulletformatlist-dropdown') || args.originalEvent.target.parentElement.classList.contains('e-rte-numberformatlist-dropdown'))) {
                args.item.command = args.item.subCommand = null;
            }
        }
        this.parent.notify(events.htmlToolbarClick, args);
        this.parent.notify(events.markdownToolbarClick, args);
    };
    ToolbarAction.prototype.dropDownSelect = function (e) {
        this.parent.notify(events.selectionRestore, {});
        if (!(document.body.contains(document.body.querySelector('.e-rte-quick-toolbar'))
            && e.item && (e.item.command === 'Images' || e.item.command === 'Display' || e.item.command === 'Table'))) {
            var value = e.item.controlParent && this.parent.quickToolbarModule && this.parent.quickToolbarModule.tableQTBar
                && this.parent.quickToolbarModule.tableQTBar.element.contains(e.item.controlParent.element) ? 'Table' : null;
            if (e.item.command === 'Lists') {
                var listItem = { listStyle: e.item.value, listImage: e.item.listImage, type: e.item.subCommand };
                this.parent.formatter.process(this.parent, e, e.originalEvent, listItem);
            }
            else {
                this.parent.formatter.process(this.parent, e, e.originalEvent, value);
            }
        }
        this.parent.notify(events.selectionSave, {});
    };
    ToolbarAction.prototype.renderSelection = function (args) {
        this.parent.notify(events.selectionRestore, {});
        this.parent.formatter.process(this.parent, args, args.originalEvent, null);
        this.parent.notify(events.selectionSave, {});
    };
    ToolbarAction.prototype.removeEventListener = function () {
        this.parent.off(events.toolbarClick, this.toolbarClick);
        this.parent.off(events.dropDownSelect, this.dropDownSelect);
        this.parent.off(events.colorPickerChanged, this.renderSelection);
        this.parent.off(events.destroy, this.removeEventListener);
    };
    return ToolbarAction;
}());
export { ToolbarAction };
