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
        define("@angular/compiler-cli/ngcc/src/host/umd_host", ["require", "exports", "tslib", "typescript", "@angular/compiler-cli/src/ngtsc/file_system", "@angular/compiler-cli/src/ngtsc/reflection", "@angular/compiler-cli/ngcc/src/utils", "@angular/compiler-cli/ngcc/src/host/commonjs_umd_utils", "@angular/compiler-cli/ngcc/src/host/esm2015_host", "@angular/compiler-cli/ngcc/src/host/esm5_host", "@angular/compiler-cli/ngcc/src/host/utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getImportsOfUmdModule = exports.parseStatementForUmdModule = exports.UmdReflectionHost = void 0;
    var tslib_1 = require("tslib");
    var ts = require("typescript");
    var file_system_1 = require("@angular/compiler-cli/src/ngtsc/file_system");
    var reflection_1 = require("@angular/compiler-cli/src/ngtsc/reflection");
    var utils_1 = require("@angular/compiler-cli/ngcc/src/utils");
    var commonjs_umd_utils_1 = require("@angular/compiler-cli/ngcc/src/host/commonjs_umd_utils");
    var esm2015_host_1 = require("@angular/compiler-cli/ngcc/src/host/esm2015_host");
    var esm5_host_1 = require("@angular/compiler-cli/ngcc/src/host/esm5_host");
    var utils_2 = require("@angular/compiler-cli/ngcc/src/host/utils");
    var UmdReflectionHost = /** @class */ (function (_super) {
        tslib_1.__extends(UmdReflectionHost, _super);
        function UmdReflectionHost(logger, isCore, src, dts) {
            if (dts === void 0) { dts = null; }
            var _this = _super.call(this, logger, isCore, src, dts) || this;
            _this.umdModules = new utils_1.FactoryMap(function (sf) { return _this.computeUmdModule(sf); });
            _this.umdExports = new utils_1.FactoryMap(function (sf) { return _this.computeExportsOfUmdModule(sf); });
            _this.umdImportPaths = new utils_1.FactoryMap(function (param) { return _this.computeImportPath(param); });
            _this.program = src.program;
            _this.compilerHost = src.host;
            return _this;
        }
        UmdReflectionHost.prototype.getImportOfIdentifier = function (id) {
            // Is `id` a namespaced property access, e.g. `Directive` in `core.Directive`?
            // If so capture the symbol of the namespace, e.g. `core`.
            var nsIdentifier = commonjs_umd_utils_1.findNamespaceOfIdentifier(id);
            var importParameter = nsIdentifier && this.findUmdImportParameter(nsIdentifier);
            var from = importParameter && this.getUmdImportPath(importParameter);
            return from !== null ? { from: from, name: id.text } : null;
        };
        UmdReflectionHost.prototype.getDeclarationOfIdentifier = function (id) {
            // First we try one of the the following:
            // 1. The `exports` identifier - referring to the current file/module.
            // 2. An identifier (e.g. `foo`) that refers to an imported UMD module.
            // 3. A UMD style export identifier (e.g. the `foo` of `exports.foo`).
            var declaration = this.getExportsDeclaration(id) || this.getUmdModuleDeclaration(id) ||
                this.getUmdDeclaration(id);
            if (declaration !== null) {
                return declaration;
            }
            // Try to get the declaration using the super class.
            var superDeclaration = _super.prototype.getDeclarationOfIdentifier.call(this, id);
            if (superDeclaration === null) {
                return null;
            }
            // Check to see if the declaration is the inner node of a declaration IIFE.
            var outerNode = esm2015_host_1.getOuterNodeFromInnerDeclaration(superDeclaration.node);
            if (outerNode === null) {
                return superDeclaration;
            }
            // We are only interested if the outer declaration is of the form
            // `exports.<name> = <initializer>`.
            if (!commonjs_umd_utils_1.isExportsAssignment(outerNode)) {
                return superDeclaration;
            }
            return {
                kind: 1 /* Inline */,
                node: outerNode.left,
                implementation: outerNode.right,
                known: null,
                viaModule: null,
            };
        };
        UmdReflectionHost.prototype.getExportsOfModule = function (module) {
            return _super.prototype.getExportsOfModule.call(this, module) || this.umdExports.get(module.getSourceFile());
        };
        UmdReflectionHost.prototype.getUmdModule = function (sourceFile) {
            if (sourceFile.isDeclarationFile) {
                return null;
            }
            return this.umdModules.get(sourceFile);
        };
        UmdReflectionHost.prototype.getUmdImportPath = function (importParameter) {
            return this.umdImportPaths.get(importParameter);
        };
        /**
         * Get the top level statements for a module.
         *
         * In UMD modules these are the body of the UMD factory function.
         *
         * @param sourceFile The module whose statements we want.
         * @returns An array of top level statements for the given module.
         */
        UmdReflectionHost.prototype.getModuleStatements = function (sourceFile) {
            var umdModule = this.getUmdModule(sourceFile);
            return umdModule !== null ? Array.from(umdModule.factoryFn.body.statements) : [];
        };
        UmdReflectionHost.prototype.getClassSymbolFromOuterDeclaration = function (declaration) {
            var superSymbol = _super.prototype.getClassSymbolFromOuterDeclaration.call(this, declaration);
            if (superSymbol) {
                return superSymbol;
            }
            if (!commonjs_umd_utils_1.isExportsDeclaration(declaration)) {
                return undefined;
            }
            var initializer = commonjs_umd_utils_1.skipAliases(declaration.parent.right);
            if (ts.isIdentifier(initializer)) {
                var implementation = this.getDeclarationOfIdentifier(initializer);
                if (implementation !== null) {
                    var implementationSymbol = this.getClassSymbol(implementation.node);
                    if (implementationSymbol !== null) {
                        return implementationSymbol;
                    }
                }
            }
            var innerDeclaration = esm2015_host_1.getInnerClassDeclaration(initializer);
            if (innerDeclaration !== null) {
                return this.createClassSymbol(declaration.name, innerDeclaration);
            }
            return undefined;
        };
        UmdReflectionHost.prototype.getClassSymbolFromInnerDeclaration = function (declaration) {
            var superClassSymbol = _super.prototype.getClassSymbolFromInnerDeclaration.call(this, declaration);
            if (superClassSymbol !== undefined) {
                return superClassSymbol;
            }
            if (!reflection_1.isNamedFunctionDeclaration(declaration)) {
                return undefined;
            }
            var outerNode = esm2015_host_1.getOuterNodeFromInnerDeclaration(declaration);
            if (outerNode === null || !commonjs_umd_utils_1.isExportsAssignment(outerNode)) {
                return undefined;
            }
            return this.createClassSymbol(outerNode.left.name, declaration);
        };
        /**
         * Extract all "classes" from the `statement` and add them to the `classes` map.
         */
        UmdReflectionHost.prototype.addClassSymbolsFromStatement = function (classes, statement) {
            _super.prototype.addClassSymbolsFromStatement.call(this, classes, statement);
            // Also check for exports of the form: `exports.<name> = <class def>;`
            if (commonjs_umd_utils_1.isExportsStatement(statement)) {
                var classSymbol = this.getClassSymbol(statement.expression.left);
                if (classSymbol) {
                    classes.set(classSymbol.implementation, classSymbol);
                }
            }
        };
        /**
         * Analyze the given statement to see if it corresponds with an exports declaration like
         * `exports.MyClass = MyClass_1 = <class def>;`. If so, the declaration of `MyClass_1`
         * is associated with the `MyClass` identifier.
         *
         * @param statement The statement that needs to be preprocessed.
         */
        UmdReflectionHost.prototype.preprocessStatement = function (statement) {
            _super.prototype.preprocessStatement.call(this, statement);
            if (!commonjs_umd_utils_1.isExportsStatement(statement)) {
                return;
            }
            var declaration = statement.expression.left;
            var initializer = statement.expression.right;
            if (!esm2015_host_1.isAssignment(initializer) || !ts.isIdentifier(initializer.left) ||
                !this.isClass(declaration)) {
                return;
            }
            var aliasedIdentifier = initializer.left;
            var aliasedDeclaration = this.getDeclarationOfIdentifier(aliasedIdentifier);
            if (aliasedDeclaration === null || aliasedDeclaration.node === null) {
                throw new Error("Unable to locate declaration of " + aliasedIdentifier.text + " in \"" + statement.getText() + "\"");
            }
            this.aliasedClassDeclarations.set(aliasedDeclaration.node, declaration.name);
        };
        UmdReflectionHost.prototype.computeUmdModule = function (sourceFile) {
            if (sourceFile.statements.length !== 1) {
                throw new Error("Expected UMD module file (" + sourceFile.fileName + ") to contain exactly one statement, " +
                    ("but found " + sourceFile.statements.length + "."));
            }
            return parseStatementForUmdModule(sourceFile.statements[0]);
        };
        UmdReflectionHost.prototype.computeExportsOfUmdModule = function (sourceFile) {
            var e_1, _a, e_2, _b;
            var moduleMap = new Map();
            try {
                for (var _c = tslib_1.__values(this.getModuleStatements(sourceFile)), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var statement = _d.value;
                    if (commonjs_umd_utils_1.isExportsStatement(statement)) {
                        var exportDeclaration = this.extractBasicUmdExportDeclaration(statement);
                        if (!moduleMap.has(exportDeclaration.name)) {
                            // We assume that the first `exports.<name>` is the actual declaration, and that any
                            // subsequent statements that match are decorating the original declaration.
                            // For example:
                            // ```
                            // exports.foo = <declaration>;
                            // exports.foo = __decorate(<decorator>, exports.foo);
                            // ```
                            // The declaration is the first line not the second.
                            moduleMap.set(exportDeclaration.name, exportDeclaration.declaration);
                        }
                    }
                    else if (commonjs_umd_utils_1.isWildcardReexportStatement(statement)) {
                        var reexports = this.extractUmdWildcardReexports(statement, sourceFile);
                        try {
                            for (var reexports_1 = (e_2 = void 0, tslib_1.__values(reexports)), reexports_1_1 = reexports_1.next(); !reexports_1_1.done; reexports_1_1 = reexports_1.next()) {
                                var reexport = reexports_1_1.value;
                                moduleMap.set(reexport.name, reexport.declaration);
                            }
                        }
                        catch (e_2_1) { e_2 = { error: e_2_1 }; }
                        finally {
                            try {
                                if (reexports_1_1 && !reexports_1_1.done && (_b = reexports_1.return)) _b.call(reexports_1);
                            }
                            finally { if (e_2) throw e_2.error; }
                        }
                    }
                    else if (commonjs_umd_utils_1.isDefinePropertyReexportStatement(statement)) {
                        var exportDeclaration = this.extractUmdDefinePropertyExportDeclaration(statement);
                        if (exportDeclaration !== null) {
                            moduleMap.set(exportDeclaration.name, exportDeclaration.declaration);
                        }
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return moduleMap;
        };
        UmdReflectionHost.prototype.computeImportPath = function (param) {
            var e_3, _a;
            var umdModule = this.getUmdModule(param.getSourceFile());
            if (umdModule === null) {
                return null;
            }
            var imports = getImportsOfUmdModule(umdModule);
            if (imports === null) {
                return null;
            }
            var importPath = null;
            try {
                for (var imports_1 = tslib_1.__values(imports), imports_1_1 = imports_1.next(); !imports_1_1.done; imports_1_1 = imports_1.next()) {
                    var i = imports_1_1.value;
                    // Add all imports to the map to speed up future look ups.
                    this.umdImportPaths.set(i.parameter, i.path);
                    if (i.parameter === param) {
                        importPath = i.path;
                    }
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (imports_1_1 && !imports_1_1.done && (_a = imports_1.return)) _a.call(imports_1);
                }
                finally { if (e_3) throw e_3.error; }
            }
            return importPath;
        };
        UmdReflectionHost.prototype.extractBasicUmdExportDeclaration = function (statement) {
            var _a;
            var name = statement.expression.left.name.text;
            var exportExpression = commonjs_umd_utils_1.skipAliases(statement.expression.right);
            var declaration = (_a = this.getDeclarationOfExpression(exportExpression)) !== null && _a !== void 0 ? _a : {
                kind: 1 /* Inline */,
                node: statement.expression.left,
                implementation: statement.expression.right,
                known: null,
                viaModule: null,
            };
            return { name: name, declaration: declaration };
        };
        UmdReflectionHost.prototype.extractUmdWildcardReexports = function (statement, containingFile) {
            var reexportArg = statement.expression.arguments[0];
            var requireCall = commonjs_umd_utils_1.isRequireCall(reexportArg) ?
                reexportArg :
                ts.isIdentifier(reexportArg) ? commonjs_umd_utils_1.findRequireCallReference(reexportArg, this.checker) : null;
            var importPath = null;
            if (requireCall !== null) {
                importPath = requireCall.arguments[0].text;
            }
            else if (ts.isIdentifier(reexportArg)) {
                var importParameter = this.findUmdImportParameter(reexportArg);
                importPath = importParameter && this.getUmdImportPath(importParameter);
            }
            if (importPath === null) {
                return [];
            }
            var importedFile = this.resolveModuleName(importPath, containingFile);
            if (importedFile === undefined) {
                return [];
            }
            var importedExports = this.getExportsOfModule(importedFile);
            if (importedExports === null) {
                return [];
            }
            var viaModule = utils_1.stripExtension(importedFile.fileName);
            var reexports = [];
            importedExports.forEach(function (decl, name) { return reexports.push({ name: name, declaration: tslib_1.__assign(tslib_1.__assign({}, decl), { viaModule: viaModule }) }); });
            return reexports;
        };
        UmdReflectionHost.prototype.extractUmdDefinePropertyExportDeclaration = function (statement) {
            var args = statement.expression.arguments;
            var name = args[1].text;
            var getterFnExpression = commonjs_umd_utils_1.extractGetterFnExpression(statement);
            if (getterFnExpression === null) {
                return null;
            }
            var declaration = this.getDeclarationOfExpression(getterFnExpression);
            if (declaration !== null) {
                return { name: name, declaration: declaration };
            }
            return {
                name: name,
                declaration: {
                    kind: 1 /* Inline */,
                    node: args[1],
                    implementation: getterFnExpression,
                    known: null,
                    viaModule: null,
                },
            };
        };
        /**
         * Is the identifier a parameter on a UMD factory function, e.g. `function factory(this, core)`?
         * If so then return its declaration.
         */
        UmdReflectionHost.prototype.findUmdImportParameter = function (id) {
            var symbol = id && this.checker.getSymbolAtLocation(id) || null;
            var declaration = symbol && symbol.valueDeclaration;
            return declaration && ts.isParameter(declaration) ? declaration : null;
        };
        UmdReflectionHost.prototype.getUmdDeclaration = function (id) {
            var nsIdentifier = commonjs_umd_utils_1.findNamespaceOfIdentifier(id);
            if (nsIdentifier === null) {
                return null;
            }
            if (nsIdentifier.parent.parent && commonjs_umd_utils_1.isExportsAssignment(nsIdentifier.parent.parent)) {
                var initializer = nsIdentifier.parent.parent.right;
                if (ts.isIdentifier(initializer)) {
                    return this.getDeclarationOfIdentifier(initializer);
                }
                return this.detectKnownDeclaration({
                    kind: 1 /* Inline */,
                    node: nsIdentifier.parent.parent.left,
                    implementation: commonjs_umd_utils_1.skipAliases(nsIdentifier.parent.parent.right),
                    viaModule: null,
                    known: null,
                });
            }
            var moduleDeclaration = this.getUmdModuleDeclaration(nsIdentifier);
            if (moduleDeclaration === null || moduleDeclaration.node === null ||
                !ts.isSourceFile(moduleDeclaration.node)) {
                return null;
            }
            var moduleExports = this.getExportsOfModule(moduleDeclaration.node);
            if (moduleExports === null) {
                return null;
            }
            // We need to compute the `viaModule` because  the `getExportsOfModule()` call
            // did not know that we were importing the declaration.
            var declaration = moduleExports.get(id.text);
            if (!moduleExports.has(id.text)) {
                return null;
            }
            // We need to compute the `viaModule` because  the `getExportsOfModule()` call
            // did not know that we were importing the declaration.
            var viaModule = declaration.viaModule === null ? moduleDeclaration.viaModule : declaration.viaModule;
            return tslib_1.__assign(tslib_1.__assign({}, declaration), { viaModule: viaModule, known: utils_1.getTsHelperFnFromIdentifier(id) });
        };
        UmdReflectionHost.prototype.getExportsDeclaration = function (id) {
            if (!isExportsIdentifier(id)) {
                return null;
            }
            // Sadly, in the case of `exports.foo = bar`, we can't use `this.findUmdImportParameter(id)`
            // to check whether this `exports` is from the IIFE body arguments, because
            // `this.checker.getSymbolAtLocation(id)` will return the symbol for the `foo` identifier
            // rather than the `exports` identifier.
            //
            // Instead we search the symbols in the current local scope.
            var exportsSymbol = this.checker.getSymbolsInScope(id, ts.SymbolFlags.Variable)
                .find(function (symbol) { return symbol.name === 'exports'; });
            var node = exportsSymbol !== undefined &&
                !ts.isFunctionExpression(exportsSymbol.valueDeclaration.parent) ?
                // There is a locally defined `exports` variable that is not a function parameter.
                // So this `exports` identifier must be a local variable and does not represent the module.
                exportsSymbol.valueDeclaration :
                // There is no local symbol or it is a parameter of an IIFE.
                // So this `exports` represents the current "module".
                id.getSourceFile();
            return {
                kind: 0 /* Concrete */,
                node: node,
                viaModule: null,
                known: null,
                identity: null,
            };
        };
        UmdReflectionHost.prototype.getUmdModuleDeclaration = function (id) {
            var importPath = this.getImportPathFromParameter(id) || this.getImportPathFromRequireCall(id);
            if (importPath === null) {
                return null;
            }
            var module = this.resolveModuleName(importPath, id.getSourceFile());
            if (module === undefined) {
                return null;
            }
            var viaModule = commonjs_umd_utils_1.isExternalImport(importPath) ? importPath : null;
            return { kind: 0 /* Concrete */, node: module, viaModule: viaModule, known: null, identity: null };
        };
        UmdReflectionHost.prototype.getImportPathFromParameter = function (id) {
            var importParameter = this.findUmdImportParameter(id);
            if (importParameter === null) {
                return null;
            }
            return this.getUmdImportPath(importParameter);
        };
        UmdReflectionHost.prototype.getImportPathFromRequireCall = function (id) {
            var requireCall = commonjs_umd_utils_1.findRequireCallReference(id, this.checker);
            if (requireCall === null) {
                return null;
            }
            return requireCall.arguments[0].text;
        };
        /**
         * If this is an IIFE then try to grab the outer and inner classes otherwise fallback on the super
         * class.
         */
        UmdReflectionHost.prototype.getDeclarationOfExpression = function (expression) {
            var inner = esm2015_host_1.getInnerClassDeclaration(expression);
            if (inner !== null) {
                var outer = esm2015_host_1.getOuterNodeFromInnerDeclaration(inner);
                if (outer !== null && commonjs_umd_utils_1.isExportsAssignment(outer)) {
                    return {
                        kind: 1 /* Inline */,
                        node: outer.left,
                        implementation: inner,
                        known: null,
                        viaModule: null,
                    };
                }
            }
            return _super.prototype.getDeclarationOfExpression.call(this, expression);
        };
        UmdReflectionHost.prototype.resolveModuleName = function (moduleName, containingFile) {
            if (this.compilerHost.resolveModuleNames) {
                var moduleInfo = this.compilerHost.resolveModuleNames([moduleName], containingFile.fileName, undefined, undefined, this.program.getCompilerOptions())[0];
                return moduleInfo && this.program.getSourceFile(file_system_1.absoluteFrom(moduleInfo.resolvedFileName));
            }
            else {
                var moduleInfo = ts.resolveModuleName(moduleName, containingFile.fileName, this.program.getCompilerOptions(), this.compilerHost);
                return moduleInfo.resolvedModule &&
                    this.program.getSourceFile(file_system_1.absoluteFrom(moduleInfo.resolvedModule.resolvedFileName));
            }
        };
        return UmdReflectionHost;
    }(esm5_host_1.Esm5ReflectionHost));
    exports.UmdReflectionHost = UmdReflectionHost;
    function parseStatementForUmdModule(statement) {
        var wrapperCall = getUmdWrapperCall(statement);
        if (!wrapperCall)
            return null;
        var wrapperFn = wrapperCall.expression;
        if (!ts.isFunctionExpression(wrapperFn))
            return null;
        var factoryFnParamIndex = wrapperFn.parameters.findIndex(function (parameter) { return ts.isIdentifier(parameter.name) && parameter.name.text === 'factory'; });
        if (factoryFnParamIndex === -1)
            return null;
        var factoryFn = utils_2.stripParentheses(wrapperCall.arguments[factoryFnParamIndex]);
        if (!factoryFn || !ts.isFunctionExpression(factoryFn))
            return null;
        return { wrapperFn: wrapperFn, factoryFn: factoryFn };
    }
    exports.parseStatementForUmdModule = parseStatementForUmdModule;
    function getUmdWrapperCall(statement) {
        if (!ts.isExpressionStatement(statement) || !ts.isParenthesizedExpression(statement.expression) ||
            !ts.isCallExpression(statement.expression.expression) ||
            !ts.isFunctionExpression(statement.expression.expression.expression)) {
            return null;
        }
        return statement.expression.expression;
    }
    function getImportsOfUmdModule(umdModule) {
        var imports = [];
        for (var i = 1; i < umdModule.factoryFn.parameters.length; i++) {
            imports.push({
                parameter: umdModule.factoryFn.parameters[i],
                path: getRequiredModulePath(umdModule.wrapperFn, i)
            });
        }
        return imports;
    }
    exports.getImportsOfUmdModule = getImportsOfUmdModule;
    function getRequiredModulePath(wrapperFn, paramIndex) {
        var statement = wrapperFn.body.statements[0];
        if (!ts.isExpressionStatement(statement)) {
            throw new Error('UMD wrapper body is not an expression statement:\n' + wrapperFn.body.getText());
        }
        var modulePaths = [];
        findModulePaths(statement.expression);
        // Since we were only interested in the `require()` calls, we miss the `exports` argument, so we
        // need to subtract 1.
        // E.g. `function(exports, dep1, dep2)` maps to `function(exports, require('path/to/dep1'),
        // require('path/to/dep2'))`
        return modulePaths[paramIndex - 1];
        // Search the statement for calls to `require('...')` and extract the string value of the first
        // argument
        function findModulePaths(node) {
            if (commonjs_umd_utils_1.isRequireCall(node)) {
                var argument = node.arguments[0];
                if (ts.isStringLiteral(argument)) {
                    modulePaths.push(argument.text);
                }
            }
            else {
                node.forEachChild(findModulePaths);
            }
        }
    }
    /**
     * Is the `node` an identifier with the name "exports"?
     */
    function isExportsIdentifier(node) {
        return ts.isIdentifier(node) && node.text === 'exports';
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidW1kX2hvc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvbmdjYy9zcmMvaG9zdC91bWRfaG9zdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBRUgsK0JBQWlDO0lBRWpDLDJFQUE0RDtJQUU1RCx5RUFBK0c7SUFFL0csOERBQWlGO0lBRWpGLDZGQUFrWTtJQUNsWSxpRkFBd0c7SUFDeEcsMkVBQStDO0lBRS9DLG1FQUF5QztJQUV6QztRQUF1Qyw2Q0FBa0I7UUFVdkQsMkJBQVksTUFBYyxFQUFFLE1BQWUsRUFBRSxHQUFrQixFQUFFLEdBQThCO1lBQTlCLG9CQUFBLEVBQUEsVUFBOEI7WUFBL0YsWUFDRSxrQkFBTSxNQUFNLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsU0FHaEM7WUFiUyxnQkFBVSxHQUNoQixJQUFJLGtCQUFVLENBQWdDLFVBQUEsRUFBRSxJQUFJLE9BQUEsS0FBSSxDQUFDLGdCQUFnQixDQUFDLEVBQUUsQ0FBQyxFQUF6QixDQUF5QixDQUFDLENBQUM7WUFDekUsZ0JBQVUsR0FBRyxJQUFJLGtCQUFVLENBQ2pDLFVBQUEsRUFBRSxJQUFJLE9BQUEsS0FBSSxDQUFDLHlCQUF5QixDQUFDLEVBQUUsQ0FBQyxFQUFsQyxDQUFrQyxDQUFDLENBQUM7WUFDcEMsb0JBQWMsR0FDcEIsSUFBSSxrQkFBVSxDQUF1QyxVQUFBLEtBQUssSUFBSSxPQUFBLEtBQUksQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsRUFBN0IsQ0FBNkIsQ0FBQyxDQUFDO1lBTS9GLEtBQUksQ0FBQyxPQUFPLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQztZQUMzQixLQUFJLENBQUMsWUFBWSxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUM7O1FBQy9CLENBQUM7UUFFRCxpREFBcUIsR0FBckIsVUFBc0IsRUFB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dEIsMkZBQTJGO1FBQzNGLDRCQUE0QjtRQUM1QixPQUFPLFdBQVcsQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFFbkMsK0ZBQStGO1FBQy9GLFdBQVc7UUFDWCxTQUFTLGVBQWUsQ0FBQyxJQUFhO1lBQ3BDLElBQUksa0NBQWEsQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDdkIsSUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDbkMsSUFBSSxFQUFFLENBQUMsZUFBZSxDQUFDLFFBQVEsQ0FBQyxFQUFFO29CQUNoQyxXQUFXLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztpQkFDakM7YUFDRjtpQkFBTTtnQkFDTCxJQUFJLENBQUMsWUFBWSxDQUFDLGVBQWUsQ0FBQyxDQUFDO2FBQ3BDO1FBQ0gsQ0FBQztJQUNILENBQUM7SUFFRDs7T0FFRztJQUNILFNBQVMsbUJBQW1CLENBQUMsSUFBYTtRQUN4QyxPQUFPLEVBQUUsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxTQUFTLENBQUM7SUFDMUQsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcblxuaW1wb3J0IHthYnNvbHV0ZUZyb219IGZyb20gJy4uLy4uLy4uL3NyYy9uZ3RzYy9maWxlX3N5c3RlbSc7XG5pbXBvcnQge0xvZ2dlcn0gZnJvbSAnLi4vLi4vLi4vc3JjL25ndHNjL2xvZ2dpbmcnO1xuaW1wb3J0IHtEZWNsYXJhdGlvbiwgRGVjbGFyYXRpb25LaW5kLCBJbXBvcnQsIGlzTmFtZWRGdW5jdGlvbkRlY2xhcmF0aW9ufSBmcm9tICcuLi8uLi8uLi9zcmMvbmd0c2MvcmVmbGVjdGlvbic7XG5pbXBvcnQge0J1bmRsZVByb2dyYW19IGZyb20gJy4uL3BhY2thZ2VzL2J1bmRsZV9wcm9ncmFtJztcbmltcG9ydCB7RmFjdG9yeU1hcCwgZ2V0VHNIZWxwZXJGbkZyb21JZGVudGlmaWVyLCBzdHJpcEV4dGVuc2lvbn0gZnJvbSAnLi4vdXRpbHMnO1xuXG5pbXBvcnQge0RlZmluZVByb3BlcnR5UmVleHBvcnRTdGF0ZW1lbnQsIEV4cG9ydERlY2xhcmF0aW9uLCBFeHBvcnRzU3RhdGVtZW50LCBleHRyYWN0R2V0dGVyRm5FeHByZXNzaW9uLCBmaW5kTmFtZXNwYWNlT2ZJZGVudGlmaWVyLCBmaW5kUmVxdWlyZUNhbGxSZWZlcmVuY2UsIGlzRGVmaW5lUHJvcGVydHlSZWV4cG9ydFN0YXRlbWVudCwgaXNFeHBvcnRzQXNzaWdubWVudCwgaXNFeHBvcnRzRGVjbGFyYXRpb24sIGlzRXhwb3J0c1N0YXRlbWVudCwgaXNFeHRlcm5hbEltcG9ydCwgaXNSZXF1aXJlQ2FsbCwgaXNXaWxkY2FyZFJlZXhwb3J0U3RhdGVtZW50LCBza2lwQWxpYXNlcywgV2lsZGNhcmRSZWV4cG9ydFN0YXRlbWVudH0gZnJvbSAnLi9jb21tb25qc191bWRfdXRpbHMnO1xuaW1wb3J0IHtnZXRJbm5lckNsYXNzRGVjbGFyYXRpb24sIGdldE91dGVyTm9kZUZyb21Jbm5lckRlY2xhcmF0aW9uLCBpc0Fzc2lnbm1lbnR9IGZyb20gJy4vZXNtMjAxNV9ob3N0JztcbmltcG9ydCB7RXNtNVJlZmxlY3Rpb25Ib3N0fSBmcm9tICcuL2VzbTVfaG9zdCc7XG5pbXBvcnQge05nY2NDbGFzc1N5bWJvbH0gZnJvbSAnLi9uZ2NjX2hvc3QnO1xuaW1wb3J0IHtzdHJpcFBhcmVudGhlc2VzfSBmcm9tICcuL3V0aWxzJztcblxuZXhwb3J0IGNsYXNzIFVtZFJlZmxlY3Rpb25Ib3N0IGV4dGVuZHMgRXNtNVJlZmxlY3Rpb25Ib3N0IHtcbiAgcHJvdGVjdGVkIHVtZE1vZHVsZXMgPVxuICAgICAgbmV3IEZhY3RvcnlNYXA8dHMuU291cmNlRmlsZSwgVW1kTW9kdWxlfG51bGw+KHNmID0+IHRoaXMuY29tcHV0ZVVtZE1vZHVsZShzZikpO1xuICBwcm90ZWN0ZWQgdW1kRXhwb3J0cyA9IG5ldyBGYWN0b3J5TWFwPHRzLlNvdXJjZUZpbGUsIE1hcDxzdHJpbmcsIERlY2xhcmF0aW9uPnxudWxsPihcbiAgICAgIHNmID0+IHRoaXMuY29tcHV0ZUV4cG9ydHNPZlVtZE1vZHVsZShzZikpO1xuICBwcm90ZWN0ZWQgdW1kSW1wb3J0UGF0aHMgPVxuICAgICAgbmV3IEZhY3RvcnlNYXA8dHMuUGFyYW1ldGVyRGVjbGFyYXRpb24sIHN0cmluZ3xudWxsPihwYXJhbSA9PiB0aGlzLmNvbXB1dGVJbXBvcnRQYXRoKHBhcmFtKSk7XG4gIHByb3RlY3RlZCBwcm9ncmFtOiB0cy5Qcm9ncmFtO1xuICBwcm90ZWN0ZWQgY29tcGlsZXJIb3N0OiB0cy5Db21waWxlckhvc3Q7XG5cbiAgY29uc3RydWN0b3IobG9nZ2VyOiBMb2dnZXIsIGlzQ29yZTogYm9vbGVhbiwgc3JjOiBCdW5kbGVQcm9ncmFtLCBkdHM6IEJ1bmRsZVByb2dyYW18bnVsbCA9IG51bGwpIHtcbiAgICBzdXBlcihsb2dnZXIsIGlzQ29yZSwgc3JjLCBkdHMpO1xuICAgIHRoaXMucHJvZ3JhbSA9IHNyYy5wcm9ncmFtO1xuICAgIHRoaXMuY29tcGlsZXJIb3N0ID0gc3JjLmhvc3Q7XG4gIH1cblxuICBnZXRJbXBvcnRPZklkZW50aWZpZXIoaWQ6IHRzLklkZW50aWZpZXIpOiBJbXBvcnR8bnVsbCB7XG4gICAgLy8gSXMgYGlkYCBhIG5hbWVzcGFjZWQgcHJvcGVydHkgYWNjZXNzLCBlLmcuIGBEaXJlY3RpdmVgIGluIGBjb3JlLkRpcmVjdGl2ZWA/XG4gICAgLy8gSWYgc28gY2FwdHVyZSB0aGUgc3ltYm9sIG9mIHRoZSBuYW1lc3BhY2UsIGUuZy4gYGNvcmVgLlxuICAgIGNvbnN0IG5zSWRlbnRpZmllciA9IGZpbmROYW1lc3BhY2VPZklkZW50aWZpZXIoaWQpO1xuICAgIGNvbnN0IGltcG9ydFBhcmFtZXRlciA9IG5zSWRlbnRpZmllciAmJiB0aGlzLmZpbmRVbWRJbXBvcnRQYXJhbWV0ZXIobnNJZGVudGlmaWVyKTtcbiAgICBjb25zdCBmcm9tID0gaW1wb3J0UGFyYW1ldGVyICYmIHRoaXMuZ2V0VW1kSW1wb3J0UGF0aChpbXBvcnRQYXJhbWV0ZXIpO1xuICAgIHJldHVybiBmcm9tICE9PSBudWxsID8ge2Zyb20sIG5hbWU6IGlkLnRleHR9IDogbnVsbDtcbiAgfVxuXG4gIGdldERlY2xhcmF0aW9uT2ZJZGVudGlmaWVyKGlkOiB0cy5JZGVudGlmaWVyKTogRGVjbGFyYXRpb258bnVsbCB7XG4gICAgLy8gRmlyc3Qgd2UgdHJ5IG9uZSBvZiB0aGUgdGhlIGZvbGxvd2luZzpcbiAgICAvLyAxLiBUaGUgYGV4cG9ydHNgIGlkZW50aWZpZXIgLSByZWZlcnJpbmcgdG8gdGhlIGN1cnJlbnQgZmlsZS9tb2R1bGUuXG4gICAgLy8gMi4gQW4gaWRlbnRpZmllciAoZS5nLiBgZm9vYCkgdGhhdCByZWZlcnMgdG8gYW4gaW1wb3J0ZWQgVU1EIG1vZHVsZS5cbiAgICAvLyAzLiBBIFVNRCBzdHlsZSBleHBvcnQgaWRlbnRpZmllciAoZS5nLiB0aGUgYGZvb2Agb2YgYGV4cG9ydHMuZm9vYCkuXG4gICAgY29uc3QgZGVjbGFyYXRpb24gPSB0aGlzLmdldEV4cG9ydHNEZWNsYXJhdGlvbihpZCkgfHwgdGhpcy5nZXRVbWRNb2R1bGVEZWNsYXJhdGlvbihpZCkgfHxcbiAgICAgICAgdGhpcy5nZXRVbWREZWNsYXJhdGlvbihpZCk7XG4gICAgaWYgKGRlY2xhcmF0aW9uICE9PSBudWxsKSB7XG4gICAgICByZXR1cm4gZGVjbGFyYXRpb247XG4gICAgfVxuXG4gICAgLy8gVHJ5IHRvIGdldCB0aGUgZGVjbGFyYXRpb24gdXNpbmcgdGhlIHN1cGVyIGNsYXNzLlxuICAgIGNvbnN0IHN1cGVyRGVjbGFyYXRpb24gPSBzdXBlci5nZXREZWNsYXJhdGlvbk9mSWRlbnRpZmllcihpZCk7XG4gICAgaWYgKHN1cGVyRGVjbGFyYXRpb24gPT09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIC8vIENoZWNrIHRvIHNlZSBpZiB0aGUgZGVjbGFyYXRpb24gaXMgdGhlIGlubmVyIG5vZGUgb2YgYSBkZWNsYXJhdGlvbiBJSUZFLlxuICAgIGNvbnN0IG91dGVyTm9kZSA9IGdldE91dGVyTm9kZUZyb21Jbm5lckRlY2xhcmF0aW9uKHN1cGVyRGVjbGFyYXRpb24ubm9kZSk7XG4gICAgaWYgKG91dGVyTm9kZSA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHN1cGVyRGVjbGFyYXRpb247XG4gICAgfVxuXG4gICAgLy8gV2UgYXJlIG9ubHkgaW50ZXJlc3RlZCBpZiB0aGUgb3V0ZXIgZGVjbGFyYXRpb24gaXMgb2YgdGhlIGZvcm1cbiAgICAvLyBgZXhwb3J0cy48bmFtZT4gPSA8aW5pdGlhbGl6ZXI+YC5cbiAgICBpZiAoIWlzRXhwb3J0c0Fzc2lnbm1lbnQob3V0ZXJOb2RlKSkge1xuICAgICAgcmV0dXJuIHN1cGVyRGVjbGFyYXRpb247XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIGtpbmQ6IERlY2xhcmF0aW9uS2luZC5JbmxpbmUsXG4gICAgICBub2RlOiBvdXRlck5vZGUubGVmdCxcbiAgICAgIGltcGxlbWVudGF0aW9uOiBvdXRlck5vZGUucmlnaHQsXG4gICAgICBrbm93bjogbnVsbCxcbiAgICAgIHZpYU1vZHVsZTogbnVsbCxcbiAgICB9O1xuICB9XG5cbiAgZ2V0RXhwb3J0c09mTW9kdWxlKG1vZHVsZTogdHMuTm9kZSk6IE1hcDxzdHJpbmcsIERlY2xhcmF0aW9uPnxudWxsIHtcbiAgICByZXR1cm4gc3VwZXIuZ2V0RXhwb3J0c09mTW9kdWxlKG1vZHVsZSkgfHwgdGhpcy51bWRFeHBvcnRzLmdldChtb2R1bGUuZ2V0U291cmNlRmlsZSgpKTtcbiAgfVxuXG4gIGdldFVtZE1vZHVsZShzb3VyY2VGaWxlOiB0cy5Tb3VyY2VGaWxlKTogVW1kTW9kdWxlfG51bGwge1xuICAgIGlmIChzb3VyY2VGaWxlLmlzRGVjbGFyYXRpb25GaWxlKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy51bWRNb2R1bGVzLmdldChzb3VyY2VGaWxlKTtcbiAgfVxuXG4gIGdldFVtZEltcG9ydFBhdGgoaW1wb3J0UGFyYW1ldGVyOiB0cy5QYXJhbWV0ZXJEZWNsYXJhdGlvbik6IHN0cmluZ3xudWxsIHtcbiAgICByZXR1cm4gdGhpcy51bWRJbXBvcnRQYXRocy5nZXQoaW1wb3J0UGFyYW1ldGVyKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIHRvcCBsZXZlbCBzdGF0ZW1lbnRzIGZvciBhIG1vZHVsZS5cbiAgICpcbiAgICogSW4gVU1EIG1vZHVsZXMgdGhlc2UgYXJlIHRoZSBib2R5IG9mIHRoZSBVTUQgZmFjdG9yeSBmdW5jdGlvbi5cbiAgICpcbiAgICogQHBhcmFtIHNvdXJjZUZpbGUgVGhlIG1vZHVsZSB3aG9zZSBzdGF0ZW1lbnRzIHdlIHdhbnQuXG4gICAqIEByZXR1cm5zIEFuIGFycmF5IG9mIHRvcCBsZXZlbCBzdGF0ZW1lbnRzIGZvciB0aGUgZ2l2ZW4gbW9kdWxlLlxuICAgKi9cbiAgcHJvdGVjdGVkIGdldE1vZHVsZVN0YXRlbWVudHMoc291cmNlRmlsZTogdHMuU291cmNlRmlsZSk6IHRzLlN0YXRlbWVudFtdIHtcbiAgICBjb25zdCB1bWRNb2R1bGUgPSB0aGlzLmdldFVtZE1vZHVsZShzb3VyY2VGaWxlKTtcbiAgICByZXR1cm4gdW1kTW9kdWxlICE9PSBudWxsID8gQXJyYXkuZnJvbSh1bWRNb2R1bGUuZmFjdG9yeUZuLmJvZHkuc3RhdGVtZW50cykgOiBbXTtcbiAgfVxuXG4gIHByb3RlY3RlZCBnZXRDbGFzc1N5bWJvbEZyb21PdXRlckRlY2xhcmF0aW9uKGRlY2xhcmF0aW9uOiB0cy5Ob2RlKTogTmdjY0NsYXNzU3ltYm9sfHVuZGVmaW5lZCB7XG4gICAgY29uc3Qgc3VwZXJTeW1ib2wgPSBzdXBlci5nZXRDbGFzc1N5bWJvbEZyb21PdXRlckRlY2xhcmF0aW9uKGRlY2xhcmF0aW9uKTtcbiAgICBpZiAoc3VwZXJTeW1ib2wpIHtcbiAgICAgIHJldHVybiBzdXBlclN5bWJvbDtcbiAgICB9XG5cbiAgICBpZiAoIWlzRXhwb3J0c0RlY2xhcmF0aW9uKGRlY2xhcmF0aW9uKSkge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBsZXQgaW5pdGlhbGl6ZXIgPSBza2lwQWxpYXNlcyhkZWNsYXJhdGlvbi5wYXJlbnQucmlnaHQpO1xuXG4gICAgaWYgKHRzLmlzSWRlbnRpZmllcihpbml0aWFsaXplcikpIHtcbiAgICAgIGNvbnN0IGltcGxlbWVudGF0aW9uID0gdGhpcy5nZXREZWNsYXJhdGlvbk9mSWRlbnRpZmllcihpbml0aWFsaXplcik7XG4gICAgICBpZiAoaW1wbGVtZW50YXRpb24gIT09IG51bGwpIHtcbiAgICAgICAgY29uc3QgaW1wbGVtZW50YXRpb25TeW1ib2wgPSB0aGlzLmdldENsYXNzU3ltYm9sKGltcGxlbWVudGF0aW9uLm5vZGUpO1xuICAgICAgICBpZiAoaW1wbGVtZW50YXRpb25TeW1ib2wgIT09IG51bGwpIHtcbiAgICAgICAgICByZXR1cm4gaW1wbGVtZW50YXRpb25TeW1ib2w7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBpbm5lckRlY2xhcmF0aW9uID0gZ2V0SW5uZXJDbGFzc0RlY2xhcmF0aW9uKGluaXRpYWxpemVyKTtcbiAgICBpZiAoaW5uZXJEZWNsYXJhdGlvbiAhPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlQ2xhc3NTeW1ib2woZGVjbGFyYXRpb24ubmFtZSwgaW5uZXJEZWNsYXJhdGlvbik7XG4gICAgfVxuXG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuXG5cbiAgcHJvdGVjdGVkIGdldENsYXNzU3ltYm9sRnJvbUlubmVyRGVjbGFyYXRpb24oZGVjbGFyYXRpb246IHRzLk5vZGUpOiBOZ2NjQ2xhc3NTeW1ib2x8dW5kZWZpbmVkIHtcbiAgICBjb25zdCBzdXBlckNsYXNzU3ltYm9sID0gc3VwZXIuZ2V0Q2xhc3NTeW1ib2xGcm9tSW5uZXJEZWNsYXJhdGlvbihkZWNsYXJhdGlvbik7XG4gICAgaWYgKHN1cGVyQ2xhc3NTeW1ib2wgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIHN1cGVyQ2xhc3NTeW1ib2w7XG4gICAgfVxuXG4gICAgaWYgKCFpc05hbWVkRnVuY3Rpb25EZWNsYXJhdGlvbihkZWNsYXJhdGlvbikpIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgY29uc3Qgb3V0ZXJOb2RlID0gZ2V0T3V0ZXJOb2RlRnJvbUlubmVyRGVjbGFyYXRpb24oZGVjbGFyYXRpb24pO1xuICAgIGlmIChvdXRlck5vZGUgPT09IG51bGwgfHwgIWlzRXhwb3J0c0Fzc2lnbm1lbnQob3V0ZXJOb2RlKSkge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5jcmVhdGVDbGFzc1N5bWJvbChvdXRlck5vZGUubGVmdC5uYW1lLCBkZWNsYXJhdGlvbik7XG4gIH1cblxuICAvKipcbiAgICogRXh0cmFjdCBhbGwgXCJjbGFzc2VzXCIgZnJvbSB0aGUgYHN0YXRlbWVudGAgYW5kIGFkZCB0aGVtIHRvIHRoZSBgY2xhc3Nlc2AgbWFwLlxuICAgKi9cbiAgcHJvdGVjdGVkIGFkZENsYXNzU3ltYm9sc0Zyb21TdGF0ZW1lbnQoXG4gICAgICBjbGFzc2VzOiBNYXA8dHMuU3ltYm9sLCBOZ2NjQ2xhc3NTeW1ib2w+LCBzdGF0ZW1lbnQ6IHRzLlN0YXRlbWVudCk6IHZvaWQge1xuICAgIHN1cGVyLmFkZENsYXNzU3ltYm9sc0Zyb21TdGF0ZW1lbnQoY2xhc3Nlcywgc3RhdGVtZW50KTtcblxuICAgIC8vIEFsc28gY2hlY2sgZm9yIGV4cG9ydHMgb2YgdGhlIGZvcm06IGBleHBvcnRzLjxuYW1lPiA9IDxjbGFzcyBkZWY+O2BcbiAgICBpZiAoaXNFeHBvcnRzU3RhdGVtZW50KHN0YXRlbWVudCkpIHtcbiAgICAgIGNvbnN0IGNsYXNzU3ltYm9sID0gdGhpcy5nZXRDbGFzc1N5bWJvbChzdGF0ZW1lbnQuZXhwcmVzc2lvbi5sZWZ0KTtcbiAgICAgIGlmIChjbGFzc1N5bWJvbCkge1xuICAgICAgICBjbGFzc2VzLnNldChjbGFzc1N5bWJvbC5pbXBsZW1lbnRhdGlvbiwgY2xhc3NTeW1ib2wpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBbmFseXplIHRoZSBnaXZlbiBzdGF0ZW1lbnQgdG8gc2VlIGlmIGl0IGNvcnJlc3BvbmRzIHdpdGggYW4gZXhwb3J0cyBkZWNsYXJhdGlvbiBsaWtlXG4gICAqIGBleHBvcnRzLk15Q2xhc3MgPSBNeUNsYXNzXzEgPSA8Y2xhc3MgZGVmPjtgLiBJZiBzbywgdGhlIGRlY2xhcmF0aW9uIG9mIGBNeUNsYXNzXzFgXG4gICAqIGlzIGFzc29jaWF0ZWQgd2l0aCB0aGUgYE15Q2xhc3NgIGlkZW50aWZpZXIuXG4gICAqXG4gICAqIEBwYXJhbSBzdGF0ZW1lbnQgVGhlIHN0YXRlbWVudCB0aGF0IG5lZWRzIHRvIGJlIHByZXByb2Nlc3NlZC5cbiAgICovXG4gIHByb3RlY3RlZCBwcmVwcm9jZXNzU3RhdGVtZW50KHN0YXRlbWVudDogdHMuU3RhdGVtZW50KTogdm9pZCB7XG4gICAgc3VwZXIucHJlcHJvY2Vzc1N0YXRlbWVudChzdGF0ZW1lbnQpO1xuXG4gICAgaWYgKCFpc0V4cG9ydHNTdGF0ZW1lbnQoc3RhdGVtZW50KSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGRlY2xhcmF0aW9uID0gc3RhdGVtZW50LmV4cHJlc3Npb24ubGVmdDtcbiAgICBjb25zdCBpbml0aWFsaXplciA9IHN0YXRlbWVudC5leHByZXNzaW9uLnJpZ2h0O1xuICAgIGlmICghaXNBc3NpZ25tZW50KGluaXRpYWxpemVyKSB8fCAhdHMuaXNJZGVudGlmaWVyKGluaXRpYWxpemVyLmxlZnQpIHx8XG4gICAgICAgICF0aGlzLmlzQ2xhc3MoZGVjbGFyYXRpb24pKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgYWxpYXNlZElkZW50aWZpZXIgPSBpbml0aWFsaXplci5sZWZ0O1xuXG4gICAgY29uc3QgYWxpYXNlZERlY2xhcmF0aW9uID0gdGhpcy5nZXREZWNsYXJhdGlvbk9mSWRlbnRpZmllcihhbGlhc2VkSWRlbnRpZmllcik7XG4gICAgaWYgKGFsaWFzZWREZWNsYXJhdGlvbiA9PT0gbnVsbCB8fCBhbGlhc2VkRGVjbGFyYXRpb24ubm9kZSA9PT0gbnVsbCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGBVbmFibGUgdG8gbG9jYXRlIGRlY2xhcmF0aW9uIG9mICR7YWxpYXNlZElkZW50aWZpZXIudGV4dH0gaW4gXCIke3N0YXRlbWVudC5nZXRUZXh0KCl9XCJgKTtcbiAgICB9XG4gICAgdGhpcy5hbGlhc2VkQ2xhc3NEZWNsYXJhdGlvbnMuc2V0KGFsaWFzZWREZWNsYXJhdGlvbi5ub2RlLCBkZWNsYXJhdGlvbi5uYW1lKTtcbiAgfVxuXG4gIHByaXZhdGUgY29tcHV0ZVVtZE1vZHVsZShzb3VyY2VGaWxlOiB0cy5Tb3VyY2VGaWxlKTogVW1kTW9kdWxlfG51bGwge1xuICAgIGlmIChzb3VyY2VGaWxlLnN0YXRlbWVudHMubGVuZ3RoICE9PSAxKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgYEV4cGVjdGVkIFVNRCBtb2R1bGUgZmlsZSAoJHtzb3VyY2VGaWxlLmZpbGVOYW1lfSkgdG8gY29udGFpbiBleGFjdGx5IG9uZSBzdGF0ZW1lbnQsIGAgK1xuICAgICAgICAgIGBidXQgZm91bmQgJHtzb3VyY2VGaWxlLnN0YXRlbWVudHMubGVuZ3RofS5gKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcGFyc2VTdGF0ZW1lbnRGb3JVbWRNb2R1bGUoc291cmNlRmlsZS5zdGF0ZW1lbnRzWzBdKTtcbiAgfVxuXG4gIHByaXZhdGUgY29tcHV0ZUV4cG9ydHNPZlVtZE1vZHVsZShzb3VyY2VGaWxlOiB0cy5Tb3VyY2VGaWxlKTogTWFwPHN0cmluZywgRGVjbGFyYXRpb24+fG51bGwge1xuICAgIGNvbnN0IG1vZHVsZU1hcCA9IG5ldyBNYXA8c3RyaW5nLCBEZWNsYXJhdGlvbj4oKTtcbiAgICBmb3IgKGNvbnN0IHN0YXRlbWVudCBvZiB0aGlzLmdldE1vZHVsZVN0YXRlbWVudHMoc291cmNlRmlsZSkpIHtcbiAgICAgIGlmIChpc0V4cG9ydHNTdGF0ZW1lbnQoc3RhdGVtZW50KSkge1xuICAgICAgICBjb25zdCBleHBvcnREZWNsYXJhdGlvbiA9IHRoaXMuZXh0cmFjdEJhc2ljVW1kRXhwb3J0RGVjbGFyYXRpb24oc3RhdGVtZW50KTtcbiAgICAgICAgaWYgKCFtb2R1bGVNYXAuaGFzKGV4cG9ydERlY2xhcmF0aW9uLm5hbWUpKSB7XG4gICAgICAgICAgLy8gV2UgYXNzdW1lIHRoYXQgdGhlIGZpcnN0IGBleHBvcnRzLjxuYW1lPmAgaXMgdGhlIGFjdHVhbCBkZWNsYXJhdGlvbiwgYW5kIHRoYXQgYW55XG4gICAgICAgICAgLy8gc3Vic2VxdWVudCBzdGF0ZW1lbnRzIHRoYXQgbWF0Y2ggYXJlIGRlY29yYXRpbmcgdGhlIG9yaWdpbmFsIGRlY2xhcmF0aW9uLlxuICAgICAgICAgIC8vIEZvciBleGFtcGxlOlxuICAgICAgICAgIC8vIGBgYFxuICAgICAgICAgIC8vIGV4cG9ydHMuZm9vID0gPGRlY2xhcmF0aW9uPjtcbiAgICAgICAgICAvLyBleHBvcnRzLmZvbyA9IF9fZGVjb3JhdGUoPGRlY29yYXRvcj4sIGV4cG9ydHMuZm9vKTtcbiAgICAgICAgICAvLyBgYGBcbiAgICAgICAgICAvLyBUaGUgZGVjbGFyYXRpb24gaXMgdGhlIGZpcnN0IGxpbmUgbm90IHRoZSBzZWNvbmQuXG4gICAgICAgICAgbW9kdWxlTWFwLnNldChleHBvcnREZWNsYXJhdGlvbi5uYW1lLCBleHBvcnREZWNsYXJhdGlvbi5kZWNsYXJhdGlvbik7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoaXNXaWxkY2FyZFJlZXhwb3J0U3RhdGVtZW50KHN0YXRlbWVudCkpIHtcbiAgICAgICAgY29uc3QgcmVleHBvcnRzID0gdGhpcy5leHRyYWN0VW1kV2lsZGNhcmRSZWV4cG9ydHMoc3RhdGVtZW50LCBzb3VyY2VGaWxlKTtcbiAgICAgICAgZm9yIChjb25zdCByZWV4cG9ydCBvZiByZWV4cG9ydHMpIHtcbiAgICAgICAgICBtb2R1bGVNYXAuc2V0KHJlZXhwb3J0Lm5hbWUsIHJlZXhwb3J0LmRlY2xhcmF0aW9uKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChpc0RlZmluZVByb3BlcnR5UmVleHBvcnRTdGF0ZW1lbnQoc3RhdGVtZW50KSkge1xuICAgICAgICBjb25zdCBleHBvcnREZWNsYXJhdGlvbiA9IHRoaXMuZXh0cmFjdFVtZERlZmluZVByb3BlcnR5RXhwb3J0RGVjbGFyYXRpb24oc3RhdGVtZW50KTtcbiAgICAgICAgaWYgKGV4cG9ydERlY2xhcmF0aW9uICE9PSBudWxsKSB7XG4gICAgICAgICAgbW9kdWxlTWFwLnNldChleHBvcnREZWNsYXJhdGlvbi5uYW1lLCBleHBvcnREZWNsYXJhdGlvbi5kZWNsYXJhdGlvbik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG1vZHVsZU1hcDtcbiAgfVxuXG4gIHByaXZhdGUgY29tcHV0ZUltcG9ydFBhdGgocGFyYW06IHRzLlBhcmFtZXRlckRlY2xhcmF0aW9uKTogc3RyaW5nfG51bGwge1xuICAgIGNvbnN0IHVtZE1vZHVsZSA9IHRoaXMuZ2V0VW1kTW9kdWxlKHBhcmFtLmdldFNvdXJjZUZpbGUoKSk7XG4gICAgaWYgKHVtZE1vZHVsZSA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3QgaW1wb3J0cyA9IGdldEltcG9ydHNPZlVtZE1vZHVsZSh1bWRNb2R1bGUpO1xuICAgIGlmIChpbXBvcnRzID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBsZXQgaW1wb3J0UGF0aDogc3RyaW5nfG51bGwgPSBudWxsO1xuXG4gICAgZm9yIChjb25zdCBpIG9mIGltcG9ydHMpIHtcbiAgICAgIC8vIEFkZCBhbGwgaW1wb3J0cyB0byB0aGUgbWFwIHRvIHNwZWVkIHVwIGZ1dHVyZSBsb29rIHVwcy5cbiAgICAgIHRoaXMudW1kSW1wb3J0UGF0aHMuc2V0KGkucGFyYW1ldGVyLCBpLnBhdGgpO1xuICAgICAgaWYgKGkucGFyYW1ldGVyID09PSBwYXJhbSkge1xuICAgICAgICBpbXBvcnRQYXRoID0gaS5wYXRoO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBpbXBvcnRQYXRoO1xuICB9XG5cbiAgcHJpdmF0ZSBleHRyYWN0QmFzaWNVbWRFeHBvcnREZWNsYXJhdGlvbihzdGF0ZW1lbnQ6IEV4cG9ydHNTdGF0ZW1lbnQpOiBFeHBvcnREZWNsYXJhdGlvbiB7XG4gICAgY29uc3QgbmFtZSA9IHN0YXRlbWVudC5leHByZXNzaW9uLmxlZnQubmFtZS50ZXh0O1xuICAgIGNvbnN0IGV4cG9ydEV4cHJlc3Npb24gPSBza2lwQWxpYXNlcyhzdGF0ZW1lbnQuZXhwcmVzc2lvbi5yaWdodCk7XG4gICAgY29uc3QgZGVjbGFyYXRpb24gPSB0aGlzLmdldERlY2xhcmF0aW9uT2ZFeHByZXNzaW9uKGV4cG9ydEV4cHJlc3Npb24pID8/IHtcbiAgICAgIGtpbmQ6IERlY2xhcmF0aW9uS2luZC5JbmxpbmUsXG4gICAgICBub2RlOiBzdGF0ZW1lbnQuZXhwcmVzc2lvbi5sZWZ0LFxuICAgICAgaW1wbGVtZW50YXRpb246IHN0YXRlbWVudC5leHByZXNzaW9uLnJpZ2h0LFxuICAgICAga25vd246IG51bGwsXG4gICAgICB2aWFNb2R1bGU6IG51bGwsXG4gICAgfTtcbiAgICByZXR1cm4ge25hbWUsIGRlY2xhcmF0aW9ufTtcbiAgfVxuXG4gIHByaXZhdGUgZXh0cmFjdFVtZFdpbGRjYXJkUmVleHBvcnRzKFxuICAgICAgc3RhdGVtZW50OiBXaWxkY2FyZFJlZXhwb3J0U3RhdGVtZW50LCBjb250YWluaW5nRmlsZTogdHMuU291cmNlRmlsZSk6IEV4cG9ydERlY2xhcmF0aW9uW10ge1xuICAgIGNvbnN0IHJlZXhwb3J0QXJnID0gc3RhdGVtZW50LmV4cHJlc3Npb24uYXJndW1lbnRzWzBdO1xuXG4gICAgY29uc3QgcmVxdWlyZUNhbGwgPSBpc1JlcXVpcmVDYWxsKHJlZXhwb3J0QXJnKSA/XG4gICAgICAgIHJlZXhwb3J0QXJnIDpcbiAgICAgICAgdHMuaXNJZGVudGlmaWVyKHJlZXhwb3J0QXJnKSA/IGZpbmRSZXF1aXJlQ2FsbFJlZmVyZW5jZShyZWV4cG9ydEFyZywgdGhpcy5jaGVja2VyKSA6IG51bGw7XG5cbiAgICBsZXQgaW1wb3J0UGF0aDogc3RyaW5nfG51bGwgPSBudWxsO1xuXG4gICAgaWYgKHJlcXVpcmVDYWxsICE9PSBudWxsKSB7XG4gICAgICBpbXBvcnRQYXRoID0gcmVxdWlyZUNhbGwuYXJndW1lbnRzWzBdLnRleHQ7XG4gICAgfSBlbHNlIGlmICh0cy5pc0lkZW50aWZpZXIocmVleHBvcnRBcmcpKSB7XG4gICAgICBjb25zdCBpbXBvcnRQYXJhbWV0ZXIgPSB0aGlzLmZpbmRVbWRJbXBvcnRQYXJhbWV0ZXIocmVleHBvcnRBcmcpO1xuICAgICAgaW1wb3J0UGF0aCA9IGltcG9ydFBhcmFtZXRlciAmJiB0aGlzLmdldFVtZEltcG9ydFBhdGgoaW1wb3J0UGFyYW1ldGVyKTtcbiAgICB9XG5cbiAgICBpZiAoaW1wb3J0UGF0aCA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIGNvbnN0IGltcG9ydGVkRmlsZSA9IHRoaXMucmVzb2x2ZU1vZHVsZU5hbWUoaW1wb3J0UGF0aCwgY29udGFpbmluZ0ZpbGUpO1xuICAgIGlmIChpbXBvcnRlZEZpbGUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIGNvbnN0IGltcG9ydGVkRXhwb3J0cyA9IHRoaXMuZ2V0RXhwb3J0c09mTW9kdWxlKGltcG9ydGVkRmlsZSk7XG4gICAgaWYgKGltcG9ydGVkRXhwb3J0cyA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIGNvbnN0IHZpYU1vZHVsZSA9IHN0cmlwRXh0ZW5zaW9uKGltcG9ydGVkRmlsZS5maWxlTmFtZSk7XG4gICAgY29uc3QgcmVleHBvcnRzOiBFeHBvcnREZWNsYXJhdGlvbltdID0gW107XG4gICAgaW1wb3J0ZWRFeHBvcnRzLmZvckVhY2goXG4gICAgICAgIChkZWNsLCBuYW1lKSA9PiByZWV4cG9ydHMucHVzaCh7bmFtZSwgZGVjbGFyYXRpb246IHsuLi5kZWNsLCB2aWFNb2R1bGV9fSkpO1xuICAgIHJldHVybiByZWV4cG9ydHM7XG4gIH1cblxuICBwcml2YXRlIGV4dHJhY3RVbWREZWZpbmVQcm9wZXJ0eUV4cG9ydERlY2xhcmF0aW9uKHN0YXRlbWVudDogRGVmaW5lUHJvcGVydHlSZWV4cG9ydFN0YXRlbWVudCk6XG4gICAgICBFeHBvcnREZWNsYXJhdGlvbnxudWxsIHtcbiAgICBjb25zdCBhcmdzID0gc3RhdGVtZW50LmV4cHJlc3Npb24uYXJndW1lbnRzO1xuICAgIGNvbnN0IG5hbWUgPSBhcmdzWzFdLnRleHQ7XG4gICAgY29uc3QgZ2V0dGVyRm5FeHByZXNzaW9uID0gZXh0cmFjdEdldHRlckZuRXhwcmVzc2lvbihzdGF0ZW1lbnQpO1xuICAgIGlmIChnZXR0ZXJGbkV4cHJlc3Npb24gPT09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IGRlY2xhcmF0aW9uID0gdGhpcy5nZXREZWNsYXJhdGlvbk9mRXhwcmVzc2lvbihnZXR0ZXJGbkV4cHJlc3Npb24pO1xuICAgIGlmIChkZWNsYXJhdGlvbiAhPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHtuYW1lLCBkZWNsYXJhdGlvbn07XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIG5hbWUsXG4gICAgICBkZWNsYXJhdGlvbjoge1xuICAgICAgICBraW5kOiBEZWNsYXJhdGlvbktpbmQuSW5saW5lLFxuICAgICAgICBub2RlOiBhcmdzWzFdLFxuICAgICAgICBpbXBsZW1lbnRhdGlvbjogZ2V0dGVyRm5FeHByZXNzaW9uLFxuICAgICAgICBrbm93bjogbnVsbCxcbiAgICAgICAgdmlhTW9kdWxlOiBudWxsLFxuICAgICAgfSxcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIElzIHRoZSBpZGVudGlmaWVyIGEgcGFyYW1ldGVyIG9uIGEgVU1EIGZhY3RvcnkgZnVuY3Rpb24sIGUuZy4gYGZ1bmN0aW9uIGZhY3RvcnkodGhpcywgY29yZSlgP1xuICAgKiBJZiBzbyB0aGVuIHJldHVybiBpdHMgZGVjbGFyYXRpb24uXG4gICAqL1xuICBwcml2YXRlIGZpbmRVbWRJbXBvcnRQYXJhbWV0ZXIoaWQ6IHRzLklkZW50aWZpZXIpOiB0cy5QYXJhbWV0ZXJEZWNsYXJhdGlvbnxudWxsIHtcbiAgICBjb25zdCBzeW1ib2wgPSBpZCAmJiB0aGlzLmNoZWNrZXIuZ2V0U3ltYm9sQXRMb2NhdGlvbihpZCkgfHwgbnVsbDtcbiAgICBjb25zdCBkZWNsYXJhdGlvbiA9IHN5bWJvbCAmJiBzeW1ib2wudmFsdWVEZWNsYXJhdGlvbjtcbiAgICByZXR1cm4gZGVjbGFyYXRpb24gJiYgdHMuaXNQYXJhbWV0ZXIoZGVjbGFyYXRpb24pID8gZGVjbGFyYXRpb24gOiBudWxsO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRVbWREZWNsYXJhdGlvbihpZDogdHMuSWRlbnRpZmllcik6IERlY2xhcmF0aW9ufG51bGwge1xuICAgIGNvbnN0IG5zSWRlbnRpZmllciA9IGZpbmROYW1lc3BhY2VPZklkZW50aWZpZXIoaWQpO1xuICAgIGlmIChuc0lkZW50aWZpZXIgPT09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGlmIChuc0lkZW50aWZpZXIucGFyZW50LnBhcmVudCAmJiBpc0V4cG9ydHNBc3NpZ25tZW50KG5zSWRlbnRpZmllci5wYXJlbnQucGFyZW50KSkge1xuICAgICAgY29uc3QgaW5pdGlhbGl6ZXIgPSBuc0lkZW50aWZpZXIucGFyZW50LnBhcmVudC5yaWdodDtcbiAgICAgIGlmICh0cy5pc0lkZW50aWZpZXIoaW5pdGlhbGl6ZXIpKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldERlY2xhcmF0aW9uT2ZJZGVudGlmaWVyKGluaXRpYWxpemVyKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLmRldGVjdEtub3duRGVjbGFyYXRpb24oe1xuICAgICAgICBraW5kOiBEZWNsYXJhdGlvbktpbmQuSW5saW5lLFxuICAgICAgICBub2RlOiBuc0lkZW50aWZpZXIucGFyZW50LnBhcmVudC5sZWZ0LFxuICAgICAgICBpbXBsZW1lbnRhdGlvbjogc2tpcEFsaWFzZXMobnNJZGVudGlmaWVyLnBhcmVudC5wYXJlbnQucmlnaHQpLFxuICAgICAgICB2aWFNb2R1bGU6IG51bGwsXG4gICAgICAgIGtub3duOiBudWxsLFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgY29uc3QgbW9kdWxlRGVjbGFyYXRpb24gPSB0aGlzLmdldFVtZE1vZHVsZURlY2xhcmF0aW9uKG5zSWRlbnRpZmllcik7XG4gICAgaWYgKG1vZHVsZURlY2xhcmF0aW9uID09PSBudWxsIHx8IG1vZHVsZURlY2xhcmF0aW9uLm5vZGUgPT09IG51bGwgfHxcbiAgICAgICAgIXRzLmlzU291cmNlRmlsZShtb2R1bGVEZWNsYXJhdGlvbi5ub2RlKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3QgbW9kdWxlRXhwb3J0cyA9IHRoaXMuZ2V0RXhwb3J0c09mTW9kdWxlKG1vZHVsZURlY2xhcmF0aW9uLm5vZGUpO1xuICAgIGlmIChtb2R1bGVFeHBvcnRzID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBXZSBuZWVkIHRvIGNvbXB1dGUgdGhlIGB2aWFNb2R1bGVgIGJlY2F1c2UgIHRoZSBgZ2V0RXhwb3J0c09mTW9kdWxlKClgIGNhbGxcbiAgICAvLyBkaWQgbm90IGtub3cgdGhhdCB3ZSB3ZXJlIGltcG9ydGluZyB0aGUgZGVjbGFyYXRpb24uXG4gICAgY29uc3QgZGVjbGFyYXRpb24gPSBtb2R1bGVFeHBvcnRzLmdldChpZC50ZXh0KSE7XG5cbiAgICBpZiAoIW1vZHVsZUV4cG9ydHMuaGFzKGlkLnRleHQpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBXZSBuZWVkIHRvIGNvbXB1dGUgdGhlIGB2aWFNb2R1bGVgIGJlY2F1c2UgIHRoZSBgZ2V0RXhwb3J0c09mTW9kdWxlKClgIGNhbGxcbiAgICAvLyBkaWQgbm90IGtub3cgdGhhdCB3ZSB3ZXJlIGltcG9ydGluZyB0aGUgZGVjbGFyYXRpb24uXG4gICAgY29uc3QgdmlhTW9kdWxlID1cbiAgICAgICAgZGVjbGFyYXRpb24udmlhTW9kdWxlID09PSBudWxsID8gbW9kdWxlRGVjbGFyYXRpb24udmlhTW9kdWxlIDogZGVjbGFyYXRpb24udmlhTW9kdWxlO1xuXG4gICAgcmV0dXJuIHsuLi5kZWNsYXJhdGlvbiwgdmlhTW9kdWxlLCBrbm93bjogZ2V0VHNIZWxwZXJGbkZyb21JZGVudGlmaWVyKGlkKX07XG4gIH1cblxuICBwcml2YXRlIGdldEV4cG9ydHNEZWNsYXJhdGlvbihpZDogdHMuSWRlbnRpZmllcik6IERlY2xhcmF0aW9ufG51bGwge1xuICAgIGlmICghaXNFeHBvcnRzSWRlbnRpZmllcihpZCkpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIC8vIFNhZGx5LCBpbiB0aGUgY2FzZSBvZiBgZXhwb3J0cy5mb28gPSBiYXJgLCB3ZSBjYW4ndCB1c2UgYHRoaXMuZmluZFVtZEltcG9ydFBhcmFtZXRlcihpZClgXG4gICAgLy8gdG8gY2hlY2sgd2hldGhlciB0aGlzIGBleHBvcnRzYCBpcyBmcm9tIHRoZSBJSUZFIGJvZHkgYXJndW1lbnRzLCBiZWNhdXNlXG4gICAgLy8gYHRoaXMuY2hlY2tlci5nZXRTeW1ib2xBdExvY2F0aW9uKGlkKWAgd2lsbCByZXR1cm4gdGhlIHN5bWJvbCBmb3IgdGhlIGBmb29gIGlkZW50aWZpZXJcbiAgICAvLyByYXRoZXIgdGhhbiB0aGUgYGV4cG9ydHNgIGlkZW50aWZpZXIuXG4gICAgLy9cbiAgICAvLyBJbnN0ZWFkIHdlIHNlYXJjaCB0aGUgc3ltYm9scyBpbiB0aGUgY3VycmVudCBsb2NhbCBzY29wZS5cbiAgICBjb25zdCBleHBvcnRzU3ltYm9sID0gdGhpcy5jaGVja2VyLmdldFN5bWJvbHNJblNjb3BlKGlkLCB0cy5TeW1ib2xGbGFncy5WYXJpYWJsZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5maW5kKHN5bWJvbCA9PiBzeW1ib2wubmFtZSA9PT0gJ2V4cG9ydHMnKTtcblxuICAgIGNvbnN0IG5vZGUgPSBleHBvcnRzU3ltYm9sICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICAgICAgICF0cy5pc0Z1bmN0aW9uRXhwcmVzc2lvbihleHBvcnRzU3ltYm9sLnZhbHVlRGVjbGFyYXRpb24ucGFyZW50KSA/XG4gICAgICAgIC8vIFRoZXJlIGlzIGEgbG9jYWxseSBkZWZpbmVkIGBleHBvcnRzYCB2YXJpYWJsZSB0aGF0IGlzIG5vdCBhIGZ1bmN0aW9uIHBhcmFtZXRlci5cbiAgICAgICAgLy8gU28gdGhpcyBgZXhwb3J0c2AgaWRlbnRpZmllciBtdXN0IGJlIGEgbG9jYWwgdmFyaWFibGUgYW5kIGRvZXMgbm90IHJlcHJlc2VudCB0aGUgbW9kdWxlLlxuICAgICAgICBleHBvcnRzU3ltYm9sLnZhbHVlRGVjbGFyYXRpb24gOlxuICAgICAgICAvLyBUaGVyZSBpcyBubyBsb2NhbCBzeW1ib2wgb3IgaXQgaXMgYSBwYXJhbWV0ZXIgb2YgYW4gSUlGRS5cbiAgICAgICAgLy8gU28gdGhpcyBgZXhwb3J0c2AgcmVwcmVzZW50cyB0aGUgY3VycmVudCBcIm1vZHVsZVwiLlxuICAgICAgICBpZC5nZXRTb3VyY2VGaWxlKCk7XG5cbiAgICByZXR1cm4ge1xuICAgICAga2luZDogRGVjbGFyYXRpb25LaW5kLkNvbmNyZXRlLFxuICAgICAgbm9kZSxcbiAgICAgIHZpYU1vZHVsZTogbnVsbCxcbiAgICAgIGtub3duOiBudWxsLFxuICAgICAgaWRlbnRpdHk6IG51bGwsXG4gICAgfTtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0VW1kTW9kdWxlRGVjbGFyYXRpb24oaWQ6IHRzLklkZW50aWZpZXIpOiBEZWNsYXJhdGlvbnxudWxsIHtcbiAgICBjb25zdCBpbXBvcnRQYXRoID0gdGhpcy5nZXRJbXBvcnRQYXRoRnJvbVBhcmFtZXRlcihpZCkgfHwgdGhpcy5nZXRJbXBvcnRQYXRoRnJvbVJlcXVpcmVDYWxsKGlkKTtcbiAgICBpZiAoaW1wb3J0UGF0aCA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3QgbW9kdWxlID0gdGhpcy5yZXNvbHZlTW9kdWxlTmFtZShpbXBvcnRQYXRoLCBpZC5nZXRTb3VyY2VGaWxlKCkpO1xuICAgIGlmIChtb2R1bGUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3QgdmlhTW9kdWxlID0gaXNFeHRlcm5hbEltcG9ydChpbXBvcnRQYXRoKSA/IGltcG9ydFBhdGggOiBudWxsO1xuICAgIHJldHVybiB7a2luZDogRGVjbGFyYXRpb25LaW5kLkNvbmNyZXRlLCBub2RlOiBtb2R1bGUsIHZpYU1vZHVsZSwga25vd246IG51bGwsIGlkZW50aXR5OiBudWxsfTtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0SW1wb3J0UGF0aEZyb21QYXJhbWV0ZXIoaWQ6IHRzLklkZW50aWZpZXIpOiBzdHJpbmd8bnVsbCB7XG4gICAgY29uc3QgaW1wb3J0UGFyYW1ldGVyID0gdGhpcy5maW5kVW1kSW1wb3J0UGFyYW1ldGVyKGlkKTtcbiAgICBpZiAoaW1wb3J0UGFyYW1ldGVyID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZ2V0VW1kSW1wb3J0UGF0aChpbXBvcnRQYXJhbWV0ZXIpO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRJbXBvcnRQYXRoRnJvbVJlcXVpcmVDYWxsKGlkOiB0cy5JZGVudGlmaWVyKTogc3RyaW5nfG51bGwge1xuICAgIGNvbnN0IHJlcXVpcmVDYWxsID0gZmluZFJlcXVpcmVDYWxsUmVmZXJlbmNlKGlkLCB0aGlzLmNoZWNrZXIpO1xuICAgIGlmIChyZXF1aXJlQ2FsbCA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiByZXF1aXJlQ2FsbC5hcmd1bWVudHNbMF0udGV4dDtcbiAgfVxuXG4gIC8qKlxuICAgKiBJZiB0aGlzIGlzIGFuIElJRkUgdGhlbiB0cnkgdG8gZ3JhYiB0aGUgb3V0ZXIgYW5kIGlubmVyIGNsYXNzZXMgb3RoZXJ3aXNlIGZhbGxiYWNrIG9uIHRoZSBzdXBlclxuICAgKiBjbGFzcy5cbiAgICovXG4gIHByb3RlY3RlZCBnZXREZWNsYXJhdGlvbk9mRXhwcmVzc2lvbihleHByZXNzaW9uOiB0cy5FeHByZXNzaW9uKTogRGVjbGFyYXRpb258bnVsbCB7XG4gICAgY29uc3QgaW5uZXIgPSBnZXRJbm5lckNsYXNzRGVjbGFyYXRpb24oZXhwcmVzc2lvbik7XG4gICAgaWYgKGlubmVyICE9PSBudWxsKSB7XG4gICAgICBjb25zdCBvdXRlciA9IGdldE91dGVyTm9kZUZyb21Jbm5lckRlY2xhcmF0aW9uKGlubmVyKTtcbiAgICAgIGlmIChvdXRlciAhPT0gbnVsbCAmJiBpc0V4cG9ydHNBc3NpZ25tZW50KG91dGVyKSkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGtpbmQ6IERlY2xhcmF0aW9uS2luZC5JbmxpbmUsXG4gICAgICAgICAgbm9kZTogb3V0ZXIubGVmdCxcbiAgICAgICAgICBpbXBsZW1lbnRhdGlvbjogaW5uZXIsXG4gICAgICAgICAga25vd246IG51bGwsXG4gICAgICAgICAgdmlhTW9kdWxlOiBudWxsLFxuICAgICAgICB9O1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gc3VwZXIuZ2V0RGVjbGFyYXRpb25PZkV4cHJlc3Npb24oZXhwcmVzc2lvbik7XG4gIH1cblxuICBwcml2YXRlIHJlc29sdmVNb2R1bGVOYW1lKG1vZHVsZU5hbWU6IHN0cmluZywgY29udGFpbmluZ0ZpbGU6IHRzLlNvdXJjZUZpbGUpOiB0cy5Tb3VyY2VGaWxlXG4gICAgICB8dW5kZWZpbmVkIHtcbiAgICBpZiAodGhpcy5jb21waWxlckhvc3QucmVzb2x2ZU1vZHVsZU5hbWVzKSB7XG4gICAgICBjb25zdCBtb2R1bGVJbmZvID0gdGhpcy5jb21waWxlckhvc3QucmVzb2x2ZU1vZHVsZU5hbWVzKFxuICAgICAgICAgIFttb2R1bGVOYW1lXSwgY29udGFpbmluZ0ZpbGUuZmlsZU5hbWUsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLFxuICAgICAgICAgIHRoaXMucHJvZ3JhbS5nZXRDb21waWxlck9wdGlvbnMoKSlbMF07XG4gICAgICByZXR1cm4gbW9kdWxlSW5mbyAmJiB0aGlzLnByb2dyYW0uZ2V0U291cmNlRmlsZShhYnNvbHV0ZUZyb20obW9kdWxlSW5mby5yZXNvbHZlZEZpbGVOYW1lKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IG1vZHVsZUluZm8gPSB0cy5yZXNvbHZlTW9kdWxlTmFtZShcbiAgICAgICAgICBtb2R1bGVOYW1lLCBjb250YWluaW5nRmlsZS5maWxlTmFtZSwgdGhpcy5wcm9ncmFtLmdldENvbXBpbGVyT3B0aW9ucygpLFxuICAgICAgICAgIHRoaXMuY29tcGlsZXJIb3N0KTtcbiAgICAgIHJldHVybiBtb2R1bGVJbmZvLnJlc29sdmVkTW9kdWxlICYmXG4gICAgICAgICAgdGhpcy5wcm9ncmFtLmdldFNvdXJjZUZpbGUoYWJzb2x1dGVGcm9tKG1vZHVsZUluZm8ucmVzb2x2ZWRNb2R1bGUucmVzb2x2ZWRGaWxlTmFtZSkpO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VTdGF0ZW1lbnRGb3JVbWRNb2R1bGUoc3RhdGVtZW50OiB0cy5TdGF0ZW1lbnQpOiBVbWRNb2R1bGV8bnVsbCB7XG4gIGNvbnN0IHdyYXBwZXJDYWxsID0gZ2V0VW1kV3JhcHBlckNhbGwoc3RhdGVtZW50KTtcbiAgaWYgKCF3cmFwcGVyQ2FsbCkgcmV0dXJuIG51bGw7XG5cbiAgY29uc3Qgd3JhcHBlckZuID0gd3JhcHBlckNhbGwuZXhwcmVzc2lvbjtcbiAgaWYgKCF0cy5pc0Z1bmN0aW9uRXhwcmVzc2lvbih3cmFwcGVyRm4pKSByZXR1cm4gbnVsbDtcblxuICBjb25zdCBmYWN0b3J5Rm5QYXJhbUluZGV4ID0gd3JhcHBlckZuLnBhcmFtZXRlcnMuZmluZEluZGV4KFxuICAgICAgcGFyYW1ldGVyID0+IHRzLmlzSWRlbnRpZmllcihwYXJhbWV0ZXIubmFtZSkgJiYgcGFyYW1ldGVyLm5hbWUudGV4dCA9PT0gJ2ZhY3RvcnknKTtcbiAgaWYgKGZhY3RvcnlGblBhcmFtSW5kZXggPT09IC0xKSByZXR1cm4gbnVsbDtcblxuICBjb25zdCBmYWN0b3J5Rm4gPSBzdHJpcFBhcmVudGhlc2VzKHdyYXBwZXJDYWxsLmFyZ3VtZW50c1tmYWN0b3J5Rm5QYXJhbUluZGV4XSk7XG4gIGlmICghZmFjdG9yeUZuIHx8ICF0cy5pc0Z1bmN0aW9uRXhwcmVzc2lvbihmYWN0b3J5Rm4pKSByZXR1cm4gbnVsbDtcblxuICByZXR1cm4ge3dyYXBwZXJGbiwgZmFjdG9yeUZufTtcbn1cblxuZnVuY3Rpb24gZ2V0VW1kV3JhcHBlckNhbGwoc3RhdGVtZW50OiB0cy5TdGF0ZW1lbnQpOiB0cy5DYWxsRXhwcmVzc2lvbiZcbiAgICB7ZXhwcmVzc2lvbjogdHMuRnVuY3Rpb25FeHByZXNzaW9ufXxudWxsIHtcbiAgaWYgKCF0cy5pc0V4cHJlc3Npb25TdGF0ZW1lbnQoc3RhdGVtZW50KSB8fCAhdHMuaXNQYXJlbnRoZXNpemVkRXhwcmVzc2lvbihzdGF0ZW1lbnQuZXhwcmVzc2lvbikgfHxcbiAgICAgICF0cy5pc0NhbGxFeHByZXNzaW9uKHN0YXRlbWVudC5leHByZXNzaW9uLmV4cHJlc3Npb24pIHx8XG4gICAgICAhdHMuaXNGdW5jdGlvbkV4cHJlc3Npb24oc3RhdGVtZW50LmV4cHJlc3Npb24uZXhwcmVzc2lvbi5leHByZXNzaW9uKSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHJldHVybiBzdGF0ZW1lbnQuZXhwcmVzc2lvbi5leHByZXNzaW9uIGFzIHRzLkNhbGxFeHByZXNzaW9uICYge2V4cHJlc3Npb246IHRzLkZ1bmN0aW9uRXhwcmVzc2lvbn07XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEltcG9ydHNPZlVtZE1vZHVsZSh1bWRNb2R1bGU6IFVtZE1vZHVsZSk6XG4gICAge3BhcmFtZXRlcjogdHMuUGFyYW1ldGVyRGVjbGFyYXRpb24sIHBhdGg6IHN0cmluZ31bXSB7XG4gIGNvbnN0IGltcG9ydHM6IHtwYXJhbWV0ZXI6IHRzLlBhcmFtZXRlckRlY2xhcmF0aW9uLCBwYXRoOiBzdHJpbmd9W10gPSBbXTtcbiAgZm9yIChsZXQgaSA9IDE7IGkgPCB1bWRNb2R1bGUuZmFjdG9yeUZuLnBhcmFtZXRlcnMubGVuZ3RoOyBpKyspIHtcbiAgICBpbXBvcnRzLnB1c2goe1xuICAgICAgcGFyYW1ldGVyOiB1bWRNb2R1bGUuZmFjdG9yeUZuLnBhcmFtZXRlcnNbaV0sXG4gICAgICBwYXRoOiBnZXRSZXF1aXJlZE1vZHVsZVBhdGgodW1kTW9kdWxlLndyYXBwZXJGbiwgaSlcbiAgICB9KTtcbiAgfVxuICByZXR1cm4gaW1wb3J0cztcbn1cblxuaW50ZXJmYWNlIFVtZE1vZHVsZSB7XG4gIHdyYXBwZXJGbjogdHMuRnVuY3Rpb25FeHByZXNzaW9uO1xuICBmYWN0b3J5Rm46IHRzLkZ1bmN0aW9uRXhwcmVzc2lvbjtcbn1cblxuZnVuY3Rpb24gZ2V0UmVxdWlyZWRNb2R1bGVQYXRoKHdyYXBwZXJGbjogdHMuRnVuY3Rpb25FeHByZXNzaW9uLCBwYXJhbUluZGV4OiBudW1iZXIpOiBzdHJpbmcge1xuICBjb25zdCBzdGF0ZW1lbnQgPSB3cmFwcGVyRm4uYm9keS5zdGF0ZW1lbnRzWzBdO1xuICBpZiAoIXRzLmlzRXhwcmVzc2lvblN0YXRlbWVudChzdGF0ZW1lbnQpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAnVU1EIHdyYXBwZXIgYm9keSBpcyBub3QgYW4gZXhwcmVzc2lvbiBzdGF0ZW1lbnQ6XFxuJyArIHdyYXBwZXJGbi5ib2R5LmdldFRleHQoKSk7XG4gIH1cbiAgY29uc3QgbW9kdWxlUGF0aHM6IHN0cmluZ1tdID0gW107XG4gIGZpbmRNb2R1bGVQYXRocyhzdGF0ZW1lbnQuZXhwcmVzc2lvbik7XG5cbiAgLy8gU2luY2Ugd2Ugd2VyZSBvbmx5IGludGVyZXN0ZWQgaW4gdGhlIGByZXF1aXJlKClgIGNhbGxzLCB3ZSBtaXNzIHRoZSBgZXhwb3J0c2AgYXJndW1lbnQsIHNvIHdlXG4gIC8vIG5lZWQgdG8gc3VidHJhY3QgMS5cbiAgLy8gRS5nLiBgZnVuY3Rpb24oZXhwb3J0cywgZGVwMSwgZGVwMilgIG1hcHMgdG8gYGZ1bmN0aW9uKGV4cG9ydHMsIHJlcXVpcmUoJ3BhdGgvdG8vZGVwMScpLFxuICAvLyByZXF1aXJlKCdwYXRoL3RvL2RlcDInKSlgXG4gIHJldHVybiBtb2R1bGVQYXRoc1twYXJhbUluZGV4IC0gMV07XG5cbiAgLy8gU2VhcmNoIHRoZSBzdGF0ZW1lbnQgZm9yIGNhbGxzIHRvIGByZXF1aXJlKCcuLi4nKWAgYW5kIGV4dHJhY3QgdGhlIHN0cmluZyB2YWx1ZSBvZiB0aGUgZmlyc3RcbiAgLy8gYXJndW1lbnRcbiAgZnVuY3Rpb24gZmluZE1vZHVsZVBhdGhzKG5vZGU6IHRzLk5vZGUpIHtcbiAgICBpZiAoaXNSZXF1aXJlQ2FsbChub2RlKSkge1xuICAgICAgY29uc3QgYXJndW1lbnQgPSBub2RlLmFyZ3VtZW50c1swXTtcbiAgICAgIGlmICh0cy5pc1N0cmluZ0xpdGVyYWwoYXJndW1lbnQpKSB7XG4gICAgICAgIG1vZHVsZVBhdGhzLnB1c2goYXJndW1lbnQudGV4dCk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIG5vZGUuZm9yRWFjaENoaWxkKGZpbmRNb2R1bGVQYXRocyk7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogSXMgdGhlIGBub2RlYCBhbiBpZGVudGlmaWVyIHdpdGggdGhlIG5hbWUgXCJleHBvcnRzXCI/XG4gKi9cbmZ1bmN0aW9uIGlzRXhwb3J0c0lkZW50aWZpZXIobm9kZTogdHMuTm9kZSk6IG5vZGUgaXMgdHMuSWRlbnRpZmllciB7XG4gIHJldHVybiB0cy5pc0lkZW50aWZpZXIobm9kZSkgJiYgbm9kZS50ZXh0ID09PSAnZXhwb3J0cyc7XG59XG4iXX0=