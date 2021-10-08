(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('rxjs'), require('@angular/common'), require('@angular/platform-browser'), require('rxjs/operators'), require('@angular/router'), require('@angular/common/http')) :
    typeof define === 'function' && define.amd ? define('ngx-ui-loader', ['exports', '@angular/core', 'rxjs', '@angular/common', '@angular/platform-browser', 'rxjs/operators', '@angular/router', '@angular/common/http'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global['ngx-ui-loader'] = {}, global.ng.core, global.rxjs, global.ng.common, global.ng.platformBrowser, global.rxjs.operators, global.ng.router, global.ng.common.http));
}(this, (function (exports, i0, rxjs, common, platformBrowser, operators, router, http) { 'use strict';

    /* eslint-disable @typescript-eslint/naming-convention */
    (function (SPINNER) {
        SPINNER["ballScaleMultiple"] = "ball-scale-multiple";
        SPINNER["ballSpin"] = "ball-spin";
        SPINNER["ballSpinClockwise"] = "ball-spin-clockwise";
        SPINNER["ballSpinClockwiseFadeRotating"] = "ball-spin-clockwise-fade-rotating";
        SPINNER["ballSpinFadeRotating"] = "ball-spin-fade-rotating";
        SPINNER["chasingDots"] = "chasing-dots";
        SPINNER["circle"] = "circle";
        SPINNER["cubeGrid"] = "cube-grid";
        SPINNER["doubleBounce"] = "double-bounce";
        SPINNER["fadingCircle"] = "fading-circle";
        SPINNER["foldingCube"] = "folding-cube";
        SPINNER["pulse"] = "pulse";
        SPINNER["rectangleBounce"] = "rectangle-bounce";
        SPINNER["rectangleBounceParty"] = "rectangle-bounce-party";
        SPINNER["rectangleBouncePulseOut"] = "rectangle-bounce-pulse-out";
        SPINNER["rectangleBouncePulseOutRapid"] = "rectangle-bounce-pulse-out-rapid";
        SPINNER["rotatingPlane"] = "rotating-plane";
        SPINNER["squareJellyBox"] = "square-jelly-box";
        SPINNER["squareLoader"] = "square-loader";
        SPINNER["threeBounce"] = "three-bounce";
        SPINNER["threeStrings"] = "three-strings";
        SPINNER["wanderingCubes"] = "wandering-cubes";
    })(exports.SPINNER || (exports.SPINNER = {}));
    (function (POSITION) {
        POSITION["bottomCenter"] = "bottom-center";
        POSITION["bottomLeft"] = "bottom-left";
        POSITION["bottomRight"] = "bottom-right";
        POSITION["centerCenter"] = "center-center";
        POSITION["centerLeft"] = "center-left";
        POSITION["centerRight"] = "center-right";
        POSITION["topCenter"] = "top-center";
        POSITION["topLeft"] = "top-left";
        POSITION["topRight"] = "top-right";
    })(exports.POSITION || (exports.POSITION = {}));
    (function (PB_DIRECTION) {
        PB_DIRECTION["leftToRight"] = "ltr";
        PB_DIRECTION["rightToLeft"] = "rtl";
    })(exports.PB_DIRECTION || (exports.PB_DIRECTION = {}));

    /**
     * The default value of foreground task id
     */
    var DEFAULT_FG_TASK_ID = 'fg-default';
    /**
     * The default value of background task id
     */
    var DEFAULT_BG_TASK_ID = 'bg-default';
    /**
     * The default value of loader id
     */
    var DEFAULT_MASTER_LOADER_ID = 'master';
    var DEFAULT_TIME = {};
    var MIN_DELAY = 0;
    var MIN_TIME = 0;
    var CLOSING_TIME = 1001;
    var FAST_CLOSING_TIME = 601;
    var BACKGROUND = false;
    var FOREGROUND = true;
    var OVERLAY_DISAPPEAR_TIME = 500;
    var FAST_OVERLAY_DISAPPEAR_TIME = 300;
    /**
     * Http loader taskId
     */
    var HTTP_LOADER_TASK_ID = '$_http-loader';
    /**
     * Router loader taskId
     */
    var ROUTER_LOADER_TASK_ID = '$_router_loader';
    /**
     * The configuration of spinners
     */
    var SPINNER_CONFIG = {
        'ball-scale-multiple': {
            divs: 3,
            class: 'sk-ball-scale-multiple',
        },
        'ball-spin': {
            divs: 8,
            class: 'sk-ball-spin',
        },
        'ball-spin-clockwise': {
            divs: 8,
            class: 'sk-ball-spin-clockwise',
        },
        'ball-spin-clockwise-fade-rotating': {
            divs: 8,
            class: 'sk-ball-spin-clockwise-fade-rotating',
        },
        'ball-spin-fade-rotating': {
            divs: 8,
            class: 'sk-ball-spin-fade-rotating',
        },
        'chasing-dots': {
            divs: 2,
            class: 'sk-chasing-dots',
        },
        circle: {
            divs: 12,
            class: 'sk-circle',
        },
        'cube-grid': {
            divs: 9,
            class: 'sk-cube-grid',
        },
        'double-bounce': {
            divs: 2,
            class: 'sk-double-bounce',
        },
        'fading-circle': {
            divs: 12,
            class: 'sk-fading-circle',
        },
        'folding-cube': {
            divs: 4,
            class: 'sk-folding-cube',
        },
        pulse: {
            divs: 1,
            class: 'sk-pulse',
        },
        'rectangle-bounce': {
            divs: 5,
            class: 'sk-rectangle-bounce',
        },
        'rectangle-bounce-party': {
            divs: 5,
            class: 'sk-rectangle-bounce-party',
        },
        'rectangle-bounce-pulse-out': {
            divs: 5,
            class: 'sk-rectangle-bounce-pulse-out',
        },
        'rectangle-bounce-pulse-out-rapid': {
            divs: 5,
            class: 'sk-rectangle-bounce-pulse-out-rapid',
        },
        'rotating-plane': {
            divs: 1,
            class: 'sk-rotating-plane',
        },
        'square-jelly-box': {
            divs: 2,
            class: 'sk-square-jelly-box',
        },
        'square-loader': {
            divs: 1,
            class: 'sk-square-loader',
        },
        'three-bounce': {
            divs: 3,
            class: 'sk-three-bounce',
        },
        'three-strings': {
            divs: 3,
            class: 'sk-three-strings',
        },
        'wandering-cubes': {
            divs: 2,
            class: 'sk-wandering-cubes',
        },
    };
    /**
     * The default configuration of ngx-ui-loader
     */
    var DEFAULT_CONFIG = {
        bgsColor: '#00ACC1',
        bgsOpacity: 0.5,
        bgsPosition: exports.POSITION.bottomRight,
        bgsSize: 60,
        bgsType: exports.SPINNER.ballSpinClockwise,
        blur: 5,
        delay: 0,
        fastFadeOut: false,
        fgsColor: '#00ACC1',
        fgsPosition: exports.POSITION.centerCenter,
        fgsSize: 60,
        fgsType: exports.SPINNER.ballSpinClockwise,
        gap: 24,
        logoPosition: exports.POSITION.centerCenter,
        logoSize: 120,
        logoUrl: '',
        masterLoaderId: DEFAULT_MASTER_LOADER_ID,
        overlayBorderRadius: '0',
        overlayColor: 'rgba(40, 40, 40, 0.8)',
        pbColor: '#00ACC1',
        pbDirection: exports.PB_DIRECTION.leftToRight,
        pbThickness: 3,
        hasProgressBar: true,
        text: '',
        textColor: '#FFFFFF',
        textPosition: exports.POSITION.centerCenter,
        maxTime: -1,
        minTime: 300,
    };

    /**
     * Injection token for ngx-ui-loader configuration
     */
    var NGX_UI_LOADER_CONFIG_TOKEN = new i0.InjectionToken('ngxUiLoaderCustom.config');

    var NgxUiLoaderService = /** @class */ (function () {
        /**
         * Constructor
         */
        function NgxUiLoaderService(config) {
            this.config = config;
            this.defaultConfig = Object.assign({}, DEFAULT_CONFIG);
            if (this.config) {
                if (this.config.minTime && this.config.minTime < MIN_TIME) {
                    this.config.minTime = MIN_TIME;
                }
                this.defaultConfig = Object.assign(Object.assign({}, this.defaultConfig), this.config);
            }
            this.loaders = {};
            this.showForeground = new rxjs.BehaviorSubject({
                loaderId: '',
                isShow: false,
            });
            this.showForeground$ = this.showForeground.asObservable();
            this.showBackground = new rxjs.BehaviorSubject({
                loaderId: '',
                isShow: false,
            });
            this.showBackground$ = this.showBackground.asObservable();
            this.fgClosing = new rxjs.BehaviorSubject({
                loaderId: '',
                isShow: false,
            });
            this.foregroundClosing$ = this.fgClosing.asObservable();
            this.bgClosing = new rxjs.BehaviorSubject({
                loaderId: '',
                isShow: false,
            });
            this.backgroundClosing$ = this.bgClosing.asObservable();
        }
        /**
         * For internal use only.
         *
         * @docs-private
         */
        NgxUiLoaderService.prototype.bindLoaderData = function (loaderId) {
            var isMaster = loaderId === this.defaultConfig.masterLoaderId;
            if (this.loaders[loaderId]) {
                if (this.loaders[loaderId].isBound) {
                    throw new Error("[ngx-ui-loader] - loaderId \"" + loaderId + "\" is duplicated.");
                }
                this.loaders[loaderId].isBound = true;
                this.loaders[loaderId].isMaster = isMaster;
                // emit showEvent after data loader is bound
                if (this.hasRunningTask(FOREGROUND, loaderId)) {
                    this.showForeground.next({ loaderId: loaderId, isShow: true });
                }
                else {
                    if (this.hasRunningTask(BACKGROUND, loaderId)) {
                        this.showBackground.next({ loaderId: loaderId, isShow: true });
                    }
                }
            }
            else {
                this.createLoaderData(loaderId, isMaster, true);
            }
        };
        /**
         * For internal use only.
         *
         * @docs-private
         */
        NgxUiLoaderService.prototype.destroyLoaderData = function (loaderId) {
            this.stopAllLoader(loaderId);
            delete this.loaders[loaderId];
        };
        /**
         * Get default loader configuration
         *
         * @returns default configuration object
         */
        NgxUiLoaderService.prototype.getDefaultConfig = function () {
            return Object.assign({}, this.defaultConfig);
        };
        /**
         * Get all the loaders
         */
        NgxUiLoaderService.prototype.getLoaders = function () {
            return JSON.parse(JSON.stringify(this.loaders));
        };
        /**
         * Get data of a specified loader. If loaderId is not provided, it will return data of
         * master loader(if existed). Otherwise null is returned.
         */
        NgxUiLoaderService.prototype.getLoader = function (loaderId) {
            loaderId = loaderId ? loaderId : this.defaultConfig.masterLoaderId;
            if (this.loaders[loaderId]) {
                return JSON.parse(JSON.stringify(this.loaders[loaderId]));
            }
            return null;
        };
        /**
         * Start the foreground loading of loader having `loaderId` with a specified `taskId`.
         * The loading is only closed off when all taskIds of that loader are called with stopLoader() method.
         *
         * @param loaderId the loader Id
         * @param taskId the optional task Id of the loading. taskId is set to 'fd-default' by default.
         */
        NgxUiLoaderService.prototype.startLoader = function (loaderId, taskId, time) {
            if (taskId === void 0) { taskId = DEFAULT_FG_TASK_ID; }
            if (!this.readyToStart(loaderId, taskId, true, time)) {
                return;
            }
            if (!this.loaders[loaderId].tasks[taskId].isOtherRunning) {
                // no other foreground task running
                if (this.hasRunningTask(BACKGROUND, loaderId)) {
                    this.backgroundCloseout(loaderId);
                    this.showBackground.next({ loaderId: loaderId, isShow: false });
                }
                this.showForeground.next({ loaderId: loaderId, isShow: true });
            }
        };
        /**
         * Start the foreground loading of master loader with a specified `taskId`.
         * The loading is only closed off when all taskIds of that loader are called with stop() method.
         * NOTE: Really this function just wraps startLoader() function
         *
         * @param taskId the optional task Id of the loading. taskId is set to 'fd-default' by default.
         */
        NgxUiLoaderService.prototype.start = function (taskId, time) {
            if (taskId === void 0) { taskId = DEFAULT_FG_TASK_ID; }
            this.startLoader(this.defaultConfig.masterLoaderId, taskId, time);
        };
        /**
         * Start the background loading of loader having `loaderId` with a specified `taskId`.
         * The loading is only closed off when all taskIds of that loader are called with stopLoaderBackground() method.
         *
         * @param loaderId the loader Id
         * @param taskId the optional task Id of the loading. taskId is set to 'bg-default' by default.
         */
        NgxUiLoaderService.prototype.startBackgroundLoader = function (loaderId, taskId, time) {
            if (taskId === void 0) { taskId = DEFAULT_BG_TASK_ID; }
            if (!this.readyToStart(loaderId, taskId, false, time)) {
                return;
            }
            if (!this.hasRunningTask(FOREGROUND, loaderId) &&
                !this.loaders[loaderId].tasks[taskId].isOtherRunning) {
                this.showBackground.next({ loaderId: loaderId, isShow: true });
            }
        };
        /**
         * Start the background loading of master loader with a specified `taskId`.
         * The loading is only closed off when all taskIds of that loader are called with stopBackground() method.
         * NOTE: Really this function just wraps startBackgroundLoader() function
         *
         * @param taskId the optional task Id of the loading. taskId is set to 'bg-default' by default.
         */
        NgxUiLoaderService.prototype.startBackground = function (taskId, time) {
            if (taskId === void 0) { taskId = DEFAULT_BG_TASK_ID; }
            this.startBackgroundLoader(this.defaultConfig.masterLoaderId, taskId, time);
        };
        /**
         * Stop a foreground loading of loader having `loaderId` with specific `taskId`
         *
         * @param loaderId the loader Id
         * @param taskId the optional task Id to stop. If not provided, 'fg-default' is used.
         * @returns Object
         */
        NgxUiLoaderService.prototype.stopLoader = function (loaderId, taskId) {
            var _this = this;
            if (taskId === void 0) { taskId = DEFAULT_FG_TASK_ID; }
            if (!this.readyToStop(loaderId, taskId)) {
                return;
            }
            if (!this.hasRunningTask(FOREGROUND, loaderId)) {
                this.foregroundCloseout(loaderId);
                this.showForeground.next({ loaderId: loaderId, isShow: false });
                if (this.hasRunningTask(BACKGROUND, loaderId)) {
                    setTimeout(function () {
                        if (_this.hasRunningTask(BACKGROUND, loaderId)) {
                            // still have background tasks
                            _this.showBackground.next({ loaderId: loaderId, isShow: true });
                        }
                    }, this.defaultConfig.fastFadeOut
                        ? FAST_OVERLAY_DISAPPEAR_TIME
                        : OVERLAY_DISAPPEAR_TIME);
                }
            }
        };
        /**
         * Stop a foreground loading of master loader with specific `taskId`
         *
         * @param taskId the optional task Id to stop. If not provided, 'fg-default' is used.
         * @returns Object
         */
        NgxUiLoaderService.prototype.stop = function (taskId) {
            if (taskId === void 0) { taskId = DEFAULT_FG_TASK_ID; }
            this.stopLoader(this.defaultConfig.masterLoaderId, taskId);
        };
        /**
         * Stop a background loading of loader having `loaderId` with specific `taskId`
         *
         * @param loaderId the loader Id
         * @param taskId the optional task Id to stop. If not provided, 'bg-default' is used.
         * @returns Object
         */
        NgxUiLoaderService.prototype.stopBackgroundLoader = function (loaderId, taskId) {
            if (taskId === void 0) { taskId = DEFAULT_BG_TASK_ID; }
            if (!this.readyToStop(loaderId, taskId)) {
                return;
            }
            if (!this.hasRunningTask(FOREGROUND, loaderId) &&
                !this.hasRunningTask(BACKGROUND, loaderId)) {
                this.backgroundCloseout(loaderId);
                this.showBackground.next({ loaderId: loaderId, isShow: false });
            }
        };
        /**
         * Stop a background loading of master loader with specific taskId
         *
         * @param taskId the optional task Id to stop. If not provided, 'bg-default' is used.
         * @returns Object
         */
        NgxUiLoaderService.prototype.stopBackground = function (taskId) {
            if (taskId === void 0) { taskId = DEFAULT_BG_TASK_ID; }
            this.stopBackgroundLoader(this.defaultConfig.masterLoaderId, taskId);
        };
        /**
         * Stop all the background and foreground loadings of loader having `loaderId`
         *
         * @param loaderId the loader Id
         */
        NgxUiLoaderService.prototype.stopAllLoader = function (loaderId) {
            if (!this.loaders[loaderId]) {
                console.warn("[ngx-ui-loader] - loaderId \"" + loaderId + "\" does not exist.");
                return;
            }
            if (this.hasRunningTask(FOREGROUND, loaderId)) {
                this.foregroundCloseout(loaderId);
                this.showForeground.next({ loaderId: loaderId, isShow: false });
            }
            else if (this.hasRunningTask(BACKGROUND, loaderId)) {
                this.backgroundCloseout(loaderId);
                this.showBackground.next({ loaderId: loaderId, isShow: false });
            }
            this.clearAllTimers(this.loaders[loaderId].tasks);
            this.loaders[loaderId].tasks = {};
        };
        /**
         * Stop all the background and foreground loadings of master loader
         */
        NgxUiLoaderService.prototype.stopAll = function () {
            this.stopAllLoader(this.defaultConfig.masterLoaderId);
        };
        /**
         * Check whether the specified loader has a running task with the given `taskId`.
         * If no `taskId` specified, it will check whether the loader has any running tasks.
         * For internal use only.
         *
         * @docs-private
         * @param isForeground foreground task or background task
         * @param loaderId the loader Id
         * @param taskId the optional task Id
         * @returns boolean
         */
        NgxUiLoaderService.prototype.hasRunningTask = function (isForeground, loaderId, taskId) {
            if (this.loaders[loaderId]) {
                var tasks_1 = this.loaders[loaderId].tasks;
                if (taskId) {
                    return tasks_1[taskId] ? (tasks_1[taskId].startAt ? true : false) : false;
                }
                return Object.keys(tasks_1).some(function (id) { return !!tasks_1[id].startAt && tasks_1[id].isForeground === isForeground; });
            }
            return false;
        };
        /**
         * Create loader data if it does not exist
         *
         * @docs-private
         */
        NgxUiLoaderService.prototype.createLoaderData = function (loaderId, isMaster, isBound) {
            if (!this.loaders[loaderId]) {
                this.loaders[loaderId] = {
                    loaderId: loaderId,
                    tasks: {},
                    isMaster: isMaster,
                    isBound: isBound,
                };
            }
        };
        /**
         * Manage to close foreground loading
         *
         * @docs-private
         * @param loaderId the loader id
         */
        NgxUiLoaderService.prototype.foregroundCloseout = function (loaderId) {
            var _this = this;
            this.fgClosing.next({ loaderId: loaderId, isShow: true });
            setTimeout(function () {
                _this.fgClosing.next({ loaderId: loaderId, isShow: false });
            }, this.defaultConfig.fastFadeOut ? FAST_CLOSING_TIME : CLOSING_TIME);
        };
        /**
         * Manage to close background loading
         *
         * @docs-private
         * @param loaderId the loader id
         */
        NgxUiLoaderService.prototype.backgroundCloseout = function (loaderId) {
            var _this = this;
            this.bgClosing.next({ loaderId: loaderId, isShow: true });
            setTimeout(function () {
                _this.bgClosing.next({ loaderId: loaderId, isShow: false });
            }, this.defaultConfig.fastFadeOut ? FAST_CLOSING_TIME : CLOSING_TIME);
        };
        /**
         * Clear all timers of the given task
         *
         * @docs-private
         */
        NgxUiLoaderService.prototype.clearTimers = function (task) {
            clearTimeout(task.delayTimer);
            clearTimeout(task.maxTimer);
            clearTimeout(task.minTimer);
        };
        /**
         * Clear all timers of the given tasks
         *
         * @docs-private
         */
        NgxUiLoaderService.prototype.clearAllTimers = function (tasks) {
            var _this = this;
            Object.keys(tasks).map(function (id) {
                _this.clearTimers(tasks[id]);
            });
        };
        /**
         * @docs-private
         */
        NgxUiLoaderService.prototype.readyToStart = function (loaderId, taskId, isForeground, time) {
            if (time === void 0) { time = DEFAULT_TIME; }
            this.createLoaderData(loaderId, undefined, false);
            var isOtherRunning = this.hasRunningTask(isForeground, loaderId);
            if (!this.loaders[loaderId].tasks[taskId]) {
                this.loaders[loaderId].tasks[taskId] = {
                    taskId: taskId,
                    isForeground: isForeground,
                    minTime: time.minTime >= MIN_TIME ? time.minTime : this.defaultConfig.minTime,
                    maxTime: time.maxTime ? time.maxTime : this.defaultConfig.maxTime,
                    delay: time.delay >= MIN_DELAY ? time.delay : this.defaultConfig.delay,
                };
            }
            else {
                if (this.loaders[loaderId].tasks[taskId].isForeground !== isForeground) {
                    throw new Error("[ngx-ui-loader] - taskId \"" + taskId + "\" is duplicated.");
                }
            }
            if (this.setDelayTimer(this.loaders[loaderId].tasks[taskId], loaderId)) {
                return false;
            }
            this.loaders[loaderId].tasks[taskId] = Object.assign(Object.assign({}, this.loaders[loaderId].tasks[taskId]), { isOtherRunning: isOtherRunning, startAt: Date.now() });
            this.setMaxTimer(this.loaders[loaderId].tasks[taskId], loaderId);
            if (!this.loaders[loaderId].isBound) {
                return false;
            }
            return true;
        };
        /**
         * @docs-private
         */
        NgxUiLoaderService.prototype.readyToStop = function (loaderId, taskId) {
            if (!this.loaders[loaderId]) {
                console.warn("[ngx-ui-loader] - loaderId \"" + loaderId + "\" does not exist.");
                return false;
            }
            var task = this.loaders[loaderId].tasks[taskId];
            if (!task) {
                return false;
            }
            if (task.isDelayed) {
                this.clearTimers(task);
                delete this.loaders[loaderId].tasks[taskId];
                return false;
            }
            if (this.setMinTimer(task, loaderId)) {
                return false;
            }
            this.clearTimers(task);
            delete this.loaders[loaderId].tasks[taskId];
            return true;
        };
        /**
         * Set delay timer, if `delay` > 0
         *
         * @docs-private
         * @returns boolean
         */
        NgxUiLoaderService.prototype.setDelayTimer = function (task, loaderId) {
            var _this = this;
            if (task.delay > MIN_DELAY) {
                if (task.isDelayed) {
                    return true;
                }
                if (!task.delayTimer) {
                    task.isDelayed = true;
                    task.delayTimer = setTimeout(function () {
                        task.isDelayed = false;
                        if (task.isForeground) {
                            _this.startLoader(loaderId, task.taskId);
                        }
                        else {
                            _this.startBackgroundLoader(loaderId, task.taskId);
                        }
                    }, task.delay);
                    return true;
                }
            }
            return false;
        };
        /**
         * Set maxTimer if `maxTime` > `minTime`
         *
         * @docs-private
         * @returns boolean
         */
        NgxUiLoaderService.prototype.setMaxTimer = function (task, loaderId) {
            var _this = this;
            if (task.maxTime > task.minTime) {
                // restart the task, reset maxTimer
                clearTimeout(task.maxTimer);
                task.maxTimer = setTimeout(function () {
                    if (task.isForeground) {
                        _this.stopLoader(loaderId, task.taskId);
                    }
                    else {
                        _this.stopBackgroundLoader(loaderId, task.taskId);
                    }
                }, task.maxTime);
            }
        };
        /**
         * Set minTimer if `startAt` + `minTime` > `Date.now()`
         *
         * @docs-private
         * @returns boolean
         */
        NgxUiLoaderService.prototype.setMinTimer = function (task, loaderId) {
            var _this = this;
            var now = Date.now();
            if (task.startAt) {
                if (task.startAt + task.minTime > now) {
                    task.minTimer = setTimeout(function () {
                        if (task.isForeground) {
                            _this.stopLoader(loaderId, task.taskId);
                        }
                        else {
                            _this.stopBackgroundLoader(loaderId, task.taskId);
                        }
                    }, task.startAt + task.minTime - now);
                    return true;
                }
            }
            return false;
        };
        return NgxUiLoaderService;
    }());
    NgxUiLoaderService.ɵprov = i0.ɵɵdefineInjectable({ factory: function NgxUiLoaderService_Factory() { return new NgxUiLoaderService(i0.ɵɵinject(NGX_UI_LOADER_CONFIG_TOKEN, 8)); }, token: NgxUiLoaderService, providedIn: "root" });
    NgxUiLoaderService.decorators = [
        { type: i0.Injectable, args: [{
                    providedIn: 'root',
                },] }
    ];
    NgxUiLoaderService.ctorParameters = function () { return [
        { type: undefined, decorators: [{ type: i0.Optional }, { type: i0.Inject, args: [NGX_UI_LOADER_CONFIG_TOKEN,] }] }
    ]; };

    /* eslint-disable @angular-eslint/component-selector */
    var NgxUiLoaderComponent = /** @class */ (function () {
        /**
         * Constructor
         */
        function NgxUiLoaderComponent(domSanitizer, changeDetectorRef, ngxService) {
            this.domSanitizer = domSanitizer;
            this.changeDetectorRef = changeDetectorRef;
            this.ngxService = ngxService;
            this.initialized = false;
            this.defaultConfig = this.ngxService.getDefaultConfig();
            this.bgsColor = this.defaultConfig.bgsColor;
            this.bgsOpacity = this.defaultConfig.bgsOpacity;
            this.bgsPosition = this.defaultConfig.bgsPosition;
            this.bgsSize = this.defaultConfig.bgsSize;
            this.bgsType = this.defaultConfig.bgsType;
            this.fastFadeOut = this.defaultConfig.fastFadeOut;
            this.fgsColor = this.defaultConfig.fgsColor;
            this.fgsPosition = this.defaultConfig.fgsPosition;
            this.fgsSize = this.defaultConfig.fgsSize;
            this.fgsType = this.defaultConfig.fgsType;
            this.gap = this.defaultConfig.gap;
            this.loaderId = this.defaultConfig.masterLoaderId;
            this.logoPosition = this.defaultConfig.logoPosition;
            this.logoSize = this.defaultConfig.logoSize;
            this.logoUrl = this.defaultConfig.logoUrl;
            this.overlayBorderRadius = this.defaultConfig.overlayBorderRadius;
            this.overlayColor = this.defaultConfig.overlayColor;
            this.pbColor = this.defaultConfig.pbColor;
            this.pbDirection = this.defaultConfig.pbDirection;
            this.pbThickness = this.defaultConfig.pbThickness;
            this.hasProgressBar = this.defaultConfig.hasProgressBar;
            this.text = this.defaultConfig.text;
            this.textColor = this.defaultConfig.textColor;
            this.textPosition = this.defaultConfig.textPosition;
        }
        /**
         * On init event
         */
        NgxUiLoaderComponent.prototype.ngOnInit = function () {
            var _this = this;
            this.initializeSpinners();
            this.ngxService.bindLoaderData(this.loaderId);
            this.determinePositions();
            this.trustedLogoUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(this.logoUrl);
            this.showForegroundWatcher = this.ngxService.showForeground$
                .pipe(operators.filter(function (showEvent) { return _this.loaderId === showEvent.loaderId; }))
                .subscribe(function (data) {
                _this.showForeground = data.isShow;
                _this.changeDetectorRef.markForCheck();
            });
            this.showBackgroundWatcher = this.ngxService.showBackground$
                .pipe(operators.filter(function (showEvent) { return _this.loaderId === showEvent.loaderId; }))
                .subscribe(function (data) {
                _this.showBackground = data.isShow;
                _this.changeDetectorRef.markForCheck();
            });
            this.foregroundClosingWatcher = this.ngxService.foregroundClosing$
                .pipe(operators.filter(function (showEvent) { return _this.loaderId === showEvent.loaderId; }))
                .subscribe(function (data) {
                _this.foregroundClosing = data.isShow;
                _this.changeDetectorRef.markForCheck();
            });
            this.backgroundClosingWatcher = this.ngxService.backgroundClosing$
                .pipe(operators.filter(function (showEvent) { return _this.loaderId === showEvent.loaderId; }))
                .subscribe(function (data) {
                _this.backgroundClosing = data.isShow;
                _this.changeDetectorRef.markForCheck();
            });
            this.initialized = true;
        };
        /**
         * On changes event
         */
        NgxUiLoaderComponent.prototype.ngOnChanges = function (changes) {
            if (!this.initialized) {
                return;
            }
            var bgsTypeChange = changes.bgsType;
            var fgsTypeChange = changes.fgsType;
            var logoUrlChange = changes.logoUrl;
            if (fgsTypeChange || bgsTypeChange) {
                this.initializeSpinners();
            }
            this.determinePositions();
            if (logoUrlChange) {
                this.trustedLogoUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(this.logoUrl);
            }
        };
        /**
         * On destroy event
         */
        NgxUiLoaderComponent.prototype.ngOnDestroy = function () {
            this.ngxService.destroyLoaderData(this.loaderId);
            if (this.showForegroundWatcher) {
                this.showForegroundWatcher.unsubscribe();
            }
            if (this.showBackgroundWatcher) {
                this.showBackgroundWatcher.unsubscribe();
            }
            if (this.foregroundClosingWatcher) {
                this.foregroundClosingWatcher.unsubscribe();
            }
            if (this.backgroundClosingWatcher) {
                this.backgroundClosingWatcher.unsubscribe();
            }
        };
        /**
         * Initialize spinners
         */
        NgxUiLoaderComponent.prototype.initializeSpinners = function () {
            this.fgDivs = Array(SPINNER_CONFIG[this.fgsType].divs).fill(1);
            this.fgSpinnerClass = SPINNER_CONFIG[this.fgsType].class;
            this.bgDivs = Array(SPINNER_CONFIG[this.bgsType].divs).fill(1);
            this.bgSpinnerClass = SPINNER_CONFIG[this.bgsType].class;
        };
        /**
         * Determine the positions of spinner, logo and text
         */
        NgxUiLoaderComponent.prototype.determinePositions = function () {
            this.logoTop = 'initial';
            this.spinnerTop = 'initial';
            this.textTop = 'initial';
            var textSize = 24;
            if (this.logoPosition.startsWith('center')) {
                this.logoTop = '50%';
            }
            else if (this.logoPosition.startsWith('top')) {
                this.logoTop = '30px';
            }
            if (this.fgsPosition.startsWith('center')) {
                this.spinnerTop = '50%';
            }
            else if (this.fgsPosition.startsWith('top')) {
                this.spinnerTop = '30px';
            }
            if (this.textPosition.startsWith('center')) {
                this.textTop = '50%';
            }
            else if (this.textPosition.startsWith('top')) {
                this.textTop = '30px';
            }
            if (this.fgsPosition === exports.POSITION.centerCenter) {
                if (this.logoUrl && this.logoPosition === exports.POSITION.centerCenter) {
                    if (this.text && this.textPosition === exports.POSITION.centerCenter) {
                        // logo, spinner and text
                        this.logoTop = this.domSanitizer.bypassSecurityTrustStyle("calc(50% - " + this.fgsSize / 2 + "px - " + textSize / 2 + "px - " + this.gap + "px)");
                        this.spinnerTop = this.domSanitizer.bypassSecurityTrustStyle("calc(50% + " + this.logoSize / 2 + "px - " + textSize / 2 + "px)");
                        this.textTop = this.domSanitizer.bypassSecurityTrustStyle("calc(50% + " + this.logoSize / 2 + "px + " + this.gap + "px + " + this.fgsSize / 2 + "px)");
                    }
                    else {
                        // logo and spinner
                        this.logoTop = this.domSanitizer.bypassSecurityTrustStyle("calc(50% - " + this.fgsSize / 2 + "px - " + this.gap / 2 + "px)");
                        this.spinnerTop = this.domSanitizer.bypassSecurityTrustStyle("calc(50% + " + this.logoSize / 2 + "px + " + this.gap / 2 + "px)");
                    }
                }
                else {
                    if (this.text && this.textPosition === exports.POSITION.centerCenter) {
                        // spinner and text
                        this.spinnerTop = this.domSanitizer.bypassSecurityTrustStyle("calc(50% - " + textSize / 2 + "px - " + this.gap / 2 + "px)");
                        this.textTop = this.domSanitizer.bypassSecurityTrustStyle("calc(50% + " + this.fgsSize / 2 + "px + " + this.gap / 2 + "px)");
                    }
                }
            }
            else {
                if (this.logoUrl &&
                    this.logoPosition === exports.POSITION.centerCenter &&
                    this.text &&
                    this.textPosition === exports.POSITION.centerCenter) {
                    // logo and text
                    this.logoTop = this.domSanitizer.bypassSecurityTrustStyle("calc(50% - " + textSize / 2 + "px - " + this.gap / 2 + "px)");
                    this.textTop = this.domSanitizer.bypassSecurityTrustStyle("calc(50% + " + this.logoSize / 2 + "px + " + this.gap / 2 + "px)");
                }
            }
        };
        return NgxUiLoaderComponent;
    }());
    NgxUiLoaderComponent.decorators = [
        { type: i0.Component, args: [{
                    selector: 'ngx-ui-loader',
                    template: "<!-- Progress bar {{{ -->\n<div\n  *ngIf=\"hasProgressBar\"\n  class=\"ngx-progress-bar\"\n  [class.ngx-position-absolute]=\"loaderId !== defaultConfig.masterLoaderId\"\n  [ngClass]=\"'ngx-progress-bar-' + pbDirection\"\n  [style.height.px]=\"pbThickness\"\n  [style.color]=\"pbColor\"\n  [class.loading-foreground]=\"showForeground\"\n  [class.foreground-closing]=\"foregroundClosing\"\n  [class.fast-closing]=\"foregroundClosing && fastFadeOut\"\n></div>\n<!-- Progress bar }}} -->\n\n<!-- Foreground container {{{ -->\n<div\n  class=\"ngx-overlay\"\n  [class.ngx-position-absolute]=\"loaderId !== defaultConfig.masterLoaderId\"\n  [style.background-color]=\"overlayColor\"\n  [style.border-radius]=\"overlayBorderRadius\"\n  [class.loading-foreground]=\"showForeground\"\n  [class.foreground-closing]=\"foregroundClosing\"\n  [class.fast-closing]=\"foregroundClosing && fastFadeOut\"\n>\n  <!-- Logo {{{ -->\n  <img\n    *ngIf=\"logoUrl\"\n    class=\"ngx-loading-logo\"\n    [ngClass]=\"logoPosition\"\n    [src]=\"trustedLogoUrl\"\n    [style.width.px]=\"logoSize\"\n    [style.height.px]=\"logoSize\"\n    [style.top]=\"logoTop\"\n  />\n  <!-- Logo }}} -->\n\n  <!-- Foreground spinner {{{ -->\n  <div\n    class=\"ngx-foreground-spinner\"\n    [ngClass]=\"fgsPosition\"\n    [style.color]=\"fgsColor\"\n    [style.width.px]=\"fgsSize\"\n    [style.height.px]=\"fgsSize\"\n    [style.top]=\"spinnerTop\"\n  >\n    <div *ngIf=\"!fgsTemplate; else foregroundTemplate\" [class]=\"fgSpinnerClass\">\n      <div *ngFor=\"let div of fgDivs\"></div>\n    </div>\n    <ng-template #foregroundTemplate>\n      <ng-container *ngTemplateOutlet=\"fgsTemplate\"></ng-container>\n    </ng-template>\n  </div>\n  <!-- Foreground spinner }}} -->\n\n  <!-- Loading text {{{ -->\n  <div class=\"ngx-loading-text\" [ngClass]=\"textPosition\" [style.top]=\"textTop\" [style.color]=\"textColor\">{{ text }}</div>\n  <!-- Loading text }}} -->\n</div>\n<!-- Foreground container }}} -->\n\n<!-- Background spinner {{{ -->\n<div\n  class=\"ngx-background-spinner\"\n  [class.ngx-position-absolute]=\"loaderId !== defaultConfig.masterLoaderId\"\n  [ngClass]=\"bgsPosition\"\n  [class.loading-background]=\"showBackground\"\n  [class.background-closing]=\"backgroundClosing\"\n  [class.fast-closing]=\"backgroundClosing && fastFadeOut\"\n  [style.width.px]=\"bgsSize\"\n  [style.height.px]=\"bgsSize\"\n  [style.color]=\"bgsColor\"\n  [style.opacity]=\"bgsOpacity\"\n>\n  <div *ngIf=\"!bgsTemplate; else backgroundTemplate\" [class]=\"bgSpinnerClass\">\n    <div *ngFor=\"let div of bgDivs\"></div>\n  </div>\n  <ng-template #backgroundTemplate>\n    <ng-container *ngTemplateOutlet=\"bgsTemplate\"></ng-container>\n  </ng-template>\n</div>\n<!-- Background spinner }}} -->\n",
                    changeDetection: i0.ChangeDetectionStrategy.OnPush,
                    styles: [".ngx-progress-bar{position:fixed;top:0;left:0;width:100%;height:3px;z-index:99999!important;display:none;color:#00acc1;overflow:hidden}.ngx-progress-bar.foreground-closing,.ngx-progress-bar.loading-foreground{display:block}.ngx-progress-bar.foreground-closing{opacity:0!important;transition:opacity .5s ease-out .5s}.ngx-progress-bar.fast-closing{transition:opacity .3s ease-out .3s!important}.ngx-progress-bar:after,.ngx-progress-bar:before{background-color:currentColor;content:\"\";display:block;width:100%;height:100%;position:absolute;top:0}.ngx-progress-bar-ltr:before{transform:translate3d(-100%,0,0)}.ngx-progress-bar-ltr:after{animation:progressBar-slide-ltr 12s ease-out 0s 1 normal;transform:translate3d(-5%,0,0)}.ngx-progress-bar-rtl:before{transform:translate3d(100%,0,0)}.ngx-progress-bar-rtl:after{animation:progressBar-slide-rtl 12s ease-out 0s 1 normal;transform:translate3d(5%,0,0)}.foreground-closing.ngx-progress-bar-ltr:before{animation:progressBar-slide-complete-ltr 1s ease-out 0s 1;transform:translateZ(0)}.fast-closing.ngx-progress-bar-ltr:before{animation:progressBar-slide-complete-ltr .6s ease-out 0s 1!important}.foreground-closing.ngx-progress-bar-rtl:before{animation:progressBar-slide-complete-rtl 1s ease-out 0s 1;transform:translateZ(0)}.fast-closing.ngx-progress-bar-rtl:before{animation:progressBar-slide-complete-rtl .6s ease-out 0s 1!important}@keyframes progressBar-slide-ltr{0%{transform:translate3d(-100%,0,0)}to{transform:translate3d(-5%,0,0)}}@keyframes progressBar-slide-rtl{0%{transform:translate3d(100%,0,0)}to{transform:translate3d(5%,0,0)}}@keyframes progressBar-slide-complete-ltr{0%{transform:translate3d(-75%,0,0)}50%{transform:translateZ(0)}}@keyframes progressBar-slide-complete-rtl{0%{transform:translate3d(75%,0,0)}50%{transform:translateZ(0)}}.ngx-overlay{position:fixed;top:0;left:0;width:100%;height:100%;z-index:99998!important;background-color:rgba(40,40,40,.8);cursor:progress;display:none}.ngx-overlay.foreground-closing,.ngx-overlay.loading-foreground{display:block}.ngx-overlay.foreground-closing{opacity:0!important;transition:opacity .5s ease-out .5s}.ngx-overlay.fast-closing{transition:opacity .3s ease-out .3s!important}.ngx-overlay>.ngx-foreground-spinner{position:fixed;width:60px;height:60px;margin:0;color:#00acc1}.ngx-overlay>.ngx-loading-logo{position:fixed;margin:0;width:120px;height:120px}.ngx-overlay>.ngx-loading-text{position:fixed;margin:0;font-family:sans-serif;font-weight:400;font-size:1.2em;color:#fff}.ngx-background-spinner{position:fixed;z-index:99997!important;width:60px;height:60px;margin:0;color:#00acc1;opacity:.6;display:none}.ngx-background-spinner.background-closing,.ngx-background-spinner.loading-background{display:block}.ngx-background-spinner.background-closing{opacity:0!important;transition:opacity .7s ease-out}.ngx-background-spinner.fast-closing{transition:opacity .4s ease-out!important}.ngx-position-absolute,.ngx-position-absolute>.ngx-foreground-spinner,.ngx-position-absolute>.ngx-loading-logo,.ngx-position-absolute>.ngx-loading-text{position:absolute!important}.ngx-position-absolute.ngx-progress-bar{z-index:99996!important}.ngx-position-absolute.ngx-overlay{z-index:99995!important}.ngx-position-absolute.ngx-background-spinner,.ngx-position-absolute .sk-square-jelly-box>div:first-child{z-index:99994!important}.top-left{top:30px;left:30px}.top-center{top:30px;left:50%;transform:translateX(-50%)}.top-right{top:30px;right:30px}.center-left{top:50%;left:30px;transform:translateY(-50%)}.center-center{top:50%;left:50%;transform:translate(-50%,-50%)}.center-right{top:50%;right:30px;transform:translateY(-50%)}.bottom-left{bottom:30px;left:30px}.bottom-center{bottom:30px;left:50%;transform:translateX(-50%)}.bottom-right{bottom:30px;right:30px}.sk-ball-scale-multiple,.sk-ball-scale-multiple>div{position:relative;box-sizing:border-box}.sk-ball-scale-multiple{width:100%;height:100%;font-size:0}.sk-ball-scale-multiple>div{display:inline-block;float:none;background-color:currentColor;border:0 solid;position:absolute;top:0;left:0;width:100%;height:100%;border-radius:100%;opacity:0;animation:ball-scale-multiple 1s linear 0s infinite}.sk-ball-scale-multiple>div:nth-child(2){animation-delay:.2s}.sk-ball-scale-multiple>div:nth-child(3){animation-delay:.4s}@keyframes ball-scale-multiple{0%{opacity:0;transform:scale(0)}5%{opacity:.75}to{opacity:0;transform:scale(1)}}.sk-ball-spin,.sk-ball-spin>div{position:relative;box-sizing:border-box}.sk-ball-spin{width:100%;height:100%;font-size:0}.sk-ball-spin>div{display:inline-block;float:none;background-color:currentColor;border:0 solid;position:absolute;top:50%;left:50%;width:25%;height:25%;margin-top:-12.5%;margin-left:-12.5%;border-radius:100%;animation:ball-spin-clockwise 1s ease-in-out infinite}.sk-ball-spin>div:first-child{top:5%;left:50%;animation-delay:-1.125s}.sk-ball-spin>div:nth-child(2){top:18.1801948466%;left:81.8198051534%;animation-delay:-1.25s}.sk-ball-spin>div:nth-child(3){top:50%;left:95%;animation-delay:-1.375s}.sk-ball-spin>div:nth-child(4){top:81.8198051534%;left:81.8198051534%;animation-delay:-1.5s}.sk-ball-spin>div:nth-child(5){top:94.9999999966%;left:50.0000000005%;animation-delay:-1.625s}.sk-ball-spin>div:nth-child(6){top:81.8198046966%;left:18.1801949248%;animation-delay:-1.75s}.sk-ball-spin>div:nth-child(7){top:49.9999750815%;left:5.0000051215%;animation-delay:-1.875s}.sk-ball-spin>div:nth-child(8){top:18.179464974%;left:18.1803700518%;animation-delay:-2s}@keyframes ball-spin{0%,to{opacity:1;transform:scale(1)}20%{opacity:1}80%{opacity:0;transform:scale(0)}}.sk-ball-spin-clockwise,.sk-ball-spin-clockwise>div{position:relative;box-sizing:border-box}.sk-ball-spin-clockwise{width:100%;height:100%;font-size:0}.sk-ball-spin-clockwise>div{display:inline-block;float:none;background-color:currentColor;border:0 solid;position:absolute;top:50%;left:50%;width:25%;height:25%;margin-top:-12.5%;margin-left:-12.5%;border-radius:100%;animation:ball-spin-clockwise 1s ease-in-out infinite}.sk-ball-spin-clockwise>div:first-child{top:5%;left:50%;animation-delay:-.875s}.sk-ball-spin-clockwise>div:nth-child(2){top:18.1801948466%;left:81.8198051534%;animation-delay:-.75s}.sk-ball-spin-clockwise>div:nth-child(3){top:50%;left:95%;animation-delay:-.625s}.sk-ball-spin-clockwise>div:nth-child(4){top:81.8198051534%;left:81.8198051534%;animation-delay:-.5s}.sk-ball-spin-clockwise>div:nth-child(5){top:94.9999999966%;left:50.0000000005%;animation-delay:-.375s}.sk-ball-spin-clockwise>div:nth-child(6){top:81.8198046966%;left:18.1801949248%;animation-delay:-.25s}.sk-ball-spin-clockwise>div:nth-child(7){top:49.9999750815%;left:5.0000051215%;animation-delay:-.125s}.sk-ball-spin-clockwise>div:nth-child(8){top:18.179464974%;left:18.1803700518%;animation-delay:0s}@keyframes ball-spin-clockwise{0%,to{opacity:1;transform:scale(1)}20%{opacity:1}80%{opacity:0;transform:scale(0)}}.sk-ball-spin-clockwise-fade-rotating,.sk-ball-spin-clockwise-fade-rotating>div{position:relative;box-sizing:border-box}.sk-ball-spin-clockwise-fade-rotating{font-size:0;width:100%;height:100%;animation:ball-spin-clockwise-fade-rotating-rotate 6s linear infinite}.sk-ball-spin-clockwise-fade-rotating>div{display:inline-block;float:none;background-color:currentColor;border:0 solid;position:absolute;top:50%;left:50%;width:25%;height:25%;margin-top:-12.5%;margin-left:-12.5%;border-radius:100%;animation:ball-spin-clockwise-fade-rotating 1s linear infinite}.sk-ball-spin-clockwise-fade-rotating>div:first-child{top:5%;left:50%;animation-delay:-.875s}.sk-ball-spin-clockwise-fade-rotating>div:nth-child(2){top:18.1801948466%;left:81.8198051534%;animation-delay:-.75s}.sk-ball-spin-clockwise-fade-rotating>div:nth-child(3){top:50%;left:95%;animation-delay:-.625s}.sk-ball-spin-clockwise-fade-rotating>div:nth-child(4){top:81.8198051534%;left:81.8198051534%;animation-delay:-.5s}.sk-ball-spin-clockwise-fade-rotating>div:nth-child(5){top:94.9999999966%;left:50.0000000005%;animation-delay:-.375s}.sk-ball-spin-clockwise-fade-rotating>div:nth-child(6){top:81.8198046966%;left:18.1801949248%;animation-delay:-.25s}.sk-ball-spin-clockwise-fade-rotating>div:nth-child(7){top:49.9999750815%;left:5.0000051215%;animation-delay:-.125s}.sk-ball-spin-clockwise-fade-rotating>div:nth-child(8){top:18.179464974%;left:18.1803700518%;animation-delay:0s}@keyframes ball-spin-clockwise-fade-rotating-rotate{to{transform:rotate(-1turn)}}@keyframes ball-spin-clockwise-fade-rotating{50%{opacity:.25;transform:scale(.5)}to{opacity:1;transform:scale(1)}}.sk-ball-spin-fade-rotating,.sk-ball-spin-fade-rotating>div{position:relative;box-sizing:border-box}.sk-ball-spin-fade-rotating{width:100%;height:100%;font-size:0;animation:ball-spin-fade-rotate 6s linear infinite}.sk-ball-spin-fade-rotating>div{display:inline-block;float:none;background-color:currentColor;border:0 solid;position:absolute;top:50%;left:50%;width:25%;height:25%;margin-top:-12.5%;margin-left:-12.5%;border-radius:100%;animation:ball-spin-fade 1s linear infinite}.sk-ball-spin-fade-rotating>div:first-child{top:5%;left:50%;animation-delay:-1.125s}.sk-ball-spin-fade-rotating>div:nth-child(2){top:18.1801948466%;left:81.8198051534%;animation-delay:-1.25s}.sk-ball-spin-fade-rotating>div:nth-child(3){top:50%;left:95%;animation-delay:-1.375s}.sk-ball-spin-fade-rotating>div:nth-child(4){top:81.8198051534%;left:81.8198051534%;animation-delay:-1.5s}.sk-ball-spin-fade-rotating>div:nth-child(5){top:94.9999999966%;left:50.0000000005%;animation-delay:-1.625s}.sk-ball-spin-fade-rotating>div:nth-child(6){top:81.8198046966%;left:18.1801949248%;animation-delay:-1.75s}.sk-ball-spin-fade-rotating>div:nth-child(7){top:49.9999750815%;left:5.0000051215%;animation-delay:-1.875s}.sk-ball-spin-fade-rotating>div:nth-child(8){top:18.179464974%;left:18.1803700518%;animation-delay:-2s}@keyframes ball-spin-fade-rotate{to{transform:rotate(1turn)}}@keyframes ball-spin-fade{0%,to{opacity:1;transform:scale(1)}50%{opacity:.25;transform:scale(.5)}}.sk-chasing-dots{margin:auto;width:100%;height:100%;position:absolute;text-align:center;animation:sk-chasingDots-rotate 2s linear infinite}.sk-chasing-dots>div{width:60%;height:60%;display:inline-block;position:absolute;top:0;background-color:currentColor;border-radius:100%;animation:sk-chasingDots-bounce 2s ease-in-out infinite}.sk-chasing-dots>div:nth-child(2){top:auto;bottom:0;animation-delay:-1s}@keyframes sk-chasingDots-rotate{to{transform:rotate(1turn)}}@keyframes sk-chasingDots-bounce{0%,to{transform:scale(0)}50%{transform:scale(1)}}.sk-circle{margin:auto;width:100%;height:100%;position:relative}.sk-circle>div{width:100%;height:100%;position:absolute;left:0;top:0}.sk-circle>div:before{content:\"\";display:block;margin:0 auto;width:15%;height:15%;background-color:currentColor;border-radius:100%;animation:sk-circle-bounceDelay 1.2s ease-in-out infinite both}.sk-circle>div:nth-child(2){transform:rotate(30deg)}.sk-circle>div:nth-child(3){transform:rotate(60deg)}.sk-circle>div:nth-child(4){transform:rotate(90deg)}.sk-circle>div:nth-child(5){transform:rotate(120deg)}.sk-circle>div:nth-child(6){transform:rotate(150deg)}.sk-circle>div:nth-child(7){transform:rotate(180deg)}.sk-circle>div:nth-child(8){transform:rotate(210deg)}.sk-circle>div:nth-child(9){transform:rotate(240deg)}.sk-circle>div:nth-child(10){transform:rotate(270deg)}.sk-circle>div:nth-child(11){transform:rotate(300deg)}.sk-circle>div:nth-child(12){transform:rotate(330deg)}.sk-circle>div:nth-child(2):before{animation-delay:-1.1s}.sk-circle>div:nth-child(3):before{animation-delay:-1s}.sk-circle>div:nth-child(4):before{animation-delay:-.9s}.sk-circle>div:nth-child(5):before{animation-delay:-.8s}.sk-circle>div:nth-child(6):before{animation-delay:-.7s}.sk-circle>div:nth-child(7):before{animation-delay:-.6s}.sk-circle>div:nth-child(8):before{animation-delay:-.5s}.sk-circle>div:nth-child(9):before{animation-delay:-.4s}.sk-circle>div:nth-child(10):before{animation-delay:-.3s}.sk-circle>div:nth-child(11):before{animation-delay:-.2s}.sk-circle>div:nth-child(12):before{animation-delay:-.1s}@keyframes sk-circle-bounceDelay{0%,80%,to{transform:scale(0)}40%{transform:scale(1)}}.sk-cube-grid{width:100%;height:100%;margin:auto}.sk-cube-grid>div{width:33%;height:33%;background-color:currentColor;float:left;animation:sk-cubeGrid-scaleDelay 1.3s ease-in-out infinite}.sk-cube-grid>div:first-child{animation-delay:.2s}.sk-cube-grid>div:nth-child(2){animation-delay:.3s}.sk-cube-grid>div:nth-child(3){animation-delay:.4s}.sk-cube-grid>div:nth-child(4){animation-delay:.1s}.sk-cube-grid>div:nth-child(5){animation-delay:.2s}.sk-cube-grid>div:nth-child(6){animation-delay:.3s}.sk-cube-grid>div:nth-child(7){animation-delay:0s}.sk-cube-grid>div:nth-child(8){animation-delay:.1s}.sk-cube-grid>div:nth-child(9){animation-delay:.2s}@keyframes sk-cubeGrid-scaleDelay{0%,70%,to{transform:scaleX(1)}35%{transform:scale3D(0,0,1)}}.sk-double-bounce{width:100%;height:100%;position:relative;margin:auto}.sk-double-bounce>div{width:100%;height:100%;border-radius:50%;background-color:currentColor;opacity:.6;position:absolute;top:0;left:0;animation:sk-doubleBounce-bounce 2s ease-in-out infinite}.sk-double-bounce>div:nth-child(2){animation-delay:-1s}@keyframes sk-doubleBounce-bounce{0%,to{transform:scale(0)}50%{transform:scale(1)}}.sk-fading-circle{margin:auto;width:100%;height:100%;position:relative}.sk-fading-circle>div{width:100%;height:100%;position:absolute;left:0;top:0}.sk-fading-circle>div:before{content:\"\";display:block;margin:0 auto;width:15%;height:15%;background-color:currentColor;border-radius:100%;animation:sk-fadingCircle-FadeDelay 1.2s ease-in-out infinite both}.sk-fading-circle>div:nth-child(2){transform:rotate(30deg)}.sk-fading-circle>div:nth-child(3){transform:rotate(60deg)}.sk-fading-circle>div:nth-child(4){transform:rotate(90deg)}.sk-fading-circle>div:nth-child(5){transform:rotate(120deg)}.sk-fading-circle>div:nth-child(6){transform:rotate(150deg)}.sk-fading-circle>div:nth-child(7){transform:rotate(180deg)}.sk-fading-circle>div:nth-child(8){transform:rotate(210deg)}.sk-fading-circle>div:nth-child(9){transform:rotate(240deg)}.sk-fading-circle>div:nth-child(10){transform:rotate(270deg)}.sk-fading-circle>div:nth-child(11){transform:rotate(300deg)}.sk-fading-circle>div:nth-child(12){transform:rotate(330deg)}.sk-fading-circle>div:nth-child(2):before{animation-delay:-1.1s}.sk-fading-circle>div:nth-child(3):before{animation-delay:-1s}.sk-fading-circle>div:nth-child(4):before{animation-delay:-.9s}.sk-fading-circle>div:nth-child(5):before{animation-delay:-.8s}.sk-fading-circle>div:nth-child(6):before{animation-delay:-.7s}.sk-fading-circle>div:nth-child(7):before{animation-delay:-.6s}.sk-fading-circle>div:nth-child(8):before{animation-delay:-.5s}.sk-fading-circle>div:nth-child(9):before{animation-delay:-.4s}.sk-fading-circle>div:nth-child(10):before{animation-delay:-.3s}.sk-fading-circle>div:nth-child(11):before{animation-delay:-.2s}.sk-fading-circle>div:nth-child(12):before{animation-delay:-.1s}@keyframes sk-fadingCircle-FadeDelay{0%,39%,to{opacity:0}40%{opacity:1}}.sk-folding-cube{margin:auto;width:100%;height:100%;position:relative;transform:rotate(45deg)}.sk-folding-cube>div{float:left;width:50%;height:50%;position:relative;transform:scale(1.1)}.sk-folding-cube>div:before{content:\"\";position:absolute;top:0;left:0;width:100%;height:100%;background-color:currentColor;animation:sk-foldingCube-angle 2.4s linear infinite both;transform-origin:100% 100%}.sk-folding-cube>div:nth-child(2){transform:scale(1.1) rotate(90deg)}.sk-folding-cube>div:nth-child(3){transform:scale(1.1) rotate(270deg)}.sk-folding-cube>div:nth-child(4){transform:scale(1.1) rotate(180deg)}.sk-folding-cube>div:nth-child(2):before{animation-delay:.3s}.sk-folding-cube>div:nth-child(3):before{animation-delay:.9s}.sk-folding-cube>div:nth-child(4):before{animation-delay:.6s}@keyframes sk-foldingCube-angle{0%,10%{transform:perspective(140px) rotateX(-180deg);opacity:0}25%,75%{transform:perspective(140px) rotateX(0deg);opacity:1}90%,to{transform:perspective(140px) rotateY(180deg);opacity:0}}.sk-pulse{width:100%;height:100%;margin:auto}.sk-pulse>div{width:100%;height:100%;background-color:currentColor;border-radius:100%;animation:sk-pulse-scaleOut 1s ease-in-out infinite}@keyframes sk-pulse-scaleOut{0%{transform:scale(0)}to{transform:scale(1);opacity:0}}.sk-rectangle-bounce{margin:auto;width:100%;height:100%;text-align:center;font-size:0}.sk-rectangle-bounce>div{background-color:currentColor;height:100%;width:10%;margin:0 5%;display:inline-block;animation:sk-rectangleBounce-stretchDelay 1.2s ease-in-out infinite}.sk-rectangle-bounce>div:nth-child(2){animation-delay:-1.1s}.sk-rectangle-bounce>div:nth-child(3){animation-delay:-1s}.sk-rectangle-bounce>div:nth-child(4){animation-delay:-.9s}.sk-rectangle-bounce>div:nth-child(5){animation-delay:-.8s}@keyframes sk-rectangleBounce-stretchDelay{0%,40%,to{transform:scaleY(.4)}20%{transform:scaleY(1)}}.sk-rectangle-bounce-party,.sk-rectangle-bounce-party>div{position:relative;box-sizing:border-box}.sk-rectangle-bounce-party{margin:auto;width:100%;height:100%;text-align:center;font-size:0}.sk-rectangle-bounce-party>div{display:inline-block;float:none;background-color:currentColor;border:0 solid;width:10%;height:100%;margin:0 5%;border-radius:0;animation-name:rectangle-bounce-party;animation-iteration-count:infinite}.sk-rectangle-bounce-party>div:first-child{animation-duration:.43s;animation-delay:-.23s}.sk-rectangle-bounce-party>div:nth-child(2){animation-duration:.62s;animation-delay:-.32s}.sk-rectangle-bounce-party>div:nth-child(3){animation-duration:.43s;animation-delay:-.44s}.sk-rectangle-bounce-party>div:nth-child(4){animation-duration:.8s;animation-delay:-.31s}.sk-rectangle-bounce-party>div:nth-child(5){animation-duration:.74s;animation-delay:-.24s}@keyframes rectangle-bounce-party{0%{transform:scaleY(1)}50%{transform:scaleY(.4)}to{transform:scaleY(1)}}.sk-rectangle-bounce-pulse-out,.sk-rectangle-bounce-pulse-out>div{position:relative;box-sizing:border-box}.sk-rectangle-bounce-pulse-out{margin:auto;width:100%;height:100%;text-align:center;font-size:0}.sk-rectangle-bounce-pulse-out>div{display:inline-block;float:none;background-color:currentColor;border:0 solid;width:10%;height:100%;margin:0 5%;border-radius:0;animation:rectangle-bounce-pulse-out .9s cubic-bezier(.85,.25,.37,.85) infinite}.sk-rectangle-bounce-pulse-out>div:nth-child(3){animation-delay:-.9s}.sk-rectangle-bounce-pulse-out>div:nth-child(2),.sk-rectangle-bounce-pulse-out>div:nth-child(4){animation-delay:-.7s}.sk-rectangle-bounce-pulse-out>div:first-child,.sk-rectangle-bounce-pulse-out>div:nth-child(5){animation-delay:-.5s}@keyframes rectangle-bounce-pulse-out{0%{transform:scaley(1)}50%{transform:scaley(.4)}to{transform:scaley(1)}}.sk-rectangle-bounce-pulse-out-rapid,.sk-rectangle-bounce-pulse-out-rapid>div{position:relative;box-sizing:border-box}.sk-rectangle-bounce-pulse-out-rapid{margin:auto;width:100%;height:100%;text-align:center;font-size:0}.sk-rectangle-bounce-pulse-out-rapid>div{display:inline-block;float:none;background-color:currentColor;border:0 solid;width:10%;height:100%;margin:0 5%;border-radius:0;animation:rectangle-bounce-pulse-out-rapid .9s cubic-bezier(.11,.49,.38,.78) infinite}.sk-rectangle-bounce-pulse-out-rapid>div:nth-child(3){animation-delay:-.9s}.sk-rectangle-bounce-pulse-out-rapid>div:nth-child(2),.sk-rectangle-bounce-pulse-out-rapid>div:nth-child(4){animation-delay:-.65s}.sk-rectangle-bounce-pulse-out-rapid>div:first-child,.sk-rectangle-bounce-pulse-out-rapid>div:nth-child(5){animation-delay:-.4s}@keyframes rectangle-bounce-pulse-out-rapid{0%{transform:scaley(1)}80%{transform:scaley(.4)}90%{transform:scaley(1)}}.sk-rotating-plane{width:100%;height:100%;text-align:center;margin:auto}.sk-rotating-plane>div{width:100%;height:100%;background-color:currentColor;animation:sk-rotatePlane 1.2s ease-in-out infinite}@keyframes sk-rotatePlane{0%{transform:perspective(120px) rotateX(0deg) rotateY(0deg)}50%{transform:perspective(120px) rotateX(-180.1deg) rotateY(0deg)}to{transform:perspective(120px) rotateX(-180deg) rotateY(-179.9deg)}}.sk-square-jelly-box,.sk-square-jelly-box>div{position:relative;box-sizing:border-box}.sk-square-jelly-box{width:100%;height:100%;font-size:0}.sk-square-jelly-box>div{display:inline-block;float:none;background-color:currentColor;border:0 solid}.sk-square-jelly-box>div:first-child,.sk-square-jelly-box>div:nth-child(2){position:absolute;left:0;width:100%}.sk-square-jelly-box>div:first-child{top:-25%;z-index:99997;height:100%;border-radius:10%;animation:square-jelly-box-animate .6s linear -.1s infinite}.sk-square-jelly-box>div:nth-child(2){bottom:-9%;height:10%;background:#000;border-radius:50%;opacity:.2;animation:square-jelly-box-shadow .6s linear -.1s infinite}@keyframes square-jelly-box-animate{17%{border-bottom-right-radius:10%}25%{transform:translateY(25%) rotate(22.5deg)}50%{border-bottom-right-radius:100%;transform:translateY(50%) scaleY(.9) rotate(45deg)}75%{transform:translateY(25%) rotate(67.5deg)}to{transform:translateY(0) rotate(90deg)}}@keyframes square-jelly-box-shadow{50%{transform:scaleX(1.25)}}.sk-square-loader,.sk-square-loader>div{position:relative;box-sizing:border-box}.sk-square-loader{font-size:0;width:100%;height:100%}.sk-square-loader>div{display:inline-block;float:none;background-color:currentColor;border:0 solid;width:100%;height:100%;background:transparent;border-width:3px;border-radius:0;animation:square-loader 2s ease infinite}.sk-square-loader>div:after{display:inline-block;width:100%;vertical-align:top;content:\"\";background-color:currentColor;animation:square-loader-inner 2s ease-in infinite}@keyframes square-loader{0%{transform:rotate(0deg)}25%{transform:rotate(180deg)}50%{transform:rotate(180deg)}75%{transform:rotate(1turn)}to{transform:rotate(1turn)}}@keyframes square-loader-inner{0%{height:0}25%{height:0}50%{height:100%}75%{height:100%}to{height:0}}.sk-three-bounce{margin:auto;width:100%;height:100%;text-align:center}.sk-three-bounce>div{margin-top:35%;width:30%;height:30%;background-color:currentColor;border-radius:100%;display:inline-block;animation:sk-threeBounce-bounceDelay 1.4s ease-in-out infinite both}.bottom-center>.sk-three-bounce>div,.bottom-left>.sk-three-bounce>div,.bottom-right>.sk-three-bounce>div{margin-top:70%!important}.top-center>.sk-three-bounce>div,.top-left>.sk-three-bounce>div,.top-right>.sk-three-bounce>div{margin-top:0!important}.sk-three-bounce>div:first-child{animation-delay:-.32s}.sk-three-bounce>div:nth-child(2){animation-delay:-.16s}@keyframes sk-threeBounce-bounceDelay{0%,80%,to{transform:scale(0)}40%{transform:scale(1)}}.sk-three-strings,.sk-three-strings>div{width:100%;height:100%}.sk-three-strings>div{position:absolute;box-sizing:border-box;border-radius:50%}.sk-three-strings>div:first-child{left:0;top:0;animation:sk-threeStrings-rotateOne 1s linear infinite;border-bottom:3px solid}.sk-three-strings>div:nth-child(2){right:0;top:0;animation:sk-threeStrings-rotateTwo 1s linear infinite;border-right:3px solid}.sk-three-strings>div:nth-child(3){right:0;bottom:0;animation:sk-threeStrings-rotateThree 1s linear infinite;border-top:3px solid}@keyframes sk-threeStrings-rotateOne{0%{transform:rotateX(35deg) rotateY(-45deg) rotate(0deg)}to{transform:rotateX(35deg) rotateY(-45deg) rotate(1turn)}}@keyframes sk-threeStrings-rotateTwo{0%{transform:rotateX(50deg) rotateY(10deg) rotate(0deg)}to{transform:rotateX(50deg) rotateY(10deg) rotate(1turn)}}@keyframes sk-threeStrings-rotateThree{0%{transform:rotateX(35deg) rotateY(55deg) rotate(0deg)}to{transform:rotateX(35deg) rotateY(55deg) rotate(1turn)}}.sk-wandering-cubes{margin:auto;width:100%;height:100%;position:relative;text-align:center}.sk-wandering-cubes>div{background-color:currentColor;width:25%;height:25%;position:absolute;top:0;left:0;animation:sk-wanderingCubes-cubeMove 1.8s ease-in-out infinite}.sk-wandering-cubes>div:nth-child(2){animation-delay:-.9s}@keyframes sk-wanderingCubes-cubeMove{25%{transform:translateX(290%) rotate(-90deg) scale(.5)}50%{transform:translateX(290%) translateY(290%) rotate(-179deg)}50.1%{transform:translateX(290%) translateY(290%) rotate(-180deg)}75%{transform:translateX(0) translateY(290%) rotate(-270deg) scale(.5)}to{transform:rotate(-1turn)}}"]
                },] }
    ];
    NgxUiLoaderComponent.ctorParameters = function () { return [
        { type: platformBrowser.DomSanitizer },
        { type: i0.ChangeDetectorRef },
        { type: NgxUiLoaderService }
    ]; };
    NgxUiLoaderComponent.propDecorators = {
        bgsColor: [{ type: i0.Input }],
        bgsOpacity: [{ type: i0.Input }],
        bgsPosition: [{ type: i0.Input }],
        bgsSize: [{ type: i0.Input }],
        bgsTemplate: [{ type: i0.Input }],
        bgsType: [{ type: i0.Input }],
        fgsColor: [{ type: i0.Input }],
        fgsPosition: [{ type: i0.Input }],
        fgsSize: [{ type: i0.Input }],
        fgsTemplate: [{ type: i0.Input }],
        fgsType: [{ type: i0.Input }],
        gap: [{ type: i0.Input }],
        loaderId: [{ type: i0.Input }],
        logoPosition: [{ type: i0.Input }],
        logoSize: [{ type: i0.Input }],
        logoUrl: [{ type: i0.Input }],
        overlayBorderRadius: [{ type: i0.Input }],
        overlayColor: [{ type: i0.Input }],
        pbColor: [{ type: i0.Input }],
        pbDirection: [{ type: i0.Input }],
        pbThickness: [{ type: i0.Input }],
        hasProgressBar: [{ type: i0.Input }],
        text: [{ type: i0.Input }],
        textColor: [{ type: i0.Input }],
        textPosition: [{ type: i0.Input }]
    };

    /* eslint-disable @angular-eslint/directive-selector */
    var NgxUiLoaderBlurredDirective = /** @class */ (function () {
        function NgxUiLoaderBlurredDirective(elementRef, renderer, loader) {
            this.elementRef = elementRef;
            this.renderer = renderer;
            this.loader = loader;
            this.blur = this.loader.getDefaultConfig().blur;
            this.loaderId = this.loader.getDefaultConfig().masterLoaderId;
            this.fastFadeOut = this.loader.getDefaultConfig().fastFadeOut;
        }
        /**
         * On Init event
         */
        NgxUiLoaderBlurredDirective.prototype.ngOnInit = function () {
            var _this = this;
            this.showForegroundWatcher = this.loader.showForeground$
                .pipe(operators.filter(function (showEvent) { return _this.loaderId === showEvent.loaderId; }))
                .subscribe(function (data) {
                if (data.isShow) {
                    var filterValue = "blur(" + _this.blur + "px)";
                    _this.renderer.setStyle(_this.elementRef.nativeElement, '-webkit-filter', filterValue);
                    _this.renderer.setStyle(_this.elementRef.nativeElement, 'filter', filterValue);
                }
                else {
                    setTimeout(function () {
                        if (!_this.loader.hasRunningTask(FOREGROUND, data.loaderId)) {
                            _this.renderer.setStyle(_this.elementRef.nativeElement, '-webkit-filter', 'none');
                            _this.renderer.setStyle(_this.elementRef.nativeElement, 'filter', 'none');
                        }
                    }, _this.fastFadeOut
                        ? FAST_OVERLAY_DISAPPEAR_TIME
                        : OVERLAY_DISAPPEAR_TIME);
                }
            });
        };
        /**
         * On destroy event
         */
        NgxUiLoaderBlurredDirective.prototype.ngOnDestroy = function () {
            if (this.showForegroundWatcher) {
                this.showForegroundWatcher.unsubscribe();
            }
        };
        return NgxUiLoaderBlurredDirective;
    }());
    NgxUiLoaderBlurredDirective.decorators = [
        { type: i0.Directive, args: [{ selector: '[ngxUiLoaderBlurred]' },] }
    ];
    NgxUiLoaderBlurredDirective.ctorParameters = function () { return [
        { type: i0.ElementRef },
        { type: i0.Renderer2 },
        { type: NgxUiLoaderService }
    ]; };
    NgxUiLoaderBlurredDirective.propDecorators = {
        blur: [{ type: i0.Input }],
        loaderId: [{ type: i0.Input }]
    };

    var NgxUiLoaderModule = /** @class */ (function () {
        function NgxUiLoaderModule() {
        }
        /**
         * forRoot
         *
         * @returns A module with its provider dependencies
         */
        NgxUiLoaderModule.forRoot = function (ngxUiLoaderConfig) {
            return {
                ngModule: NgxUiLoaderModule,
                providers: [
                    {
                        provide: NGX_UI_LOADER_CONFIG_TOKEN,
                        useValue: ngxUiLoaderConfig,
                    },
                ],
            };
        };
        return NgxUiLoaderModule;
    }());
    NgxUiLoaderModule.decorators = [
        { type: i0.NgModule, args: [{
                    imports: [common.CommonModule],
                    declarations: [NgxUiLoaderComponent, NgxUiLoaderBlurredDirective],
                    exports: [NgxUiLoaderComponent, NgxUiLoaderBlurredDirective],
                },] }
    ];

    /**
     * Injection token for ngx-ui-loader-router configuration
     */
    var NGX_UI_LOADER_ROUTER_CONFIG_TOKEN = new i0.InjectionToken('ngxUiLoaderRouterCustom.config');

    function getExcludeObj(config) {
        var strs;
        var regExps;
        if (config) {
            if (config.exclude) {
                strs = config.exclude.map(function (url) { return url.toLowerCase(); });
            }
            if (config.excludeRegexp) {
                regExps = config.excludeRegexp.map(function (regexp) { return new RegExp(regexp, 'i'); });
            }
        }
        return { strs: strs, regExps: regExps };
    }
    function isIgnored(url, excludeStrings, excludeRegexps) {
        if (excludeStrings) {
            // do not show the loader for urls in the `exclude` list
            if (excludeStrings.findIndex(function (str) { return url.toLowerCase().startsWith(str); }) !==
                -1) {
                return true;
            }
        }
        if (excludeRegexps) {
            // do not show the loader for urls which matches regexps in the `excludeRegexp` list
            if (excludeRegexps.findIndex(function (regexp) { return regexp.test(url); }) !== -1) {
                return true;
            }
        }
        return false;
    }

    var NgxUiLoaderRouterModule = /** @class */ (function () {
        /**
         * Constructor
         */
        function NgxUiLoaderRouterModule(parentModule, customConfig, router$1, loader) {
            var _this = this;
            if (parentModule) {
                throw new Error('[ngx-ui-loader] - NgxUiLoaderRouterModule is already loaded. It should be imported in the root `AppModule` only!');
            }
            var config = {
                loaderId: loader.getDefaultConfig().masterLoaderId,
                showForeground: true,
            };
            this.exclude = getExcludeObj(customConfig);
            if (customConfig) {
                config = Object.assign(Object.assign({}, config), customConfig);
            }
            router$1.events.subscribe(function (event) {
                if (event instanceof router.NavigationStart) {
                    if (!isIgnored(event.url, _this.exclude.strs, _this.exclude.regExps)) {
                        if (config.showForeground) {
                            loader.startLoader(config.loaderId, ROUTER_LOADER_TASK_ID);
                        }
                        else {
                            loader.startBackgroundLoader(config.loaderId, ROUTER_LOADER_TASK_ID);
                        }
                    }
                }
                if (event instanceof router.NavigationEnd ||
                    event instanceof router.NavigationCancel ||
                    event instanceof router.NavigationError) {
                    if (!isIgnored(event.url, _this.exclude.strs, _this.exclude.regExps)) {
                        if (config.showForeground) {
                            loader.stopLoader(config.loaderId, ROUTER_LOADER_TASK_ID);
                        }
                        else {
                            loader.stopBackgroundLoader(config.loaderId, ROUTER_LOADER_TASK_ID);
                        }
                    }
                }
            });
        }
        /**
         * forRoot
         *
         * @returns A module with its provider dependencies
         */
        NgxUiLoaderRouterModule.forRoot = function (routerConfig) {
            return {
                ngModule: NgxUiLoaderRouterModule,
                providers: [
                    {
                        provide: NGX_UI_LOADER_ROUTER_CONFIG_TOKEN,
                        useValue: routerConfig,
                    },
                ],
            };
        };
        return NgxUiLoaderRouterModule;
    }());
    NgxUiLoaderRouterModule.decorators = [
        { type: i0.NgModule, args: [{},] }
    ];
    NgxUiLoaderRouterModule.ctorParameters = function () { return [
        { type: NgxUiLoaderRouterModule, decorators: [{ type: i0.Optional }, { type: i0.SkipSelf }] },
        { type: undefined, decorators: [{ type: i0.Optional }, { type: i0.Inject, args: [NGX_UI_LOADER_ROUTER_CONFIG_TOKEN,] }] },
        { type: router.Router },
        { type: NgxUiLoaderService }
    ]; };

    /**
     * Injection token for ngx-ui-loader-http configuration
     */
    var NGX_UI_LOADER_HTTP_CONFIG_TOKEN = new i0.InjectionToken('ngxUiLoaderHttpCustom.config');

    var NgxUiLoaderHttpInterceptor = /** @class */ (function () {
        /**
         * Constructor
         */
        function NgxUiLoaderHttpInterceptor(customConfig, loader) {
            this.loader = loader;
            this.count = 0;
            this.config = {
                loaderId: this.loader.getDefaultConfig().masterLoaderId,
                showForeground: false,
            };
            this.exclude = getExcludeObj(customConfig);
            if (customConfig) {
                this.config = Object.assign(Object.assign({}, this.config), customConfig);
            }
        }
        NgxUiLoaderHttpInterceptor.prototype.intercept = function (req, next) {
            var _this = this;
            if (isIgnored(req.url, this.exclude.strs, this.exclude.regExps)) {
                return next.handle(req);
            }
            this.count++;
            if (this.config.showForeground) {
                this.loader.startLoader(this.config.loaderId, HTTP_LOADER_TASK_ID, this.config);
            }
            else {
                this.loader.startBackgroundLoader(this.config.loaderId, HTTP_LOADER_TASK_ID, this.config);
            }
            return next.handle(req).pipe(operators.finalize(function () {
                _this.count--;
                if (_this.count === 0) {
                    if (_this.config.showForeground) {
                        _this.loader.stopLoader(_this.config.loaderId, HTTP_LOADER_TASK_ID);
                    }
                    else {
                        _this.loader.stopBackgroundLoader(_this.config.loaderId, HTTP_LOADER_TASK_ID);
                    }
                }
            }));
        };
        return NgxUiLoaderHttpInterceptor;
    }());
    NgxUiLoaderHttpInterceptor.decorators = [
        { type: i0.Injectable }
    ];
    NgxUiLoaderHttpInterceptor.ctorParameters = function () { return [
        { type: undefined, decorators: [{ type: i0.Optional }, { type: i0.Inject, args: [NGX_UI_LOADER_HTTP_CONFIG_TOKEN,] }] },
        { type: NgxUiLoaderService }
    ]; };

    var NgxUiLoaderHttpModule = /** @class */ (function () {
        /**
         * Constructor
         */
        function NgxUiLoaderHttpModule(parentModule) {
            if (parentModule) {
                throw new Error('[ngx-ui-loader] - NgxUiLoaderHttpModule is already loaded. It should be imported in the root `AppModule` only!');
            }
        }
        /**
         * forRoot
         *
         * @returns A module with its provider dependencies
         */
        NgxUiLoaderHttpModule.forRoot = function (httpConfig) {
            return {
                ngModule: NgxUiLoaderHttpModule,
                providers: [
                    {
                        provide: NGX_UI_LOADER_HTTP_CONFIG_TOKEN,
                        useValue: httpConfig,
                    },
                ],
            };
        };
        return NgxUiLoaderHttpModule;
    }());
    NgxUiLoaderHttpModule.decorators = [
        { type: i0.NgModule, args: [{
                    providers: [
                        {
                            provide: http.HTTP_INTERCEPTORS,
                            useClass: NgxUiLoaderHttpInterceptor,
                            multi: true,
                        },
                    ],
                },] }
    ];
    NgxUiLoaderHttpModule.ctorParameters = function () { return [
        { type: NgxUiLoaderHttpModule, decorators: [{ type: i0.Optional }, { type: i0.SkipSelf }] }
    ]; };

    /*
     * Public API Surface of ngx-ui-loader
     */

    /**
     * Generated bundle index. Do not edit.
     */

    exports.NgxUiLoaderHttpModule = NgxUiLoaderHttpModule;
    exports.NgxUiLoaderModule = NgxUiLoaderModule;
    exports.NgxUiLoaderRouterModule = NgxUiLoaderRouterModule;
    exports.NgxUiLoaderService = NgxUiLoaderService;
    exports.ɵa = NGX_UI_LOADER_CONFIG_TOKEN;
    exports.ɵb = NgxUiLoaderComponent;
    exports.ɵc = NgxUiLoaderBlurredDirective;
    exports.ɵd = NGX_UI_LOADER_ROUTER_CONFIG_TOKEN;
    exports.ɵe = NgxUiLoaderHttpInterceptor;
    exports.ɵf = NGX_UI_LOADER_HTTP_CONFIG_TOKEN;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=ngx-ui-loader.umd.js.map
