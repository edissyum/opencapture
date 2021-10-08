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
import { Property, ChildProperty, Collection, getEnumValue, compile } from '@syncfusion/ej2-base';
import { Internationalization } from '@syncfusion/ej2-base';
import { CellType } from '@syncfusion/ej2-grids';
/**
 * Configures the TreeGrid's aggregate column.
 */
var AggregateColumn = /** @class */ (function (_super) {
    __extends(AggregateColumn, _super);
    function AggregateColumn() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.intl = new Internationalization();
        _this.templateFn = {};
        return _this;
    }
    /**
     * Custom format function
     *
     * @hidden
     * @param {string} cultureName - culture name to format
     * @returns {void}
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    AggregateColumn.prototype.setFormatter = function (cultureName) {
        if (this.format && (this.format.skeleton || this.format.format)) {
            this.formatFn = this.getFormatFunction(this.format);
        }
    };
    /**
     * @param {NumberFormatOptions | DateFormatOptions} format - formatting options for number and date values
     * @hidden
     * @returns {Function} - return formatter function
     */
    AggregateColumn.prototype.getFormatFunction = function (format) {
        if (format.type) {
            return this.intl.getDateFormat(format);
        }
        else {
            return this.intl.getNumberFormat(format);
        }
    };
    /**
     * @hidden
     * @returns {Function} - Returns formatter function
     */
    AggregateColumn.prototype.getFormatter = function () {
        return this.formatFn;
    };
    /**
     * @param {Object} helper - Specified the helper
     * @hidden
     * @returns {void}
     */
    AggregateColumn.prototype.setTemplate = function (helper) {
        if (helper === void 0) { helper = {}; }
        if (this.footerTemplate !== undefined) {
            this.templateFn[getEnumValue(CellType, CellType.Summary)] = { fn: compile(this.footerTemplate, helper),
                property: 'footerTemplate' };
        }
    };
    /**
     * @param {CellType} type - specifies the cell type
     * @returns {Object} returns the object
     * @hidden
     */
    AggregateColumn.prototype.getTemplate = function (type) {
        return this.templateFn[getEnumValue(CellType, type)];
    };
    /**
     * @param {Object} prop - updates aggregate properties without change detection
     * @hidden
     * @returns {void}
     */
    AggregateColumn.prototype.setPropertiesSilent = function (prop) {
        this.setProperties(prop, true);
    };
    __decorate([
        Property()
    ], AggregateColumn.prototype, "type", void 0);
    __decorate([
        Property()
    ], AggregateColumn.prototype, "footerTemplate", void 0);
    __decorate([
        Property()
    ], AggregateColumn.prototype, "field", void 0);
    __decorate([
        Property()
    ], AggregateColumn.prototype, "format", void 0);
    __decorate([
        Property()
    ], AggregateColumn.prototype, "columnName", void 0);
    __decorate([
        Property()
    ], AggregateColumn.prototype, "customAggregate", void 0);
    return AggregateColumn;
}(ChildProperty));
export { AggregateColumn };
var AggregateRow = /** @class */ (function (_super) {
    __extends(AggregateRow, _super);
    function AggregateRow() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Collection([], AggregateColumn)
    ], AggregateRow.prototype, "columns", void 0);
    __decorate([
        Property(true)
    ], AggregateRow.prototype, "showChildSummary", void 0);
    return AggregateRow;
}(ChildProperty));
export { AggregateRow };
