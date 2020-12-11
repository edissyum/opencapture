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
        define("@angular/compiler-cli/src/ngtsc/typecheck/api/scope", ["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NvcGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL25ndHNjL3R5cGVjaGVjay9hcGkvc2NvcGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuXG4vKipcbiAqIE1ldGFkYXRhIG9uIGEgZGlyZWN0aXZlIHdoaWNoIGlzIGF2YWlsYWJsZSBpbiB0aGUgc2NvcGUgb2YgYSB0ZW1wbGF0ZS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBEaXJlY3RpdmVJblNjb3BlIHtcbiAgLyoqXG4gICAqIFRoZSBgdHMuU3ltYm9sYCBmb3IgdGhlIGRpcmVjdGl2ZSBjbGFzcy5cbiAgICovXG4gIHRzU3ltYm9sOiB0cy5TeW1ib2w7XG5cbiAgLyoqXG4gICAqIFRoZSBzZWxlY3RvciBmb3IgdGhlIGRpcmVjdGl2ZSBvciBjb21wb25lbnQuXG4gICAqL1xuICBzZWxlY3Rvcjogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBgdHJ1ZWAgaWYgdGhpcyBkaXJlY3RpdmUgaXMgYSBjb21wb25lbnQuXG4gICAqL1xuICBpc0NvbXBvbmVudDogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBNZXRhZGF0YSBmb3IgYSBwaXBlIHdoaWNoIGlzIGF2YWlsYWJsZSBpbiB0aGUgc2NvcGUgb2YgYSB0ZW1wbGF0ZS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBQaXBlSW5TY29wZSB7XG4gIC8qKlxuICAgKiBUaGUgYHRzLlN5bWJvbGAgZm9yIHRoZSBwaXBlIGNsYXNzLlxuICAgKi9cbiAgdHNTeW1ib2w6IHRzLlN5bWJvbDtcblxuICAvKipcbiAgICogTmFtZSBvZiB0aGUgcGlwZS5cbiAgICovXG4gIG5hbWU6IHN0cmluZztcbn1cbiJdfQ==