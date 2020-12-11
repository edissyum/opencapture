(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/src/ngtsc/sourcemaps", ["require", "exports", "@angular/compiler-cli/src/ngtsc/sourcemaps/src/source_file", "@angular/compiler-cli/src/ngtsc/sourcemaps/src/source_file_loader"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SourceFileLoader = exports.SourceFile = void 0;
    var source_file_1 = require("@angular/compiler-cli/src/ngtsc/sourcemaps/src/source_file");
    Object.defineProperty(exports, "SourceFile", { enumerable: true, get: function () { return source_file_1.SourceFile; } });
    var source_file_loader_1 = require("@angular/compiler-cli/src/ngtsc/sourcemaps/src/source_file_loader");
    Object.defineProperty(exports, "SourceFileLoader", { enumerable: true, get: function () { return source_file_loader_1.SourceFileLoader; } });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL25ndHNjL3NvdXJjZW1hcHMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0lBUUEsMEZBQXNEO0lBQXJDLHlHQUFBLFVBQVUsT0FBQTtJQUMzQix3R0FBMEQ7SUFBbEQsc0hBQUEsZ0JBQWdCLE9BQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmV4cG9ydCB7UmF3U291cmNlTWFwfSBmcm9tICcuL3NyYy9yYXdfc291cmNlX21hcCc7XG5leHBvcnQge01hcHBpbmcsIFNvdXJjZUZpbGV9IGZyb20gJy4vc3JjL3NvdXJjZV9maWxlJztcbmV4cG9ydCB7U291cmNlRmlsZUxvYWRlcn0gZnJvbSAnLi9zcmMvc291cmNlX2ZpbGVfbG9hZGVyJztcbiJdfQ==