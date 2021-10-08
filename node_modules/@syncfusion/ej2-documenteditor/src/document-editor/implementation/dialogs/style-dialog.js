import { createElement, isNullOrUndefined, L10n } from '@syncfusion/ej2-base';
import { DropDownList, ComboBox } from '@syncfusion/ej2-dropdowns';
import { Button } from '@syncfusion/ej2-buttons';
import { WCharacterStyle, WParagraphStyle } from '../../implementation/format/style';
import { BulletsAndNumberingDialog } from './index';
import { Query } from '@syncfusion/ej2-data';
import { WAbstractList } from '../list/abstract-list';
import { ColorPicker } from '@syncfusion/ej2-inputs';
import { DropDownButton } from '@syncfusion/ej2-splitbuttons';
/**
 * The Style dialog is used to create or modify styles.
 */
var StyleDialog = /** @class */ (function () {
    /**
     * @param {DocumentHelper} documentHelper - Specifies the document helper.
     * @private
     */
    function StyleDialog(documentHelper) {
        var _this = this;
        this.target = undefined;
        this.styleType = undefined;
        this.styleBasedOn = undefined;
        this.styleParagraph = undefined;
        this.onlyThisDocument = undefined;
        this.template = undefined;
        this.fontFamily = undefined;
        this.fontSize = undefined;
        this.characterFormat = undefined;
        this.paragraphFormat = undefined;
        /**
         *
         * @param {DropDownButtonMenuEventArgs} args - Specifies the event args.
         * @returns {void}
         */
        this.openDialog = function (args) {
            switch (args.item.id) {
                case 'style_font':
                    _this.showFontDialog();
                    break;
                case 'style_paragraph':
                    _this.showParagraphDialog();
                    break;
                case 'style_numbering':
                    _this.showNumberingBulletDialog();
                    break;
            }
        };
        /**
         * @private
         * @returns {void}
         */
        this.setBoldProperty = function () {
            _this.characterFormat.bold = !_this.characterFormat.bold;
            _this.fontButtonClicked();
        };
        /**
         * @private
         * @returns {void}
         */
        this.setItalicProperty = function () {
            _this.characterFormat.italic = !_this.characterFormat.italic;
            _this.fontButtonClicked();
        };
        /**
         * @private
         * @returns {void}
         */
        this.setUnderlineProperty = function () {
            _this.characterFormat.underline = _this.characterFormat.underline === 'None' ? 'Single' : 'None';
            _this.fontButtonClicked();
        };
        /**
         * @private
         * @returns {void}
         */
        this.fontButtonClicked = function () {
            if (_this.characterFormat.bold) {
                if (!_this.bold.classList.contains('e-active')) {
                    _this.bold.classList.add('e-active');
                }
            }
            else {
                if (_this.bold.classList.contains('e-active')) {
                    _this.bold.classList.remove('e-active');
                }
            }
            if (_this.characterFormat.italic) {
                if (!_this.italic.classList.contains('e-active')) {
                    _this.italic.classList.add('e-active');
                }
            }
            else {
                if (_this.italic.classList.contains('e-active')) {
                    _this.italic.classList.remove('e-active');
                }
            }
            if (_this.characterFormat.underline !== undefined && _this.characterFormat.underline !== 'None') {
                if (!_this.underline.classList.contains('e-active')) {
                    _this.underline.classList.add('e-active');
                    _this.characterFormat.underline = 'Single';
                }
            }
            else {
                if (_this.underline.classList.contains('e-active')) {
                    _this.underline.classList.remove('e-active');
                    _this.characterFormat.underline = 'None';
                }
            }
        };
        /**
         * @private
         * @param {ChangeEventArgs} args - Specifies the event args.
         * @returns {void}
         */
        this.fontSizeUpdate = function (args) {
            _this.characterFormat.fontSize = args.value;
        };
        /**
         * @private
         * @param {ChangeEventArgs} args - Specifies the event args.
         * @returns {void}
         */
        this.fontFamilyChanged = function (args) {
            _this.characterFormat.fontFamily = args.value.toString();
        };
        /**
         * @private
         * @param {ColorPickerEventArgs} args - Specifies the event args.
         * @returns {void}
         */
        this.fontColorUpdate = function (args) {
            _this.characterFormat.fontColor = args.currentValue.hex;
        };
        /**
         * @private
         * @returns {void}
         */
        this.setLeftAlignment = function () {
            if (_this.paragraphFormat.textAlignment === 'Left') {
                _this.paragraphFormat.textAlignment = 'Justify';
            }
            else {
                _this.paragraphFormat.textAlignment = 'Left';
            }
            _this.updateParagraphFormat();
        };
        /**
         * @private
         * @returns {void}
         */
        this.setRightAlignment = function () {
            if (_this.paragraphFormat.textAlignment === 'Right') {
                _this.paragraphFormat.textAlignment = 'Left';
            }
            else {
                _this.paragraphFormat.textAlignment = 'Right';
            }
            _this.updateParagraphFormat();
        };
        /**
         * @private
         * @returns {void}
         */
        this.setCenterAlignment = function () {
            if (_this.paragraphFormat.textAlignment === 'Center') {
                _this.paragraphFormat.textAlignment = 'Left';
            }
            else {
                _this.paragraphFormat.textAlignment = 'Center';
            }
            _this.updateParagraphFormat();
        };
        /**
         * @private
         * @returns {void}
         */
        this.setJustifyAlignment = function () {
            if (_this.paragraphFormat.textAlignment === 'Justify') {
                _this.paragraphFormat.textAlignment = 'Left';
            }
            else {
                _this.paragraphFormat.textAlignment = 'Justify';
            }
            _this.updateParagraphFormat();
        };
        /**
         * @private
         * @returns {void}
         */
        this.increaseBeforeAfterSpacing = function () {
            _this.paragraphFormat.beforeSpacing += 6;
            _this.paragraphFormat.afterSpacing += 6;
        };
        /**
         * @private
         * @returns {void}
         */
        this.decreaseBeforeAfterSpacing = function () {
            if (_this.paragraphFormat.beforeSpacing >= 6) {
                _this.paragraphFormat.beforeSpacing -= 6;
            }
            else {
                _this.paragraphFormat.beforeSpacing = 0;
            }
            if (_this.paragraphFormat.afterSpacing >= 6) {
                _this.paragraphFormat.afterSpacing -= 6;
            }
            else {
                _this.paragraphFormat.afterSpacing = 0;
            }
        };
        /**
         * @private
         * @returns {void}
         */
        this.updateNextStyle = function (args) {
            var typedName = args.srcElement.value;
            if (_this.getTypeValue() === _this.localObj.getConstant('Paragraph') && !isNullOrUndefined(typedName) && typedName !== '' && !_this.isUserNextParaUpdated) {
                var styles = _this.documentHelper.styles.getStyleNames(_this.getTypeValue());
                if (_this.isEdit) {
                    styles = styles.filter(function (e) { return e !== _this.editStyleName; });
                }
                styles.push(typedName);
                _this.styleParagraph.dataSource = styles;
                _this.styleParagraph.index = null;
                _this.styleParagraph.index = styles.indexOf(typedName);
                _this.styleParagraph.dataBind();
            }
        };
        /**
         * @private
         * @returns {void}
         */
        this.updateOkButton = function () {
            var styleName = _this.target.getElementsByClassName('e-input e-de-style-dlg-name-input').item(0).value;
            _this.enableOrDisableOkButton();
        };
        /**
         * @private
         * @param {ChangeEventArgs} args - Specifies the event args.
         * @returns {void}
         */
        this.styleTypeChange = function (args) {
            if (args.isInteracted) {
                var type = void 0;
                if (args.value === _this.localObj.getConstant('Character')) {
                    _this.style = new WCharacterStyle();
                    type = 'Character';
                }
                if (args.value === _this.localObj.getConstant('Paragraph') || args.value === _this.localObj.getConstant('Linked Style')) {
                    _this.style = new WParagraphStyle();
                    type = 'Paragraph';
                }
                _this.toggleDisable();
                _this.updateStyleNames(type);
            }
        };
        /**
         * @returns {void}
         */
        this.styleBasedOnChange = function () {
            //Based on change
        };
        /**
         * @private
         * @param {SelectEventArgs} args - Specifies the event args.
         * @returns {void}
         */
        this.styleParagraphChange = function (args) {
            if (args.isInteracted) {
                _this.isUserNextParaUpdated = true;
            }
            //Next change
        };
        /**
         * @private
         * @returns {void}
         */
        this.showFontDialog = function () {
            if (!isNullOrUndefined(_this.documentHelper.owner.fontDialogModule)) {
                _this.documentHelper.owner.showFontDialog(_this.characterFormat);
            }
            _this.updateCharacterFormat();
        };
        /**
         * @private
         * @returns {void}
         */
        this.showParagraphDialog = function () {
            if (!isNullOrUndefined(_this.documentHelper.owner.paragraphDialogModule)) {
                _this.documentHelper.owner.showParagraphDialog(_this.paragraphFormat);
            }
        };
        /**
         * @private
         * @returns {void}
         */
        this.showNumberingBulletDialog = function () {
            _this.numberingBulletDialog = new BulletsAndNumberingDialog(_this.documentHelper);
            if (_this.style instanceof WParagraphStyle && (!isNullOrUndefined(_this.style.paragraphFormat))) {
                _this.numberingBulletDialog.showNumberBulletDialog(_this.style.paragraphFormat.listFormat, _this.abstractList);
            }
        };
        /**
         * @private
         * @returns {void}
         */
        this.onOkButtonClick = function () {
            var styleName = _this.styleNameElement.value;
            if (styleName.length > 0) {
                var style = _this.documentHelper.styles.findByName(styleName);
                var name_1;
                if (!isNullOrUndefined(style)) {
                    _this.style.type = _this.getTypeValue();
                    _this.style.basedOn = _this.documentHelper.styles.findByName(_this.styleBasedOn.value);
                    if (_this.styleType.value === _this.localObj.getConstant('Paragraph') || _this.styleType.value === _this.localObj.getConstant('Linked Style')) {
                        _this.style.next = _this.documentHelper.styles.findByName(_this.styleParagraph.value);
                        _this.style.characterFormat.mergeFormat(style.characterFormat);
                        _this.style.paragraphFormat.mergeFormat(style.paragraphFormat, true);
                        _this.updateList();
                        _this.style.link = (_this.styleType.value === _this.localObj.getConstant('Linked Style')) ? _this.createLinkStyle(styleName, _this.isEdit) : undefined;
                    }
                    //Updating existing style implementation
                    _this.style.name = style.name;
                    name_1 = style.name;
                    style = _this.style;
                    _this.documentHelper.owner.isShiftingEnabled = true;
                    _this.documentHelper.owner.editorModule.layoutWholeDocument();
                    _this.documentHelper.owner.isShiftingEnabled = false;
                }
                else {
                    var tmpStyle = _this.getTypeValue() === 'Paragraph' ? new WParagraphStyle() : new WCharacterStyle;
                    tmpStyle.copyStyle(_this.style);
                    var basedOn = _this.documentHelper.styles.findByName(_this.styleBasedOn.value);
                    if (_this.styleType.value === _this.localObj.getConstant('Paragraph') || _this.styleType.value === _this.localObj.getConstant('Linked Style')) {
                        if (styleName === _this.styleParagraph.value) {
                            tmpStyle.next = tmpStyle;
                        }
                        else {
                            tmpStyle.next = _this.documentHelper.styles.findByName(_this.styleParagraph.value);
                        }
                        _this.updateList();
                    }
                    tmpStyle.link = (_this.styleType.value === _this.localObj.getConstant('Linked Style')) ? _this.createLinkStyle(styleName) : undefined;
                    tmpStyle.type = _this.getTypeValue();
                    tmpStyle.name = styleName;
                    tmpStyle.basedOn = basedOn;
                    _this.documentHelper.styles.push(tmpStyle);
                    name_1 = styleName;
                    _this.documentHelper.owner.editorModule.applyStyle(name_1);
                }
                _this.documentHelper.dialog2.hide();
                _this.documentHelper.updateFocus();
            }
            else {
                throw new Error('Enter valid Style name');
            }
            if (_this.style) {
                //this.style.destroy();
            }
            _this.documentHelper.updateFocus();
        };
        /**
         * @private
         * @returns {void}
         */
        this.loadStyleDialog = function () {
            _this.documentHelper.updateFocus();
            _this.isUserNextParaUpdated = false;
            _this.styleNameElement = _this.target.getElementsByClassName('e-input e-de-style-dlg-name-input').item(0);
            _this.styleNameElement.value = null;
            if (!_this.isEdit) {
                _this.styleType.index = 0; //Set to paragraph            
            }
            var name;
            if (_this.isEdit) {
                _this.styleNameElement.value = _this.editStyleName;
                name = _this.editStyleName;
            }
            _this.okButton = _this.documentHelper.dialog2.element.getElementsByClassName('e-flat e-style-okay').item(0);
            _this.enableOrDisableOkButton();
            _this.updateStyleNames(_this.getTypeValue(), name);
            _this.updateCharacterFormat(_this.style.characterFormat);
            _this.updateParagraphFormat(_this.style.paragraphFormat);
        };
        /**
         * @private
         * @returns {void}
         */
        this.onCancelButtonClick = function () {
            if (!_this.isEdit && _this.style) {
                _this.style.destroy();
            }
            _this.documentHelper.dialog2.hide();
            _this.documentHelper.updateFocus();
        };
        /**
         * @private
         * @returns {void}
         */
        this.closeStyleDialog = function () {
            _this.documentHelper.updateFocus();
        };
        this.documentHelper = documentHelper;
    }
    /**
     * @private
     * @returns {string} Returns module name
     */
    StyleDialog.prototype.getModuleName = function () {
        return 'StyleDialog';
    };
    /**
     * @private
     * @param {L10n} localValue - Specifies the locale value
     * @param {boolean} isRtl - Specifies the is rtl
     * @returns {void}
     */
    /* eslint-disable  */
    StyleDialog.prototype.initStyleDialog = function (localValue, isRtl) {
        var instance = this;
        this.localObj = localValue;
        var id = this.documentHelper.owner.containerId + '_style';
        this.target = createElement('div', { id: id, className: 'e-de-style-dialog' });
        var container = createElement('div');
        var properties = createElement('div', { className: 'e-de-style-properties', innerHTML: localValue.getConstant('Properties') });
        container.appendChild(properties);
        var styleNameTypeDiv = createElement('div', { styles: 'display:flex', className: 'e-de-style-nametype-div' });
        container.appendChild(styleNameTypeDiv);
        var nameWholeDiv = createElement('div', { className: 'e-de-style-left-div' });
        styleNameTypeDiv.appendChild(nameWholeDiv);
        var name = createElement('div', { className: 'e-de-style-name', innerHTML: localValue.getConstant('Name') + ':' });
        nameWholeDiv.appendChild(name);
        var nameValue = createElement('input', { id: this.documentHelper.owner.containerId + '_style_name', styles: 'width:210px;', className: 'e-input e-de-style-dlg-name-input' });
        nameValue.addEventListener('keyup', this.updateOkButton);
        nameValue.addEventListener('input', this.updateOkButton);
        nameValue.addEventListener('blur', this.updateNextStyle);
        nameWholeDiv.appendChild(nameValue);
        var styleTypeWholeDiv = createElement('div');
        styleNameTypeDiv.appendChild(styleTypeWholeDiv);
        var styleType = createElement('div', { className: 'e-de-style-styletype', innerHTML: localValue.getConstant('Style type') + ':' });
        styleTypeWholeDiv.appendChild(styleType);
        var styleTypeDivElement = createElement('div', { className: 'e-de-style-style-type-div' });
        var styleTypeValue = createElement('select', { id: 'e-de-style-style-type' });
        styleTypeValue.innerHTML = '<option value="Paragraph">' + localValue.getConstant('Paragraph') + '</option><option value="Character">' + localValue.getConstant('Character') + '</option><option value="Linked(Paragraph and Character)">' + localValue.getConstant('Linked Style') + '</option>'; //<option>Linked(Paragraph and Character)</option><option>Table</option><option>List</option>';
        styleTypeDivElement.appendChild(styleTypeValue);
        this.styleType = new DropDownList({ change: this.styleTypeChange, popupHeight: '253px', width: '210px', enableRtl: isRtl });
        this.styleType.appendTo(styleTypeValue);
        styleTypeWholeDiv.appendChild(styleTypeDivElement);
        var styleBasedParaDiv = createElement('div', { styles: 'display:flex', className: 'e-de-style-based-para-div' });
        container.appendChild(styleBasedParaDiv);
        var styleBasedOnWholeDiv = createElement('div', { className: 'e-de-style-left-div' });
        styleBasedParaDiv.appendChild(styleBasedOnWholeDiv);
        var styleBasedOn = createElement('div', { className: 'e-de-style-style-based-on', innerHTML: localValue.getConstant('Style based on') + ':' });
        styleBasedOnWholeDiv.appendChild(styleBasedOn);
        var styleBasedOnDivElement = createElement('div', { className: 'e-de-style-style-based-on-div' });
        var styleBasedOnValue = createElement('input', { id: 'e-de-style-style-based-on-value' });
        //styleBasedOnValue.innerHTML = '<option>Normal</option><option>Heading 1</option><option>Heading 2</option><option>Heading 3</option><option>Heading 4</option><option>Heading 5</option><option>Heading 6</option>';
        styleBasedOnDivElement.appendChild(styleBasedOnValue);
        this.styleBasedOn = new DropDownList({ dataSource: [], select: this.styleBasedOnChange, popupHeight: '253px', width: '210px', enableRtl: isRtl });
        this.styleBasedOn.appendTo(styleBasedOnValue);
        styleBasedOnWholeDiv.appendChild(styleBasedOnDivElement);
        var styleParagraphWholeDiv = createElement('div');
        styleBasedParaDiv.appendChild(styleParagraphWholeDiv);
        if (isRtl) {
            nameWholeDiv.classList.add('e-de-rtl');
            styleBasedOnWholeDiv.classList.add('e-de-rtl');
            styleParagraphWholeDiv.classList.add('e-de-rtl');
        }
        var styleParagraph = createElement('div', { className: 'e-de-style-style-paragraph', innerHTML: localValue.getConstant('Style for following paragraph') + ':' });
        styleParagraphWholeDiv.appendChild(styleParagraph);
        var styleParagraphDivElement = createElement('div', { className: 'e-de-style-style-paragraph-div' });
        var styleParagraphValue = createElement('input', { id: 'e-de-style-style-paragraph-value' });
        //styleParagraphValue.innerHTML = '<option>Normal</option><option>Heading 1</option><option>Heading 2</option><option>Heading 3</option><option>Heading 4</option><option>Heading 5</option><option>Heading 6</option>';
        styleParagraphDivElement.appendChild(styleParagraphValue);
        this.styleParagraph = new DropDownList({ dataSource: [], select: this.styleParagraphChange, popupHeight: '253px', width: '210px', enableRtl: isRtl });
        this.styleParagraph.appendTo(styleParagraphValue);
        styleParagraphWholeDiv.appendChild(styleParagraphDivElement);
        var formatting = createElement('div', { className: 'e-de-style-formatting', innerHTML: localValue.getConstant('Formatting') });
        container.appendChild(formatting);
        var optionsDiv = createElement('div', { className: 'e-de-style-options-div' });
        container.appendChild(optionsDiv);
        var fontOptionsDiv = createElement('div', { styles: 'display:flex;margin-bottom: 14px;' });
        optionsDiv.appendChild(fontOptionsDiv);
        this.createFontOptions(fontOptionsDiv, isRtl);
        var paragraphOptionsDiv = createElement('div', { styles: 'display:flex', className: 'e-style-paragraph' });
        optionsDiv.appendChild(paragraphOptionsDiv);
        this.createParagraphOptions(paragraphOptionsDiv);
        // let radioOptionsDiv: HTMLElement = createElement('div', { styles: 'display:flex' });
        // container.appendChild(radioOptionsDiv);
        // let onlyThisDocumentDiv: HTMLElement = createElement('div', { className: 'e-de-style-radio-button' });
        // let onlyThisDocument: HTMLInputElement = createElement('input', { className: 'e-de-style-only-this-doc', attrs: { type: 'radio' } }) as HTMLInputElement;
        // onlyThisDocumentDiv.appendChild(onlyThisDocument);
        // this.onlyThisDocument = new RadioButton({ label: 'Only in this document', value: 'only in this document', checked: true, name: 'styles' });
        // this.onlyThisDocument.appendTo(onlyThisDocument);
        // radioOptionsDiv.appendChild(onlyThisDocumentDiv);
        // let templateDiv: HTMLElement = createElement('div', { className: 'e-de-style-radio-button' });
        // let template: HTMLInputElement = createElement('input', { className: 'e-de-style-temp', attrs: { type: 'radio' } }) as HTMLInputElement;
        // templateDiv.appendChild(template);
        // this.template = new RadioButton({ label: 'Template', value: 'template', name: 'styles' });
        // this.template.appendTo(template);
        // radioOptionsDiv.appendChild(templateDiv);
        this.createFormatDropdown(container, localValue, isRtl);
        this.target.appendChild(container);
    };
    StyleDialog.prototype.createFormatDropdown = function (parentDiv, localValue, isRtl) {
        var _this = this;
        var formatBtn = createElement('button', {
            id: 'style_format_dropdown', innerHTML: localValue.getConstant('Format'),
            attrs: { type: 'button' }
        });
        formatBtn.style.height = '31px';
        parentDiv.appendChild(formatBtn);
        var items = [{ text: localValue.getConstant('Font') + '...', id: 'style_font' },
            { text: localValue.getConstant('Paragraph') + '...', id: 'style_paragraph' },
            { text: localValue.getConstant('Numbering') + '...', id: 'style_numbering' }];
        this.styleDropdwn = new DropDownButton({
            items: items, cssClass: 'e-de-style-format-dropdwn', enableRtl: isRtl,
            beforeItemRender: function (args) {
                if (_this.styleType.value === localValue.getConstant('Character')) {
                    if (args.item.text === localValue.getConstant('Paragraph')) {
                        args.element.classList.add('e-disabled');
                    }
                    if (args.item.text === 'Numbering') {
                        args.element.classList.add('e-disabled');
                    }
                }
                else {
                    if (args.item.text === localValue.getConstant('Paragraph')) {
                        args.element.classList.remove('e-disabled');
                    }
                    if (args.item.text === 'Numbering') {
                        args.element.classList.remove('e-disabled');
                    }
                }
            },
        });
        this.styleDropdwn.appendTo(formatBtn);
        this.styleDropdwn.addEventListener('select', this.openDialog);
    };
    StyleDialog.prototype.createFontOptions = function (parentDiv, isRtl) {
        var _this = this;
        var fontFamilyElement = createElement('input', {
            id: this.target.id + '_fontName',
        });
        var fontStyle;
        var isStringTemplate = true;
        var itemTemplate = '<span style="font-family: ${FontName};">${FontName}</span>';
        parentDiv.appendChild(fontFamilyElement);
        this.fontFamily = new ComboBox({
            dataSource: fontStyle, query: new Query().select(['FontName']), fields: { text: 'FontName', value: 'value' },
            allowCustom: true, width: '123px', popupWidth: '123px',
            cssClass: 'e-style-font-fmaily-right', enableRtl: isRtl, change: this.fontFamilyChanged,
            showClearButton: false, itemTemplate: itemTemplate
        });
        this.fontFamily.appendTo(fontFamilyElement);
        this.fontFamily.isStringTemplate = isStringTemplate;
        var fontFamilyValue = this.documentHelper.owner.documentEditorSettings.fontFamilies;
        for (var i = 0; i < fontFamilyValue.length; i++) {
            var fontValue = fontFamilyValue[i];
            var fontStyleValue = { 'FontName': fontValue, 'value': fontValue };
            this.fontFamily.addItem(fontStyleValue, i);
        }
        this.fontFamily.focus = function () { _this.fontFamily.element.select(); };
        this.fontFamily.element.parentElement.setAttribute('title', this.localObj.getConstant('Font'));
        var fontSizeElement = createElement('input');
        parentDiv.appendChild(fontSizeElement);
        var sizeDataSource = [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72];
        this.fontSize = new ComboBox({
            dataSource: sizeDataSource, width: '73px', cssClass: 'e-style-font-fmaily-right',
            enableRtl: isRtl, change: this.fontSizeUpdate
        });
        this.fontSize.showClearButton = false;
        this.fontSize.appendTo(fontSizeElement);
        var fontGroupButton = createElement('div', { className: 'e-de-style-font-group-button' });
        parentDiv.appendChild(fontGroupButton);
        this.bold = this.createButtonElement(fontGroupButton, 'e-de-bold', 'e-de-style-bold-button-size', this.documentHelper.owner.containerId + '_style_bold');
        this.bold.addEventListener('click', this.setBoldProperty);
        this.italic = this.createButtonElement(fontGroupButton, 'e-de-italic', 'e-de-style-icon-button-size', this.documentHelper.owner.containerId + '_style_italic');
        this.italic.addEventListener('click', this.setItalicProperty);
        this.underline = this.createButtonElement(fontGroupButton, 'e-de-underline', 'e-de-style-icon-button-size', this.documentHelper.owner.containerId + '_style_underline');
        this.underline.addEventListener('click', this.setUnderlineProperty);
        var fontColorElement = createElement('input', { attrs: { type: 'color' }, className: 'e-de-style-icon-button-size' });
        parentDiv.appendChild(fontColorElement);
        this.fontColor = new ColorPicker({ cssClass: 'e-de-style-font-color-picker', enableRtl: isRtl, change: this.fontColorUpdate, locale: this.documentHelper.owner.locale });
        this.fontColor.appendTo(fontColorElement);
    };
    StyleDialog.prototype.createParagraphOptions = function (parentDiv) {
        var _this = this;
        var alignmentDiv = createElement('div', { className: 'e-de-style-paragraph-group-button' });
        parentDiv.appendChild(alignmentDiv);
        this.leftAlign = this.createButtonElement(alignmentDiv, 'e-de-align-left', 'e-de-style-icon-button-size');
        this.leftAlign.addEventListener('click', this.setLeftAlignment);
        this.centerAlign = this.createButtonElement(alignmentDiv, 'e-de-align-center', 'e-de-style-icon-button-size');
        this.centerAlign.addEventListener('click', this.setCenterAlignment);
        this.rightAlign = this.createButtonElement(alignmentDiv, 'e-de-align-right', 'e-de-style-icon-button-size');
        this.rightAlign.addEventListener('click', this.setRightAlignment);
        this.justify = this.createButtonElement(alignmentDiv, 'e-de-justify', 'e-de-style-icon-button-last-size');
        this.justify.addEventListener('click', this.setJustifyAlignment);
        var lineSpacingDiv = createElement('div', { className: 'e-de-style-paragraph-group-button' });
        parentDiv.appendChild(lineSpacingDiv);
        this.singleLineSpacing = this.createButtonElement(lineSpacingDiv, 'e-de-single-spacing', 'e-de-style-icon-button-first-size');
        this.singleLineSpacing.addEventListener('click', function () {
            _this.paragraphFormat.lineSpacing = 1;
            _this.updateParagraphFormat();
        });
        this.onePointFiveLineSpacing = this.createButtonElement(lineSpacingDiv, 'e-de-one-point-five-spacing', 'e-de-style-icon-button-size');
        this.onePointFiveLineSpacing.addEventListener('click', function () {
            _this.paragraphFormat.lineSpacing = 1.5;
            _this.updateParagraphFormat();
        });
        this.doubleLineSpacing = this.createButtonElement(lineSpacingDiv, 'e-de-double-spacing', 'e-de-style-icon-button-last-size');
        this.doubleLineSpacing.addEventListener('click', function () {
            _this.paragraphFormat.lineSpacing = 2;
            _this.updateParagraphFormat();
        });
        var spacingDiv = createElement('div', { className: 'e-de-style-paragraph-group-button' });
        parentDiv.appendChild(spacingDiv);
        var beforeSpacing = this.createButtonElement(spacingDiv, 'e-de-before-spacing', 'e-de-style-icon-button-first-size');
        var afterSpacing = this.createButtonElement(spacingDiv, 'e-de-after-spacing', 'e-de-style-icon-button-last-size');
        beforeSpacing.addEventListener('click', this.increaseBeforeAfterSpacing);
        afterSpacing.addEventListener('click', this.decreaseBeforeAfterSpacing);
        var indentingDiv = createElement('div', { className: 'e-de-style-paragraph-indent-group-button' });
        parentDiv.appendChild(indentingDiv);
        var decreaseIndent = this.createButtonElement(indentingDiv, 'e-de-indent', 'e-de-style-icon-button-first-size');
        decreaseIndent.addEventListener('click', function () {
            if (_this.paragraphFormat.leftIndent >= 36) {
                _this.paragraphFormat.leftIndent -= 36;
            }
            else {
                _this.paragraphFormat.leftIndent = 0;
            }
        });
        var increaseindent = this.createButtonElement(indentingDiv, 'e-de-outdent', 'e-de-style-icon-button-size');
        increaseindent.addEventListener('click', function () {
            _this.paragraphFormat.leftIndent += 36;
        });
    };
    StyleDialog.prototype.createButtonElement = function (parentDiv, iconCss, className, id) {
        var buttonElement = createElement('button', { attrs: { type: 'button' } });
        if (!isNullOrUndefined(id)) {
            buttonElement.id = id;
        }
        parentDiv.appendChild(buttonElement);
        var button = new Button({ iconCss: iconCss, cssClass: className });
        button.appendTo(buttonElement);
        return buttonElement;
    };
    StyleDialog.prototype.toggleDisable = function () {
        if (this.styleType.value === this.localObj.getConstant('Character')) {
            this.styleParagraph.enabled = false;
            this.target.getElementsByClassName('e-style-paragraph').item(0).setAttribute('style', 'display:flex;pointer-events:none;opacity:0.5');
        }
        else {
            this.styleParagraph.enabled = true;
            this.target.getElementsByClassName('e-style-paragraph').item(0).removeAttribute('style');
            this.target.getElementsByClassName('e-style-paragraph').item(0).setAttribute('style', 'display:flex');
        }
        this.styleBasedOn.enabled = true;
    };
    /**
     * @private
     * @param {string} styleName - Specifies the style name.
     * @param {string} header - Specifies the header.
     * @returns {void}
     */
    StyleDialog.prototype.show = function (styleName, header) {
        var localObj = new L10n('documenteditor', this.documentHelper.owner.defaultLocale);
        this.isEdit = (!isNullOrUndefined(styleName) && styleName.length > 0) ? true : false;
        this.editStyleName = styleName;
        this.abstractList = new WAbstractList();
        var style = this.documentHelper.styles.findByName(styleName);
        this.style = !this.isEdit ? new WParagraphStyle() : style ? style : this.getStyle(styleName);
        localObj.setLocale(this.documentHelper.owner.locale);
        if (!this.target) {
            this.initStyleDialog(localObj, this.documentHelper.owner.enableRtl);
        }
        if (isNullOrUndefined(header)) {
            header = localObj.getConstant('Create New Style');
        }
        this.documentHelper.dialog2.header = header;
        this.documentHelper.dialog2.height = 'auto';
        this.documentHelper.dialog2.width = 'auto';
        this.documentHelper.dialog2.content = this.target;
        this.documentHelper.dialog2.buttons = [{
                click: this.onOkButtonClick,
                buttonModel: { content: localObj.getConstant('Ok'), cssClass: 'e-flat e-style-okay', isPrimary: true }
            },
            {
                click: this.onCancelButtonClick,
                buttonModel: { content: localObj.getConstant('Cancel'), cssClass: 'e-flat e-style-cancel' }
            }];
        this.toggleDisable();
        this.documentHelper.dialog2.dataBind();
        this.documentHelper.dialog2.beforeOpen = this.loadStyleDialog;
        this.documentHelper.dialog2.close = this.closeStyleDialog;
        this.documentHelper.dialog2.position = { X: 'center', Y: 'center' };
        this.documentHelper.dialog2.show();
    };
    StyleDialog.prototype.updateList = function () {
        var listId = this.style.paragraphFormat.listFormat.listId;
        if (listId > -1) {
            if (this.documentHelper.lists.filter(function (a) { return (a.listId === listId); }).length === 0) {
                this.documentHelper.lists.push(this.style.paragraphFormat.listFormat.list);
            }
            else {
                this.documentHelper.lists = this.documentHelper.lists.filter(function (a) { return (a.listId !== listId); });
                this.documentHelper.lists.push(this.style.paragraphFormat.listFormat.list);
            }
        }
        if (this.abstractList.abstractListId !== -1) {
            this.documentHelper.abstractLists.push(this.abstractList);
        }
    };
    StyleDialog.prototype.createLinkStyle = function (name, isEdit) {
        var charStyle;
        if (isEdit) {
            charStyle = this.documentHelper.styles.findByName((name + ' Char'), 'Character');
        }
        else {
            charStyle = new WCharacterStyle();
        }
        charStyle.type = 'Character';
        charStyle.name = name + ' Char';
        charStyle.characterFormat = this.style.characterFormat.cloneFormat();
        charStyle.basedOn = this.style.basedOn;
        if (!isEdit) {
            this.documentHelper.styles.push(charStyle);
        }
        return this.documentHelper.styles.findByName(charStyle.name, 'Character');
    };
    /**
     * @private
     * @param {L10n} characterFormat - Specifies the character format
     * @returns {void}
     */
    StyleDialog.prototype.updateCharacterFormat = function (characterFormat) {
        if (!isNullOrUndefined(characterFormat)) {
            this.characterFormat = characterFormat;
        }
        this.fontFamily.value = this.characterFormat.fontFamily;
        this.fontSize.value = this.characterFormat.fontSize;
        var color = this.characterFormat.fontColor;
        this.fontColor.value = color === '#00000000' ? '#000000' : color;
        this.fontButtonClicked();
    };
    /**
     * @private
     * @returns {void}
     */
    StyleDialog.prototype.updateParagraphFormat = function (paragraphFOrmat) {
        if (!isNullOrUndefined(paragraphFOrmat)) {
            this.paragraphFormat = paragraphFOrmat;
        }
        if (this.paragraphFormat.textAlignment === 'Left') {
            if (!this.leftAlign.classList.contains('e-active')) {
                this.leftAlign.classList.add('e-active');
            }
            if (this.rightAlign.classList.contains('e-active')) {
                this.rightAlign.classList.remove('e-active');
            }
            if (this.centerAlign.classList.contains('e-active')) {
                this.centerAlign.classList.remove('e-active');
            }
            if (this.justify.classList.contains('e-active')) {
                this.justify.classList.remove('e-active');
            }
        }
        else if (this.paragraphFormat.textAlignment === 'Right') {
            if (this.leftAlign.classList.contains('e-active')) {
                this.leftAlign.classList.remove('e-active');
            }
            if (!this.rightAlign.classList.contains('e-active')) {
                this.rightAlign.classList.add('e-active');
            }
            if (this.centerAlign.classList.contains('e-active')) {
                this.centerAlign.classList.remove('e-active');
            }
            if (this.justify.classList.contains('e-active')) {
                this.justify.classList.remove('e-active');
            }
        }
        else if (this.paragraphFormat.textAlignment === 'Center') {
            if (this.leftAlign.classList.contains('e-active')) {
                this.leftAlign.classList.remove('e-active');
            }
            if (this.rightAlign.classList.contains('e-active')) {
                this.rightAlign.classList.remove('e-active');
            }
            if (!this.centerAlign.classList.contains('e-active')) {
                this.centerAlign.classList.add('e-active');
            }
            if (this.justify.classList.contains('e-active')) {
                this.justify.classList.remove('e-active');
            }
        }
        else if (this.paragraphFormat.textAlignment === 'Justify') {
            if (this.leftAlign.classList.contains('e-active')) {
                this.leftAlign.classList.remove('e-active');
            }
            if (this.rightAlign.classList.contains('e-active')) {
                this.rightAlign.classList.remove('e-active');
            }
            if (this.centerAlign.classList.contains('e-active')) {
                this.centerAlign.classList.remove('e-active');
            }
            if (!this.justify.classList.contains('e-active')) {
                this.justify.classList.add('e-active');
            }
        }
        if (this.paragraphFormat.lineSpacing === 1) {
            this.singleLineSpacing.classList.add('e-active');
            this.onePointFiveLineSpacing.classList.remove('e-active');
            this.doubleLineSpacing.classList.remove('e-active');
        }
        else if (this.paragraphFormat.lineSpacing === 1.5) {
            this.singleLineSpacing.classList.remove('e-active');
            this.onePointFiveLineSpacing.classList.add('e-active');
            this.doubleLineSpacing.classList.remove('e-active');
        }
        else if (this.paragraphFormat.lineSpacing === 2) {
            this.singleLineSpacing.classList.remove('e-active');
            this.onePointFiveLineSpacing.classList.remove('e-active');
            this.doubleLineSpacing.classList.add('e-active');
        }
        else {
            this.singleLineSpacing.classList.remove('e-active');
            this.onePointFiveLineSpacing.classList.remove('e-active');
            this.doubleLineSpacing.classList.remove('e-active');
        }
    };
    StyleDialog.prototype.enableOrDisableOkButton = function () {
        if (!isNullOrUndefined(this.okButton)) {
            this.okButton.disabled = (this.styleNameElement.value === '');
        }
    };
    StyleDialog.prototype.getTypeValue = function () {
        var type;
        if (this.styleType.value === this.localObj.getConstant('Linked Style') || this.styleType.value === this.localObj.getConstant('Paragraph')) {
            return 'Paragraph';
        }
        else {
            return 'Character';
        }
    };
    StyleDialog.prototype.updateStyleNames = function (type, name) {
        var styles = this.documentHelper.styles.getStyleNames(type);
        this.styleParagraph.dataSource = styles;
        this.styleParagraph.index = null;
        if (name) {
            this.styleBasedOn.dataSource = styles.filter(function (e) { return e !== name; });
            this.styleBasedOn.index = null;
            var style = this.getStyle(name);
            if (style.basedOn instanceof String || isNullOrUndefined(style.basedOn)) {
                this.styleBasedOn.enabled = false;
            }
            else {
                this.styleBasedOn.index = styles.indexOf(style.basedOn.name) > -1 ? styles.indexOf(style.basedOn.name) : 0;
            }
            if (style.type === 'Paragraph') {
                if (!isNullOrUndefined(style.link)) {
                    this.styleType.index = 2;
                }
                else {
                    this.styleType.index = 0;
                }
            }
            else {
                this.styleType.index = 1;
            }
            if (!isNullOrUndefined(style.next)) {
                var nxtName = style.next.name;
                var index = 0;
                if (styles.indexOf(nxtName) > -1) {
                    index = styles.indexOf(nxtName);
                }
                this.styleParagraph.index = index;
                this.isUserNextParaUpdated = (nxtName === name) ? false : true;
            }
        }
        else {
            this.styleBasedOn.dataSource = styles;
            this.styleBasedOn.index = null;
            var basedOnIndex = 0;
            if (this.documentHelper.owner.selectionModule) {
                var styleName = void 0;
                if (type === 'Character') {
                    styleName = this.documentHelper.owner.selection.characterFormat.styleName;
                }
                else {
                    styleName = this.documentHelper.owner.selection.paragraphFormat.styleName;
                }
                basedOnIndex = styles.indexOf(styleName);
            }
            this.styleBasedOn.index = basedOnIndex;
            this.styleParagraph.index = 0;
        }
        if (this.isEdit) {
            this.styleType.enabled = false;
        }
        else {
            this.styleType.enabled = true;
        }
        this.styleBasedOn.dataBind();
        this.styleParagraph.dataBind();
    };
    StyleDialog.prototype.getStyle = function (styleName) {
        if (isNullOrUndefined(this.documentHelper.styles.findByName(styleName))) {
            this.documentHelper.owner.editor.createStyle(this.documentHelper.preDefinedStyles.get(styleName));
        }
        return this.documentHelper.styles.findByName(styleName);
    };
    /**
     * @private
     * @returns {void}
     */
    StyleDialog.prototype.destroy = function () {
        this.documentHelper = undefined;
        if (!isNullOrUndefined(this.target)) {
            if (this.target.parentElement) {
                this.target.parentElement.removeChild(this.target);
            }
            for (var n = 0; n < this.target.childNodes.length; n++) {
                this.target.removeChild(this.target.childNodes[n]);
                n--;
            }
            this.target = undefined;
        }
        if (this.fontColor) {
            this.fontColor.destroy();
            this.fontColor = undefined;
        }
        if (this.fontSize) {
            this.fontSize.destroy();
            this.fontSize = undefined;
        }
        if (this.fontFamily) {
            this.fontFamily.destroy();
            this.fontFamily = undefined;
        }
        if (this.styleType) {
            this.styleType.destroy();
            this.styleType = undefined;
        }
        if (this.styleBasedOn) {
            this.styleBasedOn.destroy();
            this.styleBasedOn = undefined;
        }
        if (this.styleParagraph) {
            this.styleParagraph.destroy();
            this.styleParagraph = undefined;
        }
        if (this.onlyThisDocument) {
            this.onlyThisDocument.destroy();
        }
        this.onlyThisDocument = undefined;
        if (this.template) {
            this.template.destroy();
            this.template = undefined;
        }
        if (this.style) {
            this.style = undefined;
        }
        if (this.abstractList) {
            this.abstractList = undefined;
        }
        if (this.numberingBulletDialog) {
            this.numberingBulletDialog.destroy();
            this.numberingBulletDialog = undefined;
        }
        if (this.styleDropdwn) {
            this.styleDropdwn.destroy();
            this.styleDropdwn = undefined;
        }
    };
    return StyleDialog;
}());
export { StyleDialog };
