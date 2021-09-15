import * as events from '../base/constant';
import { ToolbarStatus } from '../../editor-manager/plugin/toolbar-status';
import { getDefaultHtmlTbStatus } from '../../common/util';
/**
 * HtmlToolbarStatus module for refresh the toolbar status
 */
var HtmlToolbarStatus = /** @class */ (function () {
    function HtmlToolbarStatus(parent) {
        this.parent = parent;
        this.toolbarStatus = this.prevToolbarStatus = getDefaultHtmlTbStatus();
        this.addEventListener();
    }
    HtmlToolbarStatus.prototype.addEventListener = function () {
        this.parent.on(events.toolbarRefresh, this.onRefreshHandler, this);
        this.parent.on(events.destroy, this.removeEventListener, this);
    };
    HtmlToolbarStatus.prototype.removeEventListener = function () {
        this.parent.off(events.toolbarRefresh, this.onRefreshHandler);
        this.parent.off(events.destroy, this.removeEventListener);
    };
    HtmlToolbarStatus.prototype.onRefreshHandler = function (args) {
        if (this.parent.readonly) {
            return;
        }
        var fontsize = [];
        var fontName = [];
        var formats = [];
        this.parent.fontSize.items.forEach(function (item) {
            fontsize.push(item.value);
        });
        this.parent.fontFamily.items.forEach(function (item) {
            fontName.push(item.value);
        });
        this.parent.format.types.forEach(function (item) {
            formats.push(item.value.toLocaleLowerCase());
        });
        this.toolbarStatus = ToolbarStatus.get(this.parent.contentModule.getDocument(), this.parent.contentModule.getEditPanel(), formats, fontsize, fontName, args.documentNode);
        var tbStatusString = JSON.stringify(this.toolbarStatus);
        this.parent.notify(events.toolbarUpdated, this.toolbarStatus);
        if (JSON.stringify(this.prevToolbarStatus) !== tbStatusString) {
            this.parent.notify(events.updateTbItemsStatus, { html: JSON.parse(tbStatusString), markdown: null });
            this.prevToolbarStatus = JSON.parse(tbStatusString);
        }
    };
    return HtmlToolbarStatus;
}());
export { HtmlToolbarStatus };
