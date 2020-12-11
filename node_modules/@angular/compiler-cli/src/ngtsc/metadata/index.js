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
        define("@angular/compiler-cli/src/ngtsc/metadata", ["require", "exports", "tslib", "@angular/compiler-cli/src/ngtsc/metadata/src/api", "@angular/compiler-cli/src/ngtsc/metadata/src/dts", "@angular/compiler-cli/src/ngtsc/metadata/src/inheritance", "@angular/compiler-cli/src/ngtsc/metadata/src/registry", "@angular/compiler-cli/src/ngtsc/metadata/src/template_mapping", "@angular/compiler-cli/src/ngtsc/metadata/src/util", "@angular/compiler-cli/src/ngtsc/metadata/src/property_mapping"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ClassPropertyMapping = exports.CompoundMetadataReader = exports.extractDirectiveTypeCheckMeta = exports.TemplateMapping = exports.InjectableClassRegistry = exports.LocalMetadataRegistry = exports.CompoundMetadataRegistry = exports.flattenInheritedDirectiveMetadata = exports.DtsMetadataReader = void 0;
    var tslib_1 = require("tslib");
    tslib_1.__exportStar(require("@angular/compiler-cli/src/ngtsc/metadata/src/api"), exports);
    var dts_1 = require("@angular/compiler-cli/src/ngtsc/metadata/src/dts");
    Object.defineProperty(exports, "DtsMetadataReader", { enumerable: true, get: function () { return dts_1.DtsMetadataReader; } });
    var inheritance_1 = require("@angular/compiler-cli/src/ngtsc/metadata/src/inheritance");
    Object.defineProperty(exports, "flattenInheritedDirectiveMetadata", { enumerable: true, get: function () { return inheritance_1.flattenInheritedDirectiveMetadata; } });
    var registry_1 = require("@angular/compiler-cli/src/ngtsc/metadata/src/registry");
    Object.defineProperty(exports, "CompoundMetadataRegistry", { enumerable: true, get: function () { return registry_1.CompoundMetadataRegistry; } });
    Object.defineProperty(exports, "LocalMetadataRegistry", { enumerable: true, get: function () { return registry_1.LocalMetadataRegistry; } });
    Object.defineProperty(exports, "InjectableClassRegistry", { enumerable: true, get: function () { return registry_1.InjectableClassRegistry; } });
    var template_mapping_1 = require("@angular/compiler-cli/src/ngtsc/metadata/src/template_mapping");
    Object.defineProperty(exports, "TemplateMapping", { enumerable: true, get: function () { return template_mapping_1.TemplateRegistry; } });
    var util_1 = require("@angular/compiler-cli/src/ngtsc/metadata/src/util");
    Object.defineProperty(exports, "extractDirectiveTypeCheckMeta", { enumerable: true, get: function () { return util_1.extractDirectiveTypeCheckMeta; } });
    Object.defineProperty(exports, "CompoundMetadataReader", { enumerable: true, get: function () { return util_1.CompoundMetadataReader; } });
    var property_mapping_1 = require("@angular/compiler-cli/src/ngtsc/metadata/src/property_mapping");
    Object.defineProperty(exports, "ClassPropertyMapping", { enumerable: true, get: function () { return property_mapping_1.ClassPropertyMapping; } });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL25ndHNjL21ldGFkYXRhL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCwyRkFBMEI7SUFDMUIsd0VBQTRDO0lBQXBDLHdHQUFBLGlCQUFpQixPQUFBO0lBQ3pCLHdGQUFvRTtJQUE1RCxnSUFBQSxpQ0FBaUMsT0FBQTtJQUN6QyxrRkFBd0c7SUFBaEcsb0hBQUEsd0JBQXdCLE9BQUE7SUFBRSxpSEFBQSxxQkFBcUIsT0FBQTtJQUFFLG1IQUFBLHVCQUF1QixPQUFBO0lBQ2hGLGtHQUEyRTtJQUFuRSxtSEFBQSxnQkFBZ0IsT0FBbUI7SUFDM0MsMEVBQWlGO0lBQXpFLHFIQUFBLDZCQUE2QixPQUFBO0lBQUUsOEdBQUEsc0JBQXNCLE9BQUE7SUFDN0Qsa0dBQW1IO0lBQXRGLHdIQUFBLG9CQUFvQixPQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmV4cG9ydCAqIGZyb20gJy4vc3JjL2FwaSc7XG5leHBvcnQge0R0c01ldGFkYXRhUmVhZGVyfSBmcm9tICcuL3NyYy9kdHMnO1xuZXhwb3J0IHtmbGF0dGVuSW5oZXJpdGVkRGlyZWN0aXZlTWV0YWRhdGF9IGZyb20gJy4vc3JjL2luaGVyaXRhbmNlJztcbmV4cG9ydCB7Q29tcG91bmRNZXRhZGF0YVJlZ2lzdHJ5LCBMb2NhbE1ldGFkYXRhUmVnaXN0cnksIEluamVjdGFibGVDbGFzc1JlZ2lzdHJ5fSBmcm9tICcuL3NyYy9yZWdpc3RyeSc7XG5leHBvcnQge1RlbXBsYXRlUmVnaXN0cnkgYXMgVGVtcGxhdGVNYXBwaW5nfSBmcm9tICcuL3NyYy90ZW1wbGF0ZV9tYXBwaW5nJztcbmV4cG9ydCB7ZXh0cmFjdERpcmVjdGl2ZVR5cGVDaGVja01ldGEsIENvbXBvdW5kTWV0YWRhdGFSZWFkZXJ9IGZyb20gJy4vc3JjL3V0aWwnO1xuZXhwb3J0IHtCaW5kaW5nUHJvcGVydHlOYW1lLCBDbGFzc1Byb3BlcnR5TWFwcGluZywgQ2xhc3NQcm9wZXJ0eU5hbWUsIElucHV0T3JPdXRwdXR9IGZyb20gJy4vc3JjL3Byb3BlcnR5X21hcHBpbmcnOyJdfQ==