import { getRangeIndexes } from '../common/index';
import { getCell, setCell, getSheetIndex } from '../base/index';
import { setImage } from '../common/event';
/**
 * Specifies image.
 */
var WorkbookImage = /** @class */ (function () {
    function WorkbookImage(parent) {
        this.parent = parent;
        this.addEventListener();
    }
    WorkbookImage.prototype.setImage = function (args) {
        var imgRange = args.range ? (args.range.indexOf('!') > 0) ? args.range.split('!')[1] : args.range.split('!')[0]
            : this.parent.getActiveSheet().selectedRange;
        var sheetIdx = (args.range && args.range.indexOf('!') > 0) ?
            getSheetIndex(this.parent, args.range.split('!')[0]) : this.parent.activeSheetIndex;
        var indexes = getRangeIndexes(imgRange);
        var sheet = sheetIdx ? this.parent.sheets[sheetIdx] : this.parent.getActiveSheet();
        var cell = getCell(indexes[0], indexes[1], sheet);
        var oldImgData;
        var imgData = args.options;
        if (cell && cell.image) {
            oldImgData = cell.image;
            for (var i = 0; i < imgData.length; i++) {
                oldImgData.push(imgData[i]);
            }
        }
        setCell(indexes[0], indexes[1], sheet, { image: (cell && cell.image) ? oldImgData : imgData }, true);
    };
    /**
     * Adding event listener for number format.
     *
     * @returns {void} - Adding event listener for number format.
     */
    WorkbookImage.prototype.addEventListener = function () {
        this.parent.on(setImage, this.setImage, this);
    };
    /**
     * Removing event listener for number format.
     *
     * @returns {void}
     */
    WorkbookImage.prototype.removeEventListener = function () {
        if (!this.parent.isDestroyed) {
            this.parent.off(setImage, this.setImage);
        }
    };
    /**
     * To Remove the event listeners.
     *
     * @returns {void} - To Remove the event listeners.
     */
    WorkbookImage.prototype.destroy = function () {
        this.removeEventListener();
        this.parent = null;
    };
    /**
     * Get the workbook number format module name.
     *
     * @returns {string} - Get the module name.
     */
    WorkbookImage.prototype.getModuleName = function () {
        return 'workbookImage';
    };
    return WorkbookImage;
}());
export { WorkbookImage };
