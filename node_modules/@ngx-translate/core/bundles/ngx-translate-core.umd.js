(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('rxjs'), require('rxjs/operators')) :
    typeof define === 'function' && define.amd ? define('@ngx-translate/core', ['exports', '@angular/core', 'rxjs', 'rxjs/operators'], factory) :
    (global = global || self, factory((global['ngx-translate'] = global['ngx-translate'] || {}, global['ngx-translate'].core = {}), global.ng.core, global.rxjs, global.rxjs.operators));
}(this, (function (exports, core, rxjs, operators) { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise */
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b)
                if (b.hasOwnProperty(p))
                    d[p] = b[p]; };
        return extendStatics(d, b);
    };
    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }
    var __assign = function () {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s)
                    if (Object.prototype.hasOwnProperty.call(s, p))
                        t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };
    function __rest(s, e) {
        var t = {};
        for (var p in s)
            if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
                t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    }
    function __decorate(decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
            r = Reflect.decorate(decorators, target, key, desc);
        else
            for (var i = decorators.length - 1; i >= 0; i--)
                if (d = decorators[i])
                    r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    }
    function __param(paramIndex, decorator) {
        return function (target, key) { decorator(target, key, paramIndex); };
    }
    function __metadata(metadataKey, metadataValue) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
            return Reflect.metadata(metadataKey, metadataValue);
    }
    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try {
                step(generator.next(value));
            }
            catch (e) {
                reject(e);
            } }
            function rejected(value) { try {
                step(generator["throw"](value));
            }
            catch (e) {
                reject(e);
            } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }
    function __generator(thisArg, body) {
        var _ = { label: 0, sent: function () { if (t[0] & 1)
                throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function () { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f)
                throw new TypeError("Generator is already executing.");
            while (_)
                try {
                    if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done)
                        return t;
                    if (y = 0, t)
                        op = [op[0] & 2, t.value];
                    switch (op[0]) {
                        case 0:
                        case 1:
                            t = op;
                            break;
                        case 4:
                            _.label++;
                            return { value: op[1], done: false };
                        case 5:
                            _.label++;
                            y = op[1];
                            op = [0];
                            continue;
                        case 7:
                            op = _.ops.pop();
                            _.trys.pop();
                            continue;
                        default:
                            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                                _ = 0;
                                continue;
                            }
                            if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                                _.label = op[1];
                                break;
                            }
                            if (op[0] === 6 && _.label < t[1]) {
                                _.label = t[1];
                                t = op;
                                break;
                            }
                            if (t && _.label < t[2]) {
                                _.label = t[2];
                                _.ops.push(op);
                                break;
                            }
                            if (t[2])
                                _.ops.pop();
                            _.trys.pop();
                            continue;
                    }
                    op = body.call(thisArg, _);
                }
                catch (e) {
                    op = [6, e];
                    y = 0;
                }
                finally {
                    f = t = 0;
                }
            if (op[0] & 5)
                throw op[1];
            return { value: op[0] ? op[1] : void 0, done: true };
        }
    }
    var __createBinding = Object.create ? (function (o, m, k, k2) {
        if (k2 === undefined)
            k2 = k;
        Object.defineProperty(o, k2, { enumerable: true, get: function () { return m[k]; } });
    }) : (function (o, m, k, k2) {
        if (k2 === undefined)
            k2 = k;
        o[k2] = m[k];
    });
    function __exportStar(m, exports) {
        for (var p in m)
            if (p !== "default" && !exports.hasOwnProperty(p))
                __createBinding(exports, m, p);
    }
    function __values(o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m)
            return m.call(o);
        if (o && typeof o.length === "number")
            return {
                next: function () {
                    if (o && i >= o.length)
                        o = void 0;
                    return { value: o && o[i++], done: !o };
                }
            };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    }
    function __read(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m)
            return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done)
                ar.push(r.value);
        }
        catch (error) {
            e = { error: error };
        }
        finally {
            try {
                if (r && !r.done && (m = i["return"]))
                    m.call(i);
            }
            finally {
                if (e)
                    throw e.error;
            }
        }
        return ar;
    }
    function __spread() {
        for (var ar = [], i = 0; i < arguments.length; i++)
            ar = ar.concat(__read(arguments[i]));
        return ar;
    }
    function __spreadArrays() {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++)
            s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++)
            for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
                r[k] = a[j];
        return r;
    }
    ;
    function __await(v) {
        return this instanceof __await ? (this.v = v, this) : new __await(v);
    }
    function __asyncGenerator(thisArg, _arguments, generator) {
        if (!Symbol.asyncIterator)
            throw new TypeError("Symbol.asyncIterator is not defined.");
        var g = generator.apply(thisArg, _arguments || []), i, q = [];
        return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
        function verb(n) { if (g[n])
            i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
        function resume(n, v) { try {
            step(g[n](v));
        }
        catch (e) {
            settle(q[0][3], e);
        } }
        function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
        function fulfill(value) { resume("next", value); }
        function reject(value) { resume("throw", value); }
        function settle(f, v) { if (f(v), q.shift(), q.length)
            resume(q[0][0], q[0][1]); }
    }
    function __asyncDelegator(o) {
        var i, p;
        return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
        function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
    }
    function __asyncValues(o) {
        if (!Symbol.asyncIterator)
            throw new TypeError("Symbol.asyncIterator is not defined.");
        var m = o[Symbol.asyncIterator], i;
        return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
        function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
        function settle(resolve, reject, d, v) { Promise.resolve(v).then(function (v) { resolve({ value: v, done: d }); }, reject); }
    }
    function __makeTemplateObject(cooked, raw) {
        if (Object.defineProperty) {
            Object.defineProperty(cooked, "raw", { value: raw });
        }
        else {
            cooked.raw = raw;
        }
        return cooked;
    }
    ;
    var __setModuleDefault = Object.create ? (function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function (o, v) {
        o["default"] = v;
    };
    function __importStar(mod) {
        if (mod && mod.__esModule)
            return mod;
        var result = {};
        if (mod != null)
            for (var k in mod)
                if (Object.hasOwnProperty.call(mod, k))
                    __createBinding(result, mod, k);
        __setModuleDefault(result, mod);
        return result;
    }
    function __importDefault(mod) {
        return (mod && mod.__esModule) ? mod : { default: mod };
    }
    function __classPrivateFieldGet(receiver, privateMap) {
        if (!privateMap.has(receiver)) {
            throw new TypeError("attempted to get private field on non-instance");
        }
        return privateMap.get(receiver);
    }
    function __classPrivateFieldSet(receiver, privateMap, value) {
        if (!privateMap.has(receiver)) {
            throw new TypeError("attempted to set private field on non-instance");
        }
        privateMap.set(receiver, value);
        return value;
    }

    /**
     * @abstract
     */
    var TranslateLoader = /** @class */ (function () {
        function TranslateLoader() {
        }
        return TranslateLoader;
    }());
    if (false) {
        /**
         * @abstract
         * @param {?} lang
         * @return {?}
         */
        TranslateLoader.prototype.getTranslation = function (lang) { };
    }
    /**
     * This loader is just a placeholder that does nothing, in case you don't need a loader at all
     */
    var TranslateFakeLoader = /** @class */ (function (_super) {
        __extends(TranslateFakeLoader, _super);
        function TranslateFakeLoader() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /**
         * @param {?} lang
         * @return {?}
         */
        TranslateFakeLoader.prototype.getTranslation = function (lang) {
            return rxjs.of({});
        };
        return TranslateFakeLoader;
    }(TranslateLoader));
    TranslateFakeLoader.decorators = [
        { type: core.Injectable }
    ];

    /**
     * @fileoverview added by tsickle
     * Generated from: lib/missing-translation-handler.ts
     * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
     */
    /**
     * @record
     */
    function MissingTranslationHandlerParams() { }
    if (false) {
        /**
         * the key that's missing in translation files
         * @type {?}
         */
        MissingTranslationHandlerParams.prototype.key;
        /**
         * an instance of the service that was unable to translate the key.
         * @type {?}
         */
        MissingTranslationHandlerParams.prototype.translateService;
        /**
         * interpolation params that were passed along for translating the given key.
         * @type {?|undefined}
         */
        MissingTranslationHandlerParams.prototype.interpolateParams;
    }
    /**
     * @abstract
     */
    var MissingTranslationHandler = /** @class */ (function () {
        function MissingTranslationHandler() {
        }
        return MissingTranslationHandler;
    }());
    if (false) {
        /**
         * A function that handles missing translations.
         *
         * @abstract
         * @param {?} params context for resolving a missing translation
         * @return {?} a value or an observable
         * If it returns a value, then this value is used.
         * If it return an observable, the value returned by this observable will be used (except if the method was "instant").
         * If it doesn't return then the key will be used as a value
         */
        MissingTranslationHandler.prototype.handle = function (params) { };
    }
    /**
     * This handler is just a placeholder that does nothing, in case you don't need a missing translation handler at all
     */
    var FakeMissingTranslationHandler = /** @class */ (function () {
        function FakeMissingTranslationHandler() {
        }
        /**
         * @param {?} params
         * @return {?}
         */
        FakeMissingTranslationHandler.prototype.handle = function (params) {
            return params.key;
        };
        return FakeMissingTranslationHandler;
    }());
    FakeMissingTranslationHandler.decorators = [
        { type: core.Injectable }
    ];

    /**
     * @fileoverview added by tsickle
     * Generated from: lib/util.ts
     * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
     */
    /* tslint:disable */
    /**
     * Determines if two objects or two values are equivalent.
     *
     * Two objects or values are considered equivalent if at least one of the following is true:
     *
     * * Both objects or values pass `===` comparison.
     * * Both objects or values are of the same type and all of their properties are equal by
     *   comparing them with `equals`.
     *
     * @param {?} o1 Object or value to compare.
     * @param {?} o2 Object or value to compare.
     * @return {?} true if arguments are equal.
     */
    function equals(o1, o2) {
        if (o1 === o2)
            return true;
        if (o1 === null || o2 === null)
            return false;
        if (o1 !== o1 && o2 !== o2)
            return true; // NaN === NaN
        // NaN === NaN
        /** @type {?} */
        var t1 = typeof o1;
        /** @type {?} */
        var t2 = typeof o2;
        /** @type {?} */
        var length;
        /** @type {?} */
        var key;
        /** @type {?} */
        var keySet;
        if (t1 == t2 && t1 == 'object') {
            if (Array.isArray(o1)) {
                if (!Array.isArray(o2))
                    return false;
                if ((length = o1.length) == o2.length) {
                    for (key = 0; key < length; key++) {
                        if (!equals(o1[key], o2[key]))
                            return false;
                    }
                    return true;
                }
            }
            else {
                if (Array.isArray(o2)) {
                    return false;
                }
                keySet = Object.create(null);
                for (key in o1) {
                    if (!equals(o1[key], o2[key])) {
                        return false;
                    }
                    keySet[key] = true;
                }
                for (key in o2) {
                    if (!(key in keySet) && typeof o2[key] !== 'undefined') {
                        return false;
                    }
                }
                return true;
            }
        }
        return false;
    }
    /* tslint:enable */
    /**
     * @param {?} value
     * @return {?}
     */
    function isDefined(value) {
        return typeof value !== 'undefined' && value !== null;
    }
    /**
     * @param {?} item
     * @return {?}
     */
    function isObject(item) {
        return (item && typeof item === 'object' && !Array.isArray(item));
    }
    /**
     * @param {?} target
     * @param {?} source
     * @return {?}
     */
    function mergeDeep(target, source) {
        /** @type {?} */
        var output = Object.assign({}, target);
        if (isObject(target) && isObject(source)) {
            Object.keys(source).forEach(( /**
             * @param {?} key
             * @return {?}
             */function (key) {
                var _a, _b;
                if (isObject(source[key])) {
                    if (!(key in target)) {
                        Object.assign(output, (_a = {}, _a[key] = source[key], _a));
                    }
                    else {
                        output[key] = mergeDeep(target[key], source[key]);
                    }
                }
                else {
                    Object.assign(output, (_b = {}, _b[key] = source[key], _b));
                }
            }));
        }
        return output;
    }

    /**
     * @abstract
     */
    var TranslateParser = /** @class */ (function () {
        function TranslateParser() {
        }
        return TranslateParser;
    }());
    if (false) {
        /**
         * Interpolates a string to replace parameters
         * "This is a {{ key }}" ==> "This is a value", with params = { key: "value" }
         * @abstract
         * @param {?} expr
         * @param {?=} params
         * @return {?}
         */
        TranslateParser.prototype.interpolate = function (expr, params) { };
        /**
         * Gets a value from an object by composed key
         * parser.getValue({ key1: { keyA: 'valueI' }}, 'key1.keyA') ==> 'valueI'
         * @abstract
         * @param {?} target
         * @param {?} key
         * @return {?}
         */
        TranslateParser.prototype.getValue = function (target, key) { };
    }
    var TranslateDefaultParser = /** @class */ (function (_super) {
        __extends(TranslateDefaultParser, _super);
        function TranslateDefaultParser() {
            var _this = _super.apply(this, __spread(arguments)) || this;
            _this.templateMatcher = /{{\s?([^{}\s]*)\s?}}/g;
            return _this;
        }
        /**
         * @param {?} expr
         * @param {?=} params
         * @return {?}
         */
        TranslateDefaultParser.prototype.interpolate = function (expr, params) {
            /** @type {?} */
            var result;
            if (typeof expr === 'string') {
                result = this.interpolateString(expr, params);
            }
            else if (typeof expr === 'function') {
                result = this.interpolateFunction(expr, params);
            }
            else {
                // this should not happen, but an unrelated TranslateService test depends on it
                result = ( /** @type {?} */(expr));
            }
            return result;
        };
        /**
         * @param {?} target
         * @param {?} key
         * @return {?}
         */
        TranslateDefaultParser.prototype.getValue = function (target, key) {
            /** @type {?} */
            var keys = typeof key === 'string' ? key.split('.') : [key];
            key = '';
            do {
                key += keys.shift();
                if (isDefined(target) && isDefined(target[key]) && (typeof target[key] === 'object' || !keys.length)) {
                    target = target[key];
                    key = '';
                }
                else if (!keys.length) {
                    target = undefined;
                }
                else {
                    key += '.';
                }
            } while (keys.length);
            return target;
        };
        /**
         * @private
         * @param {?} fn
         * @param {?=} params
         * @return {?}
         */
        TranslateDefaultParser.prototype.interpolateFunction = function (fn, params) {
            return fn(params);
        };
        /**
         * @private
         * @param {?} expr
         * @param {?=} params
         * @return {?}
         */
        TranslateDefaultParser.prototype.interpolateString = function (expr, params) {
            var _this = this;
            if (!params) {
                return expr;
            }
            return expr.replace(this.templateMatcher, ( /**
             * @param {?} substring
             * @param {?} b
             * @return {?}
             */function (substring, b) {
                /** @type {?} */
                var r = _this.getValue(params, b);
                return isDefined(r) ? r : substring;
            }));
        };
        return TranslateDefaultParser;
    }(TranslateParser));
    TranslateDefaultParser.decorators = [
        { type: core.Injectable }
    ];
    if (false) {
        /** @type {?} */
        TranslateDefaultParser.prototype.templateMatcher;
    }

    /**
     * @abstract
     */
    var TranslateCompiler = /** @class */ (function () {
        function TranslateCompiler() {
        }
        return TranslateCompiler;
    }());
    if (false) {
        /**
         * @abstract
         * @param {?} value
         * @param {?} lang
         * @return {?}
         */
        TranslateCompiler.prototype.compile = function (value, lang) { };
        /**
         * @abstract
         * @param {?} translations
         * @param {?} lang
         * @return {?}
         */
        TranslateCompiler.prototype.compileTranslations = function (translations, lang) { };
    }
    /**
     * This compiler is just a placeholder that does nothing, in case you don't need a compiler at all
     */
    var TranslateFakeCompiler = /** @class */ (function (_super) {
        __extends(TranslateFakeCompiler, _super);
        function TranslateFakeCompiler() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /**
         * @param {?} value
         * @param {?} lang
         * @return {?}
         */
        TranslateFakeCompiler.prototype.compile = function (value, lang) {
            return value;
        };
        /**
         * @param {?} translations
         * @param {?} lang
         * @return {?}
         */
        TranslateFakeCompiler.prototype.compileTranslations = function (translations, lang) {
            return translations;
        };
        return TranslateFakeCompiler;
    }(TranslateCompiler));
    TranslateFakeCompiler.decorators = [
        { type: core.Injectable }
    ];

    /**
     * @fileoverview added by tsickle
     * Generated from: lib/translate.store.ts
     * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
     */
    var TranslateStore = /** @class */ (function () {
        function TranslateStore() {
            /**
             * The lang currently used
             */
            this.currentLang = this.defaultLang;
            /**
             * a list of translations per lang
             */
            this.translations = {};
            /**
             * an array of langs
             */
            this.langs = [];
            /**
             * An EventEmitter to listen to translation change events
             * onTranslationChange.subscribe((params: TranslationChangeEvent) => {
             *     // do something
             * });
             */
            this.onTranslationChange = new core.EventEmitter();
            /**
             * An EventEmitter to listen to lang change events
             * onLangChange.subscribe((params: LangChangeEvent) => {
             *     // do something
             * });
             */
            this.onLangChange = new core.EventEmitter();
            /**
             * An EventEmitter to listen to default lang change events
             * onDefaultLangChange.subscribe((params: DefaultLangChangeEvent) => {
             *     // do something
             * });
             */
            this.onDefaultLangChange = new core.EventEmitter();
        }
        return TranslateStore;
    }());
    if (false) {
        /**
         * The default lang to fallback when translations are missing on the current lang
         * @type {?}
         */
        TranslateStore.prototype.defaultLang;
        /**
         * The lang currently used
         * @type {?}
         */
        TranslateStore.prototype.currentLang;
        /**
         * a list of translations per lang
         * @type {?}
         */
        TranslateStore.prototype.translations;
        /**
         * an array of langs
         * @type {?}
         */
        TranslateStore.prototype.langs;
        /**
         * An EventEmitter to listen to translation change events
         * onTranslationChange.subscribe((params: TranslationChangeEvent) => {
         *     // do something
         * });
         * @type {?}
         */
        TranslateStore.prototype.onTranslationChange;
        /**
         * An EventEmitter to listen to lang change events
         * onLangChange.subscribe((params: LangChangeEvent) => {
         *     // do something
         * });
         * @type {?}
         */
        TranslateStore.prototype.onLangChange;
        /**
         * An EventEmitter to listen to default lang change events
         * onDefaultLangChange.subscribe((params: DefaultLangChangeEvent) => {
         *     // do something
         * });
         * @type {?}
         */
        TranslateStore.prototype.onDefaultLangChange;
    }

    /** @type {?} */
    var USE_STORE = new core.InjectionToken('USE_STORE');
    /** @type {?} */
    var USE_DEFAULT_LANG = new core.InjectionToken('USE_DEFAULT_LANG');
    /** @type {?} */
    var DEFAULT_LANGUAGE = new core.InjectionToken('DEFAULT_LANGUAGE');
    /** @type {?} */
    var USE_EXTEND = new core.InjectionToken('USE_EXTEND');
    /**
     * @record
     */
    function TranslationChangeEvent() { }
    if (false) {
        /** @type {?} */
        TranslationChangeEvent.prototype.translations;
        /** @type {?} */
        TranslationChangeEvent.prototype.lang;
    }
    /**
     * @record
     */
    function LangChangeEvent() { }
    if (false) {
        /** @type {?} */
        LangChangeEvent.prototype.lang;
        /** @type {?} */
        LangChangeEvent.prototype.translations;
    }
    /**
     * @record
     */
    function DefaultLangChangeEvent() { }
    if (false) {
        /** @type {?} */
        DefaultLangChangeEvent.prototype.lang;
        /** @type {?} */
        DefaultLangChangeEvent.prototype.translations;
    }
    var TranslateService = /** @class */ (function () {
        /**
         *
         * @param {?} store an instance of the store (that is supposed to be unique)
         * @param {?} currentLoader An instance of the loader currently used
         * @param {?} compiler An instance of the compiler currently used
         * @param {?} parser An instance of the parser currently used
         * @param {?} missingTranslationHandler A handler for missing translations.
         * @param {?=} useDefaultLang whether we should use default language translation when current language translation is missing.
         * @param {?=} isolate whether this service should use the store or not
         * @param {?=} extend To make a child module extend (and use) translations from parent modules.
         * @param {?=} defaultLanguage Set the default language using configuration
         */
        function TranslateService(store, currentLoader, compiler, parser, missingTranslationHandler, useDefaultLang, isolate, extend, defaultLanguage) {
            if (useDefaultLang === void 0) { useDefaultLang = true; }
            if (isolate === void 0) { isolate = false; }
            if (extend === void 0) { extend = false; }
            this.store = store;
            this.currentLoader = currentLoader;
            this.compiler = compiler;
            this.parser = parser;
            this.missingTranslationHandler = missingTranslationHandler;
            this.useDefaultLang = useDefaultLang;
            this.isolate = isolate;
            this.extend = extend;
            this.pending = false;
            this._onTranslationChange = new core.EventEmitter();
            this._onLangChange = new core.EventEmitter();
            this._onDefaultLangChange = new core.EventEmitter();
            this._langs = [];
            this._translations = {};
            this._translationRequests = {};
            /** set the default language from configuration */
            if (defaultLanguage) {
                this.setDefaultLang(defaultLanguage);
            }
        }
        Object.defineProperty(TranslateService.prototype, "onTranslationChange", {
            /**
             * An EventEmitter to listen to translation change events
             * onTranslationChange.subscribe((params: TranslationChangeEvent) => {
             *     // do something
             * });
             * @return {?}
             */
            get: function () {
                return this.isolate ? this._onTranslationChange : this.store.onTranslationChange;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TranslateService.prototype, "onLangChange", {
            /**
             * An EventEmitter to listen to lang change events
             * onLangChange.subscribe((params: LangChangeEvent) => {
             *     // do something
             * });
             * @return {?}
             */
            get: function () {
                return this.isolate ? this._onLangChange : this.store.onLangChange;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TranslateService.prototype, "onDefaultLangChange", {
            /**
             * An EventEmitter to listen to default lang change events
             * onDefaultLangChange.subscribe((params: DefaultLangChangeEvent) => {
             *     // do something
             * });
             * @return {?}
             */
            get: function () {
                return this.isolate ? this._onDefaultLangChange : this.store.onDefaultLangChange;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TranslateService.prototype, "defaultLang", {
            /**
             * The default lang to fallback when translations are missing on the current lang
             * @return {?}
             */
            get: function () {
                return this.isolate ? this._defaultLang : this.store.defaultLang;
            },
            /**
             * @param {?} defaultLang
             * @return {?}
             */
            set: function (defaultLang) {
                if (this.isolate) {
                    this._defaultLang = defaultLang;
                }
                else {
                    this.store.defaultLang = defaultLang;
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TranslateService.prototype, "currentLang", {
            /**
             * The lang currently used
             * @return {?}
             */
            get: function () {
                return this.isolate ? this._currentLang : this.store.currentLang;
            },
            /**
             * @param {?} currentLang
             * @return {?}
             */
            set: function (currentLang) {
                if (this.isolate) {
                    this._currentLang = currentLang;
                }
                else {
                    this.store.currentLang = currentLang;
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TranslateService.prototype, "langs", {
            /**
             * an array of langs
             * @return {?}
             */
            get: function () {
                return this.isolate ? this._langs : this.store.langs;
            },
            /**
             * @param {?} langs
             * @return {?}
             */
            set: function (langs) {
                if (this.isolate) {
                    this._langs = langs;
                }
                else {
                    this.store.langs = langs;
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TranslateService.prototype, "translations", {
            /**
             * a list of translations per lang
             * @return {?}
             */
            get: function () {
                return this.isolate ? this._translations : this.store.translations;
            },
            /**
             * @param {?} translations
             * @return {?}
             */
            set: function (translations) {
                if (this.isolate) {
                    this._translations = translations;
                }
                else {
                    this.store.translations = translations;
                }
            },
            enumerable: false,
            configurable: true
        });
        /**
         * Sets the default language to use as a fallback
         * @param {?} lang
         * @return {?}
         */
        TranslateService.prototype.setDefaultLang = function (lang) {
            var _this = this;
            if (lang === this.defaultLang) {
                return;
            }
            /** @type {?} */
            var pending = this.retrieveTranslations(lang);
            if (typeof pending !== "undefined") {
                // on init set the defaultLang immediately
                if (this.defaultLang == null) {
                    this.defaultLang = lang;
                }
                pending.pipe(operators.take(1))
                    .subscribe(( /**
             * @param {?} res
             * @return {?}
             */function (res) {
                    _this.changeDefaultLang(lang);
                }));
            }
            else { // we already have this language
                this.changeDefaultLang(lang);
            }
        };
        /**
         * Gets the default language used
         * @return {?}
         */
        TranslateService.prototype.getDefaultLang = function () {
            return this.defaultLang;
        };
        /**
         * Changes the lang currently used
         * @param {?} lang
         * @return {?}
         */
        TranslateService.prototype.use = function (lang) {
            var _this = this;
            // don't change the language if the language given is already selected
            if (lang === this.currentLang) {
                return rxjs.of(this.translations[lang]);
            }
            /** @type {?} */
            var pending = this.retrieveTranslations(lang);
            if (typeof pending !== "undefined") {
                // on init set the currentLang immediately
                if (!this.currentLang) {
                    this.currentLang = lang;
                }
                pending.pipe(operators.take(1))
                    .subscribe(( /**
             * @param {?} res
             * @return {?}
             */function (res) {
                    _this.changeLang(lang);
                }));
                return pending;
            }
            else { // we have this language, return an Observable
                this.changeLang(lang);
                return rxjs.of(this.translations[lang]);
            }
        };
        /**
         * Retrieves the given translations
         * @private
         * @param {?} lang
         * @return {?}
         */
        TranslateService.prototype.retrieveTranslations = function (lang) {
            /** @type {?} */
            var pending;
            // if this language is unavailable or extend is true, ask for it
            if (typeof this.translations[lang] === "undefined" || this.extend) {
                this._translationRequests[lang] = this._translationRequests[lang] || this.getTranslation(lang);
                pending = this._translationRequests[lang];
            }
            return pending;
        };
        /**
         * Gets an object of translations for a given language with the current loader
         * and passes it through the compiler
         * @param {?} lang
         * @return {?}
         */
        TranslateService.prototype.getTranslation = function (lang) {
            var _this = this;
            this.pending = true;
            /** @type {?} */
            var loadingTranslations = this.currentLoader.getTranslation(lang).pipe(operators.shareReplay(1), operators.take(1));
            this.loadingTranslations = loadingTranslations.pipe(operators.map(( /**
             * @param {?} res
             * @return {?}
             */function (res) { return _this.compiler.compileTranslations(res, lang); })), operators.shareReplay(1), operators.take(1));
            this.loadingTranslations
                .subscribe({
                next: ( /**
                 * @param {?} res
                 * @return {?}
                 */function (res) {
                    _this.translations[lang] = _this.extend && _this.translations[lang] ? Object.assign(Object.assign({}, res), _this.translations[lang]) : res;
                    _this.updateLangs();
                    _this.pending = false;
                }),
                error: ( /**
                 * @param {?} err
                 * @return {?}
                 */function (err) {
                    _this.pending = false;
                })
            });
            return loadingTranslations;
        };
        /**
         * Manually sets an object of translations for a given language
         * after passing it through the compiler
         * @param {?} lang
         * @param {?} translations
         * @param {?=} shouldMerge
         * @return {?}
         */
        TranslateService.prototype.setTranslation = function (lang, translations, shouldMerge) {
            if (shouldMerge === void 0) { shouldMerge = false; }
            translations = this.compiler.compileTranslations(translations, lang);
            if ((shouldMerge || this.extend) && this.translations[lang]) {
                this.translations[lang] = mergeDeep(this.translations[lang], translations);
            }
            else {
                this.translations[lang] = translations;
            }
            this.updateLangs();
            this.onTranslationChange.emit({ lang: lang, translations: this.translations[lang] });
        };
        /**
         * Returns an array of currently available langs
         * @return {?}
         */
        TranslateService.prototype.getLangs = function () {
            return this.langs;
        };
        /**
         * Add available langs
         * @param {?} langs
         * @return {?}
         */
        TranslateService.prototype.addLangs = function (langs) {
            var _this = this;
            langs.forEach(( /**
             * @param {?} lang
             * @return {?}
             */function (lang) {
                if (_this.langs.indexOf(lang) === -1) {
                    _this.langs.push(lang);
                }
            }));
        };
        /**
         * Update the list of available langs
         * @private
         * @return {?}
         */
        TranslateService.prototype.updateLangs = function () {
            this.addLangs(Object.keys(this.translations));
        };
        /**
         * Returns the parsed result of the translations
         * @param {?} translations
         * @param {?} key
         * @param {?=} interpolateParams
         * @return {?}
         */
        TranslateService.prototype.getParsedResult = function (translations, key, interpolateParams) {
            var e_1, _a;
            /** @type {?} */
            var res;
            if (key instanceof Array) {
                /** @type {?} */
                var result_1 = {};
                /** @type {?} */
                var observables = false;
                try {
                    for (var key_1 = __values(key), key_1_1 = key_1.next(); !key_1_1.done; key_1_1 = key_1.next()) {
                        var k = key_1_1.value;
                        result_1[k] = this.getParsedResult(translations, k, interpolateParams);
                        if (rxjs.isObservable(result_1[k])) {
                            observables = true;
                        }
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (key_1_1 && !key_1_1.done && (_a = key_1.return)) _a.call(key_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                if (observables) {
                    /** @type {?} */
                    var sources = key.map(( /**
                     * @param {?} k
                     * @return {?}
                     */function (/**
                     * @param {?} k
                     * @return {?}
                     */ k) { return rxjs.isObservable(result_1[k]) ? result_1[k] : rxjs.of(( /** @type {?} */(result_1[k]))); }));
                    return rxjs.forkJoin(sources).pipe(operators.map(( /**
                     * @param {?} arr
                     * @return {?}
                     */function (arr) {
                        /** @type {?} */
                        var obj = {};
                        arr.forEach(( /**
                         * @param {?} value
                         * @param {?} index
                         * @return {?}
                         */function (value, index) {
                            obj[key[index]] = value;
                        }));
                        return obj;
                    })));
                }
                return result_1;
            }
            if (translations) {
                res = this.parser.interpolate(this.parser.getValue(translations, key), interpolateParams);
            }
            if (typeof res === "undefined" && this.defaultLang != null && this.defaultLang !== this.currentLang && this.useDefaultLang) {
                res = this.parser.interpolate(this.parser.getValue(this.translations[this.defaultLang], key), interpolateParams);
            }
            if (typeof res === "undefined") {
                /** @type {?} */
                var params = { key: key, translateService: this };
                if (typeof interpolateParams !== 'undefined') {
                    params.interpolateParams = interpolateParams;
                }
                res = this.missingTranslationHandler.handle(params);
            }
            return typeof res !== "undefined" ? res : key;
        };
        /**
         * Gets the translated value of a key (or an array of keys)
         * @param {?} key
         * @param {?=} interpolateParams
         * @return {?} the translated key, or an object of translated keys
         */
        TranslateService.prototype.get = function (key, interpolateParams) {
            var _this = this;
            if (!isDefined(key) || !key.length) {
                throw new Error("Parameter \"key\" required");
            }
            // check if we are loading a new translation to use
            if (this.pending) {
                return this.loadingTranslations.pipe(operators.concatMap(( /**
                 * @param {?} res
                 * @return {?}
                 */function (res) {
                    res = _this.getParsedResult(res, key, interpolateParams);
                    return rxjs.isObservable(res) ? res : rxjs.of(res);
                })));
            }
            else {
                /** @type {?} */
                var res = this.getParsedResult(this.translations[this.currentLang], key, interpolateParams);
                return rxjs.isObservable(res) ? res : rxjs.of(res);
            }
        };
        /**
         * Returns a stream of translated values of a key (or an array of keys) which updates
         * whenever the translation changes.
         * @param {?} key
         * @param {?=} interpolateParams
         * @return {?} A stream of the translated key, or an object of translated keys
         */
        TranslateService.prototype.getStreamOnTranslationChange = function (key, interpolateParams) {
            var _this = this;
            if (!isDefined(key) || !key.length) {
                throw new Error("Parameter \"key\" required");
            }
            return rxjs.concat(rxjs.defer(( /**
             * @return {?}
             */function () { return _this.get(key, interpolateParams); })), this.onTranslationChange.pipe(operators.switchMap(( /**
             * @param {?} event
             * @return {?}
             */function (event) {
                /** @type {?} */
                var res = _this.getParsedResult(event.translations, key, interpolateParams);
                if (typeof res.subscribe === 'function') {
                    return res;
                }
                else {
                    return rxjs.of(res);
                }
            }))));
        };
        /**
         * Returns a stream of translated values of a key (or an array of keys) which updates
         * whenever the language changes.
         * @param {?} key
         * @param {?=} interpolateParams
         * @return {?} A stream of the translated key, or an object of translated keys
         */
        TranslateService.prototype.stream = function (key, interpolateParams) {
            var _this = this;
            if (!isDefined(key) || !key.length) {
                throw new Error("Parameter \"key\" required");
            }
            return rxjs.concat(rxjs.defer(( /**
             * @return {?}
             */function () { return _this.get(key, interpolateParams); })), this.onLangChange.pipe(operators.switchMap(( /**
             * @param {?} event
             * @return {?}
             */function (event) {
                /** @type {?} */
                var res = _this.getParsedResult(event.translations, key, interpolateParams);
                return rxjs.isObservable(res) ? res : rxjs.of(res);
            }))));
        };
        /**
         * Returns a translation instantly from the internal state of loaded translation.
         * All rules regarding the current language, the preferred language of even fallback languages will be used except any promise handling.
         * @param {?} key
         * @param {?=} interpolateParams
         * @return {?}
         */
        TranslateService.prototype.instant = function (key, interpolateParams) {
            if (!isDefined(key) || !key.length) {
                throw new Error("Parameter \"key\" required");
            }
            /** @type {?} */
            var res = this.getParsedResult(this.translations[this.currentLang], key, interpolateParams);
            if (rxjs.isObservable(res)) {
                if (key instanceof Array) {
                    /** @type {?} */
                    var obj_1 = {};
                    key.forEach(( /**
                     * @param {?} value
                     * @param {?} index
                     * @return {?}
                     */function (value, index) {
                        obj_1[key[index]] = key[index];
                    }));
                    return obj_1;
                }
                return key;
            }
            else {
                return res;
            }
        };
        /**
         * Sets the translated value of a key, after compiling it
         * @param {?} key
         * @param {?} value
         * @param {?=} lang
         * @return {?}
         */
        TranslateService.prototype.set = function (key, value, lang) {
            if (lang === void 0) { lang = this.currentLang; }
            this.translations[lang][key] = this.compiler.compile(value, lang);
            this.updateLangs();
            this.onTranslationChange.emit({ lang: lang, translations: this.translations[lang] });
        };
        /**
         * Changes the current lang
         * @private
         * @param {?} lang
         * @return {?}
         */
        TranslateService.prototype.changeLang = function (lang) {
            this.currentLang = lang;
            this.onLangChange.emit({ lang: lang, translations: this.translations[lang] });
            // if there is no default lang, use the one that we just set
            if (this.defaultLang == null) {
                this.changeDefaultLang(lang);
            }
        };
        /**
         * Changes the default lang
         * @private
         * @param {?} lang
         * @return {?}
         */
        TranslateService.prototype.changeDefaultLang = function (lang) {
            this.defaultLang = lang;
            this.onDefaultLangChange.emit({ lang: lang, translations: this.translations[lang] });
        };
        /**
         * Allows to reload the lang file from the file
         * @param {?} lang
         * @return {?}
         */
        TranslateService.prototype.reloadLang = function (lang) {
            this.resetLang(lang);
            return this.getTranslation(lang);
        };
        /**
         * Deletes inner translation
         * @param {?} lang
         * @return {?}
         */
        TranslateService.prototype.resetLang = function (lang) {
            this._translationRequests[lang] = undefined;
            this.translations[lang] = undefined;
        };
        /**
         * Returns the language code name from the browser, e.g. "de"
         * @return {?}
         */
        TranslateService.prototype.getBrowserLang = function () {
            if (typeof window === 'undefined' || typeof window.navigator === 'undefined') {
                return undefined;
            }
            /** @type {?} */
            var browserLang = window.navigator.languages ? window.navigator.languages[0] : null;
            browserLang = browserLang || window.navigator.language || window.navigator.browserLanguage || window.navigator.userLanguage;
            if (typeof browserLang === 'undefined') {
                return undefined;
            }
            if (browserLang.indexOf('-') !== -1) {
                browserLang = browserLang.split('-')[0];
            }
            if (browserLang.indexOf('_') !== -1) {
                browserLang = browserLang.split('_')[0];
            }
            return browserLang;
        };
        /**
         * Returns the culture language code name from the browser, e.g. "de-DE"
         * @return {?}
         */
        TranslateService.prototype.getBrowserCultureLang = function () {
            if (typeof window === 'undefined' || typeof window.navigator === 'undefined') {
                return undefined;
            }
            /** @type {?} */
            var browserCultureLang = window.navigator.languages ? window.navigator.languages[0] : null;
            browserCultureLang = browserCultureLang || window.navigator.language || window.navigator.browserLanguage || window.navigator.userLanguage;
            return browserCultureLang;
        };
        return TranslateService;
    }());
    TranslateService.decorators = [
        { type: core.Injectable }
    ];
    /** @nocollapse */
    TranslateService.ctorParameters = function () { return [
        { type: TranslateStore },
        { type: TranslateLoader },
        { type: TranslateCompiler },
        { type: TranslateParser },
        { type: MissingTranslationHandler },
        { type: Boolean, decorators: [{ type: core.Inject, args: [USE_DEFAULT_LANG,] }] },
        { type: Boolean, decorators: [{ type: core.Inject, args: [USE_STORE,] }] },
        { type: Boolean, decorators: [{ type: core.Inject, args: [USE_EXTEND,] }] },
        { type: String, decorators: [{ type: core.Inject, args: [DEFAULT_LANGUAGE,] }] }
    ]; };
    if (false) {
        /**
         * @type {?}
         * @private
         */
        TranslateService.prototype.loadingTranslations;
        /**
         * @type {?}
         * @private
         */
        TranslateService.prototype.pending;
        /**
         * @type {?}
         * @private
         */
        TranslateService.prototype._onTranslationChange;
        /**
         * @type {?}
         * @private
         */
        TranslateService.prototype._onLangChange;
        /**
         * @type {?}
         * @private
         */
        TranslateService.prototype._onDefaultLangChange;
        /**
         * @type {?}
         * @private
         */
        TranslateService.prototype._defaultLang;
        /**
         * @type {?}
         * @private
         */
        TranslateService.prototype._currentLang;
        /**
         * @type {?}
         * @private
         */
        TranslateService.prototype._langs;
        /**
         * @type {?}
         * @private
         */
        TranslateService.prototype._translations;
        /**
         * @type {?}
         * @private
         */
        TranslateService.prototype._translationRequests;
        /** @type {?} */
        TranslateService.prototype.store;
        /** @type {?} */
        TranslateService.prototype.currentLoader;
        /** @type {?} */
        TranslateService.prototype.compiler;
        /** @type {?} */
        TranslateService.prototype.parser;
        /** @type {?} */
        TranslateService.prototype.missingTranslationHandler;
        /**
         * @type {?}
         * @private
         */
        TranslateService.prototype.useDefaultLang;
        /**
         * @type {?}
         * @private
         */
        TranslateService.prototype.isolate;
        /**
         * @type {?}
         * @private
         */
        TranslateService.prototype.extend;
    }

    /**
     * @fileoverview added by tsickle
     * Generated from: lib/translate.directive.ts
     * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
     */
    var TranslateDirective = /** @class */ (function () {
        /**
         * @param {?} translateService
         * @param {?} element
         * @param {?} _ref
         */
        function TranslateDirective(translateService, element, _ref) {
            var _this = this;
            this.translateService = translateService;
            this.element = element;
            this._ref = _ref;
            // subscribe to onTranslationChange event, in case the translations of the current lang change
            if (!this.onTranslationChangeSub) {
                this.onTranslationChangeSub = this.translateService.onTranslationChange.subscribe(( /**
                 * @param {?} event
                 * @return {?}
                 */function (event) {
                    if (event.lang === _this.translateService.currentLang) {
                        _this.checkNodes(true, event.translations);
                    }
                }));
            }
            // subscribe to onLangChange event, in case the language changes
            if (!this.onLangChangeSub) {
                this.onLangChangeSub = this.translateService.onLangChange.subscribe(( /**
                 * @param {?} event
                 * @return {?}
                 */function (event) {
                    _this.checkNodes(true, event.translations);
                }));
            }
            // subscribe to onDefaultLangChange event, in case the default language changes
            if (!this.onDefaultLangChangeSub) {
                this.onDefaultLangChangeSub = this.translateService.onDefaultLangChange.subscribe(( /**
                 * @param {?} event
                 * @return {?}
                 */function (event) {
                    _this.checkNodes(true);
                }));
            }
        }
        Object.defineProperty(TranslateDirective.prototype, "translate", {
            /**
             * @param {?} key
             * @return {?}
             */
            set: function (key) {
                if (key) {
                    this.key = key;
                    this.checkNodes();
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TranslateDirective.prototype, "translateParams", {
            /**
             * @param {?} params
             * @return {?}
             */
            set: function (params) {
                if (!equals(this.currentParams, params)) {
                    this.currentParams = params;
                    this.checkNodes(true);
                }
            },
            enumerable: false,
            configurable: true
        });
        /**
         * @return {?}
         */
        TranslateDirective.prototype.ngAfterViewChecked = function () {
            this.checkNodes();
        };
        /**
         * @param {?=} forceUpdate
         * @param {?=} translations
         * @return {?}
         */
        TranslateDirective.prototype.checkNodes = function (forceUpdate, translations) {
            if (forceUpdate === void 0) { forceUpdate = false; }
            /** @type {?} */
            var nodes = this.element.nativeElement.childNodes;
            // if the element is empty
            if (!nodes.length) {
                // we add the key as content
                this.setContent(this.element.nativeElement, this.key);
                nodes = this.element.nativeElement.childNodes;
            }
            for (var i = 0; i < nodes.length; ++i) {
                /** @type {?} */
                var node = nodes[i];
                if (node.nodeType === 3) { // node type 3 is a text node
                    // node type 3 is a text node
                    /** @type {?} */
                    var key = void 0;
                    if (forceUpdate) {
                        node.lastKey = null;
                    }
                    if (isDefined(node.lookupKey)) {
                        key = node.lookupKey;
                    }
                    else if (this.key) {
                        key = this.key;
                    }
                    else {
                        /** @type {?} */
                        var content = this.getContent(node);
                        /** @type {?} */
                        var trimmedContent = content.trim();
                        if (trimmedContent.length) {
                            node.lookupKey = trimmedContent;
                            // we want to use the content as a key, not the translation value
                            if (content !== node.currentValue) {
                                key = trimmedContent;
                                // the content was changed from the user, we'll use it as a reference if needed
                                node.originalContent = content || node.originalContent;
                            }
                            else if (node.originalContent) { // the content seems ok, but the lang has changed
                                // the current content is the translation, not the key, use the last real content as key
                                key = node.originalContent.trim();
                            }
                            else if (content !== node.currentValue) {
                                // we want to use the content as a key, not the translation value
                                key = trimmedContent;
                                // the content was changed from the user, we'll use it as a reference if needed
                                node.originalContent = content || node.originalContent;
                            }
                        }
                    }
                    this.updateValue(key, node, translations);
                }
            }
        };
        /**
         * @param {?} key
         * @param {?} node
         * @param {?} translations
         * @return {?}
         */
        TranslateDirective.prototype.updateValue = function (key, node, translations) {
            var _this = this;
            if (key) {
                if (node.lastKey === key && this.lastParams === this.currentParams) {
                    return;
                }
                this.lastParams = this.currentParams;
                /** @type {?} */
                var onTranslation = ( /**
                 * @param {?} res
                 * @return {?}
                 */function (res) {
                    if (res !== key) {
                        node.lastKey = key;
                    }
                    if (!node.originalContent) {
                        node.originalContent = _this.getContent(node);
                    }
                    node.currentValue = isDefined(res) ? res : (node.originalContent || key);
                    // we replace in the original content to preserve spaces that we might have trimmed
                    _this.setContent(node, _this.key ? node.currentValue : node.originalContent.replace(key, node.currentValue));
                    _this._ref.markForCheck();
                });
                if (isDefined(translations)) {
                    /** @type {?} */
                    var res = this.translateService.getParsedResult(translations, key, this.currentParams);
                    if (rxjs.isObservable(res)) {
                        res.subscribe(onTranslation);
                    }
                    else {
                        onTranslation(res);
                    }
                }
                else {
                    this.translateService.get(key, this.currentParams).subscribe(onTranslation);
                }
            }
        };
        /**
         * @param {?} node
         * @return {?}
         */
        TranslateDirective.prototype.getContent = function (node) {
            return isDefined(node.textContent) ? node.textContent : node.data;
        };
        /**
         * @param {?} node
         * @param {?} content
         * @return {?}
         */
        TranslateDirective.prototype.setContent = function (node, content) {
            if (isDefined(node.textContent)) {
                node.textContent = content;
            }
            else {
                node.data = content;
            }
        };
        /**
         * @return {?}
         */
        TranslateDirective.prototype.ngOnDestroy = function () {
            if (this.onLangChangeSub) {
                this.onLangChangeSub.unsubscribe();
            }
            if (this.onDefaultLangChangeSub) {
                this.onDefaultLangChangeSub.unsubscribe();
            }
            if (this.onTranslationChangeSub) {
                this.onTranslationChangeSub.unsubscribe();
            }
        };
        return TranslateDirective;
    }());
    TranslateDirective.decorators = [
        { type: core.Directive, args: [{
                    selector: '[translate],[ngx-translate]'
                },] }
    ];
    /** @nocollapse */
    TranslateDirective.ctorParameters = function () { return [
        { type: TranslateService },
        { type: core.ElementRef },
        { type: core.ChangeDetectorRef }
    ]; };
    TranslateDirective.propDecorators = {
        translate: [{ type: core.Input }],
        translateParams: [{ type: core.Input }]
    };
    if (false) {
        /** @type {?} */
        TranslateDirective.prototype.key;
        /** @type {?} */
        TranslateDirective.prototype.lastParams;
        /** @type {?} */
        TranslateDirective.prototype.currentParams;
        /** @type {?} */
        TranslateDirective.prototype.onLangChangeSub;
        /** @type {?} */
        TranslateDirective.prototype.onDefaultLangChangeSub;
        /** @type {?} */
        TranslateDirective.prototype.onTranslationChangeSub;
        /**
         * @type {?}
         * @private
         */
        TranslateDirective.prototype.translateService;
        /**
         * @type {?}
         * @private
         */
        TranslateDirective.prototype.element;
        /**
         * @type {?}
         * @private
         */
        TranslateDirective.prototype._ref;
    }

    /**
     * @fileoverview added by tsickle
     * Generated from: lib/translate.pipe.ts
     * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
     */
    var TranslatePipe = /** @class */ (function () {
        /**
         * @param {?} translate
         * @param {?} _ref
         */
        function TranslatePipe(translate, _ref) {
            this.translate = translate;
            this._ref = _ref;
            this.value = '';
        }
        /**
         * @param {?} key
         * @param {?=} interpolateParams
         * @param {?=} translations
         * @return {?}
         */
        TranslatePipe.prototype.updateValue = function (key, interpolateParams, translations) {
            var _this = this;
            /** @type {?} */
            var onTranslation = ( /**
             * @param {?} res
             * @return {?}
             */function (res) {
                _this.value = res !== undefined ? res : key;
                _this.lastKey = key;
                _this._ref.markForCheck();
            });
            if (translations) {
                /** @type {?} */
                var res = this.translate.getParsedResult(translations, key, interpolateParams);
                if (rxjs.isObservable(res.subscribe)) {
                    res.subscribe(onTranslation);
                }
                else {
                    onTranslation(res);
                }
            }
            this.translate.get(key, interpolateParams).subscribe(onTranslation);
        };
        /**
         * @param {?} query
         * @param {...?} args
         * @return {?}
         */
        TranslatePipe.prototype.transform = function (query) {
            var _this = this;
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            if (!query || !query.length) {
                return query;
            }
            // if we ask another time for the same key, return the last value
            if (equals(query, this.lastKey) && equals(args, this.lastParams)) {
                return this.value;
            }
            /** @type {?} */
            var interpolateParams;
            if (isDefined(args[0]) && args.length) {
                if (typeof args[0] === 'string' && args[0].length) {
                    // we accept objects written in the template such as {n:1}, {'n':1}, {n:'v'}
                    // which is why we might need to change it to real JSON objects such as {"n":1} or {"n":"v"}
                    /** @type {?} */
                    var validArgs = args[0]
                        .replace(/(\')?([a-zA-Z0-9_]+)(\')?(\s)?:/g, '"$2":')
                        .replace(/:(\s)?(\')(.*?)(\')/g, ':"$3"');
                    try {
                        interpolateParams = JSON.parse(validArgs);
                    }
                    catch (e) {
                        throw new SyntaxError("Wrong parameter in TranslatePipe. Expected a valid Object, received: " + args[0]);
                    }
                }
                else if (typeof args[0] === 'object' && !Array.isArray(args[0])) {
                    interpolateParams = args[0];
                }
            }
            // store the query, in case it changes
            this.lastKey = query;
            // store the params, in case they change
            this.lastParams = args;
            // set the value
            this.updateValue(query, interpolateParams);
            // if there is a subscription to onLangChange, clean it
            this._dispose();
            // subscribe to onTranslationChange event, in case the translations change
            if (!this.onTranslationChange) {
                this.onTranslationChange = this.translate.onTranslationChange.subscribe(( /**
                 * @param {?} event
                 * @return {?}
                 */function (event) {
                    if (_this.lastKey && event.lang === _this.translate.currentLang) {
                        _this.lastKey = null;
                        _this.updateValue(query, interpolateParams, event.translations);
                    }
                }));
            }
            // subscribe to onLangChange event, in case the language changes
            if (!this.onLangChange) {
                this.onLangChange = this.translate.onLangChange.subscribe(( /**
                 * @param {?} event
                 * @return {?}
                 */function (event) {
                    if (_this.lastKey) {
                        _this.lastKey = null; // we want to make sure it doesn't return the same value until it's been updated
                        _this.updateValue(query, interpolateParams, event.translations);
                    }
                }));
            }
            // subscribe to onDefaultLangChange event, in case the default language changes
            if (!this.onDefaultLangChange) {
                this.onDefaultLangChange = this.translate.onDefaultLangChange.subscribe(( /**
                 * @return {?}
                 */function () {
                    if (_this.lastKey) {
                        _this.lastKey = null; // we want to make sure it doesn't return the same value until it's been updated
                        _this.updateValue(query, interpolateParams);
                    }
                }));
            }
            return this.value;
        };
        /**
         * Clean any existing subscription to change events
         * @private
         * @return {?}
         */
        TranslatePipe.prototype._dispose = function () {
            if (typeof this.onTranslationChange !== 'undefined') {
                this.onTranslationChange.unsubscribe();
                this.onTranslationChange = undefined;
            }
            if (typeof this.onLangChange !== 'undefined') {
                this.onLangChange.unsubscribe();
                this.onLangChange = undefined;
            }
            if (typeof this.onDefaultLangChange !== 'undefined') {
                this.onDefaultLangChange.unsubscribe();
                this.onDefaultLangChange = undefined;
            }
        };
        /**
         * @return {?}
         */
        TranslatePipe.prototype.ngOnDestroy = function () {
            this._dispose();
        };
        return TranslatePipe;
    }());
    TranslatePipe.decorators = [
        { type: core.Injectable },
        { type: core.Pipe, args: [{
                    name: 'translate',
                    pure: false // required to update the value when the promise is resolved
                },] }
    ];
    /** @nocollapse */
    TranslatePipe.ctorParameters = function () { return [
        { type: TranslateService },
        { type: core.ChangeDetectorRef }
    ]; };
    if (false) {
        /** @type {?} */
        TranslatePipe.prototype.value;
        /** @type {?} */
        TranslatePipe.prototype.lastKey;
        /** @type {?} */
        TranslatePipe.prototype.lastParams;
        /** @type {?} */
        TranslatePipe.prototype.onTranslationChange;
        /** @type {?} */
        TranslatePipe.prototype.onLangChange;
        /** @type {?} */
        TranslatePipe.prototype.onDefaultLangChange;
        /**
         * @type {?}
         * @private
         */
        TranslatePipe.prototype.translate;
        /**
         * @type {?}
         * @private
         */
        TranslatePipe.prototype._ref;
    }

    /**
     * @fileoverview added by tsickle
     * Generated from: public_api.ts
     * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
     */
    /**
     * @record
     */
    function TranslateModuleConfig() { }
    if (false) {
        /** @type {?|undefined} */
        TranslateModuleConfig.prototype.loader;
        /** @type {?|undefined} */
        TranslateModuleConfig.prototype.compiler;
        /** @type {?|undefined} */
        TranslateModuleConfig.prototype.parser;
        /** @type {?|undefined} */
        TranslateModuleConfig.prototype.missingTranslationHandler;
        /** @type {?|undefined} */
        TranslateModuleConfig.prototype.isolate;
        /** @type {?|undefined} */
        TranslateModuleConfig.prototype.extend;
        /** @type {?|undefined} */
        TranslateModuleConfig.prototype.useDefaultLang;
        /** @type {?|undefined} */
        TranslateModuleConfig.prototype.defaultLanguage;
    }
    var TranslateModule = /** @class */ (function () {
        function TranslateModule() {
        }
        /**
         * Use this method in your root module to provide the TranslateService
         * @param {?=} config
         * @return {?}
         */
        TranslateModule.forRoot = function (config) {
            if (config === void 0) { config = {}; }
            return {
                ngModule: TranslateModule,
                providers: [
                    config.loader || { provide: TranslateLoader, useClass: TranslateFakeLoader },
                    config.compiler || { provide: TranslateCompiler, useClass: TranslateFakeCompiler },
                    config.parser || { provide: TranslateParser, useClass: TranslateDefaultParser },
                    config.missingTranslationHandler || { provide: MissingTranslationHandler, useClass: FakeMissingTranslationHandler },
                    TranslateStore,
                    { provide: USE_STORE, useValue: config.isolate },
                    { provide: USE_DEFAULT_LANG, useValue: config.useDefaultLang },
                    { provide: USE_EXTEND, useValue: config.extend },
                    { provide: DEFAULT_LANGUAGE, useValue: config.defaultLanguage },
                    TranslateService
                ]
            };
        };
        /**
         * Use this method in your other (non root) modules to import the directive/pipe
         * @param {?=} config
         * @return {?}
         */
        TranslateModule.forChild = function (config) {
            if (config === void 0) { config = {}; }
            return {
                ngModule: TranslateModule,
                providers: [
                    config.loader || { provide: TranslateLoader, useClass: TranslateFakeLoader },
                    config.compiler || { provide: TranslateCompiler, useClass: TranslateFakeCompiler },
                    config.parser || { provide: TranslateParser, useClass: TranslateDefaultParser },
                    config.missingTranslationHandler || { provide: MissingTranslationHandler, useClass: FakeMissingTranslationHandler },
                    { provide: USE_STORE, useValue: config.isolate },
                    { provide: USE_DEFAULT_LANG, useValue: config.useDefaultLang },
                    { provide: USE_EXTEND, useValue: config.extend },
                    { provide: DEFAULT_LANGUAGE, useValue: config.defaultLanguage },
                    TranslateService
                ]
            };
        };
        return TranslateModule;
    }());
    TranslateModule.decorators = [
        { type: core.NgModule, args: [{
                    declarations: [
                        TranslatePipe,
                        TranslateDirective
                    ],
                    exports: [
                        TranslatePipe,
                        TranslateDirective
                    ]
                },] }
    ];

    /**
     * @fileoverview added by tsickle
     * Generated from: ngx-translate-core.ts
     * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
     */

    exports.DEFAULT_LANGUAGE = DEFAULT_LANGUAGE;
    exports.FakeMissingTranslationHandler = FakeMissingTranslationHandler;
    exports.MissingTranslationHandler = MissingTranslationHandler;
    exports.TranslateCompiler = TranslateCompiler;
    exports.TranslateDefaultParser = TranslateDefaultParser;
    exports.TranslateDirective = TranslateDirective;
    exports.TranslateFakeCompiler = TranslateFakeCompiler;
    exports.TranslateFakeLoader = TranslateFakeLoader;
    exports.TranslateLoader = TranslateLoader;
    exports.TranslateModule = TranslateModule;
    exports.TranslateParser = TranslateParser;
    exports.TranslatePipe = TranslatePipe;
    exports.TranslateService = TranslateService;
    exports.TranslateStore = TranslateStore;
    exports.USE_DEFAULT_LANG = USE_DEFAULT_LANG;
    exports.USE_EXTEND = USE_EXTEND;
    exports.USE_STORE = USE_STORE;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=ngx-translate-core.umd.js.map
