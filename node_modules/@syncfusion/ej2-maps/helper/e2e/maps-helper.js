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
    var MapsHelper = (function (_super) {
        __extends(MapsHelper, _super);
        function MapsHelper(id, wrapperFn) {
            var _this = _super.call(this) || this;
            _this.id = id;
            if (wrapperFn !== undefined) {
                _this.wrapperFn = wrapperFn;
            }
            return _this;
        }
        MapsHelper.prototype.getMapsContainer = function () {
            return this.selector('#' + this.id);
        };
        MapsHelper.prototype.getTitlegroupElement = function () {
            return this.selector('#' + this.id + '_Title_Group');
        };
        MapsHelper.prototype.getTitleElement = function () {
            return this.selector('#' + this.id + '_Map_title');
        };
        MapsHelper.prototype.getSubTitleElement = function () {
            return this.selector('#' + this.id + '_Map_subtitle');
        };
        MapsHelper.prototype.getMarkerGroupElement = function () {
            return this.selector('#' + this.id + '_Markers_Group');
        };
        MapsHelper.prototype.getLayerCollectionElement = function () {
            return this.selector('#' + this.id + '_Layer_Collections');
        };
        MapsHelper.prototype.getLayerIndexGroupElement = function () {
            return this.selector('#' + this.id + '_LayerIndex_0');
        };
        MapsHelper.prototype.getSubLayerGroupElement = function () {
            return this.selector('#' + this.id + '_LayerIndex_1');
        };
        MapsHelper.prototype.getSecondaryElement = function () {
            return this.selector('#' + this.id + '_Secondary_Element');
        };
        MapsHelper.prototype.getTooltipGroupElement = function () {
            return this.selector('#' + this.id + '_mapsTooltip_group');
        };
        MapsHelper.prototype.getLegendGroupElement = function () {
            return this.selector('#' + this.id + '_Legend_Group');
        };
        MapsHelper.prototype.getbubbleGroupElement = function () {
            return this.selector('#' + this.id + '_LayerIndex_0_bubble_Group_0');
        };
        MapsHelper.prototype.getnavigationLineGroupElement = function () {
            return this.selector('#' + this.id + '_LayerIndex_0_line_Group');
        };
        MapsHelper.prototype.getTileElement = function () {
            return this.selector('#' + this.id + '_tile_parent');
        };
        MapsHelper.prototype.getAnnotationElement = function () {
            return this.selector('#' + this.id + '_Annotations_Group');
        };
        return MapsHelper;
    }(e2e_1.TestHelper));
    exports.MapsHelper = MapsHelper;
});
