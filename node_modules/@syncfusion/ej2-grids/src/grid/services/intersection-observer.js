import { EventHandler, Browser } from '@syncfusion/ej2-base';
import { debounce } from '@syncfusion/ej2-base';
/**
 * InterSectionObserver - class watch whether it enters the viewport.
 *
 * @hidden
 */
var InterSectionObserver = /** @class */ (function () {
    function InterSectionObserver(element, options, movableEle) {
        var _this = this;
        this.fromWheel = false;
        this.touchMove = false;
        this.options = {};
        this.sentinelInfo = {
            'up': {
                check: function (rect, info) {
                    var top = rect.top - _this.containerRect.top;
                    info.entered = top >= 0;
                    return top + (_this.options.pageHeight / 2) >= 0;
                },
                axis: 'Y'
            },
            'down': {
                check: function (rect, info) {
                    var bottom = rect.bottom;
                    info.entered = rect.bottom <= _this.containerRect.bottom;
                    return ((bottom - _this.containerRect.top) - (_this.options.pageHeight / 2)) <= _this.options.pageHeight / 2;
                }, axis: 'Y'
            },
            'right': {
                check: function (rect, info) {
                    var right = rect.right;
                    if (_this.movableEle) {
                        info.entered = right < _this.movableContainerRect.right;
                        return right - _this.movableContainerRect.width <= _this.movableContainerRect.right;
                    }
                    info.entered = right < _this.containerRect.right;
                    return right - _this.containerRect.width <= _this.containerRect.right;
                }, axis: 'X'
            },
            'left': {
                check: function (rect, info) {
                    var left = rect.left;
                    info.entered = left > 0;
                    if (_this.movableEle) {
                        return left + _this.movableContainerRect.width >= _this.movableContainerRect.left;
                    }
                    return left + _this.containerRect.width >= _this.containerRect.left;
                }, axis: 'X'
            }
        };
        this.element = element;
        this.options = options;
        this.movableEle = movableEle;
    }
    InterSectionObserver.prototype.observe = function (callback, onEnterCallback) {
        var _this = this;
        this.containerRect = this.options.container.getBoundingClientRect();
        EventHandler.add(this.options.container, 'wheel', function () { return _this.fromWheel = true; }, this);
        EventHandler.add(this.options.container, 'scroll', this.virtualScrollHandler(callback, onEnterCallback), this);
        if (this.options.movableContainer) {
            this.movableContainerRect = this.options.movableContainer.getBoundingClientRect();
            EventHandler.add(this.options.scrollbar, 'wheel', function () { return _this.fromWheel = true; }, this);
            EventHandler.add(this.options.scrollbar, 'scroll', this.virtualScrollHandler(callback, onEnterCallback), this);
        }
    };
    InterSectionObserver.prototype.check = function (direction) {
        var info = this.sentinelInfo[direction];
        if (this.movableContainerRect && (direction === 'left' || direction === 'right')) {
            return info.check(this.movableEle.getBoundingClientRect(), info);
        }
        return info.check(this.element.getBoundingClientRect(), info);
    };
    InterSectionObserver.prototype.virtualScrollHandler = function (callback, onEnterCallback) {
        var _this = this;
        var delay = Browser.info.name === 'chrome' ? 200 : 100;
        var debounced100 = debounce(callback, delay);
        var debounced50 = debounce(callback, 50);
        this.options.prevTop = this.options.prevLeft = 0;
        return function (e) {
            var top = _this.options.movableContainer ? _this.options.container.scrollTop : e.target.scrollTop;
            var left = _this.options.movableContainer ? _this.options.scrollbar.scrollLeft : e.target.scrollLeft;
            var direction = _this.options.prevTop < top ? 'down' : 'up';
            direction = _this.options.prevLeft === left ? direction : _this.options.prevLeft < left ? 'right' : 'left';
            _this.options.prevTop = top;
            _this.options.prevLeft = left;
            var current = _this.sentinelInfo[direction];
            if (_this.options.axes.indexOf(current.axis) === -1) {
                return;
            }
            var check = _this.check(direction);
            if (current.entered) {
                if (_this.movableEle && (direction === 'right' || direction === 'left')) {
                    onEnterCallback(_this.movableEle, current, direction, { top: top, left: left }, _this.fromWheel, check);
                }
                else {
                    onEnterCallback(_this.element, current, direction, { top: top, left: left }, _this.fromWheel, check);
                }
            }
            if (check) {
                var fn = debounced100;
                //this.fromWheel ? this.options.debounceEvent ? debounced100 : callback : debounced100;
                if (current.axis === 'X') {
                    fn = debounced50;
                }
                fn({ direction: direction, sentinel: current, offset: { top: top, left: left },
                    focusElement: document.activeElement });
            }
            _this.fromWheel = false;
        };
    };
    InterSectionObserver.prototype.setPageHeight = function (value) {
        this.options.pageHeight = value;
    };
    return InterSectionObserver;
}());
export { InterSectionObserver };
