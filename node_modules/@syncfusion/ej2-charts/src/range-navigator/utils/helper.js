/**
 * Methods for calculating coefficient.
 */
/** @private */
export function rangeValueToCoefficient(value, range, inversed) {
    var result = (value - range.min) / (range.delta);
    return inversed ? (1 - result) : result;
}
/** @private */
export function getXLocation(x, range, size, inversed) {
    x = rangeValueToCoefficient(x, range, inversed);
    return x * size;
}
/** @private */
export function getRangeValueXByPoint(value, size, range, inversed) {
    var actualValue = !inversed ? value / size : (1 - (value / size));
    return actualValue * (range.delta) + range.min;
}
/** @private */
export function getExactData(points, start, end) {
    var selectedData = [];
    points.map(function (point) {
        if (point.xValue >= start && point.xValue <= end) {
            selectedData.push({
                'x': point.x,
                'y': point.y
            });
        }
    });
    return selectedData;
}
/** @private */
export function getNearestValue(values, point) {
    return values.reduce(function (prev, curr) {
        return (Math.abs(curr - point) < Math.abs(prev - point) ? curr : prev);
    });
}
/**
 * Data point
 *
 * @public
 */
var DataPoint = /** @class */ (function () {
    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    function DataPoint(x, y, xValue, yValue, visible) {
        if (visible === void 0) { visible = true; }
        this.x = x;
        this.y = y;
        this.xValue = xValue;
        this.visible = visible;
    }
    return DataPoint;
}());
export { DataPoint };
