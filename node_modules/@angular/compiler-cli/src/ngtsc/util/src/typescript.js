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
        define("@angular/compiler-cli/src/ngtsc/util/src/typescript", ["require", "exports", "tslib", "typescript", "@angular/compiler-cli/src/ngtsc/file_system"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isAssignment = exports.resolveModuleName = exports.nodeDebugInfo = exports.getRootDirs = exports.isExported = exports.isTypeDeclaration = exports.isValueDeclaration = exports.isDeclaration = exports.identifierOfNode = exports.getTokenAtPosition = exports.getSourceFileOrNull = exports.getSourceFile = exports.nodeNameForError = exports.isFromDtsFile = exports.isNonDeclarationTsPath = exports.isDtsPath = void 0;
    var tslib_1 = require("tslib");
    var TS = /\.tsx?$/i;
    var D_TS = /\.d\.ts$/i;
    var ts = require("typescript");
    var file_system_1 = require("@angular/compiler-cli/src/ngtsc/file_system");
    function isDtsPath(filePath) {
        return D_TS.test(filePath);
    }
    exports.isDtsPath = isDtsPath;
    function isNonDeclarationTsPath(filePath) {
        return TS.test(filePath) && !D_TS.test(filePath);
    }
    exports.isNonDeclarationTsPath = isNonDeclarationTsPath;
    function isFromDtsFile(node) {
        var sf = node.getSourceFile();
        if (sf === undefined) {
            sf = ts.getOriginalNode(node).getSourceFile();
        }
        return sf !== undefined && sf.isDeclarationFile;
    }
    exports.isFromDtsFile = isFromDtsFile;
    function nodeNameForError(node) {
        if (node.name !== undefined && ts.isIdentifier(node.name)) {
            return node.name.text;
        }
        else {
            var kind = ts.SyntaxKind[node.kind];
            var _a = ts.getLineAndCharacterOfPosition(node.getSourceFile(), node.getStart()), line = _a.line, character = _a.character;
            return kind + "@" + line + ":" + character;
        }
    }
    exports.nodeNameForError = nodeNameForError;
    function getSourceFile(node) {
        // In certain transformation contexts, `ts.Node.getSourceFile()` can actually return `undefined`,
        // despite the type signature not allowing it. In that event, get the `ts.SourceFile` via the
        // original node instead (which works).
        var directSf = node.getSourceFile();
        return directSf !== undefined ? directSf : ts.getOriginalNode(node).getSourceFile();
    }
    exports.getSourceFile = getSourceFile;
    function getSourceFileOrNull(program, fileName) {
        return program.getSourceFile(fileName) || null;
    }
    exports.getSourceFileOrNull = getSourceFileOrNull;
    function getTokenAtPosition(sf, pos) {
        // getTokenAtPosition is part of TypeScript's private API.
        return ts.getTokenAtPosition(sf, pos);
    }
    exports.getTokenAtPosition = getTokenAtPosition;
    function identifierOfNode(decl) {
        if (decl.name !== undefined && ts.isIdentifier(decl.name)) {
            return decl.name;
        }
        else {
            return null;
        }
    }
    exports.identifierOfNode = identifierOfNode;
    function isDeclaration(node) {
        return isValueDeclaration(node) || isTypeDeclaration(node);
    }
    exports.isDeclaration = isDeclaration;
    function isValueDeclaration(node) {
        return ts.isClassDeclaration(node) || ts.isFunctionDeclaration(node) ||
            ts.isVariableDeclaration(node);
    }
    exports.isValueDeclaration = isValueDeclaration;
    function isTypeDeclaration(node) {
        return ts.isEnumDeclaration(node) || ts.isTypeAliasDeclaration(node) ||
            ts.isInterfaceDeclaration(node);
    }
    exports.isTypeDeclaration = isTypeDeclaration;
    function isExported(node) {
        var topLevel = node;
        if (ts.isVariableDeclaration(node) && ts.isVariableDeclarationList(node.parent)) {
            topLevel = node.parent.parent;
        }
        return topLevel.modifiers !== undefined &&
            topLevel.modifiers.some(function (modifier) { return modifier.kind === ts.SyntaxKind.ExportKeyword; });
    }
    exports.isExported = isExported;
    function getRootDirs(host, options) {
        var rootDirs = [];
        if (options.rootDirs !== undefined) {
            rootDirs.push.apply(rootDirs, tslib_1.__spread(options.rootDirs));
        }
        else if (options.rootDir !== undefined) {
            rootDirs.push(options.rootDir);
        }
        else {
            rootDirs.push(host.getCurrentDirectory());
        }
        // In Windows the above might not always return posix separated paths
        // See:
        // https://github.com/Microsoft/TypeScript/blob/3f7357d37f66c842d70d835bc925ec2a873ecfec/src/compiler/sys.ts#L650
        // Also compiler options might be set via an API which doesn't normalize paths
        return rootDirs.map(function (rootDir) { return file_system_1.absoluteFrom(host.getCanonicalFileName(rootDir)); });
    }
    exports.getRootDirs = getRootDirs;
    function nodeDebugInfo(node) {
        var sf = getSourceFile(node);
        var _a = ts.getLineAndCharacterOfPosition(sf, node.pos), line = _a.line, character = _a.character;
        return "[" + sf.fileName + ": " + ts.SyntaxKind[node.kind] + " @ " + line + ":" + character + "]";
    }
    exports.nodeDebugInfo = nodeDebugInfo;
    /**
     * Resolve the specified `moduleName` using the given `compilerOptions` and `compilerHost`.
     *
     * This helper will attempt to use the `CompilerHost.resolveModuleNames()` method if available.
     * Otherwise it will fallback on the `ts.ResolveModuleName()` function.
     */
    function resolveModuleName(moduleName, containingFile, compilerOptions, compilerHost, moduleResolutionCache) {
        if (compilerHost.resolveModuleNames) {
            return compilerHost.resolveModuleNames([moduleName], containingFile, undefined, // reusedNames
            undefined, // redirectedReference
            compilerOptions)[0];
        }
        else {
            return ts
                .resolveModuleName(moduleName, containingFile, compilerOptions, compilerHost, moduleResolutionCache !== null ? moduleResolutionCache : undefined)
                .resolvedModule;
        }
    }
    exports.resolveModuleName = resolveModuleName;
    /** Returns true if the node is an assignment expression. */
    function isAssignment(node) {
        return ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.EqualsToken;
    }
    exports.isAssignment = isAssignment;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZXNjcmlwdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9zcmMvbmd0c2MvdXRpbC9zcmMvdHlwZXNjcmlwdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBRUgsSUFBTSxFQUFFLEdBQUcsVUFBVSxDQUFDO0lBQ3RCLElBQU0sSUFBSSxHQUFHLFdBQVcsQ0FBQztJQUV6QiwrQkFBaUM7SUFDakMsMkVBQStEO0lBRy9ELFNBQWdCLFNBQVMsQ0FBQyxRQUFnQjtRQUN4QyxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDN0IsQ0FBQztJQUZELDhCQUVDO0lBRUQsU0FBZ0Isc0JBQXNCLENBQUMsUUFBZ0I7UUFDckQsT0FBTyxFQUFFLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUNuRCxDQUFDO0lBRkQsd0RBRUM7SUFFRCxTQUFnQixhQUFhLENBQUMsSUFBYTtRQUN6QyxJQUFJLEVBQUUsR0FBNEIsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBQ3ZELElBQUksRUFBRSxLQUFLLFNBQVMsRUFBRTtZQUNwQixFQUFFLEdBQUcsRUFBRSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxhQUFhLEVBQUUsQ0FBQztTQUMvQztRQUNELE9BQU8sRUFBRSxLQUFLLFNBQVMsSUFBSSxFQUFFLENBQUMsaUJBQWlCLENBQUM7SUFDbEQsQ0FBQztJQU5ELHNDQU1DO0lBRUQsU0FBZ0IsZ0JBQWdCLENBQUMsSUFBOEI7UUFDN0QsSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLFNBQVMsSUFBSSxFQUFFLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUN6RCxPQUFPLElBQUks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aUIsQ0FDN0IsVUFBa0IsRUFBRSxjQUFzQixFQUFFLGVBQW1DLEVBQy9FLFlBQWlGLEVBQ2pGLHFCQUFvRDtRQUN0RCxJQUFJLFlBQVksQ0FBQyxrQkFBa0IsRUFBRTtZQUNuQyxPQUFPLFlBQVksQ0FBQyxrQkFBa0IsQ0FDbEMsQ0FBQyxVQUFVLENBQUMsRUFBRSxjQUFjLEVBQzVCLFNBQVMsRUFBRyxjQUFjO1lBQzFCLFNBQVMsRUFBRyxzQkFBc0I7WUFDbEMsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDekI7YUFBTTtZQUNMLE9BQU8sRUFBRTtpQkFDSixpQkFBaUIsQ0FDZCxVQUFVLEVBQUUsY0FBYyxFQUFFLGVBQWUsRUFBRSxZQUFZLEVBQ3pELHFCQUFxQixLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztpQkFDdEUsY0FBYyxDQUFDO1NBQ3JCO0lBQ0gsQ0FBQztJQWpCRCw4Q0FpQkM7SUFFRCw0REFBNEQ7SUFDNUQsU0FBZ0IsWUFBWSxDQUFDLElBQWE7UUFDeEMsT0FBTyxFQUFFLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEtBQUssRUFBRSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUM7SUFDOUYsQ0FBQztJQUZELG9DQUVDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmNvbnN0IFRTID0gL1xcLnRzeD8kL2k7XG5jb25zdCBEX1RTID0gL1xcLmRcXC50cyQvaTtcblxuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5pbXBvcnQge0Fic29sdXRlRnNQYXRoLCBhYnNvbHV0ZUZyb219IGZyb20gJy4uLy4uL2ZpbGVfc3lzdGVtJztcbmltcG9ydCB7RGVjbGFyYXRpb25Ob2RlfSBmcm9tICcuLi8uLi9yZWZsZWN0aW9uJztcblxuZXhwb3J0IGZ1bmN0aW9uIGlzRHRzUGF0aChmaWxlUGF0aDogc3RyaW5nKTogYm9vbGVhbiB7XG4gIHJldHVybiBEX1RTLnRlc3QoZmlsZVBhdGgpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNOb25EZWNsYXJhdGlvblRzUGF0aChmaWxlUGF0aDogc3RyaW5nKTogYm9vbGVhbiB7XG4gIHJldHVybiBUUy50ZXN0KGZpbGVQYXRoKSAmJiAhRF9UUy50ZXN0KGZpbGVQYXRoKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzRnJvbUR0c0ZpbGUobm9kZTogdHMuTm9kZSk6IGJvb2xlYW4ge1xuICBsZXQgc2Y6IHRzLlNvdXJjZUZpbGV8dW5kZWZpbmVkID0gbm9kZS5nZXRTb3VyY2VGaWxlKCk7XG4gIGlmIChzZiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgc2YgPSB0cy5nZXRPcmlnaW5hbE5vZGUobm9kZSkuZ2V0U291cmNlRmlsZSgpO1xuICB9XG4gIHJldHVybiBzZiAhPT0gdW5kZWZpbmVkICYmIHNmLmlzRGVjbGFyYXRpb25GaWxlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbm9kZU5hbWVGb3JFcnJvcihub2RlOiB0cy5Ob2RlJntuYW1lPzogdHMuTm9kZX0pOiBzdHJpbmcge1xuICBpZiAobm9kZS5uYW1lICE9PSB1bmRlZmluZWQgJiYgdHMuaXNJZGVudGlmaWVyKG5vZGUubmFtZSkpIHtcbiAgICByZXR1cm4gbm9kZS5uYW1lLnRleHQ7XG4gIH0gZWxzZSB7XG4gICAgY29uc3Qga2luZCA9IHRzLlN5bnRheEtpbmRbbm9kZS5raW5kXTtcbiAgICBjb25zdCB7bGluZSwgY2hhcmFjdGVyfSA9XG4gICAgICAgIHRzLmdldExpbmVBbmRDaGFyYWN0ZXJPZlBvc2l0aW9uKG5vZGUuZ2V0U291cmNlRmlsZSgpLCBub2RlLmdldFN0YXJ0KCkpO1xuICAgIHJldHVybiBgJHtraW5kfUAke2xpbmV9OiR7Y2hhcmFjdGVyfWA7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFNvdXJjZUZpbGUobm9kZTogdHMuTm9kZSk6IHRzLlNvdXJjZUZpbGUge1xuICAvLyBJbiBjZXJ0YWluIHRyYW5zZm9ybWF0aW9uIGNvbnRleHRzLCBgdHMuTm9kZS5nZXRTb3VyY2VGaWxlKClgIGNhbiBhY3R1YWxseSByZXR1cm4gYHVuZGVmaW5lZGAsXG4gIC8vIGRlc3BpdGUgdGhlIHR5cGUgc2lnbmF0dXJlIG5vdCBhbGxvd2luZyBpdC4gSW4gdGhhdCBldmVudCwgZ2V0IHRoZSBgdHMuU291cmNlRmlsZWAgdmlhIHRoZVxuICAvLyBvcmlnaW5hbCBub2RlIGluc3RlYWQgKHdoaWNoIHdvcmtzKS5cbiAgY29uc3QgZGlyZWN0U2YgPSBub2RlLmdldFNvdXJjZUZpbGUoKSBhcyB0cy5Tb3VyY2VGaWxlIHwgdW5kZWZpbmVkO1xuICByZXR1cm4gZGlyZWN0U2YgIT09IHVuZGVmaW5lZCA/IGRpcmVjdFNmIDogdHMuZ2V0T3JpZ2luYWxOb2RlKG5vZGUpLmdldFNvdXJjZUZpbGUoKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFNvdXJjZUZpbGVPck51bGwocHJvZ3JhbTogdHMuUHJvZ3JhbSwgZmlsZU5hbWU6IEFic29sdXRlRnNQYXRoKTogdHMuU291cmNlRmlsZXxcbiAgICBudWxsIHtcbiAgcmV0dXJuIHByb2dyYW0uZ2V0U291cmNlRmlsZShmaWxlTmFtZSkgfHwgbnVsbDtcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0VG9rZW5BdFBvc2l0aW9uKHNmOiB0cy5Tb3VyY2VGaWxlLCBwb3M6IG51bWJlcik6IHRzLk5vZGUge1xuICAvLyBnZXRUb2tlbkF0UG9zaXRpb24gaXMgcGFydCBvZiBUeXBlU2NyaXB0J3MgcHJpdmF0ZSBBUEkuXG4gIHJldHVybiAodHMgYXMgYW55KS5nZXRUb2tlbkF0UG9zaXRpb24oc2YsIHBvcyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpZGVudGlmaWVyT2ZOb2RlKGRlY2w6IHRzLk5vZGUme25hbWU/OiB0cy5Ob2RlfSk6IHRzLklkZW50aWZpZXJ8bnVsbCB7XG4gIGlmIChkZWNsLm5hbWUgIT09IHVuZGVmaW5lZCAmJiB0cy5pc0lkZW50aWZpZXIoZGVjbC5uYW1lKSkge1xuICAgIHJldHVybiBkZWNsLm5hbWU7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzRGVjbGFyYXRpb24obm9kZTogdHMuTm9kZSk6IG5vZGUgaXMgdHMuRGVjbGFyYXRpb24ge1xuICByZXR1cm4gaXNWYWx1ZURlY2xhcmF0aW9uKG5vZGUpIHx8IGlzVHlwZURlY2xhcmF0aW9uKG5vZGUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNWYWx1ZURlY2xhcmF0aW9uKG5vZGU6IHRzLk5vZGUpOiBub2RlIGlzIHRzLkNsYXNzRGVjbGFyYXRpb258XG4gICAgdHMuRnVuY3Rpb25EZWNsYXJhdGlvbnx0cy5WYXJpYWJsZURlY2xhcmF0aW9uIHtcbiAgcmV0dXJuIHRzLmlzQ2xhc3NEZWNsYXJhdGlvbihub2RlKSB8fCB0cy5pc0Z1bmN0aW9uRGVjbGFyYXRpb24obm9kZSkgfHxcbiAgICAgIHRzLmlzVmFyaWFibGVEZWNsYXJhdGlvbihub2RlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzVHlwZURlY2xhcmF0aW9uKG5vZGU6IHRzLk5vZGUpOiBub2RlIGlzIHRzLkVudW1EZWNsYXJhdGlvbnxcbiAgICB0cy5UeXBlQWxpYXNEZWNsYXJhdGlvbnx0cy5JbnRlcmZhY2VEZWNsYXJhdGlvbiB7XG4gIHJldHVybiB0cy5pc0VudW1EZWNsYXJhdGlvbihub2RlKSB8fCB0cy5pc1R5cGVBbGlhc0RlY2xhcmF0aW9uKG5vZGUpIHx8XG4gICAgICB0cy5pc0ludGVyZmFjZURlY2xhcmF0aW9uKG5vZGUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNFeHBvcnRlZChub2RlOiBEZWNsYXJhdGlvbk5vZGUpOiBib29sZWFuIHtcbiAgbGV0IHRvcExldmVsOiB0cy5Ob2RlID0gbm9kZTtcbiAgaWYgKHRzLmlzVmFyaWFibGVEZWNsYXJhdGlvbihub2RlKSAmJiB0cy5pc1ZhcmlhYmxlRGVjbGFyYXRpb25MaXN0KG5vZGUucGFyZW50KSkge1xuICAgIHRvcExldmVsID0gbm9kZS5wYXJlbnQucGFyZW50O1xuICB9XG4gIHJldHVybiB0b3BMZXZlbC5tb2RpZmllcnMgIT09IHVuZGVmaW5lZCAmJlxuICAgICAgdG9wTGV2ZWwubW9kaWZpZXJzLnNvbWUobW9kaWZpZXIgPT4gbW9kaWZpZXIua2luZCA9PT0gdHMuU3ludGF4S2luZC5FeHBvcnRLZXl3b3JkKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFJvb3REaXJzKGhvc3Q6IHRzLkNvbXBpbGVySG9zdCwgb3B0aW9uczogdHMuQ29tcGlsZXJPcHRpb25zKTogQWJzb2x1dGVGc1BhdGhbXSB7XG4gIGNvbnN0IHJvb3REaXJzOiBzdHJpbmdbXSA9IFtdO1xuICBpZiAob3B0aW9ucy5yb290RGlycyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgcm9vdERpcnMucHVzaCguLi5vcHRpb25zLnJvb3REaXJzKTtcbiAgfSBlbHNlIGlmIChvcHRpb25zLnJvb3REaXIgIT09IHVuZGVmaW5lZCkge1xuICAgIHJvb3REaXJzLnB1c2gob3B0aW9ucy5yb290RGlyKTtcbiAgfSBlbHNlIHtcbiAgICByb290RGlycy5wdXNoKGhvc3QuZ2V0Q3VycmVudERpcmVjdG9yeSgpKTtcbiAgfVxuXG4gIC8vIEluIFdpbmRvd3MgdGhlIGFib3ZlIG1pZ2h0IG5vdCBhbHdheXMgcmV0dXJuIHBvc2l4IHNlcGFyYXRlZCBwYXRoc1xuICAvLyBTZWU6XG4gIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9NaWNyb3NvZnQvVHlwZVNjcmlwdC9ibG9iLzNmNzM1N2QzN2Y2NmM4NDJkNzBkODM1YmM5MjVlYzJhODczZWNmZWMvc3JjL2NvbXBpbGVyL3N5cy50cyNMNjUwXG4gIC8vIEFsc28gY29tcGlsZXIgb3B0aW9ucyBtaWdodCBiZSBzZXQgdmlhIGFuIEFQSSB3aGljaCBkb2Vzbid0IG5vcm1hbGl6ZSBwYXRoc1xuICByZXR1cm4gcm9vdERpcnMubWFwKHJvb3REaXIgPT4gYWJzb2x1dGVGcm9tKGhvc3QuZ2V0Q2Fub25pY2FsRmlsZU5hbWUocm9vdERpcikpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5vZGVEZWJ1Z0luZm8obm9kZTogdHMuTm9kZSk6IHN0cmluZyB7XG4gIGNvbnN0IHNmID0gZ2V0U291cmNlRmlsZShub2RlKTtcbiAgY29uc3Qge2xpbmUsIGNoYXJhY3Rlcn0gPSB0cy5nZXRMaW5lQW5kQ2hhcmFjdGVyT2ZQb3NpdGlvbihzZiwgbm9kZS5wb3MpO1xuICByZXR1cm4gYFske3NmLmZpbGVOYW1lfTogJHt0cy5TeW50YXhLaW5kW25vZGUua2luZF19IEAgJHtsaW5lfToke2NoYXJhY3Rlcn1dYDtcbn1cblxuLyoqXG4gKiBSZXNvbHZlIHRoZSBzcGVjaWZpZWQgYG1vZHVsZU5hbWVgIHVzaW5nIHRoZSBnaXZlbiBgY29tcGlsZXJPcHRpb25zYCBhbmQgYGNvbXBpbGVySG9zdGAuXG4gKlxuICogVGhpcyBoZWxwZXIgd2lsbCBhdHRlbXB0IHRvIHVzZSB0aGUgYENvbXBpbGVySG9zdC5yZXNvbHZlTW9kdWxlTmFtZXMoKWAgbWV0aG9kIGlmIGF2YWlsYWJsZS5cbiAqIE90aGVyd2lzZSBpdCB3aWxsIGZhbGxiYWNrIG9uIHRoZSBgdHMuUmVzb2x2ZU1vZHVsZU5hbWUoKWAgZnVuY3Rpb24uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZXNvbHZlTW9kdWxlTmFtZShcbiAgICBtb2R1bGVOYW1lOiBzdHJpbmcsIGNvbnRhaW5pbmdGaWxlOiBzdHJpbmcsIGNvbXBpbGVyT3B0aW9uczogdHMuQ29tcGlsZXJPcHRpb25zLFxuICAgIGNvbXBpbGVySG9zdDogdHMuTW9kdWxlUmVzb2x1dGlvbkhvc3QmUGljazx0cy5Db21waWxlckhvc3QsICdyZXNvbHZlTW9kdWxlTmFtZXMnPixcbiAgICBtb2R1bGVSZXNvbHV0aW9uQ2FjaGU6IHRzLk1vZHVsZVJlc29sdXRpb25DYWNoZXxudWxsKTogdHMuUmVzb2x2ZWRNb2R1bGV8dW5kZWZpbmVkIHtcbiAgaWYgKGNvbXBpbGVySG9zdC5yZXNvbHZlTW9kdWxlTmFtZXMpIHtcbiAgICByZXR1cm4gY29tcGlsZXJIb3N0LnJlc29sdmVNb2R1bGVOYW1lcyhcbiAgICAgICAgW21vZHVsZU5hbWVdLCBjb250YWluaW5nRmlsZSxcbiAgICAgICAgdW5kZWZpbmVkLCAgLy8gcmV1c2VkTmFtZXNcbiAgICAgICAgdW5kZWZpbmVkLCAgLy8gcmVkaXJlY3RlZFJlZmVyZW5jZVxuICAgICAgICBjb21waWxlck9wdGlvbnMpWzBdO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiB0c1xuICAgICAgICAucmVzb2x2ZU1vZHVsZU5hbWUoXG4gICAgICAgICAgICBtb2R1bGVOYW1lLCBjb250YWluaW5nRmlsZSwgY29tcGlsZXJPcHRpb25zLCBjb21waWxlckhvc3QsXG4gICAgICAgICAgICBtb2R1bGVSZXNvbHV0aW9uQ2FjaGUgIT09IG51bGwgPyBtb2R1bGVSZXNvbHV0aW9uQ2FjaGUgOiB1bmRlZmluZWQpXG4gICAgICAgIC5yZXNvbHZlZE1vZHVsZTtcbiAgfVxufVxuXG4vKiogUmV0dXJucyB0cnVlIGlmIHRoZSBub2RlIGlzIGFuIGFzc2lnbm1lbnQgZXhwcmVzc2lvbi4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0Fzc2lnbm1lbnQobm9kZTogdHMuTm9kZSk6IG5vZGUgaXMgdHMuQmluYXJ5RXhwcmVzc2lvbiB7XG4gIHJldHVybiB0cy5pc0JpbmFyeUV4cHJlc3Npb24obm9kZSkgJiYgbm9kZS5vcGVyYXRvclRva2VuLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuRXF1YWxzVG9rZW47XG59XG5cbi8qKlxuICogQXNzZXJ0cyB0aGF0IHRoZSBrZXlzIGBLYCBmb3JtIGEgc3Vic2V0IG9mIHRoZSBrZXlzIG9mIGBUYC5cbiAqL1xuZXhwb3J0IHR5cGUgU3Vic2V0T2ZLZXlzPFQsIEsgZXh0ZW5kcyBrZXlvZiBUPiA9IEs7XG5cbi8qKlxuICogUmVwcmVzZW50cyB0aGUgdHlwZSBgVGAsIHdpdGggYSB0cmFuc2Zvcm1hdGlvbiBhcHBsaWVkIHRoYXQgdHVybnMgYWxsIG1ldGhvZHMgKGV2ZW4gb3B0aW9uYWxcbiAqIG9uZXMpIGludG8gcmVxdWlyZWQgZmllbGRzICh3aGljaCBtYXkgYmUgYHVuZGVmaW5lZGAsIGlmIHRoZSBtZXRob2Qgd2FzIG9wdGlvbmFsKS5cbiAqL1xuZXhwb3J0IHR5cGUgUmVxdWlyZWREZWxlZ2F0aW9uczxUPiA9IHtcbiAgW00gaW4ga2V5b2YgUmVxdWlyZWQ8VD5dOiBUW01dO1xufTtcbiJdfQ==