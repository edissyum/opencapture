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
    var CircularGaugeHelper = (function (_super) {
        __extends(CircularGaugeHelper, _super);
        function CircularGaugeHelper(id, wrapperFn) {
            var _this = _super.call(this) || this;
            _this.id = id;
            if (wrapperFn !== undefined) {
                _this.wrapperFn = wrapperFn;
            }
            return _this;
        }
        CircularGaugeHelper.prototype.getGaugeContainer = function () {
            return this.selector('#' + this.id);
        };
        CircularGaugeHelper.prototype.getTitlegroupElement = function () {
            return this.selector('#' + this.id + '_CircularGaugeTitle');
        };
        CircularGaugeHelper.prototype.getAxesCollectionElement = function () {
            return this.selector('#' + this.id + '_AxesCollection');
        };
        CircularGaugeHelper.prototype.gethAxisGroupElement = function () {
            return this.selector('#' + this.id + '_Axis_Group_0');
        };
        CircularGaugeHelper.prototype.getAxisLabelElement = function () {
            return this.selector('#' + this.id + '_Axis_Labels_0');
        };
        CircularGaugeHelper.prototype.getAxisPointerElement = function () {
            return this.selector('#' + this.id + '_Axis_Pointers_0');
        };
        CircularGaugeHelper.prototype.getAxisRangesElement = function () {
            return this.selector('#' + this.id + '_Axis_Ranges_0');
        };
        CircularGaugeHelper.prototype.getMajorLineElement = function () {
            return this.selector('#' + this.id + '_Axis_MajorTickLines_0');
        };
        CircularGaugeHelper.prototype.getAnnotationElement = function () {
            return this.selector('#' + this.id + '_Annotations_0');
        };
        CircularGaugeHelper.prototype.getMinorTickElement = function () {
            return this.selector('#' + this.id + '_Axis_MinorTickLines_0');
        };
        CircularGaugeHelper.prototype.getSecondaryElement = function () {
            return this.selector('#' + this.id + '_Secondary_Element');
        };
        CircularGaugeHelper.prototype.getRangeBarElement = function () {
            return this.selector('#' + this.id + '_Axis_0_Pointer_RangeBar_0');
        };
        CircularGaugeHelper.prototype.getNeedleElement = function () {
            return this.selector('#' + this.id + '_Axis_0_Pointer_NeedleRect_0');
        };
        return CircularGaugeHelper;
    }(e2e_1.TestHelper));
    exports.CircularGaugeHelper = CircularGaugeHelper;
});
