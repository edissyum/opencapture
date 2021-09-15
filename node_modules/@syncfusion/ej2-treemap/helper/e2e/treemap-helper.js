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
    var TreeMapHelper = (function (_super) {
        __extends(TreeMapHelper, _super);
        function TreeMapHelper(id, wrapperFn) {
            var _this = _super.call(this) || this;
            _this.id = id;
            if (wrapperFn !== undefined) {
                _this.wrapperFn = wrapperFn;
            }
            return _this;
        }
        TreeMapHelper.prototype.getTreeMapContainer = function () {
            return this.selector('#' + this.id);
        };
        TreeMapHelper.prototype.getTitlegroupElement = function () {
            return this.selector('#' + this.id + 'Title_Group');
        };
        TreeMapHelper.prototype.getSquarifiedLayoutElement = function () {
            return this.selector('#' + this.id + '_TreeMap_Squarified_Layout');
        };
        TreeMapHelper.prototype.getSliceAndDiceHorizontalLayoutElement = function () {
            return this.selector('#' + this.id + '_TreeMap_SliceAndDiceHorizontal_Layout');
        };
        TreeMapHelper.prototype.getSliceAndDiceVerticaLayoutElement = function () {
            return this.selector('#' + this.id + '_TreeMap_SliceAndDiceVertical_Layout');
        };
        TreeMapHelper.prototype.getSliceAndDiceAutoLayoutElement = function () {
            return this.selector('#' + this.id + '_TreeMap_SliceAndDiceAuto_Layout');
        };
        TreeMapHelper.prototype.getLegendGroupElement = function () {
            return this.selector('#' + this.id + '_Legend_Group');
        };
        TreeMapHelper.prototype.getLevelGroupElement = function () {
            return this.selector('#' + this.id + '_Level_Index_0_Item_Index_0_Group');
        };
        TreeMapHelper.prototype.getLevelTextGroupElement = function () {
            return this.selector('#' + this.id + '_Level_Index_0_Item_Index_0_Text');
        };
        return TreeMapHelper;
    }(e2e_1.TestHelper));
    exports.TreeMapHelper = TreeMapHelper;
});
