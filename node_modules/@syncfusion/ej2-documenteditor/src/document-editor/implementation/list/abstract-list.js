import { isNullOrUndefined } from '@syncfusion/ej2-base';
/**
 * @private
 */
var WAbstractList = /** @class */ (function () {
    function WAbstractList() {
        this.abstractListIdIn = -1;
        this.levels = [];
    }
    Object.defineProperty(WAbstractList.prototype, "abstractListId", {
        get: function () {
            return this.abstractListIdIn;
        },
        set: function (abstractListId) {
            this.abstractListIdIn = abstractListId;
        },
        enumerable: true,
        configurable: true
    });
    WAbstractList.prototype.destroy = function () {
        if (!isNullOrUndefined(this.levels)) {
            for (var i = 0; i < this.levels.length; i++) {
                var listLevel = this.levels[i];
                listLevel.destroy();
                this.levels.splice(this.levels.indexOf(listLevel), 1);
                i--;
            }
            this.levels = [];
        }
        this.levels = undefined;
    };
    WAbstractList.prototype.clone = function () {
        var absList = new WAbstractList();
        for (var i = 0; i < this.levels.length; i++) {
            absList.levels.push(this.levels[i].clone(absList));
        }
        return absList;
    };
    return WAbstractList;
}());
export { WAbstractList };
