import { CheckBox } from '@syncfusion/ej2-buttons';
import { NumericTextBox } from '@syncfusion/ej2-inputs';
import { WCellFormat } from '../index';
import { isNullOrUndefined, L10n, createElement } from '@syncfusion/ej2-base';
/**
 * The Cell options dialog is used to modify margins of selected cells.
 */
var CellOptionsDialog = /** @class */ (function () {
    /**
     * @param {DocumentHelper} documentHelper - Specifies the document helper.
     * @private
     */
    function CellOptionsDialog(documentHelper) {
        var _this = this;
        /**
         * @private
         * @returns {void}
         */
        this.removeEvents = function () {
            _this.documentHelper.dialog2.element.style.pointerEvents = '';
            _this.documentHelper.updateFocus();
        };
        /**
         * @private
         * @returns {void}
         */
        this.changeSameAsTable = function () {
            if (_this.sameAsTableCheckBox.checked) {
                _this.leftMarginBox.enabled = false;
                _this.rightMarginBox.enabled = false;
                _this.bottomMarginBox.enabled = false;
                _this.topMarginBox.enabled = false;
            }
            else {
                _this.leftMarginBox.enabled = true;
                _this.rightMarginBox.enabled = true;
                _this.bottomMarginBox.enabled = true;
                _this.topMarginBox.enabled = true;
            }
        };
        /**
         * @private
         * @returns {void}
         */
        this.applyTableCellProperties = function () {
            var cellFormat = _this.documentHelper.selection.cellFormat;
            if (!isNullOrUndefined(_this.bottomMarginBox.value || _this.leftMarginBox.value
                || _this.rightMarginBox.value || _this.topMarginBox.value) &&
                (cellFormat.bottomMargin !== _this.bottomMarginBox.value || cellFormat.leftMargin !== _this.leftMarginBox.value
                    || cellFormat.rightMargin !== _this.rightMarginBox.value || cellFormat.topMargin !== _this.topMarginBox.value)) {
                _this.documentHelper.owner.tablePropertiesDialogModule.isCellOptionsUpdated = true;
                _this.applyTableOptions(_this.cellFormat);
                _this.documentHelper.owner.tablePropertiesDialogModule.applyTableSubProperties();
            }
            _this.closeCellMarginsDialog();
        };
        /**
         * @private
         * @returns {void}
         */
        this.closeCellMarginsDialog = function () {
            _this.documentHelper.dialog.hide();
            _this.documentHelper.dialog.element.style.pointerEvents = '';
        };
        this.documentHelper = documentHelper;
    }
    Object.defineProperty(CellOptionsDialog.prototype, "cellFormat", {
        /**
         * @private
         * @returns {WCellFormat} - Returns cell format.
         */
        get: function () {
            if (isNullOrUndefined(this.cellFormatIn)) {
                return this.cellFormatIn = new WCellFormat();
            }
            return this.cellFormatIn;
        },
        enumerable: true,
        configurable: true
    });
    CellOptionsDialog.prototype.getModuleName = function () {
        return 'CellOptionsDialog';
    };
    /**
     * @private
     * @param {L10n} localValue - Specifies the locale.
     * @param {boolean} isRtl - Specifies is rtl.
     * @returns {void}
     */
    CellOptionsDialog.prototype.initCellMarginsDialog = function (localValue, isRtl) {
        this.owner = this.documentHelper.owner.viewer;
        this.target = createElement('div', {
            id: this.documentHelper.owner.containerId + '_tableCellMarginsDialog', className: 'e-de-table-cell-margin-dlg'
        });
        var innerDiv = createElement('div', { styles: 'width: 504px;position: relative;height: auto;' });
        var innerDivLabel = createElement('Label', {
            className: 'e-de-cell-dia-options-label', id: this.target.id + '_innerDivLabel'
        });
        innerDivLabel.innerHTML = localValue.getConstant('Cell margins');
        innerDiv.appendChild(innerDivLabel);
        var table = createElement('TABLE', {
            styles: 'padding-bottom: 8px;padding-top: 8px;', className: 'e-de-cell-margin-top'
        });
        var tr = createElement('tr');
        var td = createElement('td', { className: 'e-de-tbl-btn-separator' });
        var sameAsTableCheckBox = createElement('input', {
            attrs: { 'type': 'checkbox' }, id: this.target.id + '_sameAsCheckBox'
        });
        td.appendChild(sameAsTableCheckBox);
        tr.appendChild(td);
        table.appendChild(tr);
        innerDiv.appendChild(table);
        CellOptionsDialog.getCellMarginDialogElements(this, innerDiv, localValue);
        var divBtn = document.createElement('div');
        this.target.appendChild(divBtn);
        this.sameAsTableCheckBox = new CheckBox({
            label: localValue.getConstant('Same as the whole table'),
            change: this.changeSameAsTable,
            enableRtl: isRtl
        });
        this.sameAsTableCheckBox.appendTo(sameAsTableCheckBox);
        this.sameAsTableCheckBox.addEventListener('change', this.changeSameAsTable);
    };
    /**
     * @private
     * @returns {void}
     */
    CellOptionsDialog.prototype.show = function () {
        var localizeValue = new L10n('documenteditor', this.documentHelper.owner.defaultLocale);
        localizeValue.setLocale(this.documentHelper.owner.locale);
        if (!this.target) {
            this.initCellMarginsDialog(localizeValue, this.documentHelper.owner.enableRtl);
        }
        this.loadCellMarginsDialog();
        this.documentHelper.dialog.header = localizeValue.getConstant('Cell Options');
        this.documentHelper.dialog.position = { X: 'center', Y: 'top' };
        this.documentHelper.dialog.height = 'auto';
        this.documentHelper.dialog.width = 'auto';
        this.documentHelper.dialog.content = this.target;
        this.documentHelper.dialog.beforeOpen = undefined;
        this.documentHelper.dialog.open = undefined;
        this.documentHelper.dialog.close = this.removeEvents;
        this.documentHelper.dialog.buttons = [{
                click: this.applyTableCellProperties,
                buttonModel: { content: localizeValue.getConstant('Ok'), cssClass: 'e-flat e-table-cell-margin-okay', isPrimary: true }
            },
            {
                click: this.closeCellMarginsDialog,
                buttonModel: { content: localizeValue.getConstant('Cancel'), cssClass: 'e-flat e-table-cell-margin-cancel' }
            }];
        this.documentHelper.dialog.show();
    };
    /**
     * @private
     * @returns {void}
     */
    CellOptionsDialog.prototype.loadCellMarginsDialog = function () {
        var cellFormat = this.documentHelper.selection.cellFormat;
        this.sameAsTable = isNullOrUndefined(cellFormat.leftMargin || cellFormat.topMargin
            || cellFormat.rightMargin || cellFormat.bottomMargin);
        if (this.sameAsTable) {
            var tableFormat = this.documentHelper.selection.tableFormat;
            this.loadCellProperties(tableFormat, false, true);
        }
        else {
            this.loadCellProperties(cellFormat, true, false);
        }
    };
    CellOptionsDialog.prototype.loadCellProperties = function (format, enableTextBox, enableCheckBox) {
        this.leftMarginBox.value = format.leftMargin;
        this.rightMarginBox.value = format.rightMargin;
        this.topMarginBox.value = format.topMargin;
        this.bottomMarginBox.value = format.bottomMargin;
        this.leftMarginBox.enabled = enableTextBox;
        this.rightMarginBox.enabled = enableTextBox;
        this.topMarginBox.enabled = enableTextBox;
        this.bottomMarginBox.enabled = enableTextBox;
        this.sameAsTableCheckBox.checked = enableCheckBox;
    };
    /**
     * @private
     * @param {WCellFormat} cellFormat Specifies cell format.
     * @returns {void}
     */
    CellOptionsDialog.prototype.applySubCellOptions = function (cellFormat) {
        this.documentHelper.owner.editorHistory.initComplexHistory(this.documentHelper.selection, 'CellMarginsSelection');
        this.documentHelper.owner.editorModule.initHistory('CellOptions');
        /* eslint-disable max-len */
        this.documentHelper.selection.start.paragraph.associatedCell.ownerTable.combineWidget(this.owner);
        this.applyCellMarginValue(this.documentHelper.selection.start.paragraph.associatedCell.ownerRow.combineWidget(this.owner), this.documentHelper.selection.start, this.documentHelper.selection.end, cellFormat);
        this.documentHelper.owner.editorModule.reLayout(this.documentHelper.selection, false);
        if (!isNullOrUndefined(this.documentHelper.owner.editorHistory.currentHistoryInfo)) {
            this.documentHelper.owner.editorHistory.updateComplexHistory();
        }
    };
    CellOptionsDialog.prototype.applyCellMarginValue = function (row, start, end, cellFormat) {
        this.applyCellMarginsInternal(row, cellFormat);
        if (end.paragraph.associatedCell.ownerRow === row) {
            return;
        }
        var newRow = row.nextWidget;
        if (!isNullOrUndefined(newRow)) {
            this.applyCellMarginValue(newRow, start, end, cellFormat);
        }
    };
    CellOptionsDialog.prototype.applyCellMarginsInternal = function (row, cellFormat) {
        if (!isNullOrUndefined(this.documentHelper.owner.editorHistory.currentBaseHistoryInfo)) {
            var currentFormat = row.childWidgets[0].cellFormat;
            /* eslint-disable max-len */
            cellFormat = this.documentHelper.owner.editorHistory.currentBaseHistoryInfo.addModifiedCellOptions(currentFormat, cellFormat, row.ownerTable);
        }
        if (!isNullOrUndefined(cellFormat)) {
            this.applyCellMarginsForCells(row, cellFormat);
        }
    };
    CellOptionsDialog.prototype.applyCellMarginsForCells = function (row, cellFormat) {
        var rowCells = row.childWidgets;
        this.iterateCells(rowCells, cellFormat);
    };
    CellOptionsDialog.prototype.iterateCells = function (cells, cellFormat) {
        for (var i = 0; i < cells.length; i++) {
            this.applySubCellMargins(cells[i].cellFormat, cellFormat);
        }
        this.documentHelper.owner.tablePropertiesDialogModule.calculateGridValue(cells[0].ownerTable);
    };
    CellOptionsDialog.prototype.applySubCellMargins = function (sourceFormat, cellFormat) {
        sourceFormat.leftMargin = cellFormat.leftMargin;
        sourceFormat.topMargin = cellFormat.topMargin;
        sourceFormat.rightMargin = cellFormat.rightMargin;
        sourceFormat.bottomMargin = cellFormat.bottomMargin;
    };
    CellOptionsDialog.prototype.applyTableOptions = function (cellFormat) {
        if (!this.sameAsTableCheckBox.checked) {
            cellFormat.leftMargin = this.leftMarginBox.value;
            cellFormat.topMargin = this.topMarginBox.value;
            cellFormat.bottomMargin = this.bottomMarginBox.value;
            cellFormat.rightMargin = this.rightMarginBox.value;
        }
    };
    /**
     * @private
     * @returns {void}
     */
    CellOptionsDialog.prototype.destroy = function () {
        if (!isNullOrUndefined(this.target)) {
            if (this.target.parentElement) {
                this.target.parentElement.removeChild(this.target);
            }
            for (var y = 0; y < this.target.childNodes.length; y++) {
                this.target.removeChild(this.target.childNodes[y]);
                y--;
            }
            this.target = undefined;
        }
        this.dialog = undefined;
        this.target = undefined;
        this.documentHelper = undefined;
        this.sameAsTableCheckBox = undefined;
    };
    /**
     * @private
     * @param {CellOptionsDialog | TableOptionsDialog} dialog - Specifies cell options dialog.
     * @param {HTMLDivElement} div - Specifies the html element.
     * @param {L10n} locale - Specifies the locale
     * @returns {void}
     */
    CellOptionsDialog.getCellMarginDialogElements = function (dialog, div, locale) {
        if (!isNullOrUndefined(dialog)) {
            var table = createElement('TABLE', { className: 'e-de-cell-margin-top' });
            var tr1 = createElement('tr', { styles: 'height: 50px;' });
            var td1 = createElement('td');
            var topLabel = createElement('label', {
                innerHTML: locale.getConstant('Top'), className: 'e-de-cell-dia-label-common',
                id: dialog.target.id + '_TopLabel'
            });
            var topTextBox = createElement('input', {
                attrs: { 'type': 'text' }, styles: 'width:100%', id: dialog.target.id + '_Top'
            });
            td1.appendChild(topLabel);
            td1.appendChild(topTextBox);
            var td2 = createElement('td', { className: 'e-de-tbl-btn-separator' });
            var leftLabel = createElement('label', {
                innerHTML: locale.getConstant('Left'), className: 'e-de-cell-dia-label-common',
                id: dialog.target.id + '_leftLabel'
            });
            var leftTextBox = createElement('input', {
                attrs: { 'type': 'text' },
                styles: 'width:100%', id: dialog.target.id + '_left'
            });
            td2.appendChild(leftLabel);
            td2.appendChild(leftTextBox);
            tr1.appendChild(td1);
            tr1.appendChild(td2);
            var tr2 = createElement('tr', { styles: 'height: 50px;' });
            var td3 = createElement('td', { styles: 'width:40%;' });
            var bottomLabel = createElement('label', {
                innerHTML: locale.getConstant('Bottom'),
                className: 'e-de-cell-dia-label-common', id: dialog.target.id + '_bottomLabel'
            });
            var bottomTextBox = createElement('input', {
                attrs: { 'type': 'text' },
                styles: 'width:100%', id: dialog.target.id + '_bottom'
            });
            td3.appendChild(bottomLabel);
            td3.appendChild(bottomTextBox);
            var td4 = createElement('td', { styles: 'width:40%;' });
            var rightLabel = createElement('label', {
                innerHTML: locale.getConstant('Right'), id: dialog.target.id + '_rightLabel',
                className: 'e-de-cell-dia-label-common'
            });
            var rightTextBox = createElement('input', {
                attrs: { 'type': 'text' },
                styles: 'width:100%', id: dialog.target.id + '_right'
            });
            td4.appendChild(rightLabel);
            td4.appendChild(rightTextBox);
            tr2.appendChild(td3);
            tr2.appendChild(td4);
            table.appendChild(tr1);
            table.appendChild(tr2);
            div.appendChild(table);
            dialog.target.appendChild(div);
            dialog.topMarginBox = new NumericTextBox({
                value: 0, min: 0, max: 1584, width: 175, decimals: 2,
                enablePersistence: false
            });
            dialog.topMarginBox.appendTo(topTextBox);
            dialog.leftMarginBox = new NumericTextBox({
                value: 0, min: 0, max: 1584, width: 175,
                decimals: 2, enablePersistence: false
            });
            dialog.leftMarginBox.appendTo(leftTextBox);
            dialog.bottomMarginBox = new NumericTextBox({
                value: 0, min: 0, max: 1584, width: 175, decimals: 2,
                enablePersistence: false
            });
            dialog.bottomMarginBox.appendTo(bottomTextBox);
            dialog.rightMarginBox = new NumericTextBox({
                value: 0, min: 0, max: 1584, width: 175,
                decimals: 2, enablePersistence: false
            });
            dialog.rightMarginBox.appendTo(rightTextBox);
        }
    };
    return CellOptionsDialog;
}());
export { CellOptionsDialog };
