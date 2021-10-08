var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
/* eslint-disable valid-jsdoc */
/* eslint-disable jsdoc/require-param */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-types */
import { Property, ChildProperty, append, compile, createElement } from '@syncfusion/ej2-base';
import { Browser, Animation as tooltipAnimation } from '@syncfusion/ej2-base';
import { isNullOrUndefined, formatUnit } from '@syncfusion/ej2-base';
import { attributes, removeClass, addClass, remove, updateBlazorTemplate } from '@syncfusion/ej2-base';
import { calculatePosition } from './position';
import { isCollide, fit } from './collision';
/**
 * Animation options that are common for both open and close actions of the Tooltip
 *
 *  @private
 */
var BlazorAnimation = /** @class */ (function (_super) {
    __extends(BlazorAnimation, _super);
    function BlazorAnimation() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property({ effect: 'FadeIn', duration: 150, delay: 0 })
    ], BlazorAnimation.prototype, "open", void 0);
    __decorate([
        Property({ effect: 'FadeOut', duration: 150, delay: 0 })
    ], BlazorAnimation.prototype, "close", void 0);
    return BlazorAnimation;
}(ChildProperty));
export { BlazorAnimation };
var SHOW_POINTER_TIP_GAP = 0;
var HIDE_POINTER_TIP_GAP = 8;
var POINTER_ADJUST = 2;
var ROOT = 'e-tooltip';
var RTL = 'e-rtl';
var DEVICE = 'e-bigger';
var CLOSE = 'e-tooltip-close';
var TOOLTIP_WRAP = 'e-tooltip-wrap';
var CONTENT = 'e-tip-content';
var ARROW_TIP = 'e-arrow-tip';
var ARROW_TIP_OUTER = 'e-arrow-tip-outer';
var ARROW_TIP_INNER = 'e-arrow-tip-inner';
var TIP_BOTTOM = 'e-tip-bottom';
var TIP_TOP = 'e-tip-top';
var TIP_LEFT = 'e-tip-left';
var TIP_RIGHT = 'e-tip-right';
var POPUP_ROOT = 'e-popup';
var POPUP_OPEN = 'e-popup-open';
var POPUP_CLOSE = 'e-popup-close';
var POPUP_LIB = 'e-lib';
var HIDE_POPUP = 'e-hidden';
var CLASSNAMES = {
    ROOT: 'e-popup',
    RTL: 'e-rtl',
    OPEN: 'e-popup-open',
    CLOSE: 'e-popup-close'
};
/**
 *  @private
 */
var BlazorTooltip = /** @class */ (function () {
    function BlazorTooltip(diagram) {
        this.isBlazorTooltip = false;
        this.contentEvent = null;
        /** @private */
        this.width = 'auto';
        /** @private */
        this.height = 'auto';
        /** @private */
        this.content = '';
        /** @private */
        this.target = '';
        /** @private */
        this.position = 'TopCenter';
        /** @private */
        this.offsetX = 0;
        /** @private */
        this.offsetY = 0;
        /** @private */
        this.tipPointerPosition = 'Auto';
        /** @private */
        this.openDelay = 0;
        /** @private */
        this.closeDelay = 0;
        /** @private */
        this.cssClass = '';
        this.element = diagram;
        this.tipClass = TIP_BOTTOM;
        this.tooltipPositionX = 'Center';
        this.tooltipPositionY = 'Top';
        this.isHidden = true;
        this.showTipPointer = true;
    }
    /**
     *  @private
     */
    BlazorTooltip.prototype.open = function (target, showAnimation, e) {
        if (isNullOrUndefined(this.animation.open)) {
            this.animation.open = this.element.tooltip && this.element.tooltip.animation &&
                this.element.tooltip.animation.open;
        }
        this.showTooltip(target, showAnimation);
    };
    /**
     *  @private
     */
    BlazorTooltip.prototype.updateTooltip = function (target) {
        if (this.tooltipEle) {
            this.addDescribedBy(target, this.ctrlId + '_content');
            this.renderContent(target);
            this.reposition(target);
            this.adjustArrow(target, this.position, this.tooltipPositionX, this.tooltipPositionY);
        }
    };
    BlazorTooltip.prototype.formatPosition = function () {
        var _a, _b;
        if (this.position.indexOf('Top') === 0 || this.position.indexOf('Bottom') === 0) {
            _a = this.position.split(/(?=[A-Z])/), this.tooltipPositionY = _a[0], this.tooltipPositionX = _a[1];
        }
        else {
            _b = this.position.split(/(?=[A-Z])/), this.tooltipPositionX = _b[0], this.tooltipPositionY = _b[1];
        }
    };
    /**
     *  @private
     */
    BlazorTooltip.prototype.destroy = function () {
        //No code
    };
    /**
     *  @private
     */
    BlazorTooltip.prototype.close = function () {
        if (this.tooltipEle) {
            removeClass([this.tooltipEle], POPUP_CLOSE);
            addClass([this.tooltipEle], POPUP_OPEN);
            tooltipAnimation.stop(this.tooltipEle);
            var animationOptions = void 0;
            // eslint-disable-next-line @typescript-eslint/no-this-alias
            var currentTooltip_1 = this;
            currentTooltip_1.isHidden = true;
            if (this.animation.close) {
                animationOptions = {
                    name: this.animation.close.effect,
                    duration: this.animation.close.duration || 0,
                    delay: this.animation.close.delay || 0,
                    timingFunction: 'easeOut'
                };
            }
            if (!isNullOrUndefined(animationOptions)) {
                animationOptions.end = function () {
                    if (currentTooltip_1.isHidden) {
                        remove(currentTooltip_1.tooltipEle);
                        currentTooltip_1.tooltipEle = null;
                    }
                };
                new tooltipAnimation(animationOptions).animate(this.tooltipEle);
            }
            else {
                removeClass([this.tooltipEle], CLASSNAMES.OPEN);
                addClass([this.tooltipEle], CLASSNAMES.CLOSE);
                remove(this.tooltipEle);
                this.tooltipEle = null;
            }
        }
    };
    /**
     *  @private
     */
    BlazorTooltip.prototype.showTooltip = function (target, showAnimation, e) {
        var _this = this;
        clearTimeout(this.showTimer);
        clearTimeout(this.hideTimer);
        this.tooltipEventArgs = {
            type: e ? e.type : null, cancel: false, target: target, event: e ? e : null,
            element: this.tooltipEle, isInteracted: !isNullOrUndefined(e)
        };
        var observeCallback = function (beforeRenderArgs) {
            _this.beforeRenderCallback(beforeRenderArgs, target, e, showAnimation);
        };
        this.element.trigger('beforeRender', this.tooltipEventArgs, observeCallback.bind(this));
    };
    BlazorTooltip.prototype.beforeRenderCallback = function (beforeRenderArgs, target, e, showAnimation) {
        this.formatPosition();
        var isBlazorTooltipRendered = false;
        if (beforeRenderArgs.cancel) {
            this.isHidden = true;
            //  this.clear();
        }
        else {
            this.isHidden = false;
            if (isNullOrUndefined(this.tooltipEle)) {
                this.ctrlId = this.element.element.id;
                this.tooltipEle = createElement('div', {
                    className: TOOLTIP_WRAP + ' ' + POPUP_ROOT + ' ' + POPUP_LIB, attrs: {
                        role: 'tooltip', 'aria-hidden': 'false', 'id': this.ctrlId + '_content'
                    }, styles: 'width:' +
                        formatUnit(this.width) + ';height:' + formatUnit(this.height) + ';position:absolute; pointer-events:none;'
                });
                this.beforeRenderBlazor(target, this);
                tooltipAnimation.stop(this.tooltipEle);
                this.afterRenderBlazor(target, e, showAnimation, this);
            }
            else {
                if (target) {
                    this.addDescribedBy(target, this.ctrlId + '_content');
                    this.renderContent(target);
                    tooltipAnimation.stop(this.tooltipEle);
                    this.reposition(target);
                    this.afterRenderBlazor(target, e, showAnimation, this);
                    this.adjustArrow(target, this.position, this.tooltipPositionX, this.tooltipPositionY);
                }
            }
        }
    };
    BlazorTooltip.prototype.afterRenderBlazor = function (target, e, showAnimation, ctrlObj) {
        var _this = this;
        if (target) {
            removeClass([ctrlObj.tooltipEle], POPUP_OPEN);
            addClass([ctrlObj.tooltipEle], POPUP_CLOSE);
            ctrlObj.tooltipEventArgs = {
                type: e ? e.type : null, cancel: false, target: target, event: e ? e : null,
                element: ctrlObj.tooltipEle, isInteracted: !isNullOrUndefined(e)
            };
            var animation = void 0;
            if (this.animation.open) {
                animation = {
                    name: this.animation.open.effect,
                    duration: this.animation.open.duration || 0,
                    delay: this.animation.open.delay || 0,
                    timingFunction: 'easeIn'
                };
            }
            if (!isNullOrUndefined(animation)) {
                animation.begin = function () {
                    removeClass([ctrlObj.tooltipEle], CLASSNAMES.CLOSE);
                    addClass([ctrlObj.tooltipEle], CLASSNAMES.OPEN);
                };
                animation.end = function () {
                    _this.element.trigger('open');
                };
                new tooltipAnimation(animation).animate(this.tooltipEle);
            }
            else {
                removeClass([ctrlObj.tooltipEle], POPUP_CLOSE);
                addClass([ctrlObj.tooltipEle], POPUP_OPEN);
            }
        }
    };
    BlazorTooltip.prototype.setTipClass = function (position) {
        if (position.indexOf('Right') === 0) {
            this.tipClass = TIP_LEFT;
        }
        else if (position.indexOf('Bottom') === 0) {
            this.tipClass = TIP_TOP;
        }
        else if (position.indexOf('Left') === 0) {
            this.tipClass = TIP_RIGHT;
        }
        else {
            this.tipClass = TIP_BOTTOM;
        }
    };
    BlazorTooltip.prototype.renderArrow = function () {
        this.setTipClass(this.position);
        var tip = createElement('div', { className: ARROW_TIP + ' ' + this.tipClass });
        tip.appendChild(createElement('div', { className: ARROW_TIP_OUTER + ' ' + this.tipClass }));
        tip.appendChild(createElement('div', { className: ARROW_TIP_INNER + ' ' + this.tipClass }));
        this.tooltipEle.appendChild(tip);
    };
    BlazorTooltip.prototype.getTooltipPosition = function (target) {
        this.tooltipEle.style.display = 'block';
        var pos = calculatePosition(target, this.tooltipPositionX, this.tooltipPositionY);
        var offsetPos = this.calculateTooltipOffset(this.position);
        var elePos = this.collisionFlipFit(target, pos.left + offsetPos.left, pos.top + offsetPos.top);
        this.tooltipEle.style.display = '';
        return elePos;
    };
    BlazorTooltip.prototype.checkCollision = function (target, x, y) {
        var elePos = {
            left: x, top: y, position: this.position,
            horizontal: this.tooltipPositionX, vertical: this.tooltipPositionY
        };
        var affectedPos = isCollide(this.tooltipEle, (this.target ? this.element.element : null), x, y);
        if (affectedPos.length > 0) {
            elePos.horizontal = affectedPos.indexOf('left') >= 0 ? 'Right' : affectedPos.indexOf('right') >= 0 ? 'Left' :
                this.tooltipPositionX;
            elePos.vertical = affectedPos.indexOf('top') >= 0 ? 'Bottom' : affectedPos.indexOf('bottom') >= 0 ? 'Top' :
                this.tooltipPositionY;
        }
        return elePos;
    };
    BlazorTooltip.prototype.collisionFlipFit = function (target, x, y) {
        var elePos = this.checkCollision(target, x, y);
        var newpos = elePos.position;
        if (this.tooltipPositionY !== elePos.vertical) {
            newpos = ((this.position.indexOf('Bottom') === 0 || this.position.indexOf('Top') === 0) ?
                elePos.vertical + this.tooltipPositionX : this.tooltipPositionX + elePos.vertical);
        }
        if (this.tooltipPositionX !== elePos.horizontal) {
            if (newpos.indexOf('Left') === 0) {
                elePos.vertical = (newpos === 'LeftTop' || newpos === 'LeftCenter') ? 'Top' : 'Bottom';
                newpos = (elePos.vertical + 'Left');
            }
            if (newpos.indexOf('Right') === 0) {
                elePos.vertical = (newpos === 'RightTop' || newpos === 'RightCenter') ? 'Top' : 'Bottom';
                newpos = (elePos.vertical + 'Right');
            }
            elePos.horizontal = this.tooltipPositionX;
        }
        this.tooltipEventArgs = {
            type: null, cancel: false, target: target, event: null,
            element: this.tooltipEle, collidedPosition: newpos
        };
        this.element.trigger('beforeCollision', this.tooltipEventArgs);
        if (elePos.position !== newpos) {
            var pos = calculatePosition(target, elePos.horizontal, elePos.vertical);
            this.adjustArrow(target, newpos, elePos.horizontal, elePos.vertical);
            var offsetPos = this.calculateTooltipOffset(newpos);
            offsetPos.top -= (('TopBottom'.indexOf(this.position.split(/(?=[A-Z])/)[0]) !== -1) &&
                ('TopBottom'.indexOf(newpos.split(/(?=[A-Z])/)[0]) !== -1)) ? (2 * this.offsetY) : 0;
            offsetPos.left -= (('RightLeft'.indexOf(this.position.split(/(?=[A-Z])/)[0]) !== -1) &&
                ('RightLeft'.indexOf(newpos.split(/(?=[A-Z])/)[0]) !== -1)) ? (2 * this.offsetX) : 0;
            elePos.position = newpos;
            elePos.left = pos.left + offsetPos.left;
            elePos.top = pos.top + offsetPos.top;
        }
        else {
            this.adjustArrow(target, newpos, elePos.horizontal, elePos.vertical);
        }
        var eleOffset = { left: elePos.left, top: elePos.top };
        var left = fit(this.tooltipEle, (this.target ? this.element.element : null), { X: true, Y: false }, eleOffset).left;
        this.tooltipEle.style.display = 'block';
        if (this.showTipPointer && (newpos.indexOf('Bottom') === 0 || newpos.indexOf('Top') === 0)) {
            var arrowEle = this.tooltipEle.querySelector('.' + ARROW_TIP);
            var arrowleft = parseInt(arrowEle.style.left, 10) - (left - elePos.left);
            if (arrowleft < 0) {
                arrowleft = 0;
            }
            else if ((arrowleft + arrowEle.offsetWidth) > this.tooltipEle.clientWidth) {
                arrowleft = this.tooltipEle.clientWidth - arrowEle.offsetWidth;
            }
            arrowEle.style.left = arrowleft.toString() + 'px';
        }
        this.tooltipEle.style.display = '';
        eleOffset.left = left;
        return eleOffset;
    };
    BlazorTooltip.prototype.calculateTooltipOffset = function (position) {
        var pos = { top: 0, left: 0 };
        var tooltipEleWidth = this.tooltipEle.offsetWidth;
        var tooltipEleHeight = this.tooltipEle.offsetHeight;
        var arrowEle = this.tooltipEle.querySelector('.' + ARROW_TIP);
        var tipWidth = arrowEle ? arrowEle.offsetWidth : 0;
        var tipHeight = arrowEle ? arrowEle.offsetHeight : 0;
        var tipAdjust = (this.showTipPointer ? SHOW_POINTER_TIP_GAP : HIDE_POINTER_TIP_GAP);
        var tipHeightAdjust = (tipHeight / 2) + POINTER_ADJUST + (this.tooltipEle.offsetHeight - this.tooltipEle.clientHeight);
        var tipWidthAdjust = (tipWidth / 2) + POINTER_ADJUST + (this.tooltipEle.offsetWidth - this.tooltipEle.clientWidth);
        switch (position) {
            case 'RightTop':
                pos.left += tipWidth + tipAdjust;
                pos.top -= tooltipEleHeight - tipHeightAdjust;
                break;
            case 'RightCenter':
                pos.left += tipWidth + tipAdjust;
                pos.top -= (tooltipEleHeight / 2);
                break;
            case 'RightBottom':
                pos.left += tipWidth + tipAdjust;
                pos.top -= (tipHeightAdjust);
                break;
            case 'BottomRight':
                pos.top += (tipHeight + tipAdjust);
                pos.left -= (tipWidthAdjust);
                break;
            case 'BottomCenter':
                pos.top += (tipHeight + tipAdjust);
                pos.left -= (tooltipEleWidth / 2);
                break;
            case 'BottomLeft':
                pos.top += (tipHeight + tipAdjust);
                pos.left -= (tooltipEleWidth - tipWidthAdjust);
                break;
            case 'LeftBottom':
                pos.left -= (tipWidth + tooltipEleWidth + tipAdjust);
                pos.top -= (tipHeightAdjust);
                break;
            case 'LeftCenter':
                pos.left -= (tipWidth + tooltipEleWidth + tipAdjust);
                pos.top -= (tooltipEleHeight / 2);
                break;
            case 'LeftTop':
                pos.left -= (tipWidth + tooltipEleWidth + tipAdjust);
                pos.top -= (tooltipEleHeight - tipHeightAdjust);
                break;
            case 'TopLeft':
                pos.top -= (tooltipEleHeight + tipHeight + tipAdjust);
                pos.left -= (tooltipEleWidth - tipWidthAdjust);
                break;
            case 'TopRight':
                pos.top -= (tooltipEleHeight + tipHeight + tipAdjust);
                pos.left -= (tipWidthAdjust);
                break;
            default:
                pos.top -= (tooltipEleHeight + tipHeight + tipAdjust);
                pos.left -= (tooltipEleWidth / 2);
                break;
        }
        pos.left += this.offsetX;
        pos.top += this.offsetY;
        return pos;
    };
    BlazorTooltip.prototype.reposition = function (target) {
        var elePos = this.getTooltipPosition(target);
        this.tooltipEle.style.left = elePos.left + 'px';
        this.tooltipEle.style.top = elePos.top + 'px';
    };
    BlazorTooltip.prototype.beforeRenderBlazor = function (target, ctrlObj) {
        if (target) {
            if (Browser.isDevice) {
                addClass([ctrlObj.tooltipEle], DEVICE);
            }
            if (ctrlObj.width !== 'auto') {
                ctrlObj.tooltipEle.style.maxWidth = formatUnit(ctrlObj.width);
            }
            ctrlObj.tooltipEle.appendChild(createElement('div', { className: CONTENT + ' ' + 'e-diagramTooltip-content' }));
            document.body.appendChild(ctrlObj.tooltipEle);
            addClass([ctrlObj.tooltipEle], POPUP_OPEN);
            removeClass([ctrlObj.tooltipEle], HIDE_POPUP);
            ctrlObj.addDescribedBy(target, ctrlObj.ctrlId + '_content');
            ctrlObj.renderContent(target);
            addClass([ctrlObj.tooltipEle], POPUP_OPEN);
            if (this.showTipPointer) {
                ctrlObj.renderArrow();
            }
            var elePos = this.getTooltipPosition(target);
            this.tooltipEle.classList.remove(POPUP_LIB);
            this.tooltipEle.style.left = elePos.left + 'px';
            this.tooltipEle.style.top = elePos.top + 'px';
            ctrlObj.reposition(target);
            ctrlObj.adjustArrow(target, ctrlObj.position, ctrlObj.tooltipPositionX, ctrlObj.tooltipPositionY);
        }
    };
    BlazorTooltip.prototype.addDescribedBy = function (target, id) {
        var describedby = (target.getAttribute('aria-describedby') || '').split(/\s+/);
        if (describedby.indexOf(id) < 0) {
            describedby.push(id);
        }
        attributes(target, { 'aria-describedby': describedby.join(' ').trim(), 'data-tooltip-id': id });
    };
    BlazorTooltip.prototype.renderContent = function (target) {
        var tooltipContent = this.tooltipEle.querySelector('.' + CONTENT);
        if (this.cssClass) {
            addClass([this.tooltipEle], this.cssClass.split(' '));
        }
        if (target && !isNullOrUndefined(target.getAttribute('title'))) {
            target.setAttribute('data-content', target.getAttribute('title'));
            target.removeAttribute('title');
        }
        if (!isNullOrUndefined(this.content)) {
            if (this.isBlazorTooltip || !(false)) {
                tooltipContent.innerHTML = '';
                if (this.content instanceof HTMLElement) {
                    tooltipContent.appendChild(this.content);
                }
                else if (typeof this.content === 'string' && this.content.indexOf('<div>Blazor') < 0) {
                    tooltipContent.innerHTML = this.content;
                }
                else {
                    var templateFunction = compile(this.content);
                    append(templateFunction({}, null, null, this.element.element.id + 'content'), tooltipContent);
                    if (typeof this.content === 'string' && this.content.indexOf('<div>Blazor') >= 0) {
                        this.isBlazorTemplate = true;
                        updateBlazorTemplate(this.element.element.id + 'content', 'Content', this);
                    }
                }
            }
        }
        else {
            if (target && !isNullOrUndefined(target.getAttribute('data-content'))) {
                tooltipContent.innerHTML = target.getAttribute('data-content');
            }
        }
    };
    BlazorTooltip.prototype.updateTipPosition = function (position) {
        var selEle = this.tooltipEle.querySelectorAll('.' + ARROW_TIP + ',.' + ARROW_TIP_OUTER + ',.' + ARROW_TIP_INNER);
        var removeList = [TIP_BOTTOM, TIP_TOP, TIP_LEFT, TIP_RIGHT];
        removeClass(selEle, removeList);
        this.setTipClass(position);
        addClass(selEle, this.tipClass);
    };
    BlazorTooltip.prototype.adjustArrow = function (target, position, tooltipPositionX, tooltipPositionY) {
        if (!this.showTipPointer) {
            return;
        }
        this.updateTipPosition(position);
        var leftValue;
        var topValue;
        this.tooltipEle.style.display = 'block';
        var tooltipWidth = this.tooltipEle.clientWidth;
        var tooltipHeight = this.tooltipEle.clientHeight;
        var arrowEle = this.tooltipEle.querySelector('.' + ARROW_TIP);
        var arrowInnerELe = this.tooltipEle.querySelector('.' + ARROW_TIP_INNER);
        var tipWidth = arrowEle.offsetWidth;
        var tipHeight = arrowEle.offsetHeight;
        this.tooltipEle.style.display = '';
        if (this.tipClass === TIP_BOTTOM || this.tipClass === TIP_TOP) {
            if (this.tipClass === TIP_BOTTOM) {
                topValue = '99.9%';
                // Arrow icon aligned -2px height from ArrowOuterTip div
                arrowInnerELe.style.top = '-' + (tipHeight - 2) + 'px';
            }
            else {
                topValue = -(tipHeight - 1) + 'px';
                // Arrow icon aligned -6px height from ArrowOuterTip div
                arrowInnerELe.style.top = '-' + (tipHeight - 6) + 'px';
            }
            if (target) {
                var tipPosExclude = tooltipPositionX !== 'Center' || (tooltipWidth > target.offsetWidth);
                if ((tipPosExclude && tooltipPositionX === 'Left') || (!tipPosExclude && this.tipPointerPosition === 'End')) {
                    leftValue = (tooltipWidth - tipWidth - POINTER_ADJUST) + 'px';
                }
                else if ((tipPosExclude && tooltipPositionX === 'Right') || (!tipPosExclude && this.tipPointerPosition === 'Start')) {
                    leftValue = POINTER_ADJUST + 'px';
                }
                else {
                    leftValue = ((tooltipWidth / 2) - (tipWidth / 2)) + 'px';
                }
            }
        }
        else {
            if (this.tipClass === TIP_RIGHT) {
                leftValue = '99.9%';
                // Arrow icon aligned -2px left from ArrowOuterTip div
                arrowInnerELe.style.left = '-' + (tipWidth - 2) + 'px';
            }
            else {
                leftValue = -(tipWidth - 1) + 'px';
                // Arrow icon aligned -2px from ArrowOuterTip width
                arrowInnerELe.style.left = (-(tipWidth) + (tipWidth - 2)) + 'px';
            }
            var tipPosExclude = tooltipPositionY !== 'Center' || (tooltipHeight > target.offsetHeight);
            if ((tipPosExclude && tooltipPositionY === 'Top') || (!tipPosExclude && this.tipPointerPosition === 'End')) {
                topValue = (tooltipHeight - tipHeight - POINTER_ADJUST) + 'px';
            }
            else if ((tipPosExclude && tooltipPositionY === 'Bottom') || (!tipPosExclude && this.tipPointerPosition === 'Start')) {
                topValue = POINTER_ADJUST + 'px';
            }
            else {
                topValue = ((tooltipHeight / 2) - (tipHeight / 2)) + 'px';
            }
        }
        arrowEle.style.top = topValue;
        arrowEle.style.left = leftValue;
    };
    /**
     * Returns the module name of the blazor tooltip
     *
     * @returns {string}  Returns the module name of the blazor tooltip
     */
    BlazorTooltip.prototype.getModuleName = function () {
        return 'BlazorTooltip';
    };
    return BlazorTooltip;
}());
export { BlazorTooltip };
