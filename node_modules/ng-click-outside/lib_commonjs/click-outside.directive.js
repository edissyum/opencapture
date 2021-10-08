"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClickOutsideDirective = void 0;
var core_1 = require("@angular/core");
var common_1 = require("@angular/common");
var ClickOutsideDirective = (function () {
    function ClickOutsideDirective(_el, _ngZone, platformId) {
        this._el = _el;
        this._ngZone = _ngZone;
        this.platformId = platformId;
        this.clickOutsideEnabled = true;
        this.attachOutsideOnClick = false;
        this.delayClickOutsideInit = false;
        this.emitOnBlur = false;
        this.exclude = '';
        this.excludeBeforeClick = false;
        this.clickOutsideEvents = '';
        this.clickOutside = new core_1.EventEmitter();
        this._nodesExcluded = [];
        this._events = ['click'];
        this._initOnClickBody = this._initOnClickBody.bind(this);
        this._onClickBody = this._onClickBody.bind(this);
        this._onWindowBlur = this._onWindowBlur.bind(this);
    }
    ClickOutsideDirective.prototype.ngOnInit = function () {
        if (!common_1.isPlatformBrowser(this.platformId)) {
            return;
        }
        this._init();
    };
    ClickOutsideDirective.prototype.ngOnDestroy = function () {
        if (!common_1.isPlatformBrowser(this.platformId)) {
            return;
        }
        this._removeClickOutsideListener();
        this._removeAttachOutsideOnClickListener();
        this._removeWindowBlurListener();
    };
    ClickOutsideDirective.prototype.ngOnChanges = function (changes) {
        if (!common_1.isPlatformBrowser(this.platformId)) {
            return;
        }
        if (changes['attachOutsideOnClick'] || changes['exclude'] || changes['emitOnBlur']) {
            this._init();
        }
    };
    ClickOutsideDirective.prototype._init = function () {
        if (this.clickOutsideEvents !== '') {
            this._events = this.clickOutsideEvents.split(',').map(function (e) { return e.trim(); });
        }
        this._excludeCheck();
        if (this.attachOutsideOnClick) {
            this._initAttachOutsideOnClickListener();
        }
        else {
            this._initOnClickBody();
        }
        if (this.emitOnBlur) {
            this._initWindowBlurListener();
        }
    };
    ClickOutsideDirective.prototype._initOnClickBody = function () {
        if (this.delayClickOutsideInit) {
            setTimeout(this._initClickOutsideListener.bind(this));
        }
        else {
            this._initClickOutsideListener();
        }
    };
    ClickOutsideDirective.prototype._excludeCheck = function () {
        if (this.exclude) {
            try {
                var nodes = Array.from(document.querySelectorAll(this.exclude));
                if (nodes) {
                    this._nodesExcluded = nodes;
                }
            }
            catch (err) {
                console.error('[ng-click-outside] Check your exclude selector syntax.', err);
            }
        }
    };
    ClickOutsideDirective.prototype._onClickBody = function (ev) {
        if (!this.clickOutsideEnabled) {
            return;
        }
        if (this.excludeBeforeClick) {
            this._excludeCheck();
        }
        if (!this._el.nativeElement.contains(ev.target) && !this._shouldExclude(ev.target)) {
            this._emit(ev);
            if (this.attachOutsideOnClick) {
                this._removeClickOutsideListener();
            }
        }
    };
    ClickOutsideDirective.prototype._onWindowBlur = function (ev) {
        var _this = this;
        setTimeout(function () {
            if (!document.hidden) {
                _this._emit(ev);
            }
        });
    };
    ClickOutsideDirective.prototype._emit = function (ev) {
        var _this = this;
        if (!this.clickOutsideEnabled) {
            return;
        }
        this._ngZone.run(function () { return _this.clickOutside.emit(ev); });
    };
    ClickOutsideDirective.prototype._shouldExclude = function (target) {
        for (var _i = 0, _a = this._nodesExcluded; _i < _a.length; _i++) {
            var excludedNode = _a[_i];
            if (excludedNode.contains(target)) {
                return true;
            }
        }
        return false;
    };
    ClickOutsideDirective.prototype._initClickOutsideListener = function () {
        var _this = this;
        this._ngZone.runOutsideAngular(function () {
            _this._events.forEach(function (e) { return document.addEventListener(e, _this._onClickBody); });
        });
    };
    ClickOutsideDirective.prototype._removeClickOutsideListener = function () {
        var _this = this;
        this._ngZone.runOutsideAngular(function () {
            _this._events.forEach(function (e) { return document.removeEventListener(e, _this._onClickBody); });
        });
    };
    ClickOutsideDirective.prototype._initAttachOutsideOnClickListener = function () {
        var _this = this;
        this._ngZone.runOutsideAngular(function () {
            _this._events.forEach(function (e) { return _this._el.nativeElement.addEventListener(e, _this._initOnClickBody); });
        });
    };
    ClickOutsideDirective.prototype._removeAttachOutsideOnClickListener = function () {
        var _this = this;
        this._ngZone.runOutsideAngular(function () {
            _this._events.forEach(function (e) { return _this._el.nativeElement.removeEventListener(e, _this._initOnClickBody); });
        });
    };
    ClickOutsideDirective.prototype._initWindowBlurListener = function () {
        var _this = this;
        this._ngZone.runOutsideAngular(function () {
            window.addEventListener('blur', _this._onWindowBlur);
        });
    };
    ClickOutsideDirective.prototype._removeWindowBlurListener = function () {
        var _this = this;
        this._ngZone.runOutsideAngular(function () {
            window.removeEventListener('blur', _this._onWindowBlur);
        });
    };
    ClickOutsideDirective.decorators = [
        { type: core_1.Directive, args: [{ selector: '[clickOutside]' },] }
    ];
    ClickOutsideDirective.ctorParameters = function () { return [
        { type: core_1.ElementRef },
        { type: core_1.NgZone },
        { type: Object, decorators: [{ type: core_1.Inject, args: [core_1.PLATFORM_ID,] }] }
    ]; };
    ClickOutsideDirective.propDecorators = {
        clickOutsideEnabled: [{ type: core_1.Input }],
        attachOutsideOnClick: [{ type: core_1.Input }],
        delayClickOutsideInit: [{ type: core_1.Input }],
        emitOnBlur: [{ type: core_1.Input }],
        exclude: [{ type: core_1.Input }],
        excludeBeforeClick: [{ type: core_1.Input }],
        clickOutsideEvents: [{ type: core_1.Input }],
        clickOutside: [{ type: core_1.Output }]
    };
    return ClickOutsideDirective;
}());
exports.ClickOutsideDirective = ClickOutsideDirective;
