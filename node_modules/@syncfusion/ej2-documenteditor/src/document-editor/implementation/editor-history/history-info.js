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
import { isNullOrUndefined } from '@syncfusion/ej2-base';
import { BaseHistoryInfo } from './base-history-info';
/**
 * EditorHistory preservation class
 */
/**
 * @private
 */
var HistoryInfo = /** @class */ (function (_super) {
    __extends(HistoryInfo, _super);
    function HistoryInfo(node, isChild) {
        var _this = _super.call(this, node) || this;
        _this.isChildHistoryInfo = false;
        _this.editRangeStart = undefined;
        _this.documentHelper = node.documentHelper;
        _this.isChildHistoryInfo = isChild;
        return _this;
    }
    Object.defineProperty(HistoryInfo.prototype, "hasAction", {
        get: function () {
            return !isNullOrUndefined(this.modifiedActions);
        },
        enumerable: true,
        configurable: true
    });
    HistoryInfo.prototype.addModifiedAction = function (baseHistoryInfo) {
        // For complex actions such as Replace text, Insert/Remove Hyperlink etc.
        if (!(this.editorHistory.isUndoing || this.editorHistory.isRedoing)) {
            if (isNullOrUndefined(this.modifiedActions)) {
                this.modifiedActions = [];
            }
            this.modifiedActions.push(baseHistoryInfo);
        }
    };
    HistoryInfo.prototype.revert = function () {
        this.editorHistory.currentHistoryInfo = this;
        if (this.action === 'BordersAndShading') {
            this.owner.editorModule.isBordersAndShadingDialog = true;
        }
        if (!isNullOrUndefined(this.modifiedActions)) {
            if (this.editorHistory.isUndoing) {
                var i = this.modifiedActions.length;
                while (i > 0) {
                    var baseHistoryInfo = this.modifiedActions[i - 1];
                    baseHistoryInfo.revert();
                    i = i - 1;
                }
            }
            else {
                var i = 0;
                while (i < this.modifiedActions.length) {
                    var baseHistoryInfo = this.modifiedActions[i];
                    baseHistoryInfo.revert();
                    i = i + 1;
                }
            }
        }
        if (this.action === 'RestrictEditing') {
            var user = this.editRangeStart.user !== '' ? this.editRangeStart.user : this.editRangeStart.group;
            if (this.editorHistory.isUndoing) {
                var index = this.owner.documentHelper.editRanges.get(user).indexOf(this.editRangeStart);
                if (index !== -1) {
                    this.owner.documentHelper.editRanges.get(user).splice(index, 1);
                }
            }
            else {
                this.owner.editor.updateRangeCollection(this.editRangeStart, user);
            }
            this.owner.selection.updateEditRangeCollection();
        }
        if (!this.isChildHistoryInfo) {
            this.editorHistory.updateComplexHistory();
        }
        else {
            this.editorHistory.updateComplexHistoryInternal();
        }
    };
    HistoryInfo.prototype.destroy = function () {
        if (!isNullOrUndefined(this.modifiedActions)) {
            while (this.modifiedActions.length > 0) {
                var baseHistoryInfo = this.modifiedActions[this.modifiedActions.length - 1];
                baseHistoryInfo.destroy();
                this.modifiedActions.splice(this.modifiedActions.indexOf(baseHistoryInfo), 1);
            }
            this.modifiedActions = undefined;
        }
        _super.prototype.destroy.call(this);
    };
    return HistoryInfo;
}(BaseHistoryInfo));
export { HistoryInfo };
