import { Touch, EventHandler, remove, addClass, createElement, closest } from '@syncfusion/ej2-base';
import { Popup } from '@syncfusion/ej2-popups';
import { Button } from '@syncfusion/ej2-buttons';
import * as cls from '../base/css-constant';
/**
 * Kanban touch module
 */
var KanbanTouch = /** @class */ (function () {
    /**
     * Constructor for touch module
     *
     * @param {Kanban} parent Accepts the kanban instance
     * @private
     */
    function KanbanTouch(parent) {
        this.parent = parent;
        this.tabHold = false;
    }
    KanbanTouch.prototype.wireTouchEvents = function () {
        this.element = this.parent.element.querySelector('.' + cls.CONTENT_CLASS);
        this.touchObj = new Touch(this.element, { tapHold: this.tapHoldHandler.bind(this) });
    };
    KanbanTouch.prototype.tapHoldHandler = function (e) {
        this.tabHold = true;
        var target = closest(e.originalEvent.target, '.' + cls.CARD_CLASS);
        if (target && this.parent.cardSettings.selectionType === 'Multiple') {
            this.parent.actionModule.cardSelection(target, true, false);
            if (!this.mobilePopup) {
                this.renderMobilePopup();
                this.mobilePopup.show();
            }
            this.updatePopupContent();
        }
    };
    KanbanTouch.prototype.renderMobilePopup = function () {
        if (this.parent.cardSettings.selectionType === 'Multiple') {
            var mobilePopupWrapper = createElement('div', {
                className: cls.POPUP_WRAPPER_CLASS + ' e-popup-close',
                innerHTML: "<div class=\"" + cls.POPUP_HEADER_CLASS + "\"><button class=\"" + cls.CLOSE_CLASS + "\"></button></div>" +
                    ("<div class=\"" + cls.POPUP_CONTENT_CLASS + "\"></div>")
            });
            document.body.appendChild(mobilePopupWrapper);
            addClass([mobilePopupWrapper], cls.DEVICE_CLASS);
            this.mobilePopup = new Popup(mobilePopupWrapper, {
                targetType: 'container',
                enableRtl: this.parent.enableRtl,
                hideAnimation: { name: 'ZoomOut' },
                showAnimation: { name: 'ZoomIn' },
                collision: { X: 'fit', Y: 'fit' },
                position: { X: 'left', Y: 'top' },
                viewPortElement: document.body,
                zIndex: 1004,
                close: this.popupClose.bind(this)
            });
            var closeIcon = this.mobilePopup.element.querySelector('.' + cls.CLOSE_CLASS);
            var buttonObj = new Button({
                cssClass: 'e-flat e-round e-small',
                enableRtl: this.parent.enableRtl,
                iconCss: cls.ICON_CLASS + ' ' + cls.CLOSE_ICON_CLASS
            });
            buttonObj.appendTo(closeIcon);
            buttonObj.isStringTemplate = true;
            EventHandler.add(closeIcon, 'click', this.closeClick, this);
        }
    };
    KanbanTouch.prototype.getPopupContent = function () {
        var popupContent;
        var selectedCards = this.parent.getSelectedCards();
        if (selectedCards.length > 1) {
            popupContent = '(' + selectedCards.length + ') ' + this.parent.localeObj.getConstant('cardsSelected');
        }
        else if (selectedCards.length === 1) {
            popupContent = ' ' + this.parent.getCardDetails(selectedCards[0])[this.parent.cardSettings.headerField];
        }
        return popupContent;
    };
    KanbanTouch.prototype.updatePopupContent = function () {
        if (!this.mobilePopup) {
            return;
        }
        var popupContent = this.getPopupContent();
        if (popupContent) {
            this.mobilePopup.element.querySelector('.' + cls.POPUP_CONTENT_CLASS).textContent = popupContent;
        }
        else {
            this.mobilePopup.hide();
        }
    };
    KanbanTouch.prototype.closeClick = function () {
        this.parent.touchModule.mobilePopup.hide();
    };
    KanbanTouch.prototype.popupClose = function () {
        this.popupDestroy();
    };
    KanbanTouch.prototype.popupDestroy = function () {
        if (this.mobilePopup && this.mobilePopup.element) {
            var instance = this.mobilePopup.element.querySelector('.e-control.e-btn').ej2_instances[0];
            if (instance) {
                instance.destroy();
            }
            this.mobilePopup.destroy();
            remove(this.mobilePopup.element);
            this.mobilePopup = null;
        }
    };
    KanbanTouch.prototype.unWireTouchEvents = function () {
        if (this.touchObj) {
            this.touchObj.destroy();
        }
        this.touchObj = null;
        this.element = null;
    };
    KanbanTouch.prototype.destroy = function () {
        this.popupDestroy();
        this.unWireTouchEvents();
        this.tabHold = false;
    };
    return KanbanTouch;
}());
export { KanbanTouch };
