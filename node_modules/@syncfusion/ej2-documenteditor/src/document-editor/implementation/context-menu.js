import { ContextMenu as Menu } from '@syncfusion/ej2-navigations';
import { isNullOrUndefined, L10n, classList, Browser } from '@syncfusion/ej2-base';
import { FieldElementBox, TextFormField, CheckBoxFormField, DropDownFormField } from './viewer/page';
var CONTEXTMENU_LOCK = '_contextmenu_lock';
var CONTEXTMENU_UNLOCK = '_contextmenu_unlock';
var CONTEXTMENU_COPY = '_contextmenu_copy';
var CONTEXTMENU_CUT = '_contextmenu_cut';
var CONTEXTMENU_PASTE = '_contextmenu_paste';
var CONTEXTMENU_ADD_COMMENT = '_add_comment';
var CONTEXTMENU_UPDATE_FIELD = '_contextmenu_update_field';
var CONTEXTMENU_EDIT_FIELD = '_contextmenu_edit_field';
var CONTEXTMENU_HYPERLINK = '_contextmenu_hyperlink';
var CONTEXTMENU_OPEN_HYPERLINK = '_contextmenu_open_hyperlink';
var CONTEXTMENU_COPY_HYPERLINK = '_contextmenu_copy_hyperlink';
var CONTEXTMENU_REMOVE_HYPERLINK = '_contextmenu_remove_hyperlink';
var CONTEXTMENU_PROPERTIES = '_properties';
var CONTEXTMENU_EDIT_HYPERLINK = '_contextmenu_edit_hyperlink';
var CONTEXTMENU_FONT_DIALOG = '_contextmenu_font_dialog';
var CONTEXTMENU_PARAGRAPH = '_contextmenu_paragraph_dialog';
var CONTEXTMENU_TABLE = '_contextmenu_table_dialog';
var CONTEXTMENU_INSERT_TABLE = '_contextmenu_insert_table';
var CONTEXTMENU_DELETE_TABLE = '_contextmenu_delete_table';
var CONTEXTMENU_INSERT_ABOVE = '_contextmenu_insert_above';
var CONTEXTMENU_INSERT_BELOW = '_contextmenu_insert_below';
var CONTEXTMENU_INSERT_RIGHT = '_contextmenu_insert_right';
var CONTEXTMENU_INSERT_LEFT = '_contextmenu_insert_left';
var CONTEXTMENU_COMPLETE_DELETE_TABLE = '_contextmenu_complete_table_delete';
var CONTEXTMENU_DELETE_ROW = '_contextmenu_delete_row';
var CONTEXTMENU_DELETE_COLUMN = '_contextmenu_delete_column';
var CONTEXTMENU_MERGE_CELL = '_contextmenu_merge_cell';
var CONTEXTMENU_AUTO_FIT = '_contextmenu_auto_fit';
var CONTEXTMENU_AUTO_FIT_TO_CONTENTS = '_contextmenu_auto_fit_contents';
var CONTEXTMENU_AUTO_FIT_TO_WINDOW = '_contextmenu_auto_fit_window';
var CONTEXTMENU_FIXED_COLUMN_WIDTH = '_contextmenu_fixed_column_width';
var CONTEXTMENU_CONTINUE_NUMBERING = '_contextmenu_continue_numbering';
var CONTEXTMENU_RESTART_AT = '_contextmenu_restart_at';
var CONTEXTMENU_SPELLING_DIALOG = '_contextmenu_spelling_dialog';
var CONTEXTMENU_SPELLCHECK_OTHERSUGGESTIONS = '_contextmenu_otherSuggestions_spellcheck_';
var CONTEXTMENU_NO_SUGGESTION = '_contextmenu_no_suggestion';
var CONTEXTMENU_ACCEPT_CHANGES = '_contextmenu_accept_changes';
var CONTEXTMENU_REJECT_CHANGES = '_contextmenu_reject_changes';
var CONTEXTMENU_NOTE_OPTIONS = '_contextmenu_note_options';
/**
 * Context Menu class
 */
var ContextMenu = /** @class */ (function () {
    /**
     * @param {DocumentHelper} documentHelper - Specifies the document helper.
     * @private
     */
    function ContextMenu(documentHelper) {
        var _this = this;
        /**
         * @private
         */
        this.contextMenuInstance = undefined;
        /**
         * @private
         */
        this.menuItems = [];
        /**
         * @private
         */
        this.customMenuItems = [];
        /**
         * @private
         */
        this.ids = [];
        this.spellContextItems = [];
        this.customItems = [];
        /**
         * Handles on context menu key pressed.
         * @param  {MouseEvent} event
         * @private
         */
        this.onContextMenuInternal = function (event) {
            var isTouch = !(event instanceof MouseEvent);
            if (_this.documentHelper.owner.isSpellCheck && _this.spellChecker.allowSpellCheckAndSuggestion) {
                event.preventDefault();
                _this.currentContextInfo = _this.spellChecker.findCurretText();
                var splittedSuggestion_1;
                /* eslint-disable @typescript-eslint/no-explicit-any */
                var allSuggestions_1;
                var exactData_1 = _this.spellChecker.manageSpecialCharacters(_this.currentContextInfo.text, undefined, true);
                if (!isNullOrUndefined(exactData_1) && _this.spellChecker.errorWordCollection.containsKey(exactData_1)) {
                    _this.spellChecker.currentContextInfo = _this.currentContextInfo;
                    if (_this.spellChecker.errorSuggestions.containsKey(exactData_1)) {
                        allSuggestions_1 = _this.spellChecker.errorSuggestions.get(exactData_1).slice();
                        splittedSuggestion_1 = _this.spellChecker.handleSuggestions(allSuggestions_1);
                        _this.processSuggestions(allSuggestions_1, splittedSuggestion_1, isTouch ? event : event);
                    }
                    else {
                        if (_this.spellChecker.enableOptimizedSpellCheck) {
                            _this.spellChecker.callSpellChecker(_this.spellChecker.languageID, exactData_1, false, true, false, false).then(function (data) {
                                /* eslint-disable @typescript-eslint/no-explicit-any */
                                var jsonObject = JSON.parse(data);
                                allSuggestions_1 = jsonObject.Suggestions;
                                if (!isNullOrUndefined(allSuggestions_1)) {
                                    _this.spellChecker.errorSuggestions.add(exactData_1, allSuggestions_1.slice());
                                    splittedSuggestion_1 = _this.spellChecker.handleSuggestions(allSuggestions_1);
                                }
                                _this.processSuggestions(allSuggestions_1, splittedSuggestion_1, isTouch ? event : event);
                            });
                        }
                        else {
                            _this.processSuggestions(allSuggestions_1, splittedSuggestion_1, isTouch ? event : event);
                        }
                    }
                }
                else {
                    _this.hideSpellContextItems();
                    _this.showContextMenuOnSel(isTouch ? event : event);
                }
            }
            else {
                _this.hideSpellContextItems();
                _this.showContextMenuOnSel(isTouch ? event : event);
            }
        };
        this.documentHelper = documentHelper;
        this.locale = new L10n('documenteditor', this.documentHelper.owner.defaultLocale);
        this.locale.setLocale(this.documentHelper.owner.locale);
        this.initContextMenu(this.locale, this.documentHelper.owner.enableRtl);
    }
    Object.defineProperty(ContextMenu.prototype, "viewer", {
        get: function () {
            return this.documentHelper.owner.viewer;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ContextMenu.prototype, "spellChecker", {
        get: function () {
            return this.documentHelper.owner.spellChecker;
        },
        enumerable: true,
        configurable: true
    });
    ContextMenu.prototype.getModuleName = function () {
        return 'ContextMenu';
    };
    /**
     * Initialize context menu.
     *
     * @param localValue Localize value.
     * @private
     */
    /* eslint-disable  */
    ContextMenu.prototype.initContextMenu = function (localValue, isRtl) {
        var _this = this;
        var id = this.documentHelper.owner.element.id;
        this.contextMenu = document.createElement('div');
        this.contextMenu.id = this.documentHelper.owner.containerId + 'e-de-contextmenu';
        document.body.appendChild(this.contextMenu);
        var ul = document.createElement('ul');
        ul.style.width = 'auto';
        ul.id = this.documentHelper.owner.containerId + 'e-de-contextmenu-list';
        ul.style.listStyle = 'none';
        ul.style.margin = '0px';
        ul.style.maxHeight = 'auto';
        ul.oncontextmenu = this.disableBrowserContextmenu;
        this.contextMenu.appendChild(ul);
        this.menuItems = [
            {
                text: localValue.getConstant('Lock'),
                iconCss: 'e-icons e-de-ctnr-lock',
                id: id + CONTEXTMENU_LOCK
            },
            {
                text: localValue.getConstant('Unlock'),
                iconCss: 'e-icons',
                id: id + CONTEXTMENU_UNLOCK
            },
            {
                text: localValue.getConstant('Cut'),
                iconCss: 'e-icons e-de-cut',
                id: id + CONTEXTMENU_CUT
            },
            {
                text: localValue.getConstant('Copy'),
                iconCss: 'e-icons e-de-copy',
                id: id + CONTEXTMENU_COPY
            },
            {
                text: localValue.getConstant('Paste'),
                iconCss: 'e-icons e-de-paste',
                id: id + CONTEXTMENU_PASTE
            },
            {
                separator: true
            },
            {
                text: localValue.getConstant('New Comment'),
                iconCss: 'e-icons e-de-cmt-add',
                id: id + CONTEXTMENU_ADD_COMMENT
            },
            {
                separator: true
            },
            {
                text: localValue.getConstant('Accept Changes'),
                iconCss: 'e-icons e-de-acceptchange',
                id: id + CONTEXTMENU_ACCEPT_CHANGES
            },
            {
                text: localValue.getConstant('Reject Changes'),
                iconCss: 'e-icons e-de-rejectchange',
                id: id + CONTEXTMENU_REJECT_CHANGES
            },
            {
                text: localValue.getConstant('Update Field'),
                iconCss: 'e-icons e-de-update-field',
                id: id + CONTEXTMENU_UPDATE_FIELD
            },
            {
                text: localValue.getConstant('Edit Field') + '...',
                iconCss: 'e-icons e-de-edit_field',
                id: id + CONTEXTMENU_EDIT_FIELD
            },
            {
                text: localValue.getConstant('Continue Numbering'),
                iconCss: 'e-icons e-de-continue-numbering',
                id: id + CONTEXTMENU_CONTINUE_NUMBERING
            },
            {
                text: localValue.getConstant('Restart At') + ' 1',
                iconCss: 'e-icons e-de-restart-at',
                id: id + CONTEXTMENU_RESTART_AT
            },
            {
                separator: true
            },
            {
                text: localValue.getConstant('Hyperlink') + '...',
                iconCss: 'e-icons e-de-insertlink',
                id: id + CONTEXTMENU_HYPERLINK
            },
            {
                text: localValue.getConstant('Edit Hyperlink') + '...',
                iconCss: 'e-icons e-de-edit-hyperlink',
                id: id + CONTEXTMENU_EDIT_HYPERLINK
            },
            {
                text: localValue.getConstant('Open Hyperlink'),
                iconCss: 'e-icons e-de-open-hyperlink',
                id: id + CONTEXTMENU_OPEN_HYPERLINK
            },
            {
                text: localValue.getConstant('Copy Hyperlink'),
                iconCss: 'e-icons e-de-copy-hyperlink',
                id: id + CONTEXTMENU_COPY_HYPERLINK
            },
            {
                text: localValue.getConstant('Remove Hyperlink'),
                iconCss: 'e-icons e-de-remove-hyperlink',
                id: id + CONTEXTMENU_REMOVE_HYPERLINK
            },
            {
                text: localValue.getConstant('Properties'),
                iconCss: 'e-icons e-de-formproperties',
                id: id + CONTEXTMENU_PROPERTIES
            },
            {
                separator: true
            },
            {
                text: localValue.getConstant('Font') + '...',
                iconCss: 'e-icons e-de-fonts',
                id: id + CONTEXTMENU_FONT_DIALOG
            },
            {
                text: localValue.getConstant('Paragraph') + '...',
                iconCss: 'e-icons e-de-paragraph',
                id: id + CONTEXTMENU_PARAGRAPH
            },
            {
                text: localValue.getConstant('Notes Options') + '...',
                id: id + CONTEXTMENU_NOTE_OPTIONS
            },
            {
                separator: true
            },
            {
                text: localValue.getConstant('Table Properties') + '...',
                id: id + CONTEXTMENU_TABLE,
                iconCss: 'e-icons e-de-table'
            },
            {
                text: localValue.getConstant('Merge Cells'),
                id: id + CONTEXTMENU_MERGE_CELL,
                iconCss: 'e-icons e-de-ctnr-mergecell'
            },
            {
                text: localValue.getConstant('AutoFit'),
                id: id + CONTEXTMENU_AUTO_FIT,
                iconCss: 'e-icons',
                items: [
                    {
                        text: localValue.getConstant('AutoFit to Contents'),
                        id: id + CONTEXTMENU_AUTO_FIT_TO_CONTENTS,
                        iconCss: 'e-icons e-de-icon-autofit e-de-autofit-contents'
                    },
                    {
                        text: localValue.getConstant('AutoFit to Window'),
                        id: id + CONTEXTMENU_AUTO_FIT_TO_WINDOW,
                        iconCss: 'e-icons e-de-icon-auto-fitwindow e-de-autofit-window'
                    },
                    {
                        text: localValue.getConstant('Fixed Column Width'),
                        id: id + CONTEXTMENU_FIXED_COLUMN_WIDTH,
                        iconCss: 'e-icons e-de-icon-fixed-columnwidth e-de-fixed-column'
                    }
                ]
            },
            {
                text: localValue.getConstant('Insert'),
                id: id + CONTEXTMENU_INSERT_TABLE,
                iconCss: 'e-icons',
                items: [
                    {
                        text: localValue.getConstant('Insert Above'),
                        id: id + CONTEXTMENU_INSERT_ABOVE,
                        iconCss: 'e-icons e-de-insertabove'
                    },
                    {
                        text: localValue.getConstant('Insert Below'),
                        id: id + CONTEXTMENU_INSERT_BELOW,
                        iconCss: 'e-icons e-de-insertbelow'
                    },
                    {
                        text: localValue.getConstant('Insert Left'),
                        id: id + CONTEXTMENU_INSERT_LEFT,
                        iconCss: 'e-icons e-de-insertleft'
                    },
                    {
                        text: localValue.getConstant('Insert Right'),
                        id: id + CONTEXTMENU_INSERT_RIGHT,
                        iconCss: 'e-icons e-de-insertright'
                    }
                ]
            },
            {
                text: localValue.getConstant('Delete'),
                id: id + CONTEXTMENU_DELETE_TABLE,
                iconCss: 'e-icons',
                items: [
                    {
                        text: localValue.getConstant('Delete Table'),
                        id: id + CONTEXTMENU_COMPLETE_DELETE_TABLE,
                        iconCss: 'e-icons e-de-delete-table'
                    },
                    {
                        text: localValue.getConstant('Delete Row'),
                        id: id + CONTEXTMENU_DELETE_ROW,
                        iconCss: 'e-icons e-de-deleterow'
                    },
                    {
                        text: localValue.getConstant('Delete Column'),
                        id: id + CONTEXTMENU_DELETE_COLUMN,
                        iconCss: 'e-icons e-de-deletecolumn'
                    }
                ]
            },
        ];
        var menuOptions = {
            target: '#' + this.documentHelper.owner.containerId + 'e-de-contextmenu',
            enableRtl: isRtl,
            items: this.addMenuItems(this.menuItems),
            select: function (args) {
                var item = args.element.id;
                _this.handleContextMenuItem(item);
            },
        };
        this.contextMenuInstance = new Menu(menuOptions, '#' + this.documentHelper.owner.containerId + 'e-de-contextmenu-list');
        this.contextMenuInstance.beforeOpen = function () {
            for (var index = 0; index < _this.customMenuItems.length; index++) {
                if (typeof _this.customMenuItems[index].id !== 'undefined') {
                    _this.ids[index] = _this.customMenuItems[index].id;
                }
                else {
                    _this.ids[index] = _this.customMenuItems[index + 1].id;
                }
            }
            _this.documentHelper.owner.fireCustomContextMenuBeforeOpen(_this.ids);
            if (_this.enableCustomContextMenu) {
                for (var index = 0; index < _this.menuItems.length; index++) {
                    if (typeof _this.menuItems[index].id !== 'undefined') {
                        document.getElementById(_this.menuItems[index].id).style.display = 'none';
                    }
                    else {
                        document.getElementById(_this.menuItems[index - 1].id).nextSibling.style.display = 'none';
                    }
                }
            }
            if (_this.viewer && _this.documentHelper.selection) {
                classList(_this.documentHelper.selection.caret, [], ['e-de-cursor-animation']);
                _this.documentHelper.selection.showCaret();
            }
        };
        this.contextMenuInstance.onClose = function () {
            if (_this.viewer && _this.documentHelper.selection) {
                classList(_this.documentHelper.selection.caret, ['e-de-cursor-animation'], []);
                _this.documentHelper.updateFocus();
            }
        };
    };
    /**
     * Disable browser context menu.
     */
    ContextMenu.prototype.disableBrowserContextmenu = function () {
        return false;
    };
    /**
     * Handles context menu items.
     * @param  {string} item Specifies which item is selected.
     * @private
     */
    ContextMenu.prototype.handleContextMenuItem = function (item) {
        var id = this.documentHelper.owner.element.id;
        switch (item) {
            case id + CONTEXTMENU_LOCK:
                if (this.documentHelper.owner.collaborativeEditingModule) {
                    this.documentHelper.owner.collaborativeEditingModule.lockContent(this.documentHelper.owner.currentUser);
                }
                break;
            case id + CONTEXTMENU_UNLOCK:
                if (this.documentHelper.owner.collaborativeEditingModule) {
                    this.documentHelper.owner.collaborativeEditingModule.unlockContent(this.documentHelper.owner.currentUser);
                }
                break;
            case id + CONTEXTMENU_COPY:
                this.documentHelper.selection.copy();
                break;
            case id + CONTEXTMENU_CUT:
                this.documentHelper.owner.editor.cut();
                break;
            case id + CONTEXTMENU_PASTE:
                if (!this.documentHelper.owner.isReadOnlyMode) {
                    this.documentHelper.owner.editorModule.pasteInternal(undefined);
                }
                break;
            case id + CONTEXTMENU_ADD_COMMENT:
                if (!this.documentHelper.owner.isReadOnlyMode) {
                    this.documentHelper.owner.editor.isUserInsert = true;
                    this.documentHelper.owner.editorModule.insertComment();
                    this.documentHelper.owner.editor.isUserInsert = false;
                }
                break;
            case id + CONTEXTMENU_UPDATE_FIELD:
                var isReadOnly = this.documentHelper.owner.isReadOnlyMode;
                if (this.documentHelper.selection.isReferenceField() && (!isReadOnly ||
                    (isReadOnly && this.documentHelper.protectionType === 'FormFieldsOnly'))) {
                    this.documentHelper.selection.updateRefField();
                }
                else if (!this.documentHelper.owner.isReadOnlyMode) {
                    this.documentHelper.owner.editorModule.updateToc();
                }
                break;
            case id + CONTEXTMENU_EDIT_FIELD:
                if (!this.documentHelper.owner.isReadOnlyMode) {
                    this.documentHelper.owner.tableOfContentsDialogModule.show();
                }
                break;
            case id + CONTEXTMENU_FONT_DIALOG:
                if (this.documentHelper.owner.fontDialogModule) {
                    this.documentHelper.owner.fontDialogModule.showFontDialog();
                }
                break;
            case id + CONTEXTMENU_OPEN_HYPERLINK:
                this.documentHelper.selection.navigateHyperlink();
                break;
            case id + CONTEXTMENU_COPY_HYPERLINK:
                this.documentHelper.selection.copyHyperlink();
                break;
            case id + CONTEXTMENU_EDIT_HYPERLINK:
            case id + CONTEXTMENU_HYPERLINK:
                if (this.documentHelper.owner.hyperlinkDialogModule) {
                    this.documentHelper.owner.hyperlinkDialogModule.show();
                }
                break;
            case id + CONTEXTMENU_REMOVE_HYPERLINK:
                this.documentHelper.owner.editor.removeHyperlink();
                break;
            case id + CONTEXTMENU_PARAGRAPH:
                if (this.documentHelper.owner.paragraphDialogModule) {
                    this.documentHelper.owner.paragraphDialogModule.show();
                }
                break;
            case id + CONTEXTMENU_TABLE:
                this.documentHelper.owner.tablePropertiesDialogModule.show();
                break;
            case id + CONTEXTMENU_MERGE_CELL:
                this.documentHelper.owner.editor.mergeCells();
                break;
            case id + CONTEXTMENU_INSERT_ABOVE:
                this.documentHelper.owner.editor.insertRow(true);
                break;
            case id + CONTEXTMENU_INSERT_BELOW:
                this.documentHelper.owner.editor.insertRow(false);
                break;
            case id + CONTEXTMENU_INSERT_LEFT:
                this.documentHelper.owner.editor.insertColumn(true);
                break;
            case id + CONTEXTMENU_INSERT_RIGHT:
                this.documentHelper.owner.editor.insertColumn(false);
                break;
            case id + CONTEXTMENU_COMPLETE_DELETE_TABLE:
                this.documentHelper.owner.editor.deleteTable();
                break;
            case id + CONTEXTMENU_DELETE_ROW:
                this.documentHelper.owner.editor.deleteRow();
                break;
            case id + CONTEXTMENU_DELETE_COLUMN:
                this.documentHelper.owner.editor.deleteColumn();
                break;
            case id + CONTEXTMENU_CONTINUE_NUMBERING:
                this.documentHelper.owner.editorModule.applyContinueNumbering();
                break;
            case id + CONTEXTMENU_RESTART_AT:
                this.documentHelper.owner.editorModule.applyRestartNumbering(this.documentHelper.selection);
                break;
            case id + CONTEXTMENU_AUTO_FIT_TO_CONTENTS:
                this.documentHelper.owner.editor.autoFitTable('FitToContents');
                break;
            case id + CONTEXTMENU_AUTO_FIT_TO_WINDOW:
                this.documentHelper.owner.editor.autoFitTable('FitToWindow');
                break;
            case id + CONTEXTMENU_FIXED_COLUMN_WIDTH:
                this.documentHelper.owner.editor.autoFitTable('FixedColumnWidth');
                break;
            case id + CONTEXTMENU_SPELLING_DIALOG:
                var contextInfo = this.spellChecker.retriveText();
                this.currentContextInfo = null;
                this.documentHelper.owner.spellCheckDialog.show(contextInfo.text, contextInfo.element);
                break;
            case id + CONTEXTMENU_ACCEPT_CHANGES:
                this.documentHelper.selection.handleAcceptReject(true);
                break;
            case id + CONTEXTMENU_REJECT_CHANGES:
                this.documentHelper.selection.handleAcceptReject(false);
                break;
            case id + CONTEXTMENU_PROPERTIES:
                var inline = this.documentHelper.selection.getCurrentFormField();
                if (inline instanceof FieldElementBox) {
                    if (inline.formFieldData instanceof TextFormField) {
                        this.documentHelper.owner.textFormFieldDialogModule.show();
                    }
                    else if (inline.formFieldData instanceof CheckBoxFormField) {
                        this.documentHelper.owner.checkBoxFormFieldDialogModule.show();
                    }
                    else if (inline.formFieldData instanceof DropDownFormField) {
                        this.documentHelper.owner.dropDownFormFieldDialogModule.show();
                    }
                }
                break;
            case id + CONTEXTMENU_NOTE_OPTIONS:
                this.documentHelper.owner.showFootNotesDialog();
                break;
            default:
                var expectedData = this.documentHelper.owner.element.id + CONTEXTMENU_SPELLCHECK_OTHERSUGGESTIONS;
                if (item.substring(0, expectedData.length) === expectedData) {
                    var content = item.substring(item.lastIndexOf('_') + 1);
                    this.callSelectedOption(content);
                    break;
                }
                else {
                    // fires customContextMenuSelect while selecting the added custom menu item
                    this.documentHelper.owner.fireCustomContextMenuSelect(item);
                    break;
                }
        }
    };
    /**
     * Method to call the selected item
     * @param {string} content
     */
    ContextMenu.prototype.callSelectedOption = function (content) {
        if (content === 'Add To Dictionary') {
            this.spellChecker.handleAddToDictionary();
        }
        else if (content === 'Ignore All') {
            this.spellChecker.handleIgnoreAllItems();
        }
        else {
            this.spellChecker.manageReplace(content);
        }
    };
    /**
     * To add and customize custom context menu
     * @param {MenuItemModel[]} items - To add custom menu item
     * @param {boolean} isEnable - To hide existing menu item and show custom menu item alone
     * @param {boolean} isBottom - To show the custom menu item in bottom of the existing item
     * @returns {void}
     */
    ContextMenu.prototype.addCustomMenu = function (items, isEnable, isBottom) {
        var menuItems = JSON.parse(JSON.stringify(items));
        this.destroy();
        if (this.spellContextItems.length === 0) {
            this.customItems = items;
        }
        for (var index = 0; index < menuItems.length; index++) {
            this.customMenuItems.push(menuItems[index]);
            this.customMenuItems[index].id = this.documentHelper.owner.element.id + this.customMenuItems[index].id;
        }
        this.enableCustomContextMenu = isEnable;
        this.enableCustomContextMenuBottom = isBottom;
        this.initContextMenu(this.locale);
    };
    /**
     * Context Menu Items.
     * @param {MenuItemModel[]} menuItems - To add MenuItem to context menu
     * @private
     */
    ContextMenu.prototype.addMenuItems = function (menuItems) {
        if (this.enableCustomContextMenuBottom) {
            return menuItems.concat(this.customMenuItems);
        }
        else {
            return this.customMenuItems.concat(menuItems);
        }
    };
    /**
     * Opens context menu.
     * @param {MouseEvent | TouchEvent} event
     */
    ContextMenu.prototype.showContextMenuOnSel = function (event) {
        var isTouch = !(event instanceof MouseEvent);
        var xPos = 0;
        var yPos = 0;
        if (isTouch) {
            var point = this.documentHelper.getTouchOffsetValue(event);
            xPos = point.x;
            yPos = point.y;
        }
        else {
            yPos = ((Browser.isIE) ? event.clientY : event.y) + document.body.scrollTop + document.documentElement.scrollTop;
            xPos = ((Browser.isIE) ? event.clientX : event.x) + document.body.scrollLeft + document.documentElement.scrollLeft;
        }
        if (this.showHideElements(this.documentHelper.selection)) {
            if (isTouch) {
                this.documentHelper.isMouseDown = false;
            }
            this.contextMenuInstance.open(yPos, xPos);
            event.preventDefault();
        }
    };
    /**
     * Method to hide spell context items
     */
    ContextMenu.prototype.hideSpellContextItems = function () {
        if (this.spellContextItems.length > 0) {
            for (var i = 0; i < this.spellContextItems.length; i++) {
                var item = document.getElementById(this.documentHelper.owner.element.id + this.spellContextItems[i].id);
                if (!isNullOrUndefined(item)) {
                    item.style.display = 'none';
                }
            }
        }
    };
    /**
     * Method to process suggestions to add in context menu
     * @param {any} allSuggestions
     * @param {string[]} splittedSuggestion
     * @param {MouseEvent} event
     * @private
     */
    /* eslint-disable @typescript-eslint/no-explicit-any */
    ContextMenu.prototype.processSuggestions = function (allSuggestions, splittedSuggestion, event) {
        this.spellContextItems = this.constructContextmenu(allSuggestions, splittedSuggestion);
        this.addCustomMenu(this.spellContextItems);
        this.noSuggestion = document.getElementById(this.documentHelper.owner.element.id + CONTEXTMENU_NO_SUGGESTION);
        if (!isNullOrUndefined(this.noSuggestion)) {
            this.noSuggestion.style.display = 'block';
            classList(this.noSuggestion, ['e-disabled'], ['e-focused']);
        }
        this.showContextMenuOnSel(event);
    };
    /**
     * Method to add inline menu
     * @private
     */
    /* eslint-disable @typescript-eslint/no-explicit-any */
    ContextMenu.prototype.constructContextmenu = function (allSuggestion, splittedSuggestion) {
        var contextMenuItems = this.customItems.length > 0 ? this.customItems.slice() : [];
        // classList(this.noSuggestion,['e-disabled'],[]);
        if (isNullOrUndefined(allSuggestion) || allSuggestion.length === 0) {
            contextMenuItems.push({ text: this.locale.getConstant('no suggestions'), id: CONTEXTMENU_NO_SUGGESTION, classList: ['e-focused'], iconCss: '' });
        }
        else {
            for (var i = 0; i < allSuggestion.length; i++) {
                contextMenuItems.push({ text: allSuggestion[i], id: CONTEXTMENU_SPELLCHECK_OTHERSUGGESTIONS + allSuggestion[i], iconCss: '' });
            }
        }
        contextMenuItems.push({ separator: true, id: '_contextmenu_suggestion_separator' });
        if (!isNullOrUndefined(splittedSuggestion) && splittedSuggestion.length > 1) {
            contextMenuItems.push({ text: this.locale.getConstant('More Suggestion'), items: splittedSuggestion });
            contextMenuItems.push({ separator: true, id: '_contextmenu_moreSuggestion_separator' });
        }
        else {
            contextMenuItems.push({ text: this.locale.getConstant('Add to Dictionary'), id: '_contextmenu_otherSuggestions_spellcheck_Add To Dictionary', iconCss: '' });
        }
        contextMenuItems.push({ text: this.locale.getConstant('Ignore Once'), id: '_contextmenu_otherSuggestions_spellcheck_Ignore Once', iconCss: '' });
        contextMenuItems.push({ text: this.locale.getConstant('Ignore All'), id: '_contextmenu_otherSuggestions_spellcheck_Ignore All', iconCss: '' });
        contextMenuItems.push({ separator: true, id: '_contextmenu_change_separator' });
        contextMenuItems.push({ text: this.locale.getConstant('Spelling'), id: CONTEXTMENU_SPELLING_DIALOG, iconCss: 'e-icons e-de-spellcheck', items: [] });
        contextMenuItems.push({ separator: true, id: '_contextmenu_spelling_separator' });
        return contextMenuItems;
    };
    ContextMenu.prototype.showHideElements = function (selection) {
        if (isNullOrUndefined(selection)) {
            return false;
        }
        selection.hideToolTip();
        var owner = this.documentHelper.owner;
        var id = owner.element.id;
        var lock = document.getElementById(id + CONTEXTMENU_LOCK);
        var unlock = document.getElementById(id + CONTEXTMENU_UNLOCK);
        var copy = document.getElementById(id + CONTEXTMENU_COPY);
        var cut = document.getElementById(id + CONTEXTMENU_CUT);
        var paste = document.getElementById(id + CONTEXTMENU_PASTE);
        var updateField = document.getElementById(id + CONTEXTMENU_UPDATE_FIELD);
        var editField = document.getElementById(id + CONTEXTMENU_EDIT_FIELD);
        var font = document.getElementById(id + CONTEXTMENU_FONT_DIALOG);
        var paragraph = document.getElementById(id + CONTEXTMENU_PARAGRAPH);
        var tableProperties = document.getElementById(id + CONTEXTMENU_TABLE);
        var insertTable = document.getElementById(id + CONTEXTMENU_INSERT_TABLE);
        var deleteTable = document.getElementById(id + CONTEXTMENU_DELETE_TABLE);
        var mergeCells = document.getElementById(id + CONTEXTMENU_MERGE_CELL);
        var hyperlink = document.getElementById(id + CONTEXTMENU_HYPERLINK);
        var openHyperlink = document.getElementById(id + CONTEXTMENU_OPEN_HYPERLINK);
        var editHyperlink = document.getElementById(id + CONTEXTMENU_EDIT_HYPERLINK);
        var copyHyperlink = document.getElementById(id + CONTEXTMENU_COPY_HYPERLINK);
        var removeHyperlink = document.getElementById(id + CONTEXTMENU_REMOVE_HYPERLINK);
        var properties = document.getElementById(id + CONTEXTMENU_PROPERTIES);
        var continueNumbering = document.getElementById(id + CONTEXTMENU_CONTINUE_NUMBERING);
        var restartAt = document.getElementById(id + CONTEXTMENU_RESTART_AT);
        var autoFitTable = document.getElementById(id + CONTEXTMENU_AUTO_FIT);
        var addComment = document.getElementById(id + CONTEXTMENU_ADD_COMMENT);
        var editNoteoptions = document.getElementById(id + CONTEXTMENU_NOTE_OPTIONS);
        if (!this.documentHelper.owner.enableLockAndEdit) {
            lock.style.display = 'none';
            unlock.style.display = 'none';
        }
        else {
            if (this.documentHelper.editRanges.containsKey(this.documentHelper.owner.currentUser)) {
                lock.style.display = 'none';
                unlock.style.display = 'block';
                if (this.documentHelper.selection.isSelectionInEditRegion()) {
                    classList(unlock, ['e-blankicon'], ['e-disabled']);
                }
                else {
                    classList(unlock, ['e-disabled', 'e-blankicon'], []);
                }
            }
            else {
                lock.style.display = 'block';
                if (this.documentHelper.owner.collaborativeEditingModule &&
                    this.documentHelper.owner.collaborativeEditingModule.canLock()) {
                    classList(unlock, ['e-disabled'], []);
                }
                else {
                    classList(unlock, [], ['e-disabled']);
                }
                unlock.style.display = 'none';
            }
        }
        var isDialogHidden = false;
        cut.style.display = 'none';
        paste.style.display = 'none';
        paste.nextSibling.style.display = 'none';
        var acceptChange = document.getElementById(id + CONTEXTMENU_ACCEPT_CHANGES);
        var rejectChange = document.getElementById(id + CONTEXTMENU_REJECT_CHANGES);
        hyperlink.style.display = 'none';
        editNoteoptions.style.display = 'none';
        editNoteoptions.nextSibling.style.display = 'none';
        font.previousSibling.style.display = 'none';
        openHyperlink.style.display = 'none';
        copyHyperlink.style.display = 'none';
        editHyperlink.style.display = 'none';
        removeHyperlink.style.display = 'none';
        removeHyperlink.nextSibling.style.display = 'none';
        properties.style.display = 'none';
        mergeCells.style.display = 'none';
        autoFitTable.style.display = 'none';
        font.style.display = 'none';
        paragraph.style.display = 'none';
        // (paragraph.nextSibling as HTMLElement).style.display = 'none';
        insertTable.style.display = 'none';
        deleteTable.style.display = 'none';
        tableProperties.style.display = 'none';
        updateField.style.display = 'none';
        var field = selection.getHyperlinkField();
        var isCrossRefField = false;
        acceptChange.style.display = 'none';
        rejectChange.style.display = 'none';
        if (field instanceof FieldElementBox && selection.isReferenceField(field)) {
            isCrossRefField = true;
        }
        if (field instanceof FieldElementBox && isCrossRefField &&
            (this.documentHelper.protectionType === 'FormFieldsOnly' || !this.documentHelper.owner.isReadOnlyMode)) {
            updateField.style.display = 'block';
        }
        editField.style.display = 'none';
        continueNumbering.style.display = 'none';
        restartAt.style.display = 'none';
        restartAt.nextSibling.style.display = 'none';
        var isSelectionEmpty = selection.isEmpty;
        classList(cut, isSelectionEmpty ? ['e-disabled'] : [], !isSelectionEmpty ? ['e-disabled'] : []);
        classList(copy, isSelectionEmpty ? ['e-disabled'] : [], !isSelectionEmpty ? ['e-disabled'] : []);
        var isHideComment = this.documentHelper.owner.isReadOnlyMode || this.documentHelper.owner.enableHeaderAndFooter || !this.documentHelper.owner.enableComment;
        addComment.style.display = isHideComment ? 'none' : 'block';
        addComment.previousSibling.style.display = isHideComment ? 'none' : 'block';
        addComment.nextSibling.style.display = isHideComment ? 'none' : 'block';
        if (owner.isReadOnlyMode) {
            return true;
        }
        if (this.viewer && this.documentHelper.owner && this.documentHelper.owner.commentReviewPane &&
            this.documentHelper.owner.commentReviewPane.commentPane.isEditMode) {
            classList(addComment, ['e-disabled'], []);
        }
        else {
            classList(addComment, [], ['e-disabled']);
        }
        acceptChange.previousSibling.style.display = 'none';
        cut.style.display = 'block';
        paste.style.display = 'block';
        paste.nextSibling.style.display = 'block';
        classList(insertTable, ['e-blankicon'], []);
        classList(deleteTable, ['e-blankicon'], []);
        classList(editField, ['e-blankicon'], []);
        classList(autoFitTable, ['e-blankicon'], []);
        var enablePaste = (owner.enableLocalPaste && !isNullOrUndefined(owner.editor.copiedData));
        classList(paste, enablePaste ? [] : ['e-disabled'], enablePaste ? ['e-disabled'] : []);
        if (selection.contextType === 'TableOfContents') {
            updateField.style.display = 'block';
            editField.style.display = 'block';
        }
        else {
            var start = selection.start;
            var end = selection.end;
            if (selection.contextType === 'List'
                && owner.selection.getListLevel(start.paragraph).listLevelPattern !== 'Bullet') {
                continueNumbering.style.display = 'block';
                restartAt.style.display = 'block';
                restartAt.nextSibling.style.display = 'block';
            }
            var isCellOrRowSelected = start.paragraph.isInsideTable && (!end.paragraph.isInsideTable
                || start.paragraph.associatedCell !== end.paragraph.associatedCell
                || selection.isCellSelected(start.paragraph.associatedCell, start, end));
            if (isCellOrRowSelected) {
                hyperlink.classList.add('e-disabled');
            }
            else {
                if (hyperlink.classList.contains('e-disabled')) {
                    hyperlink.classList.remove('e-disabled');
                }
            }
            if (field instanceof FieldElementBox && !selection.isImageField() && !isCrossRefField) {
                openHyperlink.style.display = 'block';
                copyHyperlink.style.display = 'block';
                if (owner.hyperlinkDialogModule) {
                    editHyperlink.style.display = 'block';
                }
                removeHyperlink.style.display = 'block';
                removeHyperlink.nextSibling.style.display = 'block';
                isDialogHidden = true;
                properties.style.display = 'none';
            }
            else {
                if (owner.hyperlinkDialogModule) {
                    hyperlink.style.display = 'block';
                    font.previousSibling.style.display = 'block';
                    isDialogHidden = true;
                }
            }
            if (selection.isFormField() && this.documentHelper.owner.enableFormField) {
                hyperlink.style.display = 'none';
                properties.style.display = 'block';
            }
            if (field instanceof FieldElementBox && isCrossRefField) {
                hyperlink.style.display = 'none';
                updateField.style.display = 'block';
            }
        }
        if (this.documentHelper.owner.selection.start.paragraph.isInsideTable
            && this.documentHelper.owner.selection.end.paragraph.isInsideTable) {
            if (owner.tablePropertiesDialogModule) {
                tableProperties.style.display = 'block';
            }
            insertTable.style.display = 'block';
            deleteTable.style.display = 'block';
            if (this.documentHelper.owner.editor.canMergeCells()) {
                mergeCells.style.display = 'block';
            }
            autoFitTable.style.display = this.documentHelper.selection.isTableSelected() ? 'block' : 'none';
        }
        else {
            if (this.documentHelper.owner.fontDialogModule) {
                font.style.display = 'block';
            }
            if (this.documentHelper.owner.paragraphDialogModule) {
                paragraph.style.display = 'block';
            }
            else if (!isDialogHidden && !this.documentHelper.owner.fontDialogModule && !isHideComment) {
                addComment.nextSibling.style.display = 'none';
            }
        }
        if (selection.contextType === 'Image') {
            font.style.display = 'none';
            paragraph.style.display = 'none';
            font.previousSibling.style.display = 'none';
            removeHyperlink.nextSibling.style.display = 'none';
        }
        if (this.documentHelper.selection.hasRevisions()) {
            acceptChange.previousSibling.style.display = this.documentHelper.owner.enableHeaderAndFooter ? 'none' : 'block';
            acceptChange.style.display = 'block';
            rejectChange.style.display = 'block';
        }
        if (this.documentHelper.selection.isinFootnote || this.documentHelper.selection.isinEndnote) {
            editNoteoptions.style.display = 'block';
        }
        return true;
    };
    /**
     * Disposes the internal objects which are maintained.
     * @private
     */
    ContextMenu.prototype.destroy = function () {
        if (this.contextMenuInstance) {
            this.contextMenuInstance.destroy();
        }
        if (this.contextMenu && this.contextMenu.parentElement) {
            this.contextMenu.parentElement.removeChild(this.contextMenu);
            this.contextMenu.innerHTML = '';
        }
        this.contextMenu = undefined;
        this.contextMenuInstance = undefined;
        this.menuItems = [];
        this.customMenuItems = [];
        this.ids = [];
    };
    return ContextMenu;
}());
export { ContextMenu };
