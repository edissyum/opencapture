import { L10n, createElement, isNullOrUndefined } from '@syncfusion/ej2-base';
import { CheckBox, Button } from '@syncfusion/ej2-buttons';
import { DropDownList } from '@syncfusion/ej2-dropdowns';
import { NumericTextBox } from '@syncfusion/ej2-inputs';
import { ListView } from '@syncfusion/ej2-lists';
/**
 * The Table of contents dialog is used to insert or edit table of contents at selection.
 */
var TableOfContentsDialog = /** @class */ (function () {
    /**
     * @param {DocumentHelper} documentHelper - Specifies the document helper.
     * @private
     */
    function TableOfContentsDialog(documentHelper) {
        var _this = this;
        /**
         * @private
         * @returns {void}
         */
        this.loadTableofContentDialog = function () {
            _this.documentHelper.updateFocus();
            _this.pageNumber.checked = true;
            _this.rightAlign.disabled = false;
            _this.rightAlign.checked = true;
            _this.tabLeader.enabled = true;
            _this.hyperlink.checked = true;
            _this.style.checked = true;
            _this.outline.checked = true;
            _this.outline.disabled = false;
            _this.showLevel.enabled = true;
        };
        /**
         * @private
         * @returns {void}
         */
        this.closeTableOfContentDialog = function () {
            _this.unWireEventsAndBindings();
            _this.documentHelper.updateFocus();
        };
        /**
         * @private
         * @returns {void}
         */
        this.onCancelButtonClick = function () {
            _this.documentHelper.dialog3.hide();
            _this.unWireEventsAndBindings();
            _this.documentHelper.updateFocus();
        };
        /**
         * @param {SelectEventArgs} args - Specifies the event args.
         * @returns {void}
         */
        this.selectHandler = function (args) {
            _this.textBoxInput.value = args.text;
            var value = document.getElementById('toclist');
            value.setSelectionRange(0, args.text.length);
            value.focus();
        };
        /**
         * @private
         * @returns {void}
         */
        this.showStyleDialog = function () {
            if (!isNullOrUndefined(_this.documentHelper.owner.styleDialogModule)) {
                _this.documentHelper.owner.styleDialogModule.show(_this.textBoxInput.value);
            }
        };
        /**
         * @returns {void}
         */
        this.reset = function () {
            _this.showLevel.enabled = true;
            _this.showLevel.value = 3;
            _this.outline.disabled = false;
            _this.outline.checked = true;
            var values = ['1', '2', '3', null, null, null, null, null, null];
            _this.changeByValue(values);
            _this.normal.value = null;
        };
        /**
         * @param {KeyboardEvent} args - Specifies the event args.
         * @returns {void}
         */
        this.changeStyle = function (args) {
            var headingValue = args.srcElement.value;
            var value = _this.getElementValue(args.srcElement);
            if (headingValue !== value && headingValue !== '') {
                _this.showLevel.enabled = false;
            }
            else {
                _this.showLevel.enabled = true;
                _this.checkLevel();
            }
        };
        /**
         * @param {KeyboardEvent} args - Specifies the event args.
         * @returns {void}
         */
        this.changeHeadingStyle = function (args) {
            var headingValue = args.srcElement.value;
            if (headingValue === '') {
                _this.showLevel.enabled = true;
            }
            else {
                _this.showLevel.enabled = false;
            }
            if (_this.normal === args.srcElement) {
                _this.outline.checked = false;
                _this.outline.disabled = true;
            }
        };
        /**
         * @param {ChangeEventArgs} args - Specifies the event args.
         * @returns {void}
         */
        this.changePageNumberValue = function (args) {
            if (args.checked) {
                _this.rightAlign.checked = true;
                _this.rightAlign.disabled = false;
                _this.tabLeader.enabled = true;
            }
            else {
                _this.rightAlign.disabled = true;
                _this.tabLeader.enabled = false;
            }
        };
        /**
         * @param {ChangeEventArgs} args - Specifies the event args.
         * @returns {void}
         */
        this.changeRightAlignValue = function (args) {
            if (args.checked) {
                _this.tabLeader.enabled = true;
            }
            else {
                _this.tabLeader.enabled = false;
            }
        };
        /**
         * @param {ChangeEventArgs} args - Specifies the event args.
         * @returns {void}
         */
        this.changeStyleValue = function (args) {
            if (args.checked) {
                _this.heading1.disabled = false;
                _this.heading2.disabled = false;
                _this.heading3.disabled = false;
                _this.heading4.disabled = false;
                _this.heading5.disabled = false;
                _this.heading6.disabled = false;
                _this.heading7.disabled = false;
                _this.heading8.disabled = false;
                _this.heading9.disabled = false;
                _this.normal.disabled = false;
            }
            else {
                _this.heading1.disabled = true;
                _this.heading2.disabled = true;
                _this.heading3.disabled = true;
                _this.heading4.disabled = true;
                _this.heading5.disabled = true;
                _this.heading6.disabled = true;
                _this.heading7.disabled = true;
                _this.heading8.disabled = true;
                _this.heading9.disabled = true;
                _this.normal.disabled = true;
            }
        };
        /**
         * @private
         * @returns {void}
         */
        this.applyTableOfContentProperties = function () {
            var tocSettings = {
                startLevel: 1,
                endLevel: _this.showLevel.value,
                includeHyperlink: _this.hyperlink.checked,
                includePageNumber: _this.pageNumber.checked,
                rightAlign: _this.rightAlign.checked,
                tabLeader: _this.tabLeader.value,
                includeOutlineLevels: _this.outline.checked
            };
            _this.applyLevelSetting(tocSettings);
            _this.documentHelper.owner.editorModule.insertTableOfContents(tocSettings);
            _this.documentHelper.dialog3.hide();
            _this.documentHelper.updateFocus();
        };
        /**
         * @private
         * @returns {void}
         */
        this.unWireEventsAndBindings = function () {
            _this.pageNumber.checked = false;
            _this.rightAlign.checked = false;
            _this.tabLeader.value = '';
            _this.hyperlink.checked = false;
            _this.style.checked = false;
            _this.outline.checked = false;
            _this.normal.value = '';
        };
        this.documentHelper = documentHelper;
    }
    TableOfContentsDialog.prototype.getModuleName = function () {
        return 'TableOfContentsDialog';
    };
    /* eslint-disable   */
    /**
     * @private
     * @param {L10n} localValue - Specifies the locale value
     * @param {boolean} isRtl - Specifies the is rtl
     * @returns {void}
     */
    TableOfContentsDialog.prototype.initTableOfContentDialog = function (locale, isRtl) {
        var instance = this;
        var ownerId = this.documentHelper.owner.containerId;
        var id = ownerId + '_toc_dialog';
        this.target = createElement('div', { id: id, className: 'e-de-toc-dlg-container' });
        var generalDiv = createElement('div', { id: 'general_div', className: 'e-de-toc-dlg-sub-container' });
        this.target.appendChild(generalDiv);
        var genLabel = createElement('div', { id: ownerId + '_genLabel', className: 'e-de-toc-dlg-main-heading', styles: 'margin-bottom: 13px;', innerHTML: locale.getConstant('General') });
        generalDiv.appendChild(genLabel);
        var leftGeneralDivStyles;
        var rightBottomGeneralDivStyles;
        if (isRtl) {
            leftGeneralDivStyles = 'float:right;';
            rightBottomGeneralDivStyles = 'float:left;position:relative;';
        }
        else {
            leftGeneralDivStyles = 'float:left;';
            rightBottomGeneralDivStyles = 'float:right;';
        }
        var topContainer = createElement('div', { id: 'general_top_container', styles: 'display:inline-flex' });
        var leftGeneralDiv = createElement('div', { id: 'left_general', styles: leftGeneralDivStyles + 'position:relative;' });
        topContainer.appendChild(leftGeneralDiv);
        var rightGeneralDiv = createElement('div', { className: 'e-de-toc-dlg-right-general-div' });
        topContainer.appendChild(rightGeneralDiv);
        generalDiv.appendChild(topContainer);
        var bottomContainer = createElement('div', { id: 'general_bottom_container', styles: 'display:inline-flex' });
        var leftBottomGeneralDiv = createElement('div', { id: 'leftBottom_general', styles: 'float:left;' });
        bottomContainer.appendChild(leftBottomGeneralDiv);
        var rightBottomGeneralDiv = createElement('div', { className: 'e-de-toc-dlg-right-sub-container', styles: rightBottomGeneralDivStyles });
        bottomContainer.appendChild(rightBottomGeneralDiv);
        generalDiv.appendChild(bottomContainer);
        var pageNumberDiv = createElement('div', { id: 'pageNumber_div', className: 'e-de-toc-dlg-sub-container' });
        var pageNumber = createElement('input', {
            attrs: { 'type': 'checkbox' }, id: this.target.id + '_pageNumber'
        });
        pageNumberDiv.appendChild(pageNumber);
        var rightAlignDiv = createElement('div', { id: 'rightAlign_div', className: 'e-de-toc-dlg-sub-container' });
        var rightAlign = createElement('input', {
            attrs: { 'type': 'checkbox' }, id: this.target.id + '_rightAlign'
        });
        rightAlignDiv.appendChild(rightAlign);
        this.pageNumber = new CheckBox({ label: locale.getConstant('Show page numbers'), enableRtl: isRtl, checked: true, change: this.changePageNumberValue });
        this.rightAlign = new CheckBox({ label: locale.getConstant('Right align page numbers'), enableRtl: isRtl, checked: true, change: this.changeRightAlignValue });
        this.pageNumber.appendTo(pageNumber);
        this.rightAlign.appendTo(rightAlign);
        var tabDiv = createElement('div', { id: 'tab_div', className: 'e-de-toc-dlg-tab-div' });
        var tabLeaderLabelDiv = createElement('div', { id: 'tabLeaderLabel_div' });
        var tabLeaderLabel = createElement('label', { id: ownerId + '_tabLeaderLabel', className: 'e-de-toc-dlg-heading', innerHTML: locale.getConstant('Tab leader') + ':' });
        tabLeaderLabelDiv.appendChild(tabLeaderLabel);
        var tabLeaderDiv = createElement('div', { id: 'tabLeader_div' });
        var tabLeader = createElement('select', {
            id: ownerId + '_tabLeader',
            innerHTML: '<option value="None">' + '(' + locale.getConstant('None').toLocaleLowerCase() + ')' +
                '</option><option value="Dot" selected>' + '....................' +
                '</option><option value="Hyphen">' + '-------------------' +
                '</option><option value="Underscore">' + '____________' + '</option>'
        });
        tabLeaderDiv.appendChild(tabLeader);
        tabDiv.appendChild(tabLeaderLabelDiv);
        tabDiv.appendChild(tabLeaderDiv);
        leftGeneralDiv.appendChild(pageNumberDiv);
        leftGeneralDiv.appendChild(rightAlignDiv);
        leftGeneralDiv.appendChild(tabDiv);
        this.tabLeader = new DropDownList({ width: 210, enableRtl: isRtl });
        this.tabLeader.appendTo(tabLeader);
        var hyperlink = createElement('input', {
            attrs: { 'type': 'checkbox' }, id: this.target.id + '_hyperlink'
        });
        rightGeneralDiv.appendChild(hyperlink);
        this.hyperlink = new CheckBox({ label: locale.getConstant('Use hyperlinks instead of page numbers'), cssClass: 'e-de-toc-label', enableRtl: isRtl, checked: true });
        this.hyperlink.appendTo(hyperlink);
        var showDiv = createElement('div', { id: 'show_div', className: 'e-de-toc-dlg-style-label' });
        var showLevelLabelDiv = createElement('div', { id: 'showLevelLabel_div', className: 'e-de-toc-dlg-show-level-div' });
        var showLevelLabel = createElement('label', { id: ownerId + '_showLevelLabel', className: 'e-de-toc-dlg-heading', innerHTML: locale.getConstant('Show levels') + ':' });
        showLevelLabelDiv.appendChild(showLevelLabel);
        var showLevelDiv = createElement('div', { id: 'showLevel_div', className: 'e-de-toc-dlg-showlevel-div' });
        var showLevel = createElement('input', { id: ownerId + '_showLevel', attrs: { 'type': 'text' } });
        showLevelDiv.appendChild(showLevel);
        showDiv.appendChild(showLevelLabelDiv);
        showDiv.appendChild(showLevelDiv);
        rightGeneralDiv.appendChild(showDiv);
        this.showLevel = new NumericTextBox({ format: '#', value: 3, min: 1, max: 9, width: 210, change: this.changeShowLevelValue.bind(this) });
        this.showLevel.appendTo(showLevel);
        if (isRtl) {
            this.hyperlink.cssClass = 'e-de-toc-label-rtl';
            showLevelLabelDiv.classList.add('e-de-rtl');
            showLevelDiv.classList.add('e-de-rtl');
            rightBottomGeneralDiv.classList.add('e-de-rtl');
        }
        var buildTableDiv = createElement('div', { id: 'buildTable_div', className: 'e-de-toc-dlg-sub-container' });
        var buildTableLabel = createElement('div', { id: ownerId + '_buildTableLabel', className: 'e-de-toc-dlg-main-heading e-de-toc-dlg-build-table', styles: 'margin-bottom: 13px;', innerHTML: locale.getConstant('Build table of contents from') + ':' });
        leftBottomGeneralDiv.appendChild(buildTableDiv);
        leftBottomGeneralDiv.appendChild(buildTableLabel);
        var style = createElement('input', {
            attrs: { 'type': 'checkbox' }, id: this.target.id + '_style',
        });
        leftBottomGeneralDiv.appendChild(style);
        this.style = new CheckBox({ label: locale.getConstant('Styles'), enableRtl: isRtl, checked: true, change: this.changeStyleValue });
        this.style.appendTo(style);
        var table = createElement('TABLE', { styles: 'margin-top:3px;' });
        var tr1 = createElement('tr');
        var td1 = createElement('td', { styles: 'width:120px;padding-left:10px;' });
        var availableLabel = createElement('label', {
            innerHTML: locale.getConstant('Available styles'), className: 'e-de-toc-dlg-main-heading e-de-toc-dlg-sub-level-heading', id: this.target.id + '_availableLabel'
        });
        td1.appendChild(availableLabel);
        var td2 = createElement('td');
        var tocLabel = createElement('label', {
            innerHTML: locale.getConstant('TOC level') + ':', className: 'e-de-toc-dlg-main-heading e-de-toc-dlg-sub-level-heading',
            id: this.target.id + '_tocLabel'
        });
        td2.appendChild(tocLabel);
        tr1.appendChild(td1);
        tr1.appendChild(td2);
        table.appendChild(tr1);
        var tableDiv = createElement('div', { id: 'table_div', className: 'e-de-toc-table-div' });
        var table1 = createElement('TABLE');
        var tr2 = createElement('tr');
        var td3 = createElement('td');
        var heading1Label = createElement('label', {
            innerHTML: locale.getConstant('Heading') + ' 1',
            className: 'e-de-toc-dlg-sub-heading', id: this.target.id + '_heading1Label'
        });
        td3.appendChild(heading1Label);
        var td4 = createElement('td');
        this.heading1 = createElement('input', { id: '_heading1', className: 'e-input e-de-toc-dlg-toc-level' });
        this.heading1.value = '1';
        this.heading1.addEventListener('keyup', this.changeStyle);
        td4.appendChild(this.heading1);
        tr2.appendChild(td3);
        tr2.appendChild(td4);
        var tr3 = createElement('tr');
        var td5 = createElement('td');
        var heading2Label = createElement('label', {
            innerHTML: locale.getConstant('Heading') + ' 2',
            className: 'e-de-toc-dlg-sub-heading', id: this.target.id + '_heading2Label'
        });
        td5.appendChild(heading2Label);
        var td6 = createElement('td');
        this.heading2 = createElement('input', { id: '_heading2', className: 'e-input e-de-toc-dlg-toc-level' });
        this.heading2.value = '2';
        this.heading2.addEventListener('keyup', this.changeStyle);
        td6.appendChild(this.heading2);
        tr3.appendChild(td5);
        tr3.appendChild(td6);
        var tr4 = createElement('tr');
        var td7 = createElement('td');
        var heading3Label = createElement('label', {
            innerHTML: locale.getConstant('Heading') + ' 3',
            className: 'e-de-toc-dlg-sub-heading', id: this.target.id + '_heading3Label'
        });
        td7.appendChild(heading3Label);
        var td8 = createElement('td');
        this.heading3 = createElement('input', { id: '_heading3', className: 'e-input e-de-toc-dlg-toc-level' });
        this.heading3.value = '3';
        this.heading3.addEventListener('keyup', this.changeStyle);
        td8.appendChild(this.heading3);
        tr4.appendChild(td7);
        tr4.appendChild(td8);
        var tr5 = createElement('tr');
        var td9 = createElement('td');
        var heading4Label = createElement('label', {
            innerHTML: locale.getConstant('Heading') + ' 4',
            className: 'e-de-toc-dlg-sub-heading', id: this.target.id + '_heading4Label'
        });
        td9.appendChild(heading4Label);
        var td10 = createElement('td');
        this.heading4 = createElement('input', { id: '_heading4', className: 'e-input e-de-toc-dlg-toc-level' });
        this.heading4.addEventListener('keyup', this.changeStyle);
        td10.appendChild(this.heading4);
        tr5.appendChild(td9);
        tr5.appendChild(td10);
        var tr6 = createElement('tr');
        var td11 = createElement('td');
        var heading5Label = createElement('label', {
            innerHTML: locale.getConstant('Heading') + ' 5',
            className: 'e-de-toc-dlg-sub-heading', id: this.target.id + '_heading5Label'
        });
        td11.appendChild(heading5Label);
        var td12 = createElement('td');
        this.heading5 = createElement('input', { id: '_heading5', className: 'e-input e-de-toc-dlg-toc-level' });
        this.heading5.addEventListener('keyup', this.changeStyle);
        td12.appendChild(this.heading5);
        tr6.appendChild(td11);
        tr6.appendChild(td12);
        var tr7 = createElement('tr');
        var td13 = createElement('td');
        var heading6Label = createElement('label', {
            innerHTML: locale.getConstant('Heading') + ' 6',
            className: 'e-de-toc-dlg-sub-heading', id: this.target.id + '_heading6Label'
        });
        td13.appendChild(heading6Label);
        var td14 = createElement('td');
        this.heading6 = createElement('input', { id: '_heading6', className: 'e-input e-de-toc-dlg-toc-level' });
        this.heading6.addEventListener('keyup', this.changeStyle);
        td14.appendChild(this.heading6);
        tr7.appendChild(td13);
        tr7.appendChild(td14);
        var tr8 = createElement('tr');
        var td15 = createElement('td');
        var heading7Label = createElement('label', {
            innerHTML: locale.getConstant('Heading') + ' 7',
            className: 'e-de-toc-dlg-sub-heading', id: this.target.id + '_heading7Label'
        });
        td15.appendChild(heading7Label);
        var td16 = createElement('td');
        this.heading7 = createElement('input', { id: '_heading7', className: 'e-input e-de-toc-dlg-toc-level' });
        this.heading7.addEventListener('keyup', this.changeStyle);
        td16.appendChild(this.heading7);
        tr8.appendChild(td15);
        tr8.appendChild(td16);
        var tr9 = createElement('tr');
        var td17 = createElement('td');
        var heading8Label = createElement('label', {
            innerHTML: locale.getConstant('Heading') + ' 8',
            className: 'e-de-toc-dlg-sub-heading', id: this.target.id + '_heading8Label'
        });
        td17.appendChild(heading8Label);
        var td18 = createElement('td');
        this.heading8 = createElement('input', { id: '_heading8', className: 'e-input e-de-toc-dlg-toc-level' });
        this.heading8.addEventListener('keyup', this.changeStyle);
        td18.appendChild(this.heading8);
        tr9.appendChild(td17);
        tr9.appendChild(td18);
        var tr10 = createElement('tr');
        var td19 = createElement('td');
        var heading9Label = createElement('label', {
            innerHTML: locale.getConstant('Heading') + ' 9',
            className: 'e-de-toc-dlg-sub-heading', id: this.target.id + '_heading9Label'
        });
        td19.appendChild(heading9Label);
        var td20 = createElement('td');
        this.heading9 = createElement('input', { id: '_heading9', className: 'e-input e-de-toc-dlg-toc-level' });
        this.heading9.addEventListener('keyup', this.changeStyle);
        td20.appendChild(this.heading9);
        tr10.appendChild(td19);
        tr10.appendChild(td20);
        var tr12 = createElement('tr');
        var td23 = createElement('td');
        var normalLabel = createElement('label', {
            innerHTML: locale.getConstant('Normal'),
            className: 'e-de-toc-dlg-sub-heading', id: this.target.id + '_normalLabel'
        });
        td23.appendChild(normalLabel);
        var td24 = createElement('td');
        this.normal = createElement('input', { id: '_normal', className: 'e-input e-de-toc-dlg-toc-level' });
        this.normal.addEventListener('keyup', this.changeHeadingStyle);
        td24.appendChild(this.normal);
        tr12.appendChild(td23);
        tr12.appendChild(td24);
        if (isRtl) {
            this.normal.classList.add('e-de-rtl');
            this.heading1.classList.add('e-de-rtl');
            this.heading2.classList.add('e-de-rtl');
            this.heading3.classList.add('e-de-rtl');
            this.heading4.classList.add('e-de-rtl');
            this.heading5.classList.add('e-de-rtl');
            this.heading6.classList.add('e-de-rtl');
            this.heading7.classList.add('e-de-rtl');
            this.heading8.classList.add('e-de-rtl');
            this.heading9.classList.add('e-de-rtl');
        }
        table1.appendChild(tr2);
        table1.appendChild(tr3);
        table1.appendChild(tr4);
        table1.appendChild(tr5);
        table1.appendChild(tr6);
        table1.appendChild(tr7);
        table1.appendChild(tr8);
        table1.appendChild(tr9);
        table1.appendChild(tr10);
        table1.appendChild(tr12);
        tableDiv.appendChild(table1);
        var stylesLevelDiv = createElement('div', { className: 'e-de-toc-styles-table-div' });
        stylesLevelDiv.appendChild(table);
        stylesLevelDiv.appendChild(tableDiv);
        leftBottomGeneralDiv.appendChild(stylesLevelDiv);
        //leftBottomGeneralDiv.appendChild(table); leftBottomGeneralDiv.appendChild(tableDiv);
        var fieldsDiv = createElement('div', { id: 'fields_div', styles: 'display: flex;' });
        leftBottomGeneralDiv.appendChild(fieldsDiv);
        var outDiv = createElement('div', { id: 'out_div' });
        var outlineDiv = createElement('div', { id: 'outline_div', className: 'e-de-toc-dlg-sub-container e-de-toc-dlg-outline-levels' });
        var outline = createElement('input', {
            attrs: { 'type': 'checkbox' }, id: '_outline'
        });
        outlineDiv.appendChild(outline);
        outDiv.appendChild(outlineDiv);
        fieldsDiv.appendChild(outDiv);
        this.outline = new CheckBox({
            label: locale.getConstant('Outline levels'),
            enableRtl: isRtl, checked: true, cssClass: 'e-de-outline-rtl'
        });
        this.outline.appendTo(outline);
        var resetButtonDiv = createElement('div', { className: 'e-de-toc-reset-button' });
        fieldsDiv.appendChild(resetButtonDiv);
        var resetElement = createElement('button', {
            innerHTML: locale.getConstant('Reset'), id: 'reset',
            attrs: { type: 'button' }
        });
        resetButtonDiv.appendChild(resetElement);
        var resetButton = new Button({ cssClass: 'e-btn e-flat' });
        resetButton.appendTo(resetElement);
        resetElement.addEventListener('click', this.reset);
        var tocStylesDiv = createElement('div', { id: 'tocStyles_div', className: 'e-de-toc-dlg-sub-container' });
        var tocStylesLabel = createElement('div', {
            id: ownerId + '_tocStylesLabel', className: 'e-de-toc-dlg-main-heading e-de-toc-dlg-styles',
            innerHTML: locale.getConstant('Styles') + ':'
        });
        rightBottomGeneralDiv.appendChild(tocStylesDiv);
        rightBottomGeneralDiv.appendChild(tocStylesLabel);
        var textBoxDiv = createElement('div', { className: 'e-de-toc-dlg-style-input' });
        rightBottomGeneralDiv.appendChild(textBoxDiv);
        this.textBoxInput = createElement('input', { className: 'e-input', id: 'toclist' });
        this.textBoxInput.setAttribute('type', 'text');
        textBoxDiv.appendChild(this.textBoxInput);
        var listViewDiv = createElement('div', { className: 'e-de-toc-list-view' });
        var styleLocale = ['TOC 1', 'TOC 2', 'TOC 3', 'TOC 4', 'TOC 5', 'TOC 6', 'TOC 7', 'TOC 8', 'TOC 9'];
        var styleValues = this.styleLocaleValue(styleLocale, locale);
        this.listViewInstance = new ListView({ dataSource: styleValues, cssClass: 'e-toc-list-view' });
        this.listViewInstance.appendTo(listViewDiv);
        this.listViewInstance.addEventListener('select', this.selectHandler);
        rightBottomGeneralDiv.appendChild(listViewDiv);
        var modifyButtonDiv = createElement('div', { className: 'e-de-toc-modify-button' });
        rightBottomGeneralDiv.appendChild(modifyButtonDiv);
        var modifyElement = createElement('button', {
            innerHTML: locale.getConstant('Modify') + '...', id: 'modify',
            attrs: { type: 'button' }
        });
        modifyButtonDiv.appendChild(modifyElement);
        var modifyButton = new Button({ cssClass: 'e-btn e-flat' });
        modifyButton.appendTo(modifyElement);
        modifyElement.addEventListener('click', this.showStyleDialog);
        if (isRtl) {
            resetButtonDiv.classList.add('e-de-rtl');
            tocStylesLabel.classList.add('e-de-rtl');
            textBoxDiv.classList.add('e-de-rtl');
            listViewDiv.classList.add('e-de-rtl');
            modifyButtonDiv.classList.add('e-de-rtl');
        }
    };
    TableOfContentsDialog.prototype.styleLocaleValue = function (styleLocale, localValue) {
        var styleName = [];
        for (var index = 0; index < styleLocale.length; index++) {
            styleName.push(localValue.getConstant(styleLocale[index]));
        }
        return styleName;
    };
    /**
     * @private
     */
    TableOfContentsDialog.prototype.show = function () {
        var localValue = new L10n('documenteditor', this.documentHelper.owner.defaultLocale);
        localValue.setLocale(this.documentHelper.owner.locale);
        if (!this.target) {
            this.initTableOfContentDialog(localValue, this.documentHelper.owner.enableRtl);
        }
        this.documentHelper.dialog3.header = localValue.getConstant('Table of Contents');
        this.documentHelper.dialog3.position = { X: 'center', Y: 'center' };
        this.documentHelper.dialog3.width = 'auto';
        this.documentHelper.dialog3.height = 'auto';
        this.documentHelper.dialog3.content = this.target;
        this.documentHelper.dialog3.beforeOpen = this.loadTableofContentDialog;
        this.documentHelper.dialog3.close = this.closeTableOfContentDialog;
        this.documentHelper.dialog3.buttons = [{
                click: this.applyTableOfContentProperties,
                buttonModel: { content: localValue.getConstant('Ok'), cssClass: 'e-flat e-toc-okay', isPrimary: true }
            },
            {
                click: this.onCancelButtonClick,
                buttonModel: { content: localValue.getConstant('Cancel'), cssClass: 'e-flat e-toc-cancel' }
            }];
        this.documentHelper.dialog3.dataBind();
        this.documentHelper.dialog3.show();
    };
    TableOfContentsDialog.prototype.changeShowLevelValue = function (event) {
        var levels = event.value;
        var values = [];
        switch (levels) {
            case 1:
                values = ['1', null, null, null, null, null, null, null, null];
                this.changeByValue(values);
                break;
            case 2:
                values = ['1', '2', null, null, null, null, null, null, null];
                this.changeByValue(values);
                break;
            case 3:
                values = ['1', '2', '3', null, null, null, null, null, null];
                this.changeByValue(values);
                break;
            case 4:
                values = ['1', '2', '3', '4', null, null, null, null, null];
                this.changeByValue(values);
                break;
            case 5:
                values = ['1', '2', '3', '4', '5', null, null, null, null];
                this.changeByValue(values);
                break;
            case 6:
                values = ['1', '2', '3', '4', '5', '6', null, null, null];
                this.changeByValue(values);
                break;
            case 7:
                values = ['1', '2', '3', '4', '5', '6', '7', null, null];
                this.changeByValue(values);
                break;
            case 8:
                values = ['1', '2', '3', '4', '5', '6', '7', '8', null];
                this.changeByValue(values);
                break;
            case 9:
                values = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
                this.changeByValue(values);
                break;
        }
    };
    TableOfContentsDialog.prototype.changeByValue = function (headings) {
        this.heading1.value = headings[0];
        this.heading2.value = headings[1];
        this.heading3.value = headings[2];
        this.heading4.value = headings[3];
        this.heading5.value = headings[4];
        this.heading6.value = headings[5];
        this.heading7.value = headings[6];
        this.heading8.value = headings[7];
        this.heading9.value = headings[8];
    };
    TableOfContentsDialog.prototype.checkLevel = function () {
        if (this.heading1.value !== '') {
            this.showLevel.value = 1;
        }
        if (this.heading2.value !== '') {
            this.showLevel.value = 2;
        }
        if (this.heading3.value !== '') {
            this.showLevel.value = 3;
        }
        if (this.heading4.value !== '') {
            this.showLevel.value = 4;
        }
        if (this.heading5.value !== '') {
            this.showLevel.value = 5;
        }
        if (this.heading6.value !== '') {
            this.showLevel.value = 6;
        }
        if (this.heading7.value !== '') {
            this.showLevel.value = 7;
        }
        if (this.heading8.value !== '') {
            this.showLevel.value = 8;
        }
        if (this.heading9.value !== '') {
            this.showLevel.value = 9;
        }
    };
    TableOfContentsDialog.prototype.getElementValue = function (element) {
        switch (element) {
            case this.heading1:
                return '1';
            case this.heading2:
                return '2';
            case this.heading3:
                return '3';
            case this.heading4:
                return '4';
            case this.heading5:
                return '5';
            case this.heading6:
                return '6';
            case this.heading7:
                return '7';
            case this.heading8:
                return '8';
            case this.heading9:
                return '9';
            default:
                return '1';
        }
    };
    TableOfContentsDialog.prototype.getHeadingLevel = function (index) {
        switch (index) {
            case 1:
                return parseInt(this.heading1.value);
            case 2:
                return parseInt(this.heading2.value);
            case 3:
                return parseInt(this.heading3.value);
            case 4:
                return parseInt(this.heading4.value);
            case 5:
                return parseInt(this.heading5.value);
            case 6:
                return parseInt(this.heading6.value);
            case 7:
                return parseInt(this.heading7.value);
            case 8:
                return parseInt(this.heading8.value);
            case 9:
                return parseInt(this.heading9.value);
            default:
                return 0;
        }
    };
    TableOfContentsDialog.prototype.applyLevelSetting = function (tocSettings) {
        tocSettings.levelSettings = {};
        var headingPrefix = 'Heading ';
        var newStartLevel = 0;
        var newEndLevel = 0;
        var isEndLevel = false;
        for (var i = 1; i <= tocSettings.endLevel; i++) {
            var outlineLevel = this.getHeadingLevel(i);
            if (i === outlineLevel) {
                if (newStartLevel === 0) {
                    newStartLevel = i;
                    isEndLevel = false;
                }
                if (!isEndLevel) {
                    newEndLevel = i;
                }
            }
            else {
                isEndLevel = true;
                if (outlineLevel !== 0) {
                    var headingStyle = headingPrefix + i.toString();
                    tocSettings.levelSettings[headingStyle] = outlineLevel;
                }
            }
        }
        tocSettings.startLevel = newStartLevel;
        tocSettings.endLevel = newEndLevel;
        if (this.normal.value !== '') {
            tocSettings.levelSettings['Normal'] = +this.normal.value;
        }
    };
    /**
     * @private
     * @returns {void}
     */
    TableOfContentsDialog.prototype.destroy = function () {
        if (this.pageNumber) {
            this.pageNumber.destroy();
            this.pageNumber = undefined;
        }
        if (this.rightAlign) {
            this.rightAlign.destroy();
            this.rightAlign = undefined;
        }
        if (this.tabLeader) {
            this.tabLeader.destroy();
            this.tabLeader = undefined;
        }
        if (this.showLevel) {
            this.showLevel.destroy();
            this.showLevel = undefined;
        }
        if (this.hyperlink) {
            this.hyperlink.destroy();
            this.hyperlink = undefined;
        }
        if (this.style) {
            this.style.destroy();
            this.style = undefined;
        }
        if (this.outline) {
            this.outline.destroy();
            this.outline = undefined;
        }
        if (this.listViewInstance) {
            this.listViewInstance.destroy();
            this.listViewInstance = undefined;
        }
        this.heading1 = undefined;
        this.heading2 = undefined;
        this.heading3 = undefined;
        this.heading4 = undefined;
        this.heading5 = undefined;
        this.heading6 = undefined;
        this.heading7 = undefined;
        this.heading8 = undefined;
        this.heading9 = undefined;
        this.normal = undefined;
        this.textBoxInput = undefined;
        this.documentHelper = undefined;
        if (!isNullOrUndefined(this.target)) {
            if (this.target.parentElement) {
                this.target.parentElement.removeChild(this.target);
            }
            for (var count = 0; count < this.target.childNodes.length; count++) {
                this.target.removeChild(this.target.childNodes[count]);
                count--;
            }
            this.target = undefined;
        }
    };
    return TableOfContentsDialog;
}());
export { TableOfContentsDialog };
