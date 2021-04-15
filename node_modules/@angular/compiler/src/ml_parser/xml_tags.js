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
        define("@angular/compiler/src/ml_parser/xml_tags", ["require", "exports", "@angular/compiler/src/ml_parser/tags"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getXmlTagDefinition = exports.XmlTagDefinition = void 0;
    var tags_1 = require("@angular/compiler/src/ml_parser/tags");
    var XmlTagDefinition = /** @class */ (function () {
        function XmlTagDefinition() {
            this.closedByParent = false;
            this.contentType = tags_1.TagContentType.PARSABLE_DATA;
            this.isVoid = false;
            this.ignoreFirstLf = false;
            this.canSelfClose = true;
            this.preventNamespaceInheritance = false;
        }
        XmlTagDefinition.prototype.requireExtraParent = function (currentParent) {
            return false;
        };
        XmlTagDefinition.prototype.isClosedByChild = function (name) {
            return false;
        };
        return XmlTagDefinition;
    }());
    exports.XmlTagDefinition = XmlTagDefinition;
    var _TAG_DEFINITION = new XmlTagDefinition();
    function getXmlTagDefinition(tagName) {
        return _TAG_DEFINITION;
    }
    exports.getXmlTagDefinition = getXmlTagDefinition;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieG1sX3RhZ3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci9zcmMvbWxfcGFyc2VyL3htbF90YWdzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7OztJQUVILDZEQUFxRDtJQUVyRDtRQUFBO1lBQ0UsbUJBQWMsR0FBWSxLQUFLLENBQUM7WUFPaEMsZ0JBQVcsR0FBbUIscUJBQWMsQ0FBQyxhQUFhLENBQUM7WUFDM0QsV0FBTSxHQUFZLEtBQUssQ0FBQztZQUN4QixrQkFBYSxHQUFZLEtBQUssQ0FBQztZQUMvQixpQkFBWSxHQUFZLElBQUksQ0FBQztZQUM3QixnQ0FBMkIsR0FBWSxLQUFLLENBQUM7UUFTL0MsQ0FBQztRQVBDLDZDQUFrQixHQUFsQixVQUFtQixhQUFxQjtZQUN0QyxPQUFPLEtBQUssQ0FBQztRQUNmLENBQUM7UUFFRCwwQ0FBZSxHQUFmLFVBQWdCLElBQVk7WUFDMUIsT0FBTyxLQUFLLENBQUM7UUFDZixDQUFDO1FBQ0gsdUJBQUM7SUFBRCxDQUFDLEFBckJELElBcUJDO0lBckJZLDRDQUFnQjtJQXVCN0IsSUFBTSxlQUFlLEdBQUcsSUFBSSxnQkFBZ0IsRUFBRSxDQUFDO0lBRS9DLFNBQWdCLG1CQUFtQixDQUFDLE9BQWU7UUFDakQsT0FBTyxlQUFlLENBQUM7SUFDekIsQ0FBQztJQUZELGtEQUVDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7VGFnQ29udGVudFR5cGUsIFRhZ0RlZmluaXRpb259IGZyb20gJy4vdGFncyc7XG5cbmV4cG9ydCBjbGFzcyBYbWxUYWdEZWZpbml0aW9uIGltcGxlbWVudHMgVGFnRGVmaW5pdGlvbiB7XG4gIGNsb3NlZEJ5UGFyZW50OiBib29sZWFuID0gZmFsc2U7XG4gIC8vIFRPRE8oaXNzdWUvMjQ1NzEpOiByZW1vdmUgJyEnLlxuICByZXF1aXJlZFBhcmVudHMhOiB7W2tleTogc3RyaW5nXTogYm9vbGVhbn07XG4gIC8vIFRPRE8oaXNzdWUvMjQ1NzEpOiByZW1vdmUgJyEnLlxuICBwYXJlbnRUb0FkZCE6IHN0cmluZztcbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIGltcGxpY2l0TmFtZXNwYWNlUHJlZml4ITogc3RyaW5nO1xuICBjb250ZW50VHlwZTogVGFnQ29udGVudFR5cGUgPSBUYWdDb250ZW50VHlwZS5QQVJTQUJMRV9EQVRBO1xuICBpc1ZvaWQ6IGJvb2xlYW4gPSBmYWxzZTtcbiAgaWdub3JlRmlyc3RMZjogYm9vbGVhbiA9IGZhbHNlO1xuICBjYW5TZWxmQ2xvc2U6IGJvb2xlYW4gPSB0cnVlO1xuICBwcmV2ZW50TmFtZXNwYWNlSW5oZXJpdGFuY2U6IGJvb2xlYW4gPSBmYWxzZTtcblxuICByZXF1aXJlRXh0cmFQYXJlbnQoY3VycmVudFBhcmVudDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaXNDbG9zZWRCeUNoaWxkKG5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG5jb25zdCBfVEFHX0RFRklOSVRJT04gPSBuZXcgWG1sVGFnRGVmaW5pdGlvbigpO1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0WG1sVGFnRGVmaW5pdGlvbih0YWdOYW1lOiBzdHJpbmcpOiBYbWxUYWdEZWZpbml0aW9uIHtcbiAgcmV0dXJuIF9UQUdfREVGSU5JVElPTjtcbn1cbiJdfQ==