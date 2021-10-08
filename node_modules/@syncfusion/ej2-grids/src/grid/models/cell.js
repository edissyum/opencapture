import { merge } from '@syncfusion/ej2-base';
/**
 * Cell
 *
 * @hidden
 */
var Cell = /** @class */ (function () {
    function Cell(options) {
        this.isSpanned = false;
        this.isRowSpanned = false;
        merge(this, options);
    }
    Cell.prototype.clone = function () {
        var cell = new Cell({});
        merge(cell, this);
        return cell;
    };
    return Cell;
}());
export { Cell };
