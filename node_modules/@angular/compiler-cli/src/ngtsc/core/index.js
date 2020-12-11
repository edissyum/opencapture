/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/src/ngtsc/core", ["require", "exports", "@angular/compiler-cli/src/ngtsc/core/src/compiler", "@angular/compiler-cli/src/ngtsc/core/src/host"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NgCompilerHost = exports.NgCompiler = void 0;
    var compiler_1 = require("@angular/compiler-cli/src/ngtsc/core/src/compiler");
    Object.defineProperty(exports, "NgCompiler", { enumerable: true, get: function () { return compiler_1.NgCompiler; } });
    var host_1 = require("@angular/compiler-cli/src/ngtsc/core/src/host");
    Object.defineProperty(exports, "NgCompilerHost", { enumerable: true, get: function () { return host_1.NgCompilerHost; } });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL25ndHNjL2NvcmUvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7O0lBRUgsOEVBQTBDO0lBQWxDLHNHQUFBLFVBQVUsT0FBQTtJQUNsQixzRUFBMEM7SUFBbEMsc0dBQUEsY0FBYyxPQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmV4cG9ydCB7TmdDb21waWxlcn0gZnJvbSAnLi9zcmMvY29tcGlsZXInO1xuZXhwb3J0IHtOZ0NvbXBpbGVySG9zdH0gZnJvbSAnLi9zcmMvaG9zdCc7XG4iXX0=