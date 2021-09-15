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
define(["require", "exports", "@syncfusion/ej2-base/helpers/e2e"], function (require, exports, e2e_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var LinearGaugeHelper = (function (_super) {
        __extends(LinearGaugeHelper, _super);
        function LinearGaugeHelper(id, wrapperFn) {
            var _this = _super.call(this) || this;
            _this.id = id;
            if (wrapperFn !== undefined) {
                _this.wrapperFn = wrapperFn;
            }
            return _this;
        }
        LinearGaugeHelper.prototype.getGaugeContainer = function () {
            return this.selector('#' + this.id);
        };
        LinearGaugeHelper.prototype.getTitlegroupElement = function () {
            return this.selector('#' + this.id + '_LinearGaugeTitle');
        };
        LinearGaugeHelper.prototype.getRangesGroupElement = function () {
            return this.selector('#' + this.id + '_RangesGroup');
        };
        LinearGaugeHelper.prototype.getAxisCollectionsElement = function () {
            return this.selector('#' + this.id + '_Axis_Collections');
        };
        LinearGaugeHelper.prototype.getAnnotationElement = function () {
            return this.selector('#' + this.id + '_AnnotationsGroup');
        };
        LinearGaugeHelper.prototype.getAxisGroupElement = function () {
            return this.selector('#' + this.id + '_Axis_Group_0');
        };
        LinearGaugeHelper.prototype.getMinorTicksLineElement = function () {
            return this.selector('#' + this.id + '_MinorTicksLine_0');
        };
        LinearGaugeHelper.prototype.getMajorTicksLineElement = function () {
            return this.selector('#' + this.id + '_MajorTicksLine_0');
        };
        LinearGaugeHelper.prototype.getSecondaryElement = function () {
            return this.selector('#' + this.id + '_Secondary_Element');
        };
        LinearGaugeHelper.prototype.getTooltipElement = function () {
            return this.selector('#' + this.id + '_LinearGauge_Tooltip');
        };
        return LinearGaugeHelper;
    }(e2e_1.TestHelper));
    exports.LinearGaugeHelper = LinearGaugeHelper;
});
