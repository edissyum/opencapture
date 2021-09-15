import { isNullOrUndefined } from '@syncfusion/ej2-base';
import { WLevelOverride } from './level-override';
/**
 * @private
 */
var WList = /** @class */ (function () {
    function WList() {
        this.listId = -1;
        this.sourceListId = -1;
        this.abstractListId = -1;
        this.abstractList = undefined;
        this.levelOverrides = [];
    }
    WList.prototype.getListLevel = function (levelNumber) {
        var listLevel = undefined;
        var levelOverride = this.getLevelOverride(levelNumber);
        if (!isNullOrUndefined(levelOverride) && !isNullOrUndefined(levelOverride.overrideListLevel)) {
            listLevel = levelOverride.overrideListLevel;
        }
        else {
            listLevel = this.abstractList.levels[levelNumber];
        }
        return listLevel;
    };
    WList.prototype.getLevelOverride = function (levelNumber) {
        for (var i = 0; i < this.levelOverrides.length; i++) {
            if (this.levelOverrides[i] instanceof WLevelOverride) {
                var levelOverride = this.levelOverrides[i];
                if (levelOverride.levelNumber === levelNumber) {
                    return levelOverride;
                }
            }
        }
        return undefined;
    };
    WList.prototype.destroy = function () {
        if (!isNullOrUndefined(this.levelOverrides)) {
            this.levelOverrides = [];
        }
        this.abstractListId = undefined;
        this.listId = undefined;
        this.sourceListId = undefined;
        this.levelOverrides = undefined;
    };
    WList.prototype.mergeList = function (list) {
        if (!isNullOrUndefined(this.abstractListId) && this.abstractListId !== -1) {
            this.abstractListId = list.abstractListId;
        }
        if (!isNullOrUndefined(this.listId) && this.listId !== -1) {
            this.listId = list.listId;
        }
        if (!isNullOrUndefined(this.sourceListId) && this.sourceListId !== -1) {
            this.sourceListId = list.sourceListId;
        }
        if (!isNullOrUndefined(this.levelOverrides) && this.levelOverrides.length !== 0) {
            this.levelOverrides = list.levelOverrides;
        }
    };
    WList.prototype.clone = function () {
        var list = new WList();
        for (var i = 0; i < this.levelOverrides.length; i++) {
            list.levelOverrides.push(this.levelOverrides[i].clone());
        }
        return list;
    };
    return WList;
}());
export { WList };
