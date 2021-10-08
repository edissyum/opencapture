import { WCharacterFormat, WParagraphFormat } from '../format/index';
import { WList } from '../list/list';
import { WAbstractList } from '../list/abstract-list';
import { WListLevel } from '../list/list-level';
import { isNullOrUndefined } from '@syncfusion/ej2-base';
/**
 * List view model implementation
 *
 * @private
 */
var ListViewModel = /** @class */ (function () {
    /**
     * @private
     */
    function ListViewModel() {
        this.listIn = undefined;
        this.levelNumberIn = undefined;
        this.dialog = undefined;
        this.levelNumber = 0;
    }
    Object.defineProperty(ListViewModel.prototype, "levelNumber", {
        get: function () {
            return this.levelNumberIn;
        },
        set: function (value) {
            this.levelNumberIn = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ListViewModel.prototype, "list", {
        get: function () {
            return this.listIn;
        },
        set: function (value) {
            if (isNullOrUndefined(value)) {
                this.createList();
            }
            else {
                this.listIn = value;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ListViewModel.prototype, "listLevel", {
        get: function () {
            if (!isNullOrUndefined(this.list) && this.levelNumber >= 0 && this.levelNumber < 9) {
                if (!isNullOrUndefined(this.dialog.documentHelper.getAbstractListById(this.list.abstractListId))) {
                    if (this.dialog.documentHelper.getAbstractListById(this.list.abstractListId).levels.length <= this.levelNumber) {
                        this.addListLevels();
                    }
                    return this.dialog.documentHelper.getAbstractListById(this.list.abstractListId).levels[this.levelNumber];
                }
                else {
                    this.dialog.documentHelper.lists.push(this.list);
                    var abstractList = this.list.abstractList;
                    if (!this.list.abstractList) {
                        abstractList = new WAbstractList();
                        abstractList.abstractListId = this.list.abstractListId;
                    }
                    var listLevelAdv = new WListLevel(abstractList);
                    listLevelAdv.characterFormat = new WCharacterFormat(listLevelAdv);
                    listLevelAdv.paragraphFormat = new WParagraphFormat(listLevelAdv);
                    listLevelAdv.paragraphFormat.leftIndent = (1) * 48;
                    listLevelAdv.paragraphFormat.firstLineIndent = -24;
                    listLevelAdv.numberFormat = '%' + (1).toString() + '.';
                    listLevelAdv.listLevelPattern = 'UpRoman';
                    listLevelAdv.followCharacter = 'Tab';
                    listLevelAdv.startAt = 1;
                    listLevelAdv.restartLevel = 1;
                    this.dialog.documentHelper.abstractLists.push(abstractList);
                    return this.dialog.documentHelper.getAbstractListById(this.list.abstractListId).levels[0];
                    // return this.dialog.documentHelper.getAbstractListById(this.list.abstractListId).levels.getItem(0);
                }
            }
            return undefined;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ListViewModel.prototype, "listLevelPattern", {
        get: function () {
            if (!isNullOrUndefined(this.listLevel)) {
                return this.listLevel.listLevelPattern;
            }
            return 'Arabic';
        },
        set: function (value) {
            if (!isNullOrUndefined(this.listLevel)) {
                this.listLevel.listLevelPattern = value;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ListViewModel.prototype, "followCharacter", {
        get: function () {
            if (!isNullOrUndefined(this.listLevel)) {
                return this.listLevel.followCharacter;
            }
            return 'None';
        },
        set: function (value) {
            if (!isNullOrUndefined(this.listLevel)) {
                this.listLevel.followCharacter = value;
            }
        },
        enumerable: true,
        configurable: true
    });
    ListViewModel.prototype.createList = function () {
        this.list = new WList();
        this.list.listId = this.dialog.documentHelper.lists.length + 1;
        var abstractList = new WAbstractList();
        abstractList.abstractListId = this.dialog.documentHelper.abstractLists.length + 1;
        this.list.abstractListId = abstractList.abstractListId;
        this.dialog.documentHelper.lists.push(this.list);
        var listLevel = new WListLevel(abstractList);
        listLevel.paragraphFormat = new WParagraphFormat(listLevel);
        listLevel.paragraphFormat.leftIndent = 48;
        listLevel.paragraphFormat.firstLineIndent = -24;
        listLevel.characterFormat = new WCharacterFormat(listLevel);
        listLevel.numberFormat = '%1.';
        listLevel.startAt = 1;
        abstractList.levels.push(listLevel);
        this.dialog.documentHelper.abstractLists.push(abstractList);
    };
    ListViewModel.prototype.addListLevels = function () {
        if (!isNullOrUndefined(this.list) && !isNullOrUndefined(this.list.abstractListId)) {
            for (var i = this.dialog.documentHelper.getAbstractListById(this.list.abstractListId).levels.length; i < 9; i++) {
                var listLevelAdv = new WListLevel(this.dialog.documentHelper.getAbstractListById(this.list.abstractListId));
                listLevelAdv.characterFormat = new WCharacterFormat(listLevelAdv);
                listLevelAdv.paragraphFormat = new WParagraphFormat(listLevelAdv);
                listLevelAdv.paragraphFormat.leftIndent = (i + 1) * 48;
                listLevelAdv.paragraphFormat.firstLineIndent = -24;
                listLevelAdv.numberFormat = '%' + (i + 1).toString() + '.';
                listLevelAdv.listLevelPattern = 'Arabic';
                listLevelAdv.followCharacter = 'Tab';
                listLevelAdv.startAt = 1;
                listLevelAdv.restartLevel = i;
                (this.dialog.documentHelper).getAbstractListById(this.list.abstractListId).levels.push(listLevelAdv);
            }
        }
    };
    /**
     * @private
     * @returns {void}
     */
    ListViewModel.prototype.destroy = function () {
        this.list = undefined;
        this.followCharacter = undefined;
        this.levelNumber = undefined;
        this.listLevelPattern = undefined;
    };
    return ListViewModel;
}());
export { ListViewModel };
