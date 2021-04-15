(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/ngcc/src/rendering/umd_rendering_formatter", ["require", "exports", "tslib", "canonical-path", "typescript", "@angular/compiler-cli/ngcc/src/rendering/esm5_rendering_formatter", "@angular/compiler-cli/ngcc/src/rendering/utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UmdRenderingFormatter = void 0;
    var tslib_1 = require("tslib");
    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var canonical_path_1 = require("canonical-path");
    var ts = require("typescript");
    var esm5_rendering_formatter_1 = require("@angular/compiler-cli/ngcc/src/rendering/esm5_rendering_formatter");
    var utils_1 = require("@angular/compiler-cli/ngcc/src/rendering/utils");
    /**
     * A RenderingFormatter that works with UMD files, instead of `import` and `export` statements
     * the module is an IIFE with a factory function call with dependencies, which are defined in a
     * wrapper function for AMD, CommonJS and global module formats.
     */
    var UmdRenderingFormatter = /** @class */ (function (_super) {
        tslib_1.__extends(UmdRenderingFormatter, _super);
        function UmdRenderingFormatter(umdHost, isCore) {
            var _this = _super.call(this, umdHost, isCore) || this;
            _this.umdHost = umdHost;
            return _this;
        }
        /**
         * Add the imports to the UMD module IIFE.
         *
         * Note that imports at "prepended" to the start of the parameter list of the factory function,
         * and so also to the arguments passed to it when it is called.
         * This is because there are scenarios where the factory function does not accept as many
         * parameters as are passed as argument in the call. For example:
         *
         * ```
         * (function (global, factory) {
         *     typeof exports === 'object' && typeof module !== 'undefined' ?
         *         factory(exports,require('x'),require('z')) :
         *     typeof define === 'function' && define.amd ?
         *         define(['exports', 'x', 'z'], factory) :
         *     (global = global || self, factory(global.myBundle = {}, global.x));
         * }(this, (function (exports, x) { ... }
         * ```
         *
         * (See that the `z` import is not being used by the factory function.)
         */
        UmdRenderingFormatter.prototype.addImports = function (output, imports, file) {
            if (imports.length === 0) {
                return;
            }
            // Assume there is only one UMD module in the file
            var umdModule = this.umdHost.getUmdModule(file);
            if (!umdModule) {
                return;
            }
            var wrapperFunction = umdModule.wrapperFn;
            // We need to add new `require()` calls for each import in the CommonJS initializer
            renderCommonJsDependencies(output, wrapperFunction, imports);
            renderAmdDependencies(output, wrapperFunction, imports);
            renderGlobalDependencies(output, wrapperFunction, imports);
            renderFactoryParameters(output, wrapperFunction, imports);
        };
        /**
         * Add the exports to the bottom of the UMD module factory function.
         */
        UmdRenderingFormatter.prototype.addExports = function (output, entryPointBasePath, exports, importManager, file) {
            var umdModule = this.umdHost.getUmdModule(file);
            if (!umdModule) {
                return;
            }
            var factoryFunction = umdModule.factoryFn;
            var lastStatement = factoryFunction.body.statements[factoryFunction.body.statements.length - 1];
            var insertionPoint = lastStatement ? lastStatement.getEnd() : factoryFunction.body.getEnd() - 1;
            exports.forEach(function (e) {
                var basePath = utils_1.stripExtension(e.from);
                var relativePath = './' + canonical_path_1.relative(canonical_path_1.dirname(entryPointBasePath), basePath);
                var namedImport = entryPointBasePath !== basePath ?
                    importManager.generateNamedImport(relativePath, e.identifier) :
                    { symbol: e.identifier, moduleImport: null };
                var importNamespace = namedImport.moduleImport ? namedImport.moduleImport.text + "." : '';
                var exportStr = "\nexports." + e.identifier + " = " + importNamespace + namedImport.symbol + ";";
                output.appendRight(insertionPoint, exportStr);
            });
        };
        UmdRenderingFormatter.prototype.addDirectExports = function (output, exports, importManager, file) {
            var e_1, _a;
            var umdModule = this.umdHost.getUmdModule(file);
            if (!umdModule) {
                return;
            }
            var factoryFunction = umdModule.factoryFn;
            var lastStatement = factoryFunction.body.statements[factoryFunction.body.statements.length - 1];
            var insertionPoint = lastStatement ? lastStatement.getEnd() : factoryFunction.body.getEnd() - 1;
            try {
                for (var exports_1 = tslib_1.__values(exports), exports_1_1 = exports_1.next(); !exports_1_1.done; exports_1_1 = exports_1.next()) {
                    var e = exports_1_1.value;
                    var namedImport = importManager.generateNamedImport(e.fromModule, e.symbolName);
                    var importNamespace = namedImport.moduleImport ? namedImport.moduleImport.text + "." : '';
                    var exportStr = "\nexports." + e.asAlias + " = " + importNamespace + namedImport.symbol + ";";
                    output.appendRight(insertionPoint, exportStr);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (exports_1_1 && !exports_1_1.done && (_a = exports_1.return)) _a.call(exports_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
        };
        /**
         * Add the constants to the top of the UMD factory function.
         */
        UmdRenderingFormatter.prototype.addConstants = function (output, constants, file) {
            if (constants === '') {
                return;
            }
            var umdModule = this.umdHost.getUmdModule(file);
            if (!umdModule) {
                return;
            }
            var factoryFunction = umdModule.factoryFn;
            var firstStatement = factoryFunction.body.statements[0];
            var insertionPoint = firstStatement ? firstStatement.getStart() : factoryFunction.body.getStart() + 1;
            output.appendLeft(insertionPoint, '\n' + constants + '\n');
        };
        return UmdRenderingFormatter;
    }(esm5_rendering_formatter_1.Esm5RenderingFormatter));
    exports.UmdRenderingFormatter = UmdRenderingFormatter;
    /**
     * Add dependencies to the CommonJS part of the UMD wrapper function.
     */
    function renderCommonJsDependencies(output, wrapperFunction, imports) {
        var conditional = find(wrapperFunction.body.statements[0], isCommonJSConditional);
        if (!conditional) {
            return;
        }
        var factoryCall = conditional.whenTrue;
        var injectionPoint = factoryCall.arguments.length > 0 ?
            // Add extra dependencies before the first argument
            factoryCall.arguments[0].getFullStart() :
            // Backup one char to account for the closing parenthesis on the call
            factoryCall.getEnd() - 1;
        var importString = imports.map(function (i) { return "require('" + i.specifier + "')"; }).join(',');
        output.appendLeft(injectionPoint, importString + (factoryCall.arguments.length > 0 ? ',' : ''));
    }
    /**
     * Add dependencies to the AMD part of the UMD wrapper function.
     */
    function renderAmdDependencies(output, wrapperFunction, imports) {
        var conditional = find(wrapperFunction.body.statements[0], isAmdConditional);
        if (!conditional) {
            return;
        }
        var amdDefineCall = conditional.whenTrue;
        var importString = imports.map(function (i) { return "'" + i.specifier + "'"; }).join(',');
        // The dependency array (if it exists) is the second to last argument
        // `define(id?, dependencies?, factory);`
        var factoryIndex = amdDefineCall.arguments.length - 1;
        var dependencyArray = amdDefineCall.arguments[factoryIndex - 1];
        if (dependencyArray === undefined || !ts.isArrayLiteralExpression(dependencyArray)) {
            // No array provided: `define(factory)` or `define(id, factory)`.
            // Insert a new array in front the `factory` call.
            var injectionPoint = amdDefineCall.arguments[factoryIndex].getFullStart();
            output.appendLeft(injectionPoint, "[" + importString + "],");
        }
        else {
            // Already an array
            var injectionPoint = dependencyArray.elements.length > 0 ?
                // Add imports before the first item.
                dependencyArray.elements[0].getFullStart() :
                // Backup one char to account for the closing square bracket on the array
                dependencyArray.getEnd() - 1;
            output.appendLeft(injectionPoint, importString + (dependencyArray.elements.length > 0 ? ',' : ''));
        }
    }
    /**
     * Add dependencies to the global part of the UMD wrapper function.
     */
    function renderGlobalDependencies(output, wrapperFunction, imports) {
        var globalFactoryCall = find(wrapperFunction.body.statements[0], isGlobalFactoryCall);
        if (!globalFactoryCall) {
            return;
        }
        var injectionPoint = globalFactoryCall.arguments.length > 0 ?
            // Add extra dependencies before the first argument
            globalFactoryCall.arguments[0].getFullStart() :
            // Backup one char to account for the closing parenthesis on the call
            globalFactoryCall.getEnd() - 1;
        var importString = imports.map(function (i) { return "global." + getGlobalIdentifier(i); }).join(',');
        output.appendLeft(injectionPoint, importString + (globalFactoryCall.arguments.length > 0 ? ',' : ''));
    }
    /**
     * Add dependency parameters to the UMD factory function.
     */
    function renderFactoryParameters(output, wrapperFunction, imports) {
        var wrapperCall = wrapperFunction.parent;
        var secondArgument = wrapperCall.arguments[1];
        if (!secondArgument) {
            return;
        }
        // Be resilient to the factory being inside parentheses
        var factoryFunction = ts.isParenthesizedExpression(secondArgument) ? secondArgument.expression : secondArgument;
        if (!ts.isFunctionExpression(factoryFunction)) {
            return;
        }
        var parameters = factoryFunction.parameters;
        var parameterString = imports.map(function (i) { return i.qualifier; }).join(',');
        if (parameters.length > 0) {
            var injectionPoint = parameters[0].getFullStart();
            output.appendLeft(injectionPoint, parameterString + ',');
        }
        else {
            // If there are no parameters then the factory function will look like:
            // function () { ... }
            // The AST does not give us a way to find the insertion point - between the two parentheses.
            // So we must use a regular expression on the text of the function.
            var injectionPoint = factoryFunction.getStart() + factoryFunction.getText().indexOf('()') + 1;
            output.appendLeft(injectionPoint, parameterString);
        }
    }
    /**
     * Is this node the CommonJS conditional expression in the UMD wrapper?
     */
    function isCommonJSConditional(value) {
        if (!ts.isConditionalExpression(value)) {
            return false;
        }
        if (!ts.isBinaryExpression(value.condition) ||
            value.condition.operatorToken.kind !== ts.SyntaxKind.AmpersandAmpersandToken) {
            return false;
        }
        if (!oneOfBinaryConditions(value.condition, function (exp) { return isTypeOf(exp, 'exports', 'module'); })) {
            return false;
        }
        if (!ts.isCallExpression(value.whenTrue) || !ts.isIdentifier(value.whenTrue.expression)) {
            return false;
        }
        return value.whenTrue.expression.text === 'factory';
    }
    /**
     * Is this node the AMD conditional expression in the UMD wrapper?
     */
    function isAmdConditional(value) {
        if (!ts.isConditionalExpression(value)) {
            return false;
        }
        if (!ts.isBinaryExpression(value.condition) ||
            value.condition.operatorToken.kind !== ts.SyntaxKind.AmpersandAmpersandToken) {
            return false;
        }
        if (!oneOfBinaryConditions(value.condition, function (exp) { return isTypeOf(exp, 'define'); })) {
            return false;
        }
        if (!ts.isCallExpression(value.whenTrue) || !ts.isIdentifier(value.whenTrue.expression)) {
            return false;
        }
        return value.whenTrue.expression.text === 'define';
    }
    /**
     * Is this node the call to setup the global dependencies in the UMD wrapper?
     */
    function isGlobalFactoryCall(value) {
        if (ts.isCallExpression(value) && !!value.parent) {
            // Be resilient to the value being part of a comma list
            value = isCommaExpression(value.parent) ? value.parent : value;
            // Be resilient to the value being inside parentheses
            value = ts.isParenthesizedExpression(value.parent) ? value.parent : value;
            return !!value.parent && ts.isConditionalExpression(value.parent) &&
                value.parent.whenFalse === value;
        }
        else {
            return false;
        }
    }
    function isCommaExpression(value) {
        return ts.isBinaryExpression(value) && value.operatorToken.kind === ts.SyntaxKind.CommaToken;
    }
    /**
     * Compute a global identifier for the given import (`i`).
     *
     * The identifier used to access a package when using the "global" form of a UMD bundle usually
     * follows a special format where snake-case is conveted to camelCase and path separators are
     * converted to dots. In addition there are special cases such as `@angular` is mapped to `ng`.
     *
     * For example
     *
     * * `@ns/package/entry-point` => `ns.package.entryPoint`
     * * `@angular/common/testing` => `ng.common.testing`
     * * `@angular/platform-browser-dynamic` => `ng.platformBrowserDynamic`
     *
     * It is possible for packages to specify completely different identifiers for attaching the package
     * to the global, and so there is no guaranteed way to compute this.
     * Currently, this approach appears to work for the known scenarios; also it is not known how common
     * it is to use globals for importing packages.
     *
     * If it turns out that there are packages that are being used via globals, where this approach
     * fails, we should consider implementing a configuration based solution, similar to what would go
     * in a rollup configuration for mapping import paths to global indentifiers.
     */
    function getGlobalIdentifier(i) {
        return i.specifier.replace(/^@angular\//, 'ng.')
            .replace(/^@/, '')
            .replace(/\//g, '.')
            .replace(/[-_]+(.?)/g, function (_, c) { return c.toUpperCase(); })
            .replace(/^./, function (c) { return c.toLowerCase(); });
    }
    function find(node, test) {
        return test(node) ? node : node.forEachChild(function (child) { return find(child, test); });
    }
    function oneOfBinaryConditions(node, test) {
        return test(node.left) || test(node.right);
    }
    function isTypeOf(node) {
        var types = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            types[_i - 1] = arguments[_i];
        }
        return ts.isBinaryExpression(node) && ts.isTypeOfExpression(node.left) &&
            ts.isIdentifier(node.left.expression) && types.indexOf(node.left.expression.text) !== -1;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidW1kX3JlbmRlcmluZ19mb3JtYXR0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvbmdjYy9zcmMvcmVuZGVyaW5nL3VtZF9yZW5kZXJpbmdfZm9ybWF0dGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7SUFBQTs7Ozs7O09BTUc7SUFDSCxpREFBaUQ7SUFFakQsK0JBQWlDO0lBT2pDLDhHQUFrRTtJQUNsRSx3RUFBdUM7SUFLdkM7Ozs7T0FJRztJQUNIO1FBQTJDLGlEQUFzQjtRQUMvRCwrQkFBc0IsT0FBMEIsRUFBRSxNQUFlO1lBQWpFLFlBQ0Usa0JBQU0sT0FBTyxFQUFFLE1BQU0sQ0FBQyxTQUN2QjtZQUZxQixhQUFPLEdBQVAsT0FBTyxDQUFtQjs7UUFFaEQsQ0FBQztRQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O1dBbUJHO1FBQ0gsMENBQVUsR0FBVixVQUFXLE1BQW1CLEVBQUUsT0FBaUIsRUFBRSxJQUFtQjtZQUNwRSxJQUFJLE9BQU8sQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUN4QixPQUFPO2FBQ1I7WUFFRCxrREFBa0Q7WUFDbEQsSUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDbEQsSUFBSSxDQUFDLFNBQVMsRUFBRTtnQkFDZCxPQUFPO2FBQ1I7WUFFRCxJQUFNLGVBQWUsR0FBRyxTQUFTLENBQUMsU0FBUyxDQUFDO1lBRTVDLG1GQUFtRjtZQUNuRiwwQkFBMEIsQ0FBQyxNQUFNLEVBQUUsZUFBZSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQzdELHFCQUFxQixDQUFDLE1BQU0sRUFBRSxlQUFlLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDeEQsd0JBQXdCLENBQUMsTUFBTSxFQUFFLGVBQWUsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUMzRCx1QkFBdUIsQ0FB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QyxVQUFVLENBQUMsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQy9GLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7ZGlybmFtZSwgcmVsYXRpdmV9IGZyb20gJ2Nhbm9uaWNhbC1wYXRoJztcbmltcG9ydCBNYWdpY1N0cmluZyBmcm9tICdtYWdpYy1zdHJpbmcnO1xuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5cbmltcG9ydCB7UmVleHBvcnR9IGZyb20gJy4uLy4uLy4uL3NyYy9uZ3RzYy9pbXBvcnRzJztcbmltcG9ydCB7SW1wb3J0LCBJbXBvcnRNYW5hZ2VyfSBmcm9tICcuLi8uLi8uLi9zcmMvbmd0c2MvdHJhbnNsYXRvcic7XG5pbXBvcnQge0V4cG9ydEluZm99IGZyb20gJy4uL2FuYWx5c2lzL3ByaXZhdGVfZGVjbGFyYXRpb25zX2FuYWx5emVyJztcbmltcG9ydCB7VW1kUmVmbGVjdGlvbkhvc3R9IGZyb20gJy4uL2hvc3QvdW1kX2hvc3QnO1xuXG5pbXBvcnQge0VzbTVSZW5kZXJpbmdGb3JtYXR0ZXJ9IGZyb20gJy4vZXNtNV9yZW5kZXJpbmdfZm9ybWF0dGVyJztcbmltcG9ydCB7c3RyaXBFeHRlbnNpb259IGZyb20gJy4vdXRpbHMnO1xuXG50eXBlIENvbW1vbkpzQ29uZGl0aW9uYWwgPSB0cy5Db25kaXRpb25hbEV4cHJlc3Npb24me3doZW5UcnVlOiB0cy5DYWxsRXhwcmVzc2lvbn07XG50eXBlIEFtZENvbmRpdGlvbmFsID0gdHMuQ29uZGl0aW9uYWxFeHByZXNzaW9uJnt3aGVuVHJ1ZTogdHMuQ2FsbEV4cHJlc3Npb259O1xuXG4vKipcbiAqIEEgUmVuZGVyaW5nRm9ybWF0dGVyIHRoYXQgd29ya3Mgd2l0aCBVTUQgZmlsZXMsIGluc3RlYWQgb2YgYGltcG9ydGAgYW5kIGBleHBvcnRgIHN0YXRlbWVudHNcbiAqIHRoZSBtb2R1bGUgaXMgYW4gSUlGRSB3aXRoIGEgZmFjdG9yeSBmdW5jdGlvbiBjYWxsIHdpdGggZGVwZW5kZW5jaWVzLCB3aGljaCBhcmUgZGVmaW5lZCBpbiBhXG4gKiB3cmFwcGVyIGZ1bmN0aW9uIGZvciBBTUQsIENvbW1vbkpTIGFuZCBnbG9iYWwgbW9kdWxlIGZvcm1hdHMuXG4gKi9cbmV4cG9ydCBjbGFzcyBVbWRSZW5kZXJpbmdGb3JtYXR0ZXIgZXh0ZW5kcyBFc201UmVuZGVyaW5nRm9ybWF0dGVyIHtcbiAgY29uc3RydWN0b3IocHJvdGVjdGVkIHVtZEhvc3Q6IFVtZFJlZmxlY3Rpb25Ib3N0LCBpc0NvcmU6IGJvb2xlYW4pIHtcbiAgICBzdXBlcih1bWRIb3N0LCBpc0NvcmUpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCB0aGUgaW1wb3J0cyB0byB0aGUgVU1EIG1vZHVsZSBJSUZFLlxuICAgKlxuICAgKiBOb3RlIHRoYXQgaW1wb3J0cyBhdCBcInByZXBlbmRlZFwiIHRvIHRoZSBzdGFydCBvZiB0aGUgcGFyYW1ldGVyIGxpc3Qgb2YgdGhlIGZhY3RvcnkgZnVuY3Rpb24sXG4gICAqIGFuZCBzbyBhbHNvIHRvIHRoZSBhcmd1bWVudHMgcGFzc2VkIHRvIGl0IHdoZW4gaXQgaXMgY2FsbGVkLlxuICAgKiBUaGlzIGlzIGJlY2F1c2UgdGhlcmUgYXJlIHNjZW5hcmlvcyB3aGVyZSB0aGUgZmFjdG9yeSBmdW5jdGlvbiBkb2VzIG5vdCBhY2NlcHQgYXMgbWFueVxuICAgKiBwYXJhbWV0ZXJzIGFzIGFyZSBwYXNzZWQgYXMgYXJndW1lbnQgaW4gdGhlIGNhbGwuIEZvciBleGFtcGxlOlxuICAgKlxuICAgKiBgYGBcbiAgICogKGZ1bmN0aW9uIChnbG9iYWwsIGZhY3RvcnkpIHtcbiAgICogICAgIHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyA/XG4gICAqICAgICAgICAgZmFjdG9yeShleHBvcnRzLHJlcXVpcmUoJ3gnKSxyZXF1aXJlKCd6JykpIDpcbiAgICogICAgIHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCA/XG4gICAqICAgICAgICAgZGVmaW5lKFsnZXhwb3J0cycsICd4JywgJ3onXSwgZmFjdG9yeSkgOlxuICAgKiAgICAgKGdsb2JhbCA9IGdsb2JhbCB8fCBzZWxmLCBmYWN0b3J5KGdsb2JhbC5teUJ1bmRsZSA9IHt9LCBnbG9iYWwueCkpO1xuICAgKiB9KHRoaXMsIChmdW5jdGlvbiAoZXhwb3J0cywgeCkgeyAuLi4gfVxuICAgKiBgYGBcbiAgICpcbiAgICogKFNlZSB0aGF0IHRoZSBgemAgaW1wb3J0IGlzIG5vdCBiZWluZyB1c2VkIGJ5IHRoZSBmYWN0b3J5IGZ1bmN0aW9uLilcbiAgICovXG4gIGFkZEltcG9ydHMob3V0cHV0OiBNYWdpY1N0cmluZywgaW1wb3J0czogSW1wb3J0W10sIGZpbGU6IHRzLlNvdXJjZUZpbGUpOiB2b2lkIHtcbiAgICBpZiAoaW1wb3J0cy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBBc3N1bWUgdGhlcmUgaXMgb25seSBvbmUgVU1EIG1vZHVsZSBpbiB0aGUgZmlsZVxuICAgIGNvbnN0IHVtZE1vZHVsZSA9IHRoaXMudW1kSG9zdC5nZXRVbWRNb2R1bGUoZmlsZSk7XG4gICAgaWYgKCF1bWRNb2R1bGUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCB3cmFwcGVyRnVuY3Rpb24gPSB1bWRNb2R1bGUud3JhcHBlckZuO1xuXG4gICAgLy8gV2UgbmVlZCB0byBhZGQgbmV3IGByZXF1aXJlKClgIGNhbGxzIGZvciBlYWNoIGltcG9ydCBpbiB0aGUgQ29tbW9uSlMgaW5pdGlhbGl6ZXJcbiAgICByZW5kZXJDb21tb25Kc0RlcGVuZGVuY2llcyhvdXRwdXQsIHdyYXBwZXJGdW5jdGlvbiwgaW1wb3J0cyk7XG4gICAgcmVuZGVyQW1kRGVwZW5kZW5jaWVzKG91dHB1dCwgd3JhcHBlckZ1bmN0aW9uLCBpbXBvcnRzKTtcbiAgICByZW5kZXJHbG9iYWxEZXBlbmRlbmNpZXMob3V0cHV0LCB3cmFwcGVyRnVuY3Rpb24sIGltcG9ydHMpO1xuICAgIHJlbmRlckZhY3RvcnlQYXJhbWV0ZXJzKG91dHB1dCwgd3JhcHBlckZ1bmN0aW9uLCBpbXBvcnRzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgdGhlIGV4cG9ydHMgdG8gdGhlIGJvdHRvbSBvZiB0aGUgVU1EIG1vZHVsZSBmYWN0b3J5IGZ1bmN0aW9uLlxuICAgKi9cbiAgYWRkRXhwb3J0cyhcbiAgICAgIG91dHB1dDogTWFnaWNTdHJpbmcsIGVudHJ5UG9pbnRCYXNlUGF0aDogc3RyaW5nLCBleHBvcnRzOiBFeHBvcnRJbmZvW10sXG4gICAgICBpbXBvcnRNYW5hZ2VyOiBJbXBvcnRNYW5hZ2VyLCBmaWxlOiB0cy5Tb3VyY2VGaWxlKTogdm9pZCB7XG4gICAgY29uc3QgdW1kTW9kdWxlID0gdGhpcy51bWRIb3N0LmdldFVtZE1vZHVsZShmaWxlKTtcbiAgICBpZiAoIXVtZE1vZHVsZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBmYWN0b3J5RnVuY3Rpb24gPSB1bWRNb2R1bGUuZmFjdG9yeUZuO1xuICAgIGNvbnN0IGxhc3RTdGF0ZW1lbnQgPVxuICAgICAgICBmYWN0b3J5RnVuY3Rpb24uYm9keS5zdGF0ZW1lbnRzW2ZhY3RvcnlGdW5jdGlvbi5ib2R5LnN0YXRlbWVudHMubGVuZ3RoIC0gMV07XG4gICAgY29uc3QgaW5zZXJ0aW9uUG9pbnQgPVxuICAgICAgICBsYXN0U3RhdGVtZW50ID8gbGFzdFN0YXRlbWVudC5nZXRFbmQoKSA6IGZhY3RvcnlGdW5jdGlvbi5ib2R5LmdldEVuZCgpIC0gMTtcbiAgICBleHBvcnRzLmZvckVhY2goZSA9PiB7XG4gICAgICBjb25zdCBiYXNlUGF0aCA9IHN0cmlwRXh0ZW5zaW9uKGUuZnJvbSk7XG4gICAgICBjb25zdCByZWxhdGl2ZVBhdGggPSAnLi8nICsgcmVsYXRpdmUoZGlybmFtZShlbnRyeVBvaW50QmFzZVBhdGgpLCBiYXNlUGF0aCk7XG4gICAgICBjb25zdCBuYW1lZEltcG9ydCA9IGVudHJ5UG9pbnRCYXNlUGF0aCAhPT0gYmFzZVBhdGggP1xuICAgICAgICAgIGltcG9ydE1hbmFnZXIuZ2VuZXJhdGVOYW1lZEltcG9ydChyZWxhdGl2ZVBhdGgsIGUuaWRlbnRpZmllcikgOlxuICAgICAgICAgIHtzeW1ib2w6IGUuaWRlbnRpZmllciwgbW9kdWxlSW1wb3J0OiBudWxsfTtcbiAgICAgIGNvbnN0IGltcG9ydE5hbWVzcGFjZSA9IG5hbWVkSW1wb3J0Lm1vZHVsZUltcG9ydCA/IGAke25hbWVkSW1wb3J0Lm1vZHVsZUltcG9ydC50ZXh0fS5gIDogJyc7XG4gICAgICBjb25zdCBleHBvcnRTdHIgPSBgXFxuZXhwb3J0cy4ke2UuaWRlbnRpZmllcn0gPSAke2ltcG9ydE5hbWVzcGFjZX0ke25hbWVkSW1wb3J0LnN5bWJvbH07YDtcbiAgICAgIG91dHB1dC5hcHBlbmRSaWdodChpbnNlcnRpb25Qb2ludCwgZXhwb3J0U3RyKTtcbiAgICB9KTtcbiAgfVxuXG4gIGFkZERpcmVjdEV4cG9ydHMoXG4gICAgICBvdXRwdXQ6IE1hZ2ljU3RyaW5nLCBleHBvcnRzOiBSZWV4cG9ydFtdLCBpbXBvcnRNYW5hZ2VyOiBJbXBvcnRNYW5hZ2VyLFxuICAgICAgZmlsZTogdHMuU291cmNlRmlsZSk6IHZvaWQge1xuICAgIGNvbnN0IHVtZE1vZHVsZSA9IHRoaXMudW1kSG9zdC5nZXRVbWRNb2R1bGUoZmlsZSk7XG4gICAgaWYgKCF1bWRNb2R1bGUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgZmFjdG9yeUZ1bmN0aW9uID0gdW1kTW9kdWxlLmZhY3RvcnlGbjtcbiAgICBjb25zdCBsYXN0U3RhdGVtZW50ID1cbiAgICAgICAgZmFjdG9yeUZ1bmN0aW9uLmJvZHkuc3RhdGVtZW50c1tmYWN0b3J5RnVuY3Rpb24uYm9keS5zdGF0ZW1lbnRzLmxlbmd0aCAtIDFdO1xuICAgIGNvbnN0IGluc2VydGlvblBvaW50ID1cbiAgICAgICAgbGFzdFN0YXRlbWVudCA/IGxhc3RTdGF0ZW1lbnQuZ2V0RW5kKCkgOiBmYWN0b3J5RnVuY3Rpb24uYm9keS5nZXRFbmQoKSAtIDE7XG4gICAgZm9yIChjb25zdCBlIG9mIGV4cG9ydHMpIHtcbiAgICAgIGNvbnN0IG5hbWVkSW1wb3J0ID0gaW1wb3J0TWFuYWdlci5nZW5lcmF0ZU5hbWVkSW1wb3J0KGUuZnJvbU1vZHVsZSwgZS5zeW1ib2xOYW1lKTtcbiAgICAgIGNvbnN0IGltcG9ydE5hbWVzcGFjZSA9IG5hbWVkSW1wb3J0Lm1vZHVsZUltcG9ydCA/IGAke25hbWVkSW1wb3J0Lm1vZHVsZUltcG9ydC50ZXh0fS5gIDogJyc7XG4gICAgICBjb25zdCBleHBvcnRTdHIgPSBgXFxuZXhwb3J0cy4ke2UuYXNBbGlhc30gPSAke2ltcG9ydE5hbWVzcGFjZX0ke25hbWVkSW1wb3J0LnN5bWJvbH07YDtcbiAgICAgIG91dHB1dC5hcHBlbmRSaWdodChpbnNlcnRpb25Qb2ludCwgZXhwb3J0U3RyKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQWRkIHRoZSBjb25zdGFudHMgdG8gdGhlIHRvcCBvZiB0aGUgVU1EIGZhY3RvcnkgZnVuY3Rpb24uXG4gICAqL1xuICBhZGRDb25zdGFudHMob3V0cHV0OiBNYWdpY1N0cmluZywgY29uc3RhbnRzOiBzdHJpbmcsIGZpbGU6IHRzLlNvdXJjZUZpbGUpOiB2b2lkIHtcbiAgICBpZiAoY29uc3RhbnRzID09PSAnJykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCB1bWRNb2R1bGUgPSB0aGlzLnVtZEhvc3QuZ2V0VW1kTW9kdWxlKGZpbGUpO1xuICAgIGlmICghdW1kTW9kdWxlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IGZhY3RvcnlGdW5jdGlvbiA9IHVtZE1vZHVsZS5mYWN0b3J5Rm47XG4gICAgY29uc3QgZmlyc3RTdGF0ZW1lbnQgPSBmYWN0b3J5RnVuY3Rpb24uYm9keS5zdGF0ZW1lbnRzWzBdO1xuICAgIGNvbnN0IGluc2VydGlvblBvaW50ID1cbiAgICAgICAgZmlyc3RTdGF0ZW1lbnQgPyBmaXJzdFN0YXRlbWVudC5nZXRTdGFydCgpIDogZmFjdG9yeUZ1bmN0aW9uLmJvZHkuZ2V0U3RhcnQoKSArIDE7XG4gICAgb3V0cHV0LmFwcGVuZExlZnQoaW5zZXJ0aW9uUG9pbnQsICdcXG4nICsgY29uc3RhbnRzICsgJ1xcbicpO1xuICB9XG59XG5cbi8qKlxuICogQWRkIGRlcGVuZGVuY2llcyB0byB0aGUgQ29tbW9uSlMgcGFydCBvZiB0aGUgVU1EIHdyYXBwZXIgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIHJlbmRlckNvbW1vbkpzRGVwZW5kZW5jaWVzKFxuICAgIG91dHB1dDogTWFnaWNTdHJpbmcsIHdyYXBwZXJGdW5jdGlvbjogdHMuRnVuY3Rpb25FeHByZXNzaW9uLCBpbXBvcnRzOiBJbXBvcnRbXSkge1xuICBjb25zdCBjb25kaXRpb25hbCA9IGZpbmQod3JhcHBlckZ1bmN0aW9uLmJvZHkuc3RhdGVtZW50c1swXSwgaXNDb21tb25KU0NvbmRpdGlvbmFsKTtcbiAgaWYgKCFjb25kaXRpb25hbCkge1xuICAgIHJldHVybjtcbiAgfVxuICBjb25zdCBmYWN0b3J5Q2FsbCA9IGNvbmRpdGlvbmFsLndoZW5UcnVlO1xuICBjb25zdCBpbmplY3Rpb25Qb2ludCA9IGZhY3RvcnlDYWxsLmFyZ3VtZW50cy5sZW5ndGggPiAwID9cbiAgICAgIC8vIEFkZCBleHRyYSBkZXBlbmRlbmNpZXMgYmVmb3JlIHRoZSBmaXJzdCBhcmd1bWVudFxuICAgICAgZmFjdG9yeUNhbGwuYXJndW1lbnRzWzBdLmdldEZ1bGxTdGFydCgpIDpcbiAgICAgIC8vIEJhY2t1cCBvbmUgY2hhciB0byBhY2NvdW50IGZvciB0aGUgY2xvc2luZyBwYXJlbnRoZXNpcyBvbiB0aGUgY2FsbFxuICAgICAgZmFjdG9yeUNhbGwuZ2V0RW5kKCkgLSAxO1xuICBjb25zdCBpbXBvcnRTdHJpbmcgPSBpbXBvcnRzLm1hcChpID0+IGByZXF1aXJlKCcke2kuc3BlY2lmaWVyfScpYCkuam9pbignLCcpO1xuICBvdXRwdXQuYXBwZW5kTGVmdChpbmplY3Rpb25Qb2ludCwgaW1wb3J0U3RyaW5nICsgKGZhY3RvcnlDYWxsLmFyZ3VtZW50cy5sZW5ndGggPiAwID8gJywnIDogJycpKTtcbn1cblxuLyoqXG4gKiBBZGQgZGVwZW5kZW5jaWVzIHRvIHRoZSBBTUQgcGFydCBvZiB0aGUgVU1EIHdyYXBwZXIgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIHJlbmRlckFtZERlcGVuZGVuY2llcyhcbiAgICBvdXRwdXQ6IE1hZ2ljU3RyaW5nLCB3cmFwcGVyRnVuY3Rpb246IHRzLkZ1bmN0aW9uRXhwcmVzc2lvbiwgaW1wb3J0czogSW1wb3J0W10pIHtcbiAgY29uc3QgY29uZGl0aW9uYWwgPSBmaW5kKHdyYXBwZXJGdW5jdGlvbi5ib2R5LnN0YXRlbWVudHNbMF0sIGlzQW1kQ29uZGl0aW9uYWwpO1xuICBpZiAoIWNvbmRpdGlvbmFsKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGNvbnN0IGFtZERlZmluZUNhbGwgPSBjb25kaXRpb25hbC53aGVuVHJ1ZTtcbiAgY29uc3QgaW1wb3J0U3RyaW5nID0gaW1wb3J0cy5tYXAoaSA9PiBgJyR7aS5zcGVjaWZpZXJ9J2ApLmpvaW4oJywnKTtcbiAgLy8gVGhlIGRlcGVuZGVuY3kgYXJyYXkgKGlmIGl0IGV4aXN0cykgaXMgdGhlIHNlY29uZCB0byBsYXN0IGFyZ3VtZW50XG4gIC8vIGBkZWZpbmUoaWQ/LCBkZXBlbmRlbmNpZXM/LCBmYWN0b3J5KTtgXG4gIGNvbnN0IGZhY3RvcnlJbmRleCA9IGFtZERlZmluZUNhbGwuYXJndW1lbnRzLmxlbmd0aCAtIDE7XG4gIGNvbnN0IGRlcGVuZGVuY3lBcnJheSA9IGFtZERlZmluZUNhbGwuYXJndW1lbnRzW2ZhY3RvcnlJbmRleCAtIDFdO1xuICBpZiAoZGVwZW5kZW5jeUFycmF5ID09PSB1bmRlZmluZWQgfHwgIXRzLmlzQXJyYXlMaXRlcmFsRXhwcmVzc2lvbihkZXBlbmRlbmN5QXJyYXkpKSB7XG4gICAgLy8gTm8gYXJyYXkgcHJvdmlkZWQ6IGBkZWZpbmUoZmFjdG9yeSlgIG9yIGBkZWZpbmUoaWQsIGZhY3RvcnkpYC5cbiAgICAvLyBJbnNlcnQgYSBuZXcgYXJyYXkgaW4gZnJvbnQgdGhlIGBmYWN0b3J5YCBjYWxsLlxuICAgIGNvbnN0IGluamVjdGlvblBvaW50ID0gYW1kRGVmaW5lQ2FsbC5hcmd1bWVudHNbZmFjdG9yeUluZGV4XS5nZXRGdWxsU3RhcnQoKTtcbiAgICBvdXRwdXQuYXBwZW5kTGVmdChpbmplY3Rpb25Qb2ludCwgYFske2ltcG9ydFN0cmluZ31dLGApO1xuICB9IGVsc2Uge1xuICAgIC8vIEFscmVhZHkgYW4gYXJyYXlcbiAgICBjb25zdCBpbmplY3Rpb25Qb2ludCA9IGRlcGVuZGVuY3lBcnJheS5lbGVtZW50cy5sZW5ndGggPiAwID9cbiAgICAgICAgLy8gQWRkIGltcG9ydHMgYmVmb3JlIHRoZSBmaXJzdCBpdGVtLlxuICAgICAgICBkZXBlbmRlbmN5QXJyYXkuZWxlbWVudHNbMF0uZ2V0RnVsbFN0YXJ0KCkgOlxuICAgICAgICAvLyBCYWNrdXAgb25lIGNoYXIgdG8gYWNjb3VudCBmb3IgdGhlIGNsb3Npbmcgc3F1YXJlIGJyYWNrZXQgb24gdGhlIGFycmF5XG4gICAgICAgIGRlcGVuZGVuY3lBcnJheS5nZXRFbmQoKSAtIDE7XG4gICAgb3V0cHV0LmFwcGVuZExlZnQoXG4gICAgICAgIGluamVjdGlvblBvaW50LCBpbXBvcnRTdHJpbmcgKyAoZGVwZW5kZW5jeUFycmF5LmVsZW1lbnRzLmxlbmd0aCA+IDAgPyAnLCcgOiAnJykpO1xuICB9XG59XG5cbi8qKlxuICogQWRkIGRlcGVuZGVuY2llcyB0byB0aGUgZ2xvYmFsIHBhcnQgb2YgdGhlIFVNRCB3cmFwcGVyIGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiByZW5kZXJHbG9iYWxEZXBlbmRlbmNpZXMoXG4gICAgb3V0cHV0OiBNYWdpY1N0cmluZywgd3JhcHBlckZ1bmN0aW9uOiB0cy5GdW5jdGlvbkV4cHJlc3Npb24sIGltcG9ydHM6IEltcG9ydFtdKSB7XG4gIGNvbnN0IGdsb2JhbEZhY3RvcnlDYWxsID0gZmluZCh3cmFwcGVyRnVuY3Rpb24uYm9keS5zdGF0ZW1lbnRzWzBdLCBpc0dsb2JhbEZhY3RvcnlDYWxsKTtcbiAgaWYgKCFnbG9iYWxGYWN0b3J5Q2FsbCkge1xuICAgIHJldHVybjtcbiAgfVxuICBjb25zdCBpbmplY3Rpb25Qb2ludCA9IGdsb2JhbEZhY3RvcnlDYWxsLmFyZ3VtZW50cy5sZW5ndGggPiAwID9cbiAgICAgIC8vIEFkZCBleHRyYSBkZXBlbmRlbmNpZXMgYmVmb3JlIHRoZSBmaXJzdCBhcmd1bWVudFxuICAgICAgZ2xvYmFsRmFjdG9yeUNhbGwuYXJndW1lbnRzWzBdLmdldEZ1bGxTdGFydCgpIDpcbiAgICAgIC8vIEJhY2t1cCBvbmUgY2hhciB0byBhY2NvdW50IGZvciB0aGUgY2xvc2luZyBwYXJlbnRoZXNpcyBvbiB0aGUgY2FsbFxuICAgICAgZ2xvYmFsRmFjdG9yeUNhbGwuZ2V0RW5kKCkgLSAxO1xuICBjb25zdCBpbXBvcnRTdHJpbmcgPSBpbXBvcnRzLm1hcChpID0+IGBnbG9iYWwuJHtnZXRHbG9iYWxJZGVudGlmaWVyKGkpfWApLmpvaW4oJywnKTtcbiAgb3V0cHV0LmFwcGVuZExlZnQoXG4gICAgICBpbmplY3Rpb25Qb2ludCwgaW1wb3J0U3RyaW5nICsgKGdsb2JhbEZhY3RvcnlDYWxsLmFyZ3VtZW50cy5sZW5ndGggPiAwID8gJywnIDogJycpKTtcbn1cblxuLyoqXG4gKiBBZGQgZGVwZW5kZW5jeSBwYXJhbWV0ZXJzIHRvIHRoZSBVTUQgZmFjdG9yeSBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gcmVuZGVyRmFjdG9yeVBhcmFtZXRlcnMoXG4gICAgb3V0cHV0OiBNYWdpY1N0cmluZywgd3JhcHBlckZ1bmN0aW9uOiB0cy5GdW5jdGlvbkV4cHJlc3Npb24sIGltcG9ydHM6IEltcG9ydFtdKSB7XG4gIGNvbnN0IHdyYXBwZXJDYWxsID0gd3JhcHBlckZ1bmN0aW9uLnBhcmVudCBhcyB0cy5DYWxsRXhwcmVzc2lvbjtcbiAgY29uc3Qgc2Vjb25kQXJndW1lbnQgPSB3cmFwcGVyQ2FsbC5hcmd1bWVudHNbMV07XG4gIGlmICghc2Vjb25kQXJndW1lbnQpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICAvLyBCZSByZXNpbGllbnQgdG8gdGhlIGZhY3RvcnkgYmVpbmcgaW5zaWRlIHBhcmVudGhlc2VzXG4gIGNvbnN0IGZhY3RvcnlGdW5jdGlvbiA9XG4gICAgICB0cy5pc1BhcmVudGhlc2l6ZWRFeHByZXNzaW9uKHNlY29uZEFyZ3VtZW50KSA/IHNlY29uZEFyZ3VtZW50LmV4cHJlc3Npb24gOiBzZWNvbmRBcmd1bWVudDtcbiAgaWYgKCF0cy5pc0Z1bmN0aW9uRXhwcmVzc2lvbihmYWN0b3J5RnVuY3Rpb24pKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgY29uc3QgcGFyYW1ldGVycyA9IGZhY3RvcnlGdW5jdGlvbi5wYXJhbWV0ZXJzO1xuICBjb25zdCBwYXJhbWV0ZXJTdHJpbmcgPSBpbXBvcnRzLm1hcChpID0+IGkucXVhbGlmaWVyKS5qb2luKCcsJyk7XG4gIGlmIChwYXJhbWV0ZXJzLmxlbmd0aCA+IDApIHtcbiAgICBjb25zdCBpbmplY3Rpb25Qb2ludCA9IHBhcmFtZXRlcnNbMF0uZ2V0RnVsbFN0YXJ0KCk7XG4gICAgb3V0cHV0LmFwcGVuZExlZnQoaW5qZWN0aW9uUG9pbnQsIHBhcmFtZXRlclN0cmluZyArICcsJyk7XG4gIH0gZWxzZSB7XG4gICAgLy8gSWYgdGhlcmUgYXJlIG5vIHBhcmFtZXRlcnMgdGhlbiB0aGUgZmFjdG9yeSBmdW5jdGlvbiB3aWxsIGxvb2sgbGlrZTpcbiAgICAvLyBmdW5jdGlvbiAoKSB7IC4uLiB9XG4gICAgLy8gVGhlIEFTVCBkb2VzIG5vdCBnaXZlIHVzIGEgd2F5IHRvIGZpbmQgdGhlIGluc2VydGlvbiBwb2ludCAtIGJldHdlZW4gdGhlIHR3byBwYXJlbnRoZXNlcy5cbiAgICAvLyBTbyB3ZSBtdXN0IHVzZSBhIHJlZ3VsYXIgZXhwcmVzc2lvbiBvbiB0aGUgdGV4dCBvZiB0aGUgZnVuY3Rpb24uXG4gICAgY29uc3QgaW5qZWN0aW9uUG9pbnQgPSBmYWN0b3J5RnVuY3Rpb24uZ2V0U3RhcnQoKSArIGZhY3RvcnlGdW5jdGlvbi5nZXRUZXh0KCkuaW5kZXhPZignKCknKSArIDE7XG4gICAgb3V0cHV0LmFwcGVuZExlZnQoaW5qZWN0aW9uUG9pbnQsIHBhcmFtZXRlclN0cmluZyk7XG4gIH1cbn1cblxuLyoqXG4gKiBJcyB0aGlzIG5vZGUgdGhlIENvbW1vbkpTIGNvbmRpdGlvbmFsIGV4cHJlc3Npb24gaW4gdGhlIFVNRCB3cmFwcGVyP1xuICovXG5mdW5jdGlvbiBpc0NvbW1vbkpTQ29uZGl0aW9uYWwodmFsdWU6IHRzLk5vZGUpOiB2YWx1ZSBpcyBDb21tb25Kc0NvbmRpdGlvbmFsIHtcbiAgaWYgKCF0cy5pc0NvbmRpdGlvbmFsRXhwcmVzc2lvbih2YWx1ZSkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgaWYgKCF0cy5pc0JpbmFyeUV4cHJlc3Npb24odmFsdWUuY29uZGl0aW9uKSB8fFxuICAgICAgdmFsdWUuY29uZGl0aW9uLm9wZXJhdG9yVG9rZW4ua2luZCAhPT0gdHMuU3ludGF4S2luZC5BbXBlcnNhbmRBbXBlcnNhbmRUb2tlbikge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBpZiAoIW9uZU9mQmluYXJ5Q29uZGl0aW9ucyh2YWx1ZS5jb25kaXRpb24sIChleHApID0+IGlzVHlwZU9mKGV4cCwgJ2V4cG9ydHMnLCAnbW9kdWxlJykpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGlmICghdHMuaXNDYWxsRXhwcmVzc2lvbih2YWx1ZS53aGVuVHJ1ZSkgfHwgIXRzLmlzSWRlbnRpZmllcih2YWx1ZS53aGVuVHJ1ZS5leHByZXNzaW9uKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gdmFsdWUud2hlblRydWUuZXhwcmVzc2lvbi50ZXh0ID09PSAnZmFjdG9yeSc7XG59XG5cbi8qKlxuICogSXMgdGhpcyBub2RlIHRoZSBBTUQgY29uZGl0aW9uYWwgZXhwcmVzc2lvbiBpbiB0aGUgVU1EIHdyYXBwZXI/XG4gKi9cbmZ1bmN0aW9uIGlzQW1kQ29uZGl0aW9uYWwodmFsdWU6IHRzLk5vZGUpOiB2YWx1ZSBpcyBBbWRDb25kaXRpb25hbCB7XG4gIGlmICghdHMuaXNDb25kaXRpb25hbEV4cHJlc3Npb24odmFsdWUpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGlmICghdHMuaXNCaW5hcnlFeHByZXNzaW9uKHZhbHVlLmNvbmRpdGlvbikgfHxcbiAgICAgIHZhbHVlLmNvbmRpdGlvbi5vcGVyYXRvclRva2VuLmtpbmQgIT09IHRzLlN5bnRheEtpbmQuQW1wZXJzYW5kQW1wZXJzYW5kVG9rZW4pIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgaWYgKCFvbmVPZkJpbmFyeUNvbmRpdGlvbnModmFsdWUuY29uZGl0aW9uLCAoZXhwKSA9PiBpc1R5cGVPZihleHAsICdkZWZpbmUnKSkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgaWYgKCF0cy5pc0NhbGxFeHByZXNzaW9uKHZhbHVlLndoZW5UcnVlKSB8fCAhdHMuaXNJZGVudGlmaWVyKHZhbHVlLndoZW5UcnVlLmV4cHJlc3Npb24pKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiB2YWx1ZS53aGVuVHJ1ZS5leHByZXNzaW9uLnRleHQgPT09ICdkZWZpbmUnO1xufVxuXG4vKipcbiAqIElzIHRoaXMgbm9kZSB0aGUgY2FsbCB0byBzZXR1cCB0aGUgZ2xvYmFsIGRlcGVuZGVuY2llcyBpbiB0aGUgVU1EIHdyYXBwZXI/XG4gKi9cbmZ1bmN0aW9uIGlzR2xvYmFsRmFjdG9yeUNhbGwodmFsdWU6IHRzLk5vZGUpOiB2YWx1ZSBpcyB0cy5DYWxsRXhwcmVzc2lvbiB7XG4gIGlmICh0cy5pc0NhbGxFeHByZXNzaW9uKHZhbHVlKSAmJiAhIXZhbHVlLnBhcmVudCkge1xuICAgIC8vIEJlIHJlc2lsaWVudCB0byB0aGUgdmFsdWUgYmVpbmcgcGFydCBvZiBhIGNvbW1hIGxpc3RcbiAgICB2YWx1ZSA9IGlzQ29tbWFFeHByZXNzaW9uKHZhbHVlLnBhcmVudCkgPyB2YWx1ZS5wYXJlbnQgOiB2YWx1ZTtcbiAgICAvLyBCZSByZXNpbGllbnQgdG8gdGhlIHZhbHVlIGJlaW5nIGluc2lkZSBwYXJlbnRoZXNlc1xuICAgIHZhbHVlID0gdHMuaXNQYXJlbnRoZXNpemVkRXhwcmVzc2lvbih2YWx1ZS5wYXJlbnQpID8gdmFsdWUucGFyZW50IDogdmFsdWU7XG4gICAgcmV0dXJuICEhdmFsdWUucGFyZW50ICYmIHRzLmlzQ29uZGl0aW9uYWxFeHByZXNzaW9uKHZhbHVlLnBhcmVudCkgJiZcbiAgICAgICAgdmFsdWUucGFyZW50LndoZW5GYWxzZSA9PT0gdmFsdWU7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbmZ1bmN0aW9uIGlzQ29tbWFFeHByZXNzaW9uKHZhbHVlOiB0cy5Ob2RlKTogdmFsdWUgaXMgdHMuQmluYXJ5RXhwcmVzc2lvbiB7XG4gIHJldHVybiB0cy5pc0JpbmFyeUV4cHJlc3Npb24odmFsdWUpICYmIHZhbHVlLm9wZXJhdG9yVG9rZW4ua2luZCA9PT0gdHMuU3ludGF4S2luZC5Db21tYVRva2VuO1xufVxuXG4vKipcbiAqIENvbXB1dGUgYSBnbG9iYWwgaWRlbnRpZmllciBmb3IgdGhlIGdpdmVuIGltcG9ydCAoYGlgKS5cbiAqXG4gKiBUaGUgaWRlbnRpZmllciB1c2VkIHRvIGFjY2VzcyBhIHBhY2thZ2Ugd2hlbiB1c2luZyB0aGUgXCJnbG9iYWxcIiBmb3JtIG9mIGEgVU1EIGJ1bmRsZSB1c3VhbGx5XG4gKiBmb2xsb3dzIGEgc3BlY2lhbCBmb3JtYXQgd2hlcmUgc25ha2UtY2FzZSBpcyBjb252ZXRlZCB0byBjYW1lbENhc2UgYW5kIHBhdGggc2VwYXJhdG9ycyBhcmVcbiAqIGNvbnZlcnRlZCB0byBkb3RzLiBJbiBhZGRpdGlvbiB0aGVyZSBhcmUgc3BlY2lhbCBjYXNlcyBzdWNoIGFzIGBAYW5ndWxhcmAgaXMgbWFwcGVkIHRvIGBuZ2AuXG4gKlxuICogRm9yIGV4YW1wbGVcbiAqXG4gKiAqIGBAbnMvcGFja2FnZS9lbnRyeS1wb2ludGAgPT4gYG5zLnBhY2thZ2UuZW50cnlQb2ludGBcbiAqICogYEBhbmd1bGFyL2NvbW1vbi90ZXN0aW5nYCA9PiBgbmcuY29tbW9uLnRlc3RpbmdgXG4gKiAqIGBAYW5ndWxhci9wbGF0Zm9ybS1icm93c2VyLWR5bmFtaWNgID0+IGBuZy5wbGF0Zm9ybUJyb3dzZXJEeW5hbWljYFxuICpcbiAqIEl0IGlzIHBvc3NpYmxlIGZvciBwYWNrYWdlcyB0byBzcGVjaWZ5IGNvbXBsZXRlbHkgZGlmZmVyZW50IGlkZW50aWZpZXJzIGZvciBhdHRhY2hpbmcgdGhlIHBhY2thZ2VcbiAqIHRvIHRoZSBnbG9iYWwsIGFuZCBzbyB0aGVyZSBpcyBubyBndWFyYW50ZWVkIHdheSB0byBjb21wdXRlIHRoaXMuXG4gKiBDdXJyZW50bHksIHRoaXMgYXBwcm9hY2ggYXBwZWFycyB0byB3b3JrIGZvciB0aGUga25vd24gc2NlbmFyaW9zOyBhbHNvIGl0IGlzIG5vdCBrbm93biBob3cgY29tbW9uXG4gKiBpdCBpcyB0byB1c2UgZ2xvYmFscyBmb3IgaW1wb3J0aW5nIHBhY2thZ2VzLlxuICpcbiAqIElmIGl0IHR1cm5zIG91dCB0aGF0IHRoZXJlIGFyZSBwYWNrYWdlcyB0aGF0IGFyZSBiZWluZyB1c2VkIHZpYSBnbG9iYWxzLCB3aGVyZSB0aGlzIGFwcHJvYWNoXG4gKiBmYWlscywgd2Ugc2hvdWxkIGNvbnNpZGVyIGltcGxlbWVudGluZyBhIGNvbmZpZ3VyYXRpb24gYmFzZWQgc29sdXRpb24sIHNpbWlsYXIgdG8gd2hhdCB3b3VsZCBnb1xuICogaW4gYSByb2xsdXAgY29uZmlndXJhdGlvbiBmb3IgbWFwcGluZyBpbXBvcnQgcGF0aHMgdG8gZ2xvYmFsIGluZGVudGlmaWVycy5cbiAqL1xuZnVuY3Rpb24gZ2V0R2xvYmFsSWRlbnRpZmllcihpOiBJbXBvcnQpOiBzdHJpbmcge1xuICByZXR1cm4gaS5zcGVjaWZpZXIucmVwbGFjZSgvXkBhbmd1bGFyXFwvLywgJ25nLicpXG4gICAgICAucmVwbGFjZSgvXkAvLCAnJylcbiAgICAgIC5yZXBsYWNlKC9cXC8vZywgJy4nKVxuICAgICAgLnJlcGxhY2UoL1stX10rKC4/KS9nLCAoXywgYykgPT4gYy50b1VwcGVyQ2FzZSgpKVxuICAgICAgLnJlcGxhY2UoL14uLywgYyA9PiBjLnRvTG93ZXJDYXNlKCkpO1xufVxuXG5mdW5jdGlvbiBmaW5kPFQ+KG5vZGU6IHRzLk5vZGUsIHRlc3Q6IChub2RlOiB0cy5Ob2RlKSA9PiBub2RlIGlzIHRzLk5vZGUgJiBUKTogVHx1bmRlZmluZWQge1xuICByZXR1cm4gdGVzdChub2RlKSA/IG5vZGUgOiBub2RlLmZvckVhY2hDaGlsZChjaGlsZCA9PiBmaW5kPFQ+KGNoaWxkLCB0ZXN0KSk7XG59XG5cbmZ1bmN0aW9uIG9uZU9mQmluYXJ5Q29uZGl0aW9ucyhcbiAgICBub2RlOiB0cy5CaW5hcnlFeHByZXNzaW9uLCB0ZXN0OiAoZXhwcmVzc2lvbjogdHMuRXhwcmVzc2lvbikgPT4gYm9vbGVhbikge1xuICByZXR1cm4gdGVzdChub2RlLmxlZnQpIHx8IHRlc3Qobm9kZS5yaWdodCk7XG59XG5cbmZ1bmN0aW9uIGlzVHlwZU9mKG5vZGU6IHRzLkV4cHJlc3Npb24sIC4uLnR5cGVzOiBzdHJpbmdbXSk6IGJvb2xlYW4ge1xuICByZXR1cm4gdHMuaXNCaW5hcnlFeHByZXNzaW9uKG5vZGUpICYmIHRzLmlzVHlwZU9mRXhwcmVzc2lvbihub2RlLmxlZnQpICYmXG4gICAgICB0cy5pc0lkZW50aWZpZXIobm9kZS5sZWZ0LmV4cHJlc3Npb24pICYmIHR5cGVzLmluZGV4T2Yobm9kZS5sZWZ0LmV4cHJlc3Npb24udGV4dCkgIT09IC0xO1xufVxuIl19