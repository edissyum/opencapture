(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define('@ngx-translate/http-loader', ['exports'], factory) :
    (global = global || self, factory((global['ngx-translate'] = global['ngx-translate'] || {}, global['ngx-translate']['http-loader'] = {})));
}(this, (function (exports) { 'use strict';

    var TranslateHttpLoader = /** @class */ (function () {
        function TranslateHttpLoader(http, prefix, suffix) {
            if (prefix === void 0) { prefix = "/assets/i18n/"; }
            if (suffix === void 0) { suffix = ".json"; }
            this.http = http;
            this.prefix = prefix;
            this.suffix = suffix;
        }
        /**
         * Gets the translations from the server
         */
        TranslateHttpLoader.prototype.getTranslation = function (lang) {
            return this.http.get("" + this.prefix + lang + this.suffix);
        };
        return TranslateHttpLoader;
    }());

    /**
     * Generated bundle index. Do not edit.
     */

    exports.TranslateHttpLoader = TranslateHttpLoader;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=ngx-translate-http-loader.umd.js.map
