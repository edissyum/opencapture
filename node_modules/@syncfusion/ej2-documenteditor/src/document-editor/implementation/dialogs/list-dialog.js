import { NumericTextBox } from '@syncfusion/ej2-inputs';
import { createElement, L10n } from '@syncfusion/ej2-base';
import { isNullOrUndefined } from '@syncfusion/ej2-base';
import { WCharacterFormat, WParagraphFormat } from '../format/index';
import { WAbstractList } from '../list/abstract-list';
import { WLevelOverride } from '../list/level-override';
import { DropDownList } from '@syncfusion/ej2-dropdowns';
import { Tooltip } from '@syncfusion/ej2-popups';
import { ListViewModel } from './list-view-model';
/**
 * The List dialog is used to create or modify lists.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
var ListDialog = /** @class */ (function () {
    /**
     * @param {DocumentHelper} documentHelper - Specifies the document helper.
     * @private
     */
    function ListDialog(documentHelper) {
        var _this = this;
        /**
         * @private
         */
        this.dialog = undefined;
        this.target = undefined;
        /**
         * @private
         */
        this.documentHelper = undefined;
        this.viewModel = undefined;
        this.startAt = undefined;
        this.textIndent = undefined;
        this.alignedAt = undefined;
        this.listLevelElement = undefined;
        this.followNumberWith = undefined;
        this.numberStyle = undefined;
        this.numberFormat = undefined;
        this.restartBy = undefined;
        /**
         * @private
         */
        this.isListCharacterFormat = false;
        /**
         * @private
         * @param {ChangeEventArgs} args - Specifies the change event args.
         * @returns {void}
         */
        this.onTextIndentChanged = function (args) {
            _this.viewModel.listLevel.paragraphFormat.leftIndent = args.value;
        };
        /**
         * @private
         * @param {ChangeEventArgs} args - Specifies the change event args.
         * @returns {void}
         */
        this.onStartValueChanged = function (args) {
            if (!isNullOrUndefined(_this.viewModel) && !isNullOrUndefined(_this.viewModel.listLevel)) {
                _this.viewModel.listLevel.startAt = args.value;
            }
        };
        /**
         * @private
         * @param {ChangeEventArgs} args - Specifies the change event args.
         * @returns {void}
         */
        this.onListLevelValueChanged = function (args) {
            _this.viewModel.levelNumber = parseInt(args.value.slice(args.value.length - 1), 10) - 1;
            if (isNullOrUndefined(_this.listLevel)) {
                return;
            }
            if (isNullOrUndefined(_this.listLevel.characterFormat)) {
                _this.listLevel.characterFormat = new WCharacterFormat(_this.viewModel.listLevel);
            }
            if (!isNullOrUndefined(_this.listLevel.paragraphFormat)) {
                _this.listLevel.paragraphFormat = new WParagraphFormat(_this.viewModel.listLevel);
            }
            _this.updateDialogValues();
            _this.updateRestartLevelBox();
        };
        /**
         * @private
         * @param {any} args - Specifies the change event args.
         * @returns {void}
         */
        this.onNumberFormatChanged = function (args) {
            _this.viewModel.listLevel.numberFormat = args.target.value;
        };
        /**
         * @private
         * @param {ChangeEventArgs} args - Specifies the change event args.
         * @returns {void}
         */
        this.onAlignedAtValueChanged = function (args) {
            _this.viewModel.listLevel.paragraphFormat.firstLineIndent = args.value;
        };
        /**
         * @private
         * @param {ChangeEventArgs} args - Specifies the change event args.
         * @returns {void}
         */
        this.onFollowCharacterValueChanged = function (args) {
            if (args.value) {
                _this.viewModel.followCharacter = args.value;
            }
        };
        /**
         * @private
         * @param {ChangeEventArgs} args - Specifies the change event args.
         * @returns {void}
         */
        this.onLevelPatternValueChanged = function (args) {
            _this.viewModel.listLevelPattern = args.value;
            var numberFormat = '%' + (_this.levelNumber + 1).toString();
            var numberFormatTextBox = document.getElementById(_this.documentHelper.owner.containerId + '_numberFormat');
            if (_this.listLevel.listLevelPattern === 'Bullet') {
                _this.listLevel.numberFormat = '\uf0b7';
                numberFormatTextBox.value = _this.listLevel.numberFormat;
                _this.listLevel.characterFormat.fontFamily = 'Wingdings';
            }
            else {
                if (_this.listLevel.listLevelPattern === 'None') {
                    _this.listLevel.numberFormat = '';
                }
                if (!_this.listLevel.numberFormat.match(numberFormat) && _this.listLevel.listLevelPattern !== 'None') {
                    _this.listLevel.numberFormat = numberFormat + '.';
                }
                numberFormatTextBox.value = _this.listLevel.numberFormat;
            }
        };
        /**
         * @private
         * @returns {void}
         */
        this.loadListDialog = function () {
            _this.documentHelper.updateFocus();
            if (isNullOrUndefined(_this.documentHelper.owner)) {
                return;
            }
            _this.viewModel = new ListViewModel();
            _this.viewModel.dialog = _this;
            if (_this.documentHelper.selection.paragraphFormat.listLevelNumber > 0) {
                _this.viewModel.levelNumber = _this.documentHelper.selection.paragraphFormat.listLevelNumber;
            }
            _this.viewModel.list = _this.documentHelper.selection.paragraphFormat.getList();
            if (isNullOrUndefined(_this.listLevel)) {
                return;
            }
            if (isNullOrUndefined(_this.listLevel.characterFormat)) {
                _this.listLevel.characterFormat = new WCharacterFormat(_this.viewModel.listLevel);
            }
            if (isNullOrUndefined(_this.listLevel.paragraphFormat)) {
                _this.listLevel.paragraphFormat = new WParagraphFormat(_this.viewModel.listLevel);
            }
            _this.updateDialogValues();
            if (_this.documentHelper.selection.caret.style.display !== 'none') {
                _this.documentHelper.selection.caret.style.display = 'none';
            }
        };
        /**
         * @private
         * @returns {void}
         */
        this.showFontDialog = function () {
            _this.documentHelper.owner.fontDialogModule.showFontDialog(_this.listLevel.characterFormat);
        };
        /**
         * @private
         * @returns {void}
         */
        this.onApplyList = function () {
            if (!isNullOrUndefined(_this.owner)) {
                _this.documentHelper.selection.paragraphFormat.setList(_this.list);
            }
            _this.documentHelper.dialog2.hide();
            _this.documentHelper.updateFocus();
        };
        /**
         * @private
         * @returns {void}
         */
        this.onCancelButtonClick = function () {
            _this.disposeBindingForListUI();
            _this.documentHelper.dialog2.hide();
            _this.documentHelper.updateFocus();
            _this.isListCharacterFormat = false;
        };
        /**
         * @private
         * @returns {void}
         */
        this.closeListDialog = function () {
            _this.disposeBindingForListUI();
            _this.documentHelper.updateFocus();
            _this.isListCharacterFormat = false;
        };
        this.documentHelper = documentHelper;
        this.viewModel = new ListViewModel();
    }
    Object.defineProperty(ListDialog.prototype, "listLevel", {
        /**
         * @private
         * @returns {WListLevel} Returns list level
         */
        get: function () {
            if (!isNullOrUndefined(this.viewModel)) {
                return this.viewModel.listLevel;
            }
            return undefined;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ListDialog.prototype, "list", {
        /**
         * @private
         * @returns {WList} Returns list
         */
        get: function () {
            if (!isNullOrUndefined(this.viewModel)) {
                return this.viewModel.list;
            }
            return undefined;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ListDialog.prototype, "levelNumber", {
        /**
         * @private
         * @returns {number} Returns level number
         */
        get: function () {
            if (this.listLevel.ownerBase instanceof WLevelOverride) {
                return this.listLevel.ownerBase.levelNumber;
                /* eslint-disable-next-line max-len */
            }
            else if (this.listLevel.ownerBase instanceof WAbstractList && !isNullOrUndefined(this.listLevel.ownerBase.levels)) {
                return this.listLevel.ownerBase.levels.indexOf(this.listLevel);
            }
            else {
                return -1;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ListDialog.prototype, "owner", {
        get: function () {
            return this.documentHelper.owner.viewer;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * @private
     * @returns {string} Returns module name
     */
    ListDialog.prototype.getModuleName = function () {
        return 'ListDialog';
    };
    /**
     * @private
     * @returns {void}
     */
    ListDialog.prototype.showListDialog = function () {
        var locale = new L10n('documenteditor', this.documentHelper.owner.defaultLocale);
        locale.setLocale(this.documentHelper.owner.locale);
        if (!this.target) {
            this.initListDialog(locale, this.documentHelper.owner.enableRtl);
        }
        this.isListCharacterFormat = true;
        this.documentHelper.dialog2.header = locale.getConstant('Define new Multilevel list');
        this.documentHelper.dialog2.height = 'auto';
        this.documentHelper.dialog2.width = 'auto';
        this.documentHelper.dialog2.content = this.target;
        var buttonClass;
        var isRtl = this.documentHelper.owner.enableRtl;
        if (isRtl) {
            buttonClass = 'e-flat e-list-dlg-font e-de-dlg-target.e-de-rtl e-font-rtl';
        }
        else {
            buttonClass = 'e-flat e-list-dlg-font e-font';
        }
        this.documentHelper.dialog2.buttons = [{
                click: this.showFontDialog,
                buttonModel: { content: locale.getConstant('Font'), cssClass: buttonClass }
            }, {
                click: this.onApplyList,
                buttonModel: { content: locale.getConstant('Ok'), cssClass: 'e-flat e-list-dlg', isPrimary: true }
            },
            {
                click: this.onCancelButtonClick,
                buttonModel: { content: locale.getConstant('Cancel'), cssClass: 'e-flat e-list-dlg' }
            }];
        this.documentHelper.dialog2.dataBind();
        this.wireAndBindEvent(locale, isRtl);
        this.documentHelper.dialog2.beforeOpen = this.loadListDialog;
        this.documentHelper.dialog2.close = this.closeListDialog;
        this.documentHelper.dialog2.position = { X: 'center', Y: 'top' };
        this.documentHelper.dialog2.show();
    };
    /**
     * Shows the table properties dialog
     *
     * @private
     * @param {L10n} locale - Specifies the locale value
     * @param {boolean} isRtl - Specifies the is rtl
     * @returns {void}
     */
    ListDialog.prototype.initListDialog = function (locale, isRtl) {
        var containerId = this.documentHelper.owner.containerId;
        var id = containerId + '_insert_list';
        this.target = createElement('div', { id: id, className: 'e-de-list-dlg' });
        var listLevelDiv = createElement('div', { innerHTML: '<label id="' + containerId + '_listLevellabel" style="display:block;" class=e-de-list-ddl-header-list-level>' + locale.getConstant('List level') + '</label><label id="' + containerId + '_modifyLabel" style="display:block;" class=e-de-list-ddl-subheader>' + locale.getConstant('Choose level to modify') + '</label><select style="height:20px;width:43%" id="' + containerId + '_listLevel"><option>' + locale.getConstant('Level') + ' 1' + '</option><option>' + locale.getConstant('Level') + ' 2' + '</option><option>' + locale.getConstant('Level') + ' 3' + '</option><option>' + locale.getConstant('Level') + ' 4' + '</option><option>' + locale.getConstant('Level') + ' 5' + '</option><option>' + locale.getConstant('Level') + ' 6' + '</option><option>' + locale.getConstant('Level') + ' 7' + '</option><option>' + locale.getConstant('Level') + ' 8' + '</option><option>' + locale.getConstant('Level') + ' 9' + '</option></select>' });
        this.target.appendChild(listLevelDiv);
        var div = createElement('div');
        var divStyle;
        if (isRtl) {
            divStyle = '<div style="float:right;display:block;width:241px;">';
        }
        else {
            divStyle = '<div style="float:left;display:block;">';
        }
        var numberStyleDiv = createElement('div', { innerHTML: divStyle + '<label id="' + containerId + '_numberFormatLabel" style="display:block;" class=e-de-list-ddl-header>' + locale.getConstant('Number format') + '</label><label id="' + containerId + '_numberStyleLabel" style="display:block;" class=e-de-list-ddl-subheader>' + locale.getConstant('Number style for this level') + '</label><select style="height:20px;width:100%" id="' + containerId + '_numberStyle"><option>' + locale.getConstant('Arabic') + '</option><option>' + locale.getConstant('UpRoman') + '</option><option>' + locale.getConstant('LowRoman') + '</option><option>' + locale.getConstant('UpLetter') + '</option><option>' + locale.getConstant('LowLetter') + '</option><option>' + locale.getConstant('Number') + '</option><option>' + locale.getConstant('Leading zero') + '</option><option>' + locale.getConstant('Bullet') + '</option><option>' + locale.getConstant('Ordinal') + '</option><option>' + locale.getConstant('Ordinal Text') + '</option><option>' + locale.getConstant('Special') + '</option><option>' + locale.getConstant('For East') + '</option></select><label id="' + containerId + '_startAtLabel" style="display:block;" class=e-de-list-ddl-subheaderbottom>' + locale.getConstant('Start at') + '</label><input type="text" id="' + containerId + '_startAt">' });
        div.appendChild(numberStyleDiv);
        this.numberFormatDiv = createElement('div', { className: 'e-de-list-dlg-subdiv', innerHTML: '<div><div><label id="' + containerId + '_formatLabel" style="display:inline-block;width:86%" class=e-de-list-ddl-subheader>' + locale.getConstant('Enter formatting for number') + '</label><button type="button" id="' + containerId + '_list_info" class="e-control e-btn e-primary e-de-list-format-info">i</button></div><input style=width:180px; type="text" id="' + containerId + '_numberFormat" class=e-input></div><label id="' + containerId + '_restartLabel" style="display:block;" class=e-de-list-ddl-subheaderbottom>' + locale.getConstant('Restart list after') + '</label><select style="height:20px;width:100%" id="' + containerId + '_restartBy"><option>' + locale.getConstant('No Restart') + '</option></select></div>' });
        div.appendChild(this.numberFormatDiv);
        this.target.appendChild(div);
        var indentsDivLabelStyle;
        if (isRtl) {
            indentsDivLabelStyle = 'display:block;position:relative; ';
        }
        else {
            indentsDivLabelStyle = 'display:block; ';
        }
        var indentsDiv = createElement('div', { innerHTML: divStyle + '<label id="' + containerId + '_IndentsLabel" style=' + indentsDivLabelStyle + 'class=e-de-list-ddl-header>' + locale.getConstant('Position') + '</label><label id="' + containerId + '_textIndentLabel" style=' + indentsDivLabelStyle + 'class=e-de-list-ddl-subheader>' + locale.getConstant('Text indent at') + '</label><input type="text" id="' + containerId + '_textIndent"><label id="' + containerId + '_followCharacterLabel" style=' + indentsDivLabelStyle + 'class=e-de-list-ddl-subheaderbottom>' + locale.getConstant('Follow number with') + '</label><select style="height:20px;width:100%" id="' + containerId + '_followCharacter"><option>' + locale.getConstant('Tab character') + '</option><option>' + locale.getConstant('Space') + '</option><option>' + locale.getConstant('Nothing') + '</option></select></div><div id="e-de-list-dlg-div" class="e-de-list-dlg-div"><label id="' + containerId + '_alignedAtLabel" style="display:block;" class=e-de-list-ddl-subheader>' + locale.getConstant('Aligned at') + '</label><input type="text" id="' + containerId + '_alignedAt"></div>' });
        this.target.appendChild(indentsDiv);
    };
    ListDialog.prototype.wireAndBindEvent = function (locale, isRtl) {
        var containerId = this.documentHelper.owner.containerId;
        if (isRtl) {
            document.getElementById('e-de-list-dlg-div').classList.add('e-de-rtl');
            this.numberFormatDiv.classList.add('e-de-rtl');
        }
        var startAtTextBox = document.getElementById(containerId + '_startAt');
        var textIndentAtTextBox = document.getElementById(containerId + '_textIndent');
        var alignedAtTextBox = document.getElementById(containerId + '_alignedAt');
        this.startAt = new NumericTextBox({
            format: '#',
            decimals: 0,
            min: 0,
            max: 50,
            width: '180px',
            enablePersistence: false
        });
        this.startAt.addEventListener('change', this.onStartValueChanged);
        this.startAt.appendTo(startAtTextBox);
        this.textIndent = new NumericTextBox({
            format: '#',
            decimals: 0,
            min: 0,
            max: 1584,
            width: '180px',
            step: 4,
            enablePersistence: false
        });
        this.textIndent.addEventListener('change', this.onTextIndentChanged);
        this.textIndent.appendTo(textIndentAtTextBox);
        this.alignedAt = new NumericTextBox({
            format: '#',
            max: 1584,
            step: 6,
            width: '180px',
            enablePersistence: false
        });
        this.alignedAt.addEventListener('change', this.onAlignedAtValueChanged);
        this.alignedAt.appendTo(alignedAtTextBox);
        var listLevel = document.getElementById(containerId + '_listLevel');
        this.listLevelElement = new DropDownList({ popupHeight: '150px', width: '180px', enableRtl: isRtl, change: this.onListLevelValueChanged });
        this.listLevelElement.appendTo(listLevel);
        var followCharacterElement = document.getElementById(containerId + '_followCharacter');
        this.followNumberWith = new DropDownList({ popupHeight: '150px', width: '180px', enableRtl: isRtl, change: this.onFollowCharacterValueChanged });
        this.followNumberWith.appendTo(followCharacterElement);
        var numberStyleEle = document.getElementById(containerId + '_numberStyle');
        this.numberStyle = new DropDownList({ popupHeight: '150px', width: '180px', enableRtl: isRtl, change: this.onLevelPatternValueChanged });
        this.numberStyle.appendTo(numberStyleEle);
        this.numberFormat = document.getElementById(containerId + '_numberFormat');
        this.numberFormat.addEventListener('change', this.onNumberFormatChanged);
        var restartElement = document.getElementById(containerId + '_restartBy');
        this.restartBy = new DropDownList({ popupHeight: '150px', width: '180px', enableRtl: isRtl });
        this.restartBy.appendTo(restartElement);
        var button = document.getElementById(containerId + '_list_info');
        this.formatInfoToolTip = new Tooltip({ width: 200 });
        this.formatInfoToolTip.content = locale.getConstant('Number format tooltip information');
        this.formatInfoToolTip.position = 'RightTop';
        this.formatInfoToolTip.appendTo(button);
    };
    ListDialog.prototype.updateRestartLevelBox = function () {
        var containerId = this.documentHelper.owner.containerId;
        var listLevel = document.getElementById(containerId + '_listLevel');
        var restartBy = document.getElementById(containerId + '_restartBy');
        for (var i = 0; i < restartBy.options.length; i) {
            restartBy.options.remove(i);
        }
        if (listLevel.selectedIndex === 0) {
            var option = document.createElement('option');
            option.value = 'No Restart';
            option.innerHTML = 'No Restart';
            restartBy.appendChild(option);
        }
        else {
            for (var i = listLevel.selectedIndex; i > 0; i--) {
                var option_1 = document.createElement('option');
                option_1.value = 'Level ' + i;
                option_1.innerHTML = 'Level ' + i;
                restartBy.appendChild(option_1);
            }
            var option = document.createElement('option');
            option.value = 'No Restart';
            option.innerHTML = 'No Restart';
            restartBy.appendChild(option);
        }
        restartBy.selectedIndex = 0;
    };
    ListDialog.prototype.listPatternConverter = function (listLevelPattern) {
        switch (listLevelPattern) {
            case 'Arabic': return 0;
            case 'LowLetter': return 1;
            case 'LowRoman': return 2;
            case 'UpLetter': return 3;
            case 'UpRoman': return 4;
            case 'Number': return 5;
            case 'LeadingZero': return 6;
            case 'Bullet': return 7;
            case 'Ordinal': return 8;
            case 'OrdinalText': return 9;
            case 'Special': return 10;
            case 'FarEast': return 11;
            default: return 12;
        }
    };
    ListDialog.prototype.followCharacterConverter = function (followCharacter) {
        switch (followCharacter) {
            case 'Tab':
                return 0;
            case 'Space':
                return 1;
            default:
                return 2;
        }
    };
    ListDialog.prototype.updateDialogValues = function () {
        //const restartByTextBox: HTMLSelectElement = document.getElementById(this.documentHelper.owner.containerId + '_restartBy') as HTMLSelectElement;
        if (!isNullOrUndefined(this.viewModel) && !isNullOrUndefined(this.viewModel.listLevel)) {
            this.startAt.value = this.viewModel.listLevel.startAt;
            this.textIndent.value = this.viewModel.listLevel.paragraphFormat.leftIndent;
            this.alignedAt.value = this.viewModel.listLevel.paragraphFormat.firstLineIndent;
            this.followNumberWith.index = this.followCharacterConverter(this.viewModel.followCharacter);
            this.numberFormat.value = this.viewModel.listLevel.numberFormat;
            this.numberStyle.index = this.listPatternConverter(this.viewModel.listLevelPattern);
            this.listLevelElement.index = this.viewModel.levelNumber;
            //this.viewModel.levelNumber = this.viewModel.levelNumber;
        }
    };
    ListDialog.prototype.disposeBindingForListUI = function () {
        this.followNumberWith.index = -1;
        this.numberFormat.value = ' ';
        this.numberStyle.index = -1;
        this.listLevelElement.index = -1;
        this.restartBy.index = -1;
        this.viewModel.destroy();
    };
    /**
     * @private
     * @returns {void}
     */
    ListDialog.prototype.destroy = function () {
        if (this.alignedAt) {
            this.alignedAt.destroy();
        }
        this.alignedAt = undefined;
        this.dialog = undefined;
        if (this.followNumberWith) {
            this.followNumberWith.destroy();
        }
        this.followNumberWith = undefined;
        if (this.listLevelElement) {
            this.listLevelElement.destroy();
        }
        this.listLevelElement = undefined;
        if (this.textIndent) {
            this.textIndent.destroy();
        }
        this.textIndent = undefined;
        if (this.startAt) {
            this.startAt.destroy();
        }
        this.startAt = undefined;
        if (this.numberStyle) {
            this.numberStyle.destroy();
        }
        this.numberStyle = undefined;
        this.numberFormat = undefined;
        if (this.restartBy) {
            this.restartBy.destroy();
        }
        this.restartBy = undefined;
        if (!isNullOrUndefined(this.target)) {
            if (this.target.parentElement) {
                this.target.parentElement.removeChild(this.target);
            }
            for (var l = 0; l < this.target.childNodes.length; l++) {
                this.target.removeChild(this.target.childNodes[l]);
                l--;
            }
            this.target = undefined;
        }
        this.documentHelper = undefined;
        this.viewModel = undefined;
    };
    return ListDialog;
}());
export { ListDialog };
/* eslint-enable @typescript-eslint/no-explicit-any */
