import { KeyboardEvents, closest, addClass, removeClass } from '@syncfusion/ej2-base';
import * as cls from '../base/css-constant';
/**
 * Keyboard interaction
 */
/** @hidden */
var CommonKeyboardInteraction = /** @class */ (function () {
    /**
     * Constructor
     */
    function CommonKeyboardInteraction(parent) {
        this.keyConfigs = {
            shiftF: 'shift+F',
            shiftS: 'shift+S',
            shiftE: 'shift+E',
            delete: 'delete',
            enter: 'enter',
            escape: 'escape',
            upArrow: 'upArrow',
            downArrow: 'downArrow',
            altJ: 'alt+J'
        };
        /* eslint-enable */
        this.parent = parent;
        this.parent.element.tabIndex = this.parent.element.tabIndex === -1 ? 0 : this.parent.element.tabIndex;
        this.keyboardModule = new KeyboardEvents(this.parent.element, {
            keyAction: this.keyActionHandler.bind(this),
            keyConfigs: this.keyConfigs,
            eventName: 'keydown'
        });
    }
    CommonKeyboardInteraction.prototype.keyActionHandler = function (e) {
        switch (e.action) {
            case 'shiftF':
                this.processFilter(e);
                break;
            case 'shiftS':
                this.processSort(e);
                break;
            case 'shiftE':
                this.processEdit(e);
                break;
            case 'delete':
                this.processDelete(e);
                break;
            case 'enter':
                this.processEnter(e);
                break;
            case 'escape':
                this.processClose(e);
                break;
            case 'upArrow':
            case 'downArrow':
                this.processFilterNodeSelection(e);
                break;
            case 'altJ':
                this.processComponentFocus(e);
        }
    };
    CommonKeyboardInteraction.prototype.processComponentFocus = function (e) {
        if (this.parent.element) {
            this.parent.element.focus();
            e.stopPropagation();
            e.preventDefault();
            return;
        }
    };
    CommonKeyboardInteraction.prototype.getButtonElement = function (target) {
        var allPivotButtons = [].slice.call(this.parent.element.querySelectorAll('.' + cls.PIVOT_BUTTON_CLASS));
        for (var i = 0, len = allPivotButtons.length; i < len; i++) {
            if (allPivotButtons[i].getAttribute('data-uid') === target.getAttribute('data-uid')) {
                return allPivotButtons[i];
            }
        }
        return target;
    };
    CommonKeyboardInteraction.prototype.processEnter = function (e) {
        var target = e.target;
        if (target && closest(target, '.' + cls.PIVOT_BUTTON_CLASS)) {
            if (target.querySelector('.' + cls.AXISFIELD_ICON_CLASS) && closest(target, '.' + cls.VALUE_AXIS_CLASS)) {
                target.querySelector('.' + cls.AXISFIELD_ICON_CLASS).click();
            }
            else if (target.querySelector('.' + cls.CALC_EDIT)) {
                target.querySelector('.' + cls.CALC_EDIT).click();
            }
            else if (target.querySelector('.' + cls.SORT_CLASS) &&
                !closest(target, '.' + cls.VALUE_AXIS_CLASS) && !closest(target, '.' + cls.AXIS_FILTER_CLASS)) {
                target.querySelector('.' + cls.SORT_CLASS).click();
                this.getButtonElement(target).focus();
            }
            else if (target.querySelector('.' + cls.FILTER_COMMON_CLASS) && !closest(target, '.' + cls.VALUE_AXIS_CLASS)) {
                target.querySelector('.' + cls.FILTER_COMMON_CLASS).click();
            }
            e.preventDefault();
            return;
        }
    };
    CommonKeyboardInteraction.prototype.processSort = function (e) {
        var target = e.target;
        if (target && closest(target, '.' + cls.PIVOT_BUTTON_CLASS) && target.querySelector('.' + cls.SORT_CLASS) &&
            !closest(target, '.' + cls.VALUE_AXIS_CLASS) && !closest(target, '.' + cls.AXIS_FILTER_CLASS)) {
            target.querySelector('.' + cls.SORT_CLASS).click();
            this.getButtonElement(target).focus();
            e.preventDefault();
            return;
        }
    };
    CommonKeyboardInteraction.prototype.processEdit = function (e) {
        var target = e.target;
        if (target && closest(target, '.' + cls.PIVOT_BUTTON_CLASS) && target.querySelector('.' + cls.CALC_EDIT)) {
            target.querySelector('.' + cls.CALC_EDIT).click();
            e.preventDefault();
            return;
        }
    };
    CommonKeyboardInteraction.prototype.processFilter = function (e) {
        var target = e.target;
        if (target && closest(target, '.' + cls.PIVOT_BUTTON_CLASS) && target.querySelector('.' + cls.FILTER_COMMON_CLASS) &&
            !closest(target, '.' + cls.VALUE_AXIS_CLASS)) {
            target.querySelector('.' + cls.FILTER_COMMON_CLASS).click();
            if (this.parent && this.parent.control && this.parent.moduleName === 'pivotview' &&
                this.parent.control.grid && this.parent.control.showGroupingBar &&
                this.parent.control.groupingBarModule && closest(target, '.' + cls.GROUP_ROW_CLASS) &&
                this.parent.filterDialog && this.parent.filterDialog.dialogPopUp &&
                !this.parent.filterDialog.dialogPopUp.isDestroyed && this.parent.filterDialog.dialogPopUp.element) {
                var dialogElement_1 = this.parent.filterDialog.dialogPopUp.element;
                var isExcelFilter_1 = this.parent.filterDialog.allowExcelLikeFilter;
                clearTimeout(this.timeOutObj);
                this.timeOutObj = setTimeout(function () {
                    if (dialogElement_1 && dialogElement_1.classList.contains('e-popup-open')) {
                        if (isExcelFilter_1 && dialogElement_1.querySelector('.e-dlg-closeicon-btn')) {
                            dialogElement_1.querySelector('.e-dlg-closeicon-btn').focus();
                        }
                        else if (dialogElement_1.querySelector('input')) {
                            dialogElement_1.querySelector('input').focus();
                        }
                    }
                });
            }
            e.preventDefault();
            return;
        }
    };
    CommonKeyboardInteraction.prototype.processFilterNodeSelection = function (e) {
        var target = e.target;
        if (target && closest(target, '.' + cls.SELECT_ALL_CLASS) && e.keyCode === 40) {
            var memberEditorTree = closest(target, '.' + cls.EDITOR_TREE_WRAPPER_CLASS).querySelector('.' + cls.EDITOR_TREE_CONTAINER_CLASS);
            if (memberEditorTree && memberEditorTree.querySelector('li')) {
                var firstLi = memberEditorTree.querySelector('li');
                if (memberEditorTree.querySelector('li#_active')) {
                    removeClass([memberEditorTree.querySelector('li#_active')], ['e-hover', 'e-node-focus']);
                    memberEditorTree.querySelector('li#_active').removeAttribute('id');
                }
                firstLi.setAttribute('id', '_active');
                addClass([firstLi], ['e-hover', 'e-node-focus']);
                memberEditorTree.focus();
                e.preventDefault();
                return;
            }
        }
        else if (target && closest(target, '.' + cls.EDITOR_TREE_CONTAINER_CLASS) && e.keyCode === 38) {
            var memberEditorTree = closest(target, '.' + cls.EDITOR_TREE_CONTAINER_CLASS);
            if (memberEditorTree.querySelector('li#_active.e-hover.e-node-focus') && memberEditorTree.querySelector('li') &&
                memberEditorTree.querySelector('li').classList.contains('e-prev-active-node') &&
                memberEditorTree.querySelector('li') === memberEditorTree.querySelector('li#_active.e-hover.e-node-focus')) {
                removeClass(memberEditorTree.querySelectorAll('li.e-prev-active-node'), 'e-prev-active-node');
                var allMemberEditorTree = closest(target, '.' + cls.EDITOR_TREE_WRAPPER_CLASS).querySelector('.' + cls.SELECT_ALL_CLASS);
                if (allMemberEditorTree && allMemberEditorTree.querySelector('li')) {
                    var firstLi = allMemberEditorTree.querySelector('li');
                    firstLi.setAttribute('id', '_active');
                    addClass([firstLi], ['e-hover', 'e-node-focus']);
                    allMemberEditorTree.focus();
                    e.preventDefault();
                    return;
                }
            }
        }
        else if (target && target.id === this.parent.parentID + '_inputbox') {
            if (e.action === 'upArrow') {
                target.parentElement.querySelector('.e-spin-up').click();
            }
            else if (e.action === 'downArrow') {
                target.parentElement.querySelector('.e-spin-down').click();
            }
        }
    };
    CommonKeyboardInteraction.prototype.processDelete = function (e) {
        var target = e.target;
        if (target && closest(target, '.' + cls.PIVOT_BUTTON_CLASS) && target.querySelector('.' + cls.REMOVE_CLASS)) {
            target.querySelector('.' + cls.REMOVE_CLASS).click();
            e.preventDefault();
            return;
        }
    };
    CommonKeyboardInteraction.prototype.processClose = function (e) {
        var target = e.target;
        if (target && closest(target, '.e-popup.e-popup-open')) {
            /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
            var dialogInstance = closest(target, '.e-popup.e-popup-open').ej2_instances[0];
            if (dialogInstance && !dialogInstance.closeOnEscape) {
                var button = dialogInstance.element.getAttribute('data-fieldName');
                dialogInstance.hide();
                if (this.parent.element) {
                    var pivotButtons = [].slice.call(this.parent.element.querySelectorAll('.e-pivot-button'));
                    for (var _i = 0, pivotButtons_1 = pivotButtons; _i < pivotButtons_1.length; _i++) {
                        var item = pivotButtons_1[_i];
                        if (item.getAttribute('data-uid') === button) {
                            item.focus();
                            break;
                        }
                    }
                }
                e.preventDefault();
                return;
            }
        }
    };
    /**
     * To destroy the keyboard module.
     * @returns {void}
     * @private
     */
    CommonKeyboardInteraction.prototype.destroy = function () {
        if (this.keyboardModule) {
            this.keyboardModule.destroy();
        }
        else {
            return;
        }
    };
    return CommonKeyboardInteraction;
}());
export { CommonKeyboardInteraction };
