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
        define("@angular/compiler-cli/src/ngtsc/reflection/src/typescript", ["require", "exports", "typescript", "@angular/compiler-cli/src/ngtsc/reflection/src/host", "@angular/compiler-cli/src/ngtsc/reflection/src/type_to_value", "@angular/compiler-cli/src/ngtsc/reflection/src/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.reflectObjectLiteral = exports.findMember = exports.filterToMembersWithDecorator = exports.reflectTypeEntityToDeclaration = exports.reflectIdentifierOfDeclaration = exports.reflectNameOfDeclaration = exports.TypeScriptReflectionHost = void 0;
    var ts = require("typescript");
    var host_1 = require("@angular/compiler-cli/src/ngtsc/reflection/src/host");
    var type_to_value_1 = require("@angular/compiler-cli/src/ngtsc/reflection/src/type_to_value");
    var util_1 = require("@angular/compiler-cli/src/ngtsc/reflection/src/util");
    /**
     * reflector.ts implements static reflection of declarations using the TypeScript `ts.TypeChecker`.
     */
    var TypeScriptReflectionHost = /** @class */ (function () {
        function TypeScriptReflectionHost(checker) {
            this.checker = checker;
        }
        TypeScriptReflectionHost.prototype.getDecoratorsOfDeclaration = function (declaration) {
            var _this = this;
            if (declaration.decorators === undefined || declaration.decorators.length === 0) {
                return null;
            }
            return declaration.decorators.map(function (decorator) { return _this._reflectDecorator(decorator); })
                .filter(function (dec) { return dec !== null; });
        };
        TypeScriptReflectionHost.prototype.getMembersOfClass = function (clazz) {
            var _this = this;
            var tsClazz = castDeclarationToClassOrDie(clazz);
            return tsClazz.members.map(function (member) { return _this._reflectMember(member); })
                .filter(function (member) { return member !== null; });
        };
        TypeScriptReflectionHost.prototype.getConstructorParameters = function (clazz) {
            var _this = this;
            var tsClazz = castDeclarationToClassOrDie(clazz);
            // First, find the constructor with a `body`. The constructors without a `body` are overloads
            // whereas we want the implementation since it's the one that'll be executed and which can
            // have decorators.
            var ctor = tsClazz.members.find(function (member) {
                return ts.isConstructorDeclaration(member) && member.body !== undefined;
            });
            if (ctor === undefined) {
                return null;
            }
            return ctor.parameters.map(function (node) {
                // The name of the parameter is easy.
                var name = parameterName(node.name);
                var decorators = _this.getDecoratorsOfDeclaration(node);
                // It may or may not be possible to write an expression that refers to the value side of the
                // type named for the parameter.
                var originalTypeNode = node.type || null;
                var typeNode = originalTypeNode;
                // Check if we are dealing with a simple nullable union type e.g. `foo: Foo|null`
                // and extract the type. More complex union types e.g. `foo: Foo|Bar` are not supported.
                // We also don't need to support `foo: Foo|undefined` because Angular's DI injects `null` for
                // optional tokes that don't have providers.
                if (typeNode && ts.isUnionTypeNode(typeNode)) {
                    var childTypeNodes = typeNode.types.filter(
                    // TODO(alan-agius4): remove `childTypeNode.kind !== ts.SyntaxKind.NullKeyword` when
                    // TS 3.9 support is dropped. In TS 4.0 NullKeyword is a child of LiteralType.
                    function (childTypeNode) { return childTypeNode.kind !== ts.SyntaxKind.NullKeyword &&
                        !(ts.isLiteralTypeNode(childTypeNode) &&
                            childTypeNode.literal.kind === ts.SyntaxKind.NullKeyword); });
                    if (childTypeNodes.length === 1) {
                        typeNode = childTypeNodes[0];
                    }
                }
                var typeValueReference = type_to_value_1.typeToValue(typeNode, _this.checker);
                return {
                    name: name,
                    nameNode: node.name,
                    typeValueReference: typeValueReference,
                    typeNode: originalTypeNode,
                    decorators: decorators,
                };
            });
        };
        TypeScriptReflectionHost.prototype.getImportOfIdentifier = function (id) {
            var directImport = this.getDirectImportOfIdentifier(id);
            if (directImport !== null) {
                return directImport;
            }
            else if (ts.isQualifiedName(id.parent) && id.parent.right === id) {
                return this.getImportOfNamespacedIdentifier(id, getQualifiedNameRoot(id.parent));
            }
            else if (ts.isPropertyAccessExpression(id.parent) && id.parent.name === id) {
                return this.getImportOfNamespacedIdentifier(id, getFarLeftIdentifier(id.parent));
            }
            else {
                return null;
            }
        };
        TypeScriptReflectionHost.prototype.getExportsOfModule = function (node) {
            var _this = this;
            // In TypeScript code, modules are only ts.SourceFiles. Throw if the node isn't a module.
            if (!ts.isSourceFile(node)) {
                throw new Error("getExportsOfModule() called on non-SourceFile in TS code");
            }
            // Reflect the module to a Symbol, and use getExportsOfModule() to get a list of exported
            // Symbols.
            var symbol = this.checker.getSymbolAtLocation(node);
            if (symbol === undefined) {
                return null;
            }
            var map = new Map();
            this.checker.getExportsOfModule(symbol).forEach(function (exportSymbol) {
                // Map each exported Symbol to a Declaration and add it to the map.
                var decl = _this.getDeclarationOfSymbol(exportSymbol, null);
                if (decl !== null) {
                    map.set(exportSymbol.name, decl);
                }
            });
            return map;
        };
        TypeScriptReflectionHost.prototype.isClass = function (node) {
            // For our purposes, classes are "named" ts.ClassDeclarations;
            // (`node.name` can be undefined in unnamed default exports: `default export class { ... }`).
            return util_1.isNamedClassDeclaration(node);
        };
        TypeScriptReflectionHost.prototype.hasBaseClass = function (clazz) {
            return this.getBaseClassExpression(clazz) !== null;
        };
        TypeScriptReflectionHost.prototype.getBaseClassExpression = function (clazz) {
            if (!(ts.isClassDeclaration(clazz) || ts.isClassExpression(clazz)) ||
                clazz.heritageClauses === undefined) {
                return null;
            }
            var extendsClause = clazz.heritageClauses.find(function (clause) { return clause.token === ts.SyntaxKind.ExtendsKeyword; });
            if (extendsClause === undefined) {
                return null;
            }
            var extendsType = extendsClause.types[0];
            if (extendsType === undefined) {
                return null;
            }
            return extendsType.expression;
        };
        TypeScriptReflectionHost.prototype.getDeclarationOfIdentifier = function (id) {
            // Resolve the identifier to a Symbol, and return the declaration of that.
            var symbol = this.checker.getSymbolAtLocation(id);
            if (symbol === undefined) {
                return null;
            }
            return this.getDeclarationOfSymbol(symbol, id);
        };
        TypeScriptReflectionHost.prototype.getDefinitionOfFunction = function (node) {
            if (!ts.isFunctionDeclaration(node) && !ts.isMethodDeclaration(node) &&
                !ts.isFunctionExpression(node)) {
                return null;
            }
            return {
                node: node,
                body: node.body !== undefined ? Array.from(node.body.statements) : null,
                parameters: node.parameters.map(function (param) {
                    var name = parameterName(param.name);
                    var initializer = param.initializer || null;
                    return { name: name, node: param, initializer: initializer };
                }),
            };
        };
        TypeScriptReflectionHost.prototype.getGenericArityOfClass = function (clazz) {
            if (!ts.isClassDeclaration(clazz)) {
                return null;
            }
            return clazz.typeParameters !== undefined ? clazz.typeParameters.length : 0;
        };
        TypeScriptReflectionHost.prototype.getVariableValue = function (declaration) {
            return declaration.initializer || null;
        };
        TypeScriptReflectionHost.prototype.getDtsDeclaration = function (_) {
            return null;
        };
        TypeScriptReflectionHost.prototype.getInternalNameOfClass = function (clazz) {
            return clazz.name;
        };
        TypeScriptReflectionHost.prototype.getAdjacentNameOfClass = function (clazz) {
            return clazz.name;
        };
        TypeScriptReflectionHost.prototype.getDirectImportOfIdentifier = function (id) {
            var symbol = this.checker.getSymbolAtLocation(id);
            if (symbol === undefined || symbol.declarations === undefined ||
                symbol.declarations.length !== 1) {
                return null;
            }
            var decl = symbol.declarations[0];
            var importDecl = getContainingImportDeclaration(decl);
            // Ignore declarations that are defined locally (not imported).
            if (importDecl === null) {
                return null;
            }
            // The module specifier is guaranteed to be a string literal, so this should always pass.
            if (!ts.isStringLiteral(importDecl.moduleSpecifier)) {
                // Not allowed to happen in TypeScript ASTs.
                return null;
            }
            return { from: importDecl.moduleSpecifier.text, name: getExportedName(decl, id) };
        };
        /**
         * Try to get the import info for this identifier as though it is a namespaced import.
         *
         * For example, if the identifier is the `Directive` part of a qualified type chain like:
         *
         * ```
         * core.Directive
         * ```
         *
         * then it might be that `core` is a namespace import such as:
         *
         * ```
         * import * as core from 'tslib';
         * ```
         *
         * @param id the TypeScript identifier to find the import info for.
         * @returns The import info if this is a namespaced import or `null`.
         */
        TypeScriptReflectionHost.prototype.getImportOfNamespacedIdentifier = function (id, namespaceIdentifier) {
            if (namespaceIdentifier === null) {
                return null;
            }
            var namespaceSymbol = this.checker.getSymbolAtLocation(namespaceIdentifier);
            if (!namespaceSymbol) {
                return null;
            }
            var declaration = namespaceSymbol.declarations.length === 1 ? namespaceSymbol.declarations[0] : null;
            if (!declaration) {
                return null;
            }
            var namespaceDeclaration = ts.isNamespaceImport(declaration) ? declaration : null;
            if (!namespaceDeclaration) {
                return null;
            }
            var importDeclaration = namespaceDeclaration.parent.parent;
            if (!ts.isStringLiteral(importDeclaration.moduleSpecifier)) {
                // Should not happen as this would be invalid TypesScript
                return null;
            }
            return {
                from: importDeclaration.moduleSpecifier.text,
                name: id.text,
            };
        };
        /**
         * Resolve a `ts.Symbol` to its declaration, keeping track of the `viaModule` along the way.
         */
        TypeScriptReflectionHost.prototype.getDeclarationOfSymbol = function (symbol, originalId) {
            // If the symbol points to a ShorthandPropertyAssignment, resolve it.
            var valueDeclaration = undefined;
            if (symbol.valueDeclaration !== undefined) {
                valueDeclaration = symbol.valueDeclaration;
            }
            else if (symbol.declarations !== undefined && symbol.declarations.length > 0) {
                valueDeclaration = symbol.declarations[0];
            }
            if (valueDeclaration !== undefined && ts.isShorthandPropertyAssignment(valueDeclaration)) {
                var shorthandSymbol = this.checker.getShorthandAssignmentValueSymbol(valueDeclaration);
                if (shorthandSymbol === undefined) {
                    return null;
                }
                return this.getDeclarationOfSymbol(shorthandSymbol, originalId);
            }
            else if (valueDeclaration !== undefined && ts.isExportSpecifier(valueDeclaration)) {
                var targetSymbol = this.checker.getExportSpecifierLocalTargetSymbol(valueDeclaration);
                if (targetSymbol === undefined) {
                    return null;
                }
                return this.getDeclarationOfSymbol(targetSymbol, originalId);
            }
            var importInfo = originalId && this.getImportOfIdentifier(originalId);
            var viaModule = importInfo !== null && importInfo.from !== null && !importInfo.from.startsWith('.') ?
                importInfo.from :
                null;
            // Now, resolve the Symbol to its declaration by following any and all aliases.
            while (symbol.flags & ts.SymbolFlags.Alias) {
                symbol = this.checker.getAliasedSymbol(symbol);
            }
            // Look at the resolved Symbol's declarations and pick one of them to return. Value declarations
            // are given precedence over type declarations.
            if (symbol.valueDeclaration !== undefined) {
                return {
                    node: symbol.valueDeclaration,
                    known: null,
                    viaModule: viaModule,
                    identity: null,
                    kind: 0 /* Concrete */,
                };
            }
            else if (symbol.declarations !== undefined && symbol.declarations.length > 0) {
                return {
                    node: symbol.declarations[0],
                    known: null,
                    viaModule: viaModule,
                    identity: null,
                    kind: 0 /* Concrete */,
                };
            }
            else {
                return null;
            }
        };
        TypeScriptReflectionHost.prototype._reflectDecorator = function (node) {
            // Attempt to resolve the decorator expression into a reference to a concrete Identifier. The
            // expression may contain a call to a function which returns the decorator function, in which
            // case we want to return the arguments.
            var decoratorExpr = node.expression;
            var args = null;
            // Check for call expressions.
            if (ts.isCallExpression(decoratorExpr)) {
                args = Array.from(decoratorExpr.arguments);
                decoratorExpr = decoratorExpr.expression;
            }
            // The final resolved decorator should be a `ts.Identifier` - if it's not, then something is
            // wrong and the decorator can't be resolved statically.
            if (!host_1.isDecoratorIdentifier(decoratorExpr)) {
                return null;
            }
            var decoratorIdentifier = ts.isIdentifier(decoratorExpr) ? decoratorExpr : decoratorExpr.name;
            var importDecl = this.getImportOfIdentifier(decoratorIdentifier);
            return {
                name: decoratorIdentifier.text,
                identifier: decoratorExpr,
                import: importDecl,
                node: node,
                args: args,
            };
        };
        TypeScriptReflectionHost.prototype._reflectMember = function (node) {
            var kind = null;
            var value = null;
            var name = null;
            var nameNode = null;
            if (ts.isPropertyDeclaration(node)) {
                kind = host_1.ClassMemberKind.Property;
                value = node.initializer || null;
            }
            else if (ts.isGetAccessorDeclaration(node)) {
                kind = host_1.ClassMemberKind.Getter;
            }
            else if (ts.isSetAccessorDeclaration(node)) {
                kind = host_1.ClassMemberKind.Setter;
            }
            else if (ts.isMethodDeclaration(node)) {
                kind = host_1.ClassMemberKind.Method;
            }
            else if (ts.isConstructorDeclaration(node)) {
                kind = host_1.ClassMemberKind.Constructor;
            }
            else {
                return null;
            }
            if (ts.isConstructorDeclaration(node)) {
                name = 'constructor';
            }
            else if (ts.isIdentifier(node.name)) {
                name = node.name.text;
                nameNode = node.name;
            }
            else if (ts.isStringLiteral(node.name)) {
                name = node.name.text;
                nameNode = node.name;
            }
            else {
                return null;
            }
            var decorators = this.getDecoratorsOfDeclaration(node);
            var isStatic = node.modifiers !== undefined &&
                node.modifiers.some(function (mod) { return mod.kind === ts.SyntaxKind.StaticKeyword; });
            return {
                node: node,
                implementation: node,
                kind: kind,
                type: node.type || null,
                name: name,
                nameNode: nameNode,
                decorators: decorators,
                value: value,
                isStatic: isStatic,
            };
        };
        return TypeScriptReflectionHost;
    }());
    exports.TypeScriptReflectionHost = TypeScriptReflectionHost;
    function reflectNameOfDeclaration(decl) {
        var id = reflectIdentifierOfDeclaration(decl);
        return id && id.text || null;
    }
    exports.reflectNameOfDeclaration = reflectNameOfDeclaration;
    function reflectIdentifierOfDeclaration(decl) {
        if (ts.isClassDeclaration(decl) || ts.isFunctionDeclaration(decl)) {
            return decl.name || null;
        }
        else if (ts.isVariableDeclaration(decl)) {
            if (ts.isIdentifier(decl.name)) {
                return decl.name;
            }
        }
        return null;
    }
    exports.reflectIdentifierOfDeclaration = reflectIdentifierOfDeclaration;
    function reflectTypeEntityToDeclaration(type, checker) {
        var realSymbol = checker.getSymbolAtLocation(type);
        if (realSymbol === undefined) {
            throw new Error("Cannot resolve type entity " + type.getText() + " to symbol");
        }
        while (realSymbol.flags & ts.SymbolFlags.Alias) {
            realSymbol = checker.getAliasedSymbol(realSymbol);
        }
        var node = null;
        if (realSymbol.valueDeclaration !== undefined) {
            node = realSymbol.valueDeclaration;
        }
        else if (realSymbol.declarations !== undefined && realSymbol.declarations.length === 1) {
            node = realSymbol.declarations[0];
        }
        else {
            throw new Error("Cannot resolve type entity symbol to declaration");
        }
        if (ts.isQualifiedName(type)) {
            if (!ts.isIdentifier(type.left)) {
                throw new Error("Cannot handle qualified name with non-identifier lhs");
            }
            var symbol = checker.getSymbolAtLocation(type.left);
            if (symbol === undefined || symbol.declarations === undefined ||
                symbol.declarations.length !== 1) {
                throw new Error("Cannot resolve qualified type entity lhs to symbol");
            }
            var decl = symbol.declarations[0];
            if (ts.isNamespaceImport(decl)) {
                var clause = decl.parent;
                var importDecl = clause.parent;
                if (!ts.isStringLiteral(importDecl.moduleSpecifier)) {
                    throw new Error("Module specifier is not a string");
                }
                return { node: node, from: importDecl.moduleSpecifier.text };
            }
            else {
                throw new Error("Unknown import type?");
            }
        }
        else {
            return { node: node, from: null };
        }
    }
    exports.reflectTypeEntityToDeclaration = reflectTypeEntityToDeclaration;
    function filterToMembersWithDecorator(members, name, module) {
        return members.filter(function (member) { return !member.isStatic; })
            .map(function (member) {
            if (member.decorators === null) {
                return null;
            }
            var decorators = member.decorators.filter(function (dec) {
                if (dec.import !== null) {
                    return dec.import.name === name && (module === undefined || dec.import.from === module);
                }
                else {
                    return dec.name === name && module === undefined;
                }
            });
            if (decorators.length === 0) {
                return null;
            }
            return { member: member, decorators: decorators };
        })
            .filter(function (value) { return value !== null; });
    }
    exports.filterToMembersWithDecorator = filterToMembersWithDecorator;
    function findMember(members, name, isStatic) {
        if (isStatic === void 0) { isStatic = false; }
        return members.find(function (member) { return member.isStatic === isStatic && member.name === name; }) || null;
    }
    exports.findMember = findMember;
    function reflectObjectLiteral(node) {
        var map = new Map();
        node.properties.forEach(function (prop) {
            if (ts.isPropertyAssignment(prop)) {
                var name_1 = propertyNameToString(prop.name);
                if (name_1 === null) {
                    return;
                }
                map.set(name_1, prop.initializer);
            }
            else if (ts.isShorthandPropertyAssignment(prop)) {
                map.set(prop.name.text, prop.name);
            }
            else {
                return;
            }
        });
        return map;
    }
    exports.reflectObjectLiteral = reflectObjectLiteral;
    function castDeclarationToClassOrDie(declaration) {
        if (!ts.isClassDeclaration(declaration)) {
            throw new Error("Reflecting on a " + ts.SyntaxKind[declaration.kind] + " instead of a ClassDeclaration.");
        }
        return declaration;
    }
    function parameterName(name) {
        if (ts.isIdentifier(name)) {
            return name.text;
        }
        else {
            return null;
        }
    }
    function propertyNameToString(node) {
        if (ts.isIdentifier(node) || ts.isStringLiteral(node) || ts.isNumericLiteral(node)) {
            return node.text;
        }
        else {
            return null;
        }
    }
    /**
     * Compute the left most identifier in a qualified type chain. E.g. the `a` of `a.b.c.SomeType`.
     * @param qualifiedName The starting property access expression from which we want to compute
     * the left most identifier.
     * @returns the left most identifier in the chain or `null` if it is not an identifier.
     */
    function getQualifiedNameRoot(qualifiedName) {
        while (ts.isQualifiedName(qualifiedName.left)) {
            qualifiedName = qualifiedName.left;
        }
        return ts.isIdentifier(qualifiedName.left) ? qualifiedName.left : null;
    }
    /**
     * Compute the left most identifier in a property access chain. E.g. the `a` of `a.b.c.d`.
     * @param propertyAccess The starting property access expression from which we want to compute
     * the left most identifier.
     * @returns the left most identifier in the chain or `null` if it is not an identifier.
     */
    function getFarLeftIdentifier(propertyAccess) {
        while (ts.isPropertyAccessExpression(propertyAccess.expression)) {
            propertyAccess = propertyAccess.expression;
        }
        return ts.isIdentifier(propertyAccess.expression) ? propertyAccess.expression : null;
    }
    /**
     * Return the ImportDeclaration for the given `node` if it is either an `ImportSpecifier` or a
     * `NamespaceImport`. If not return `null`.
     */
    function getContainingImportDeclaration(node) {
        return ts.isImportSpecifier(node) ? node.parent.parent.parent :
            ts.isNamespaceImport(node) ? node.parent.parent : null;
    }
    /**
     * Compute the name by which the `decl` was exported, not imported.
     * If no such declaration can be found (e.g. it is a namespace import)
     * then fallback to the `originalId`.
     */
    function getExportedName(decl, originalId) {
        return ts.isImportSpecifier(decl) ?
            (decl.propertyName !== undefined ? decl.propertyName : decl.name).text :
            originalId.text;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZXNjcmlwdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9zcmMvbmd0c2MvcmVmbGVjdGlvbi9zcmMvdHlwZXNjcmlwdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7SUFFSCwrQkFBaUM7SUFFakMsNEVBQWtOO0lBQ2xOLDhGQUE0QztJQUM1Qyw0RUFBK0M7SUFFL0M7O09BRUc7SUFFSDtRQUNFLGtDQUFzQixPQUF1QjtZQUF2QixZQUFPLEdBQVAsT0FBTyxDQUFnQjtRQUFHLENBQUM7UUFFakQsNkRBQTBCLEdBQTFCLFVBQTJCLFdBQTRCO1lBQXZELGlCQU1DO1lBTEMsSUFBSSxXQUFXLENBQUMsVUFBVSxLQUFLLFNBQVMsSUFBSSxXQUFXLENBQUMsVUFBVSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7Z0JBQy9FLE9BQU8sSUFBSSxDQUFDO2FBQ2I7WUFDRCxPQUFPLFdBQVcsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLFVBQUEsU0FBUyxJQUFJLE9BQUEsS0FBSSxDQUFDLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxFQUFqQyxDQUFpQyxDQUFDO2lCQUM1RSxNQUFNLENBQUMsVUFBQyxHQUFHLElBQXVCLE9BQUEsR0FBRyxLQUFLLElBQUksRUFBWixDQUFZLENBQUMsQ0FBQztRQUN2RCxDQUFDO1FBRUQsb0RBQWlCLEdBQWpCLFVBQWtCLEtBQXVCO1lBQXpDLGlCQUlDO1lBSEMsSUFBTSxPQUFPLEdBQUcsMkJBQTJCLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDbkQsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFBLE1BQU0sSUFBSSxPQUFBLEtBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLEVBQTNCLENBQTJCLENBQUM7aUJBQzVELE1BQU0sQ0FBQyxVQUFDLE1BQU0sSUFBNEIs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QyxDQUFDO1lBQy9CLENBQUMsSUFBSSxDQUFDLFlBQVksS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN4RSxVQUFVLENBQUMsSUFBSSxDQUFDO0lBQ3RCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5cbmltcG9ydCB7Q2xhc3NEZWNsYXJhdGlvbiwgQ2xhc3NNZW1iZXIsIENsYXNzTWVtYmVyS2luZCwgQ3RvclBhcmFtZXRlciwgRGVjbGFyYXRpb24sIERlY2xhcmF0aW9uS2luZCwgRGVjbGFyYXRpb25Ob2RlLCBEZWNvcmF0b3IsIEZ1bmN0aW9uRGVmaW5pdGlvbiwgSW1wb3J0LCBpc0RlY29yYXRvcklkZW50aWZpZXIsIFJlZmxlY3Rpb25Ib3N0fSBmcm9tICcuL2hvc3QnO1xuaW1wb3J0IHt0eXBlVG9WYWx1ZX0gZnJvbSAnLi90eXBlX3RvX3ZhbHVlJztcbmltcG9ydCB7aXNOYW1lZENsYXNzRGVjbGFyYXRpb259IGZyb20gJy4vdXRpbCc7XG5cbi8qKlxuICogcmVmbGVjdG9yLnRzIGltcGxlbWVudHMgc3RhdGljIHJlZmxlY3Rpb24gb2YgZGVjbGFyYXRpb25zIHVzaW5nIHRoZSBUeXBlU2NyaXB0IGB0cy5UeXBlQ2hlY2tlcmAuXG4gKi9cblxuZXhwb3J0IGNsYXNzIFR5cGVTY3JpcHRSZWZsZWN0aW9uSG9zdCBpbXBsZW1lbnRzIFJlZmxlY3Rpb25Ib3N0IHtcbiAgY29uc3RydWN0b3IocHJvdGVjdGVkIGNoZWNrZXI6IHRzLlR5cGVDaGVja2VyKSB7fVxuXG4gIGdldERlY29yYXRvcnNPZkRlY2xhcmF0aW9uKGRlY2xhcmF0aW9uOiBEZWNsYXJhdGlvbk5vZGUpOiBEZWNvcmF0b3JbXXxudWxsIHtcbiAgICBpZiAoZGVjbGFyYXRpb24uZGVjb3JhdG9ycyA9PT0gdW5kZWZpbmVkIHx8IGRlY2xhcmF0aW9uLmRlY29yYXRvcnMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIGRlY2xhcmF0aW9uLmRlY29yYXRvcnMubWFwKGRlY29yYXRvciA9PiB0aGlzLl9yZWZsZWN0RGVjb3JhdG9yKGRlY29yYXRvcikpXG4gICAgICAgIC5maWx0ZXIoKGRlYyk6IGRlYyBpcyBEZWNvcmF0b3IgPT4gZGVjICE9PSBudWxsKTtcbiAgfVxuXG4gIGdldE1lbWJlcnNPZkNsYXNzKGNsYXp6OiBDbGFzc0RlY2xhcmF0aW9uKTogQ2xhc3NNZW1iZXJbXSB7XG4gICAgY29uc3QgdHNDbGF6eiA9IGNhc3REZWNsYXJhdGlvblRvQ2xhc3NPckRpZShjbGF6eik7XG4gICAgcmV0dXJuIHRzQ2xhenoubWVtYmVycy5tYXAobWVtYmVyID0+IHRoaXMuX3JlZmxlY3RNZW1iZXIobWVtYmVyKSlcbiAgICAgICAgLmZpbHRlcigobWVtYmVyKTogbWVtYmVyIGlzIENsYXNzTWVtYmVyID0+IG1lbWJlciAhPT0gbnVsbCk7XG4gIH1cblxuICBnZXRDb25zdHJ1Y3RvclBhcmFtZXRlcnMoY2xheno6IENsYXNzRGVjbGFyYXRpb24pOiBDdG9yUGFyYW1ldGVyW118bnVsbCB7XG4gICAgY29uc3QgdHNDbGF6eiA9IGNhc3REZWNsYXJhdGlvblRvQ2xhc3NPckRpZShjbGF6eik7XG5cbiAgICAvLyBGaXJzdCwgZmluZCB0aGUgY29uc3RydWN0b3Igd2l0aCBhIGBib2R5YC4gVGhlIGNvbnN0cnVjdG9ycyB3aXRob3V0IGEgYGJvZHlgIGFyZSBvdmVybG9hZHNcbiAgICAvLyB3aGVyZWFzIHdlIHdhbnQgdGhlIGltcGxlbWVudGF0aW9uIHNpbmNlIGl0J3MgdGhlIG9uZSB0aGF0J2xsIGJlIGV4ZWN1dGVkIGFuZCB3aGljaCBjYW5cbiAgICAvLyBoYXZlIGRlY29yYXRvcnMuXG4gICAgY29uc3QgY3RvciA9IHRzQ2xhenoubWVtYmVycy5maW5kKFxuICAgICAgICAobWVtYmVyKTogbWVtYmVyIGlzIHRzLkNvbnN0cnVjdG9yRGVjbGFyYXRpb24gPT5cbiAgICAgICAgICAgIHRzLmlzQ29uc3RydWN0b3JEZWNsYXJhdGlvbihtZW1iZXIpICYmIG1lbWJlci5ib2R5ICE9PSB1bmRlZmluZWQpO1xuICAgIGlmIChjdG9yID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHJldHVybiBjdG9yLnBhcmFtZXRlcnMubWFwKG5vZGUgPT4ge1xuICAgICAgLy8gVGhlIG5hbWUgb2YgdGhlIHBhcmFtZXRlciBpcyBlYXN5LlxuICAgICAgY29uc3QgbmFtZSA9IHBhcmFtZXRlck5hbWUobm9kZS5uYW1lKTtcblxuICAgICAgY29uc3QgZGVjb3JhdG9ycyA9IHRoaXMuZ2V0RGVjb3JhdG9yc09mRGVjbGFyYXRpb24obm9kZSk7XG5cbiAgICAgIC8vIEl0IG1heSBvciBtYXkgbm90IGJlIHBvc3NpYmxlIHRvIHdyaXRlIGFuIGV4cHJlc3Npb24gdGhhdCByZWZlcnMgdG8gdGhlIHZhbHVlIHNpZGUgb2YgdGhlXG4gICAgICAvLyB0eXBlIG5hbWVkIGZvciB0aGUgcGFyYW1ldGVyLlxuXG4gICAgICBsZXQgb3JpZ2luYWxUeXBlTm9kZSA9IG5vZGUudHlwZSB8fCBudWxsO1xuICAgICAgbGV0IHR5cGVOb2RlID0gb3JpZ2luYWxUeXBlTm9kZTtcblxuICAgICAgLy8gQ2hlY2sgaWYgd2UgYXJlIGRlYWxpbmcgd2l0aCBhIHNpbXBsZSBudWxsYWJsZSB1bmlvbiB0eXBlIGUuZy4gYGZvbzogRm9vfG51bGxgXG4gICAgICAvLyBhbmQgZXh0cmFjdCB0aGUgdHlwZS4gTW9yZSBjb21wbGV4IHVuaW9uIHR5cGVzIGUuZy4gYGZvbzogRm9vfEJhcmAgYXJlIG5vdCBzdXBwb3J0ZWQuXG4gICAgICAvLyBXZSBhbHNvIGRvbid0IG5lZWQgdG8gc3VwcG9ydCBgZm9vOiBGb298dW5kZWZpbmVkYCBiZWNhdXNlIEFuZ3VsYXIncyBESSBpbmplY3RzIGBudWxsYCBmb3JcbiAgICAgIC8vIG9wdGlvbmFsIHRva2VzIHRoYXQgZG9uJ3QgaGF2ZSBwcm92aWRlcnMuXG4gICAgICBpZiAodHlwZU5vZGUgJiYgdHMuaXNVbmlvblR5cGVOb2RlKHR5cGVOb2RlKSkge1xuICAgICAgICBsZXQgY2hpbGRUeXBlTm9kZXMgPSB0eXBlTm9kZS50eXBlcy5maWx0ZXIoXG4gICAgICAgICAgICAvLyBUT0RPKGFsYW4tYWdpdXM0KTogcmVtb3ZlIGBjaGlsZFR5cGVOb2RlLmtpbmQgIT09IHRzLlN5bnRheEtpbmQuTnVsbEtleXdvcmRgIHdoZW5cbiAgICAgICAgICAgIC8vIFRTIDMuOSBzdXBwb3J0IGlzIGRyb3BwZWQuIEluIFRTIDQuMCBOdWxsS2V5d29yZCBpcyBhIGNoaWxkIG9mIExpdGVyYWxUeXBlLlxuICAgICAgICAgICAgY2hpbGRUeXBlTm9kZSA9PiBjaGlsZFR5cGVOb2RlLmtpbmQgIT09IHRzLlN5bnRheEtpbmQuTnVsbEtleXdvcmQgJiZcbiAgICAgICAgICAgICAgICAhKHRzLmlzTGl0ZXJhbFR5cGVOb2RlKGNoaWxkVHlwZU5vZGUpICYmXG4gICAgICAgICAgICAgICAgICBjaGlsZFR5cGVOb2RlLmxpdGVyYWwua2luZCA9PT0gdHMuU3ludGF4S2luZC5OdWxsS2V5d29yZCkpO1xuXG4gICAgICAgIGlmIChjaGlsZFR5cGVOb2Rlcy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICB0eXBlTm9kZSA9IGNoaWxkVHlwZU5vZGVzWzBdO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHR5cGVWYWx1ZVJlZmVyZW5jZSA9IHR5cGVUb1ZhbHVlKHR5cGVOb2RlLCB0aGlzLmNoZWNrZXIpO1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBuYW1lLFxuICAgICAgICBuYW1lTm9kZTogbm9kZS5uYW1lLFxuICAgICAgICB0eXBlVmFsdWVSZWZlcmVuY2UsXG4gICAgICAgIHR5cGVOb2RlOiBvcmlnaW5hbFR5cGVOb2RlLFxuICAgICAgICBkZWNvcmF0b3JzLFxuICAgICAgfTtcbiAgICB9KTtcbiAgfVxuXG4gIGdldEltcG9ydE9mSWRlbnRpZmllcihpZDogdHMuSWRlbnRpZmllcik6IEltcG9ydHxudWxsIHtcbiAgICBjb25zdCBkaXJlY3RJbXBvcnQgPSB0aGlzLmdldERpcmVjdEltcG9ydE9mSWRlbnRpZmllcihpZCk7XG4gICAgaWYgKGRpcmVjdEltcG9ydCAhPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIGRpcmVjdEltcG9ydDtcbiAgICB9IGVsc2UgaWYgKHRzLmlzUXVhbGlmaWVkTmFtZShpZC5wYXJlbnQpICYmIGlkLnBhcmVudC5yaWdodCA9PT0gaWQpIHtcbiAgICAgIHJldHVybiB0aGlzLmdldEltcG9ydE9mTmFtZXNwYWNlZElkZW50aWZpZXIoaWQsIGdldFF1YWxpZmllZE5hbWVSb290KGlkLnBhcmVudCkpO1xuICAgIH0gZWxzZSBpZiAodHMuaXNQcm9wZXJ0eUFjY2Vzc0V4cHJlc3Npb24oaWQucGFyZW50KSAmJiBpZC5wYXJlbnQubmFtZSA9PT0gaWQpIHtcbiAgICAgIHJldHVybiB0aGlzLmdldEltcG9ydE9mTmFtZXNwYWNlZElkZW50aWZpZXIoaWQsIGdldEZhckxlZnRJZGVudGlmaWVyKGlkLnBhcmVudCkpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cblxuICBnZXRFeHBvcnRzT2ZNb2R1bGUobm9kZTogdHMuTm9kZSk6IE1hcDxzdHJpbmcsIERlY2xhcmF0aW9uPnxudWxsIHtcbiAgICAvLyBJbiBUeXBlU2NyaXB0IGNvZGUsIG1vZHVsZXMgYXJlIG9ubHkgdHMuU291cmNlRmlsZXMuIFRocm93IGlmIHRoZSBub2RlIGlzbid0IGEgbW9kdWxlLlxuICAgIGlmICghdHMuaXNTb3VyY2VGaWxlKG5vZGUpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYGdldEV4cG9ydHNPZk1vZHVsZSgpIGNhbGxlZCBvbiBub24tU291cmNlRmlsZSBpbiBUUyBjb2RlYCk7XG4gICAgfVxuXG4gICAgLy8gUmVmbGVjdCB0aGUgbW9kdWxlIHRvIGEgU3ltYm9sLCBhbmQgdXNlIGdldEV4cG9ydHNPZk1vZHVsZSgpIHRvIGdldCBhIGxpc3Qgb2YgZXhwb3J0ZWRcbiAgICAvLyBTeW1ib2xzLlxuICAgIGNvbnN0IHN5bWJvbCA9IHRoaXMuY2hlY2tlci5nZXRTeW1ib2xBdExvY2F0aW9uKG5vZGUpO1xuICAgIGlmIChzeW1ib2wgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3QgbWFwID0gbmV3IE1hcDxzdHJpbmcsIERlY2xhcmF0aW9uPigpO1xuICAgIHRoaXMuY2hlY2tlci5nZXRFeHBvcnRzT2ZNb2R1bGUoc3ltYm9sKS5mb3JFYWNoKGV4cG9ydFN5bWJvbCA9PiB7XG4gICAgICAvLyBNYXAgZWFjaCBleHBvcnRlZCBTeW1ib2wgdG8gYSBEZWNsYXJhdGlvbiBhbmQgYWRkIGl0IHRvIHRoZSBtYXAuXG4gICAgICBjb25zdCBkZWNsID0gdGhpcy5nZXREZWNsYXJhdGlvbk9mU3ltYm9sKGV4cG9ydFN5bWJvbCwgbnVsbCk7XG4gICAgICBpZiAoZGVjbCAhPT0gbnVsbCkge1xuICAgICAgICBtYXAuc2V0KGV4cG9ydFN5bWJvbC5uYW1lLCBkZWNsKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gbWFwO1xuICB9XG5cbiAgaXNDbGFzcyhub2RlOiB0cy5Ob2RlKTogbm9kZSBpcyBDbGFzc0RlY2xhcmF0aW9uIHtcbiAgICAvLyBGb3Igb3VyIHB1cnBvc2VzLCBjbGFzc2VzIGFyZSBcIm5hbWVkXCIgdHMuQ2xhc3NEZWNsYXJhdGlvbnM7XG4gICAgLy8gKGBub2RlLm5hbWVgIGNhbiBiZSB1bmRlZmluZWQgaW4gdW5uYW1lZCBkZWZhdWx0IGV4cG9ydHM6IGBkZWZhdWx0IGV4cG9ydCBjbGFzcyB7IC4uLiB9YCkuXG4gICAgcmV0dXJuIGlzTmFtZWRDbGFzc0RlY2xhcmF0aW9uKG5vZGUpO1xuICB9XG5cbiAgaGFzQmFzZUNsYXNzKGNsYXp6OiBDbGFzc0RlY2xhcmF0aW9uKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0QmFzZUNsYXNzRXhwcmVzc2lvbihjbGF6eikgIT09IG51bGw7XG4gIH1cblxuICBnZXRCYXNlQ2xhc3NFeHByZXNzaW9uKGNsYXp6OiBDbGFzc0RlY2xhcmF0aW9uKTogdHMuRXhwcmVzc2lvbnxudWxsIHtcbiAgICBpZiAoISh0cy5pc0NsYXNzRGVjbGFyYXRpb24oY2xhenopIHx8IHRzLmlzQ2xhc3NFeHByZXNzaW9uKGNsYXp6KSkgfHxcbiAgICAgICAgY2xhenouaGVyaXRhZ2VDbGF1c2VzID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCBleHRlbmRzQ2xhdXNlID1cbiAgICAgICAgY2xhenouaGVyaXRhZ2VDbGF1c2VzLmZpbmQoY2xhdXNlID0+IGNsYXVzZS50b2tlbiA9PT0gdHMuU3ludGF4S2luZC5FeHRlbmRzS2V5d29yZCk7XG4gICAgaWYgKGV4dGVuZHNDbGF1c2UgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IGV4dGVuZHNUeXBlID0gZXh0ZW5kc0NsYXVzZS50eXBlc1swXTtcbiAgICBpZiAoZXh0ZW5kc1R5cGUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiBleHRlbmRzVHlwZS5leHByZXNzaW9uO1xuICB9XG5cbiAgZ2V0RGVjbGFyYXRpb25PZklkZW50aWZpZXIoaWQ6IHRzLklkZW50aWZpZXIpOiBEZWNsYXJhdGlvbnxudWxsIHtcbiAgICAvLyBSZXNvbHZlIHRoZSBpZGVudGlmaWVyIHRvIGEgU3ltYm9sLCBhbmQgcmV0dXJuIHRoZSBkZWNsYXJhdGlvbiBvZiB0aGF0LlxuICAgIGxldCBzeW1ib2w6IHRzLlN5bWJvbHx1bmRlZmluZWQgPSB0aGlzLmNoZWNrZXIuZ2V0U3ltYm9sQXRMb2NhdGlvbihpZCk7XG4gICAgaWYgKHN5bWJvbCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZ2V0RGVjbGFyYXRpb25PZlN5bWJvbChzeW1ib2wsIGlkKTtcbiAgfVxuXG4gIGdldERlZmluaXRpb25PZkZ1bmN0aW9uKG5vZGU6IHRzLk5vZGUpOiBGdW5jdGlvbkRlZmluaXRpb258bnVsbCB7XG4gICAgaWYgKCF0cy5pc0Z1bmN0aW9uRGVjbGFyYXRpb24obm9kZSkgJiYgIXRzLmlzTWV0aG9kRGVjbGFyYXRpb24obm9kZSkgJiZcbiAgICAgICAgIXRzLmlzRnVuY3Rpb25FeHByZXNzaW9uKG5vZGUpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgIG5vZGUsXG4gICAgICBib2R5OiBub2RlLmJvZHkgIT09IHVuZGVmaW5lZCA/IEFycmF5LmZyb20obm9kZS5ib2R5LnN0YXRlbWVudHMpIDogbnVsbCxcbiAgICAgIHBhcmFtZXRlcnM6IG5vZGUucGFyYW1ldGVycy5tYXAocGFyYW0gPT4ge1xuICAgICAgICBjb25zdCBuYW1lID0gcGFyYW1ldGVyTmFtZShwYXJhbS5uYW1lKTtcbiAgICAgICAgY29uc3QgaW5pdGlhbGl6ZXIgPSBwYXJhbS5pbml0aWFsaXplciB8fCBudWxsO1xuICAgICAgICByZXR1cm4ge25hbWUsIG5vZGU6IHBhcmFtLCBpbml0aWFsaXplcn07XG4gICAgICB9KSxcbiAgICB9O1xuICB9XG5cbiAgZ2V0R2VuZXJpY0FyaXR5T2ZDbGFzcyhjbGF6ejogQ2xhc3NEZWNsYXJhdGlvbik6IG51bWJlcnxudWxsIHtcbiAgICBpZiAoIXRzLmlzQ2xhc3NEZWNsYXJhdGlvbihjbGF6eikpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gY2xhenoudHlwZVBhcmFtZXRlcnMgIT09IHVuZGVmaW5lZCA/IGNsYXp6LnR5cGVQYXJhbWV0ZXJzLmxlbmd0aCA6IDA7XG4gIH1cblxuICBnZXRWYXJpYWJsZVZhbHVlKGRlY2xhcmF0aW9uOiB0cy5WYXJpYWJsZURlY2xhcmF0aW9uKTogdHMuRXhwcmVzc2lvbnxudWxsIHtcbiAgICByZXR1cm4gZGVjbGFyYXRpb24uaW5pdGlhbGl6ZXIgfHwgbnVsbDtcbiAgfVxuXG4gIGdldER0c0RlY2xhcmF0aW9uKF86IENsYXNzRGVjbGFyYXRpb24pOiB0cy5EZWNsYXJhdGlvbnxudWxsIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGdldEludGVybmFsTmFtZU9mQ2xhc3MoY2xheno6IENsYXNzRGVjbGFyYXRpb24pOiB0cy5JZGVudGlmaWVyIHtcbiAgICByZXR1cm4gY2xhenoubmFtZTtcbiAgfVxuXG4gIGdldEFkamFjZW50TmFtZU9mQ2xhc3MoY2xheno6IENsYXNzRGVjbGFyYXRpb24pOiB0cy5JZGVudGlmaWVyIHtcbiAgICByZXR1cm4gY2xhenoubmFtZTtcbiAgfVxuXG4gIHByb3RlY3RlZCBnZXREaXJlY3RJbXBvcnRPZklkZW50aWZpZXIoaWQ6IHRzLklkZW50aWZpZXIpOiBJbXBvcnR8bnVsbCB7XG4gICAgY29uc3Qgc3ltYm9sID0gdGhpcy5jaGVja2VyLmdldFN5bWJvbEF0TG9jYXRpb24oaWQpO1xuXG4gICAgaWYgKHN5bWJvbCA9PT0gdW5kZWZpbmVkIHx8IHN5bWJvbC5kZWNsYXJhdGlvbnMgPT09IHVuZGVmaW5lZCB8fFxuICAgICAgICBzeW1ib2wuZGVjbGFyYXRpb25zLmxlbmd0aCAhPT0gMSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3QgZGVjbCA9IHN5bWJvbC5kZWNsYXJhdGlvbnNbMF07XG4gICAgY29uc3QgaW1wb3J0RGVjbCA9IGdldENvbnRhaW5pbmdJbXBvcnREZWNsYXJhdGlvbihkZWNsKTtcblxuICAgIC8vIElnbm9yZSBkZWNsYXJhdGlvbnMgdGhhdCBhcmUgZGVmaW5lZCBsb2NhbGx5IChub3QgaW1wb3J0ZWQpLlxuICAgIGlmIChpbXBvcnREZWNsID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBUaGUgbW9kdWxlIHNwZWNpZmllciBpcyBndWFyYW50ZWVkIHRvIGJlIGEgc3RyaW5nIGxpdGVyYWwsIHNvIHRoaXMgc2hvdWxkIGFsd2F5cyBwYXNzLlxuICAgIGlmICghdHMuaXNTdHJpbmdMaXRlcmFsKGltcG9ydERlY2wubW9kdWxlU3BlY2lmaWVyKSkge1xuICAgICAgLy8gTm90IGFsbG93ZWQgdG8gaGFwcGVuIGluIFR5cGVTY3JpcHQgQVNUcy5cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHJldHVybiB7ZnJvbTogaW1wb3J0RGVjbC5tb2R1bGVTcGVjaWZpZXIudGV4dCwgbmFtZTogZ2V0RXhwb3J0ZWROYW1lKGRlY2wsIGlkKX07XG4gIH1cblxuICAvKipcbiAgICogVHJ5IHRvIGdldCB0aGUgaW1wb3J0IGluZm8gZm9yIHRoaXMgaWRlbnRpZmllciBhcyB0aG91Z2ggaXQgaXMgYSBuYW1lc3BhY2VkIGltcG9ydC5cbiAgICpcbiAgICogRm9yIGV4YW1wbGUsIGlmIHRoZSBpZGVudGlmaWVyIGlzIHRoZSBgRGlyZWN0aXZlYCBwYXJ0IG9mIGEgcXVhbGlmaWVkIHR5cGUgY2hhaW4gbGlrZTpcbiAgICpcbiAgICogYGBgXG4gICAqIGNvcmUuRGlyZWN0aXZlXG4gICAqIGBgYFxuICAgKlxuICAgKiB0aGVuIGl0IG1pZ2h0IGJlIHRoYXQgYGNvcmVgIGlzIGEgbmFtZXNwYWNlIGltcG9ydCBzdWNoIGFzOlxuICAgKlxuICAgKiBgYGBcbiAgICogaW1wb3J0ICogYXMgY29yZSBmcm9tICd0c2xpYic7XG4gICAqIGBgYFxuICAgKlxuICAgKiBAcGFyYW0gaWQgdGhlIFR5cGVTY3JpcHQgaWRlbnRpZmllciB0byBmaW5kIHRoZSBpbXBvcnQgaW5mbyBmb3IuXG4gICAqIEByZXR1cm5zIFRoZSBpbXBvcnQgaW5mbyBpZiB0aGlzIGlzIGEgbmFtZXNwYWNlZCBpbXBvcnQgb3IgYG51bGxgLlxuICAgKi9cbiAgcHJvdGVjdGVkIGdldEltcG9ydE9mTmFtZXNwYWNlZElkZW50aWZpZXIoXG4gICAgICBpZDogdHMuSWRlbnRpZmllciwgbmFtZXNwYWNlSWRlbnRpZmllcjogdHMuSWRlbnRpZmllcnxudWxsKTogSW1wb3J0fG51bGwge1xuICAgIGlmIChuYW1lc3BhY2VJZGVudGlmaWVyID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3QgbmFtZXNwYWNlU3ltYm9sID0gdGhpcy5jaGVja2VyLmdldFN5bWJvbEF0TG9jYXRpb24obmFtZXNwYWNlSWRlbnRpZmllcik7XG4gICAgaWYgKCFuYW1lc3BhY2VTeW1ib2wpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCBkZWNsYXJhdGlvbiA9XG4gICAgICAgIG5hbWVzcGFjZVN5bWJvbC5kZWNsYXJhdGlvbnMubGVuZ3RoID09PSAxID8gbmFtZXNwYWNlU3ltYm9sLmRlY2xhcmF0aW9uc1swXSA6IG51bGw7XG4gICAgaWYgKCFkZWNsYXJhdGlvbikge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IG5hbWVzcGFjZURlY2xhcmF0aW9uID0gdHMuaXNOYW1lc3BhY2VJbXBvcnQoZGVjbGFyYXRpb24pID8gZGVjbGFyYXRpb24gOiBudWxsO1xuICAgIGlmICghbmFtZXNwYWNlRGVjbGFyYXRpb24pIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IGltcG9ydERlY2xhcmF0aW9uID0gbmFtZXNwYWNlRGVjbGFyYXRpb24ucGFyZW50LnBhcmVudDtcbiAgICBpZiAoIXRzLmlzU3RyaW5nTGl0ZXJhbChpbXBvcnREZWNsYXJhdGlvbi5tb2R1bGVTcGVjaWZpZXIpKSB7XG4gICAgICAvLyBTaG91bGQgbm90IGhhcHBlbiBhcyB0aGlzIHdvdWxkIGJlIGludmFsaWQgVHlwZXNTY3JpcHRcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBmcm9tOiBpbXBvcnREZWNsYXJhdGlvbi5tb2R1bGVTcGVjaWZpZXIudGV4dCxcbiAgICAgIG5hbWU6IGlkLnRleHQsXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXNvbHZlIGEgYHRzLlN5bWJvbGAgdG8gaXRzIGRlY2xhcmF0aW9uLCBrZWVwaW5nIHRyYWNrIG9mIHRoZSBgdmlhTW9kdWxlYCBhbG9uZyB0aGUgd2F5LlxuICAgKi9cbiAgcHJvdGVjdGVkIGdldERlY2xhcmF0aW9uT2ZTeW1ib2woc3ltYm9sOiB0cy5TeW1ib2wsIG9yaWdpbmFsSWQ6IHRzLklkZW50aWZpZXJ8bnVsbCk6IERlY2xhcmF0aW9uXG4gICAgICB8bnVsbCB7XG4gICAgLy8gSWYgdGhlIHN5bWJvbCBwb2ludHMgdG8gYSBTaG9ydGhhbmRQcm9wZXJ0eUFzc2lnbm1lbnQsIHJlc29sdmUgaXQuXG4gICAgbGV0IHZhbHVlRGVjbGFyYXRpb246IHRzLkRlY2xhcmF0aW9ufHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBpZiAoc3ltYm9sLnZhbHVlRGVjbGFyYXRpb24gIT09IHVuZGVmaW5lZCkge1xuICAgICAgdmFsdWVEZWNsYXJhdGlvbiA9IHN5bWJvbC52YWx1ZURlY2xhcmF0aW9uO1xuICAgIH0gZWxzZSBpZiAoc3ltYm9sLmRlY2xhcmF0aW9ucyAhPT0gdW5kZWZpbmVkICYmIHN5bWJvbC5kZWNsYXJhdGlvbnMubGVuZ3RoID4gMCkge1xuICAgICAgdmFsdWVEZWNsYXJhdGlvbiA9IHN5bWJvbC5kZWNsYXJhdGlvbnNbMF07XG4gICAgfVxuICAgIGlmICh2YWx1ZURlY2xhcmF0aW9uICE9PSB1bmRlZmluZWQgJiYgdHMuaXNTaG9ydGhhbmRQcm9wZXJ0eUFzc2lnbm1lbnQodmFsdWVEZWNsYXJhdGlvbikpIHtcbiAgICAgIGNvbnN0IHNob3J0aGFuZFN5bWJvbCA9IHRoaXMuY2hlY2tlci5nZXRTaG9ydGhhbmRBc3NpZ25tZW50VmFsdWVTeW1ib2wodmFsdWVEZWNsYXJhdGlvbik7XG4gICAgICBpZiAoc2hvcnRoYW5kU3ltYm9sID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5nZXREZWNsYXJhdGlvbk9mU3ltYm9sKHNob3J0aGFuZFN5bWJvbCwgb3JpZ2luYWxJZCk7XG4gICAgfSBlbHNlIGlmICh2YWx1ZURlY2xhcmF0aW9uICE9PSB1bmRlZmluZWQgJiYgdHMuaXNFeHBvcnRTcGVjaWZpZXIodmFsdWVEZWNsYXJhdGlvbikpIHtcbiAgICAgIGNvbnN0IHRhcmdldFN5bWJvbCA9IHRoaXMuY2hlY2tlci5nZXRFeHBvcnRTcGVjaWZpZXJMb2NhbFRhcmdldFN5bWJvbCh2YWx1ZURlY2xhcmF0aW9uKTtcbiAgICAgIGlmICh0YXJnZXRTeW1ib2wgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLmdldERlY2xhcmF0aW9uT2ZTeW1ib2wodGFyZ2V0U3ltYm9sLCBvcmlnaW5hbElkKTtcbiAgICB9XG5cbiAgICBjb25zdCBpbXBvcnRJbmZvID0gb3JpZ2luYWxJZCAmJiB0aGlzLmdldEltcG9ydE9mSWRlbnRpZmllcihvcmlnaW5hbElkKTtcbiAgICBjb25zdCB2aWFNb2R1bGUgPVxuICAgICAgICBpbXBvcnRJbmZvICE9PSBudWxsICYmIGltcG9ydEluZm8uZnJvbSAhPT0gbnVsbCAmJiAhaW1wb3J0SW5mby5mcm9tLnN0YXJ0c1dpdGgoJy4nKSA/XG4gICAgICAgIGltcG9ydEluZm8uZnJvbSA6XG4gICAgICAgIG51bGw7XG5cbiAgICAvLyBOb3csIHJlc29sdmUgdGhlIFN5bWJvbCB0byBpdHMgZGVjbGFyYXRpb24gYnkgZm9sbG93aW5nIGFueSBhbmQgYWxsIGFsaWFzZXMuXG4gICAgd2hpbGUgKHN5bWJvbC5mbGFncyAmIHRzLlN5bWJvbEZsYWdzLkFsaWFzKSB7XG4gICAgICBzeW1ib2wgPSB0aGlzLmNoZWNrZXIuZ2V0QWxpYXNlZFN5bWJvbChzeW1ib2wpO1xuICAgIH1cblxuICAgIC8vIExvb2sgYXQgdGhlIHJlc29sdmVkIFN5bWJvbCdzIGRlY2xhcmF0aW9ucyBhbmQgcGljayBvbmUgb2YgdGhlbSB0byByZXR1cm4uIFZhbHVlIGRlY2xhcmF0aW9uc1xuICAgIC8vIGFyZSBnaXZlbiBwcmVjZWRlbmNlIG92ZXIgdHlwZSBkZWNsYXJhdGlvbnMuXG4gICAgaWYgKHN5bWJvbC52YWx1ZURlY2xhcmF0aW9uICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIG5vZGU6IHN5bWJvbC52YWx1ZURlY2xhcmF0aW9uLFxuICAgICAgICBrbm93bjogbnVsbCxcbiAgICAgICAgdmlhTW9kdWxlLFxuICAgICAgICBpZGVudGl0eTogbnVsbCxcbiAgICAgICAga2luZDogRGVjbGFyYXRpb25LaW5kLkNvbmNyZXRlLFxuICAgICAgfTtcbiAgICB9IGVsc2UgaWYgKHN5bWJvbC5kZWNsYXJhdGlvbnMgIT09IHVuZGVmaW5lZCAmJiBzeW1ib2wuZGVjbGFyYXRpb25zLmxlbmd0aCA+IDApIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIG5vZGU6IHN5bWJvbC5kZWNsYXJhdGlvbnNbMF0sXG4gICAgICAgIGtub3duOiBudWxsLFxuICAgICAgICB2aWFNb2R1bGUsXG4gICAgICAgIGlkZW50aXR5OiBudWxsLFxuICAgICAgICBraW5kOiBEZWNsYXJhdGlvbktpbmQuQ29uY3JldGUsXG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9yZWZsZWN0RGVjb3JhdG9yKG5vZGU6IHRzLkRlY29yYXRvcik6IERlY29yYXRvcnxudWxsIHtcbiAgICAvLyBBdHRlbXB0IHRvIHJlc29sdmUgdGhlIGRlY29yYXRvciBleHByZXNzaW9uIGludG8gYSByZWZlcmVuY2UgdG8gYSBjb25jcmV0ZSBJZGVudGlmaWVyLiBUaGVcbiAgICAvLyBleHByZXNzaW9uIG1heSBjb250YWluIGEgY2FsbCB0byBhIGZ1bmN0aW9uIHdoaWNoIHJldHVybnMgdGhlIGRlY29yYXRvciBmdW5jdGlvbiwgaW4gd2hpY2hcbiAgICAvLyBjYXNlIHdlIHdhbnQgdG8gcmV0dXJuIHRoZSBhcmd1bWVudHMuXG4gICAgbGV0IGRlY29yYXRvckV4cHI6IHRzLkV4cHJlc3Npb24gPSBub2RlLmV4cHJlc3Npb247XG4gICAgbGV0IGFyZ3M6IHRzLkV4cHJlc3Npb25bXXxudWxsID0gbnVsbDtcblxuICAgIC8vIENoZWNrIGZvciBjYWxsIGV4cHJlc3Npb25zLlxuICAgIGlmICh0cy5pc0NhbGxFeHByZXNzaW9uKGRlY29yYXRvckV4cHIpKSB7XG4gICAgICBhcmdzID0gQXJyYXkuZnJvbShkZWNvcmF0b3JFeHByLmFyZ3VtZW50cyk7XG4gICAgICBkZWNvcmF0b3JFeHByID0gZGVjb3JhdG9yRXhwci5leHByZXNzaW9uO1xuICAgIH1cblxuICAgIC8vIFRoZSBmaW5hbCByZXNvbHZlZCBkZWNvcmF0b3Igc2hvdWxkIGJlIGEgYHRzLklkZW50aWZpZXJgIC0gaWYgaXQncyBub3QsIHRoZW4gc29tZXRoaW5nIGlzXG4gICAgLy8gd3JvbmcgYW5kIHRoZSBkZWNvcmF0b3IgY2FuJ3QgYmUgcmVzb2x2ZWQgc3RhdGljYWxseS5cbiAgICBpZiAoIWlzRGVjb3JhdG9ySWRlbnRpZmllcihkZWNvcmF0b3JFeHByKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3QgZGVjb3JhdG9ySWRlbnRpZmllciA9IHRzLmlzSWRlbnRpZmllcihkZWNvcmF0b3JFeHByKSA/IGRlY29yYXRvckV4cHIgOiBkZWNvcmF0b3JFeHByLm5hbWU7XG4gICAgY29uc3QgaW1wb3J0RGVjbCA9IHRoaXMuZ2V0SW1wb3J0T2ZJZGVudGlmaWVyKGRlY29yYXRvcklkZW50aWZpZXIpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIG5hbWU6IGRlY29yYXRvcklkZW50aWZpZXIudGV4dCxcbiAgICAgIGlkZW50aWZpZXI6IGRlY29yYXRvckV4cHIsXG4gICAgICBpbXBvcnQ6IGltcG9ydERlY2wsXG4gICAgICBub2RlLFxuICAgICAgYXJncyxcbiAgICB9O1xuICB9XG5cbiAgcHJpdmF0ZSBfcmVmbGVjdE1lbWJlcihub2RlOiB0cy5DbGFzc0VsZW1lbnQpOiBDbGFzc01lbWJlcnxudWxsIHtcbiAgICBsZXQga2luZDogQ2xhc3NNZW1iZXJLaW5kfG51bGwgPSBudWxsO1xuICAgIGxldCB2YWx1ZTogdHMuRXhwcmVzc2lvbnxudWxsID0gbnVsbDtcbiAgICBsZXQgbmFtZTogc3RyaW5nfG51bGwgPSBudWxsO1xuICAgIGxldCBuYW1lTm9kZTogdHMuSWRlbnRpZmllcnx0cy5TdHJpbmdMaXRlcmFsfG51bGwgPSBudWxsO1xuXG4gICAgaWYgKHRzLmlzUHJvcGVydHlEZWNsYXJhdGlvbihub2RlKSkge1xuICAgICAga2luZCA9IENsYXNzTWVtYmVyS2luZC5Qcm9wZXJ0eTtcbiAgICAgIHZhbHVlID0gbm9kZS5pbml0aWFsaXplciB8fCBudWxsO1xuICAgIH0gZWxzZSBpZiAodHMuaXNHZXRBY2Nlc3NvckRlY2xhcmF0aW9uKG5vZGUpKSB7XG4gICAgICBraW5kID0gQ2xhc3NNZW1iZXJLaW5kLkdldHRlcjtcbiAgICB9IGVsc2UgaWYgKHRzLmlzU2V0QWNjZXNzb3JEZWNsYXJhdGlvbihub2RlKSkge1xuICAgICAga2luZCA9IENsYXNzTWVtYmVyS2luZC5TZXR0ZXI7XG4gICAgfSBlbHNlIGlmICh0cy5pc01ldGhvZERlY2xhcmF0aW9uKG5vZGUpKSB7XG4gICAgICBraW5kID0gQ2xhc3NNZW1iZXJLaW5kLk1ldGhvZDtcbiAgICB9IGVsc2UgaWYgKHRzLmlzQ29uc3RydWN0b3JEZWNsYXJhdGlvbihub2RlKSkge1xuICAgICAga2luZCA9IENsYXNzTWVtYmVyS2luZC5Db25zdHJ1Y3RvcjtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgaWYgKHRzLmlzQ29uc3RydWN0b3JEZWNsYXJhdGlvbihub2RlKSkge1xuICAgICAgbmFtZSA9ICdjb25zdHJ1Y3Rvcic7XG4gICAgfSBlbHNlIGlmICh0cy5pc0lkZW50aWZpZXIobm9kZS5uYW1lKSkge1xuICAgICAgbmFtZSA9IG5vZGUubmFtZS50ZXh0O1xuICAgICAgbmFtZU5vZGUgPSBub2RlLm5hbWU7XG4gICAgfSBlbHNlIGlmICh0cy5pc1N0cmluZ0xpdGVyYWwobm9kZS5uYW1lKSkge1xuICAgICAgbmFtZSA9IG5vZGUubmFtZS50ZXh0O1xuICAgICAgbmFtZU5vZGUgPSBub2RlLm5hbWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IGRlY29yYXRvcnMgPSB0aGlzLmdldERlY29yYXRvcnNPZkRlY2xhcmF0aW9uKG5vZGUpO1xuICAgIGNvbnN0IGlzU3RhdGljID0gbm9kZS5tb2RpZmllcnMgIT09IHVuZGVmaW5lZCAmJlxuICAgICAgICBub2RlLm1vZGlmaWVycy5zb21lKG1vZCA9PiBtb2Qua2luZCA9PT0gdHMuU3ludGF4S2luZC5TdGF0aWNLZXl3b3JkKTtcblxuICAgIHJldHVybiB7XG4gICAgICBub2RlLFxuICAgICAgaW1wbGVtZW50YXRpb246IG5vZGUsXG4gICAgICBraW5kLFxuICAgICAgdHlwZTogbm9kZS50eXBlIHx8IG51bGwsXG4gICAgICBuYW1lLFxuICAgICAgbmFtZU5vZGUsXG4gICAgICBkZWNvcmF0b3JzLFxuICAgICAgdmFsdWUsXG4gICAgICBpc1N0YXRpYyxcbiAgICB9O1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZWZsZWN0TmFtZU9mRGVjbGFyYXRpb24oZGVjbDogdHMuRGVjbGFyYXRpb24pOiBzdHJpbmd8bnVsbCB7XG4gIGNvbnN0IGlkID0gcmVmbGVjdElkZW50aWZpZXJPZkRlY2xhcmF0aW9uKGRlY2wpO1xuICByZXR1cm4gaWQgJiYgaWQudGV4dCB8fCBudWxsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVmbGVjdElkZW50aWZpZXJPZkRlY2xhcmF0aW9uKGRlY2w6IHRzLkRlY2xhcmF0aW9uKTogdHMuSWRlbnRpZmllcnxudWxsIHtcbiAgaWYgKHRzLmlzQ2xhc3NEZWNsYXJhdGlvbihkZWNsKSB8fCB0cy5pc0Z1bmN0aW9uRGVjbGFyYXRpb24oZGVjbCkpIHtcbiAgICByZXR1cm4gZGVjbC5uYW1lIHx8IG51bGw7XG4gIH0gZWxzZSBpZiAodHMuaXNWYXJpYWJsZURlY2xhcmF0aW9uKGRlY2wpKSB7XG4gICAgaWYgKHRzLmlzSWRlbnRpZmllcihkZWNsLm5hbWUpKSB7XG4gICAgICByZXR1cm4gZGVjbC5uYW1lO1xuICAgIH1cbiAgfVxuICByZXR1cm4gbnVsbDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlZmxlY3RUeXBlRW50aXR5VG9EZWNsYXJhdGlvbihcbiAgICB0eXBlOiB0cy5FbnRpdHlOYW1lLCBjaGVja2VyOiB0cy5UeXBlQ2hlY2tlcik6IHtub2RlOiB0cy5EZWNsYXJhdGlvbiwgZnJvbTogc3RyaW5nfG51bGx9IHtcbiAgbGV0IHJlYWxTeW1ib2wgPSBjaGVja2VyLmdldFN5bWJvbEF0TG9jYXRpb24odHlwZSk7XG4gIGlmIChyZWFsU3ltYm9sID09PSB1bmRlZmluZWQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYENhbm5vdCByZXNvbHZlIHR5cGUgZW50aXR5ICR7dHlwZS5nZXRUZXh0KCl9IHRvIHN5bWJvbGApO1xuICB9XG4gIHdoaWxlIChyZWFsU3ltYm9sLmZsYWdzICYgdHMuU3ltYm9sRmxhZ3MuQWxpYXMpIHtcbiAgICByZWFsU3ltYm9sID0gY2hlY2tlci5nZXRBbGlhc2VkU3ltYm9sKHJlYWxTeW1ib2wpO1xuICB9XG5cbiAgbGV0IG5vZGU6IHRzLkRlY2xhcmF0aW9ufG51bGwgPSBudWxsO1xuICBpZiAocmVhbFN5bWJvbC52YWx1ZURlY2xhcmF0aW9uICE9PSB1bmRlZmluZWQpIHtcbiAgICBub2RlID0gcmVhbFN5bWJvbC52YWx1ZURlY2xhcmF0aW9uO1xuICB9IGVsc2UgaWYgKHJlYWxTeW1ib2wuZGVjbGFyYXRpb25zICE9PSB1bmRlZmluZWQgJiYgcmVhbFN5bWJvbC5kZWNsYXJhdGlvbnMubGVuZ3RoID09PSAxKSB7XG4gICAgbm9kZSA9IHJlYWxTeW1ib2wuZGVjbGFyYXRpb25zWzBdO1xuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBFcnJvcihgQ2Fubm90IHJlc29sdmUgdHlwZSBlbnRpdHkgc3ltYm9sIHRvIGRlY2xhcmF0aW9uYCk7XG4gIH1cblxuICBpZiAodHMuaXNRdWFsaWZpZWROYW1lKHR5cGUpKSB7XG4gICAgaWYgKCF0cy5pc0lkZW50aWZpZXIodHlwZS5sZWZ0KSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBDYW5ub3QgaGFuZGxlIHF1YWxpZmllZCBuYW1lIHdpdGggbm9uLWlkZW50aWZpZXIgbGhzYCk7XG4gICAgfVxuICAgIGNvbnN0IHN5bWJvbCA9IGNoZWNrZXIuZ2V0U3ltYm9sQXRMb2NhdGlvbih0eXBlLmxlZnQpO1xuICAgIGlmIChzeW1ib2wgPT09IHVuZGVmaW5lZCB8fCBzeW1ib2wuZGVjbGFyYXRpb25zID09PSB1bmRlZmluZWQgfHxcbiAgICAgICAgc3ltYm9sLmRlY2xhcmF0aW9ucy5sZW5ndGggIT09IDEpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQ2Fubm90IHJlc29sdmUgcXVhbGlmaWVkIHR5cGUgZW50aXR5IGxocyB0byBzeW1ib2xgKTtcbiAgICB9XG4gICAgY29uc3QgZGVjbCA9IHN5bWJvbC5kZWNsYXJhdGlvbnNbMF07XG4gICAgaWYgKHRzLmlzTmFtZXNwYWNlSW1wb3J0KGRlY2wpKSB7XG4gICAgICBjb25zdCBjbGF1c2UgPSBkZWNsLnBhcmVudCE7XG4gICAgICBjb25zdCBpbXBvcnREZWNsID0gY2xhdXNlLnBhcmVudCE7XG4gICAgICBpZiAoIXRzLmlzU3RyaW5nTGl0ZXJhbChpbXBvcnREZWNsLm1vZHVsZVNwZWNpZmllcikpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBNb2R1bGUgc3BlY2lmaWVyIGlzIG5vdCBhIHN0cmluZ2ApO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHtub2RlLCBmcm9tOiBpbXBvcnREZWNsLm1vZHVsZVNwZWNpZmllci50ZXh0fTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmtub3duIGltcG9ydCB0eXBlP2ApO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICByZXR1cm4ge25vZGUsIGZyb206IG51bGx9O1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmaWx0ZXJUb01lbWJlcnNXaXRoRGVjb3JhdG9yKG1lbWJlcnM6IENsYXNzTWVtYmVyW10sIG5hbWU6IHN0cmluZywgbW9kdWxlPzogc3RyaW5nKTpcbiAgICB7bWVtYmVyOiBDbGFzc01lbWJlciwgZGVjb3JhdG9yczogRGVjb3JhdG9yW119W10ge1xuICByZXR1cm4gbWVtYmVycy5maWx0ZXIobWVtYmVyID0+ICFtZW1iZXIuaXNTdGF0aWMpXG4gICAgICAubWFwKG1lbWJlciA9PiB7XG4gICAgICAgIGlmIChtZW1iZXIuZGVjb3JhdG9ycyA9PT0gbnVsbCkge1xuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZGVjb3JhdG9ycyA9IG1lbWJlci5kZWNvcmF0b3JzLmZpbHRlcihkZWMgPT4ge1xuICAgICAgICAgIGlmIChkZWMuaW1wb3J0ICE9PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gZGVjLmltcG9ydC5uYW1lID09PSBuYW1lICYmIChtb2R1bGUgPT09IHVuZGVmaW5lZCB8fCBkZWMuaW1wb3J0LmZyb20gPT09IG1vZHVsZSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBkZWMubmFtZSA9PT0gbmFtZSAmJiBtb2R1bGUgPT09IHVuZGVmaW5lZDtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChkZWNvcmF0b3JzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHttZW1iZXIsIGRlY29yYXRvcnN9O1xuICAgICAgfSlcbiAgICAgIC5maWx0ZXIoKHZhbHVlKTogdmFsdWUgaXMge21lbWJlcjogQ2xhc3NNZW1iZXIsIGRlY29yYXRvcnM6IERlY29yYXRvcltdfSA9PiB2YWx1ZSAhPT0gbnVsbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmaW5kTWVtYmVyKFxuICAgIG1lbWJlcnM6IENsYXNzTWVtYmVyW10sIG5hbWU6IHN0cmluZywgaXNTdGF0aWM6IGJvb2xlYW4gPSBmYWxzZSk6IENsYXNzTWVtYmVyfG51bGwge1xuICByZXR1cm4gbWVtYmVycy5maW5kKG1lbWJlciA9PiBtZW1iZXIuaXNTdGF0aWMgPT09IGlzU3RhdGljICYmIG1lbWJlci5uYW1lID09PSBuYW1lKSB8fCBudWxsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVmbGVjdE9iamVjdExpdGVyYWwobm9kZTogdHMuT2JqZWN0TGl0ZXJhbEV4cHJlc3Npb24pOiBNYXA8c3RyaW5nLCB0cy5FeHByZXNzaW9uPiB7XG4gIGNvbnN0IG1hcCA9IG5ldyBNYXA8c3RyaW5nLCB0cy5FeHByZXNzaW9uPigpO1xuICBub2RlLnByb3BlcnRpZXMuZm9yRWFjaChwcm9wID0+IHtcbiAgICBpZiAodHMuaXNQcm9wZXJ0eUFzc2lnbm1lbnQocHJvcCkpIHtcbiAgICAgIGNvbnN0IG5hbWUgPSBwcm9wZXJ0eU5hbWVUb1N0cmluZyhwcm9wLm5hbWUpO1xuICAgICAgaWYgKG5hbWUgPT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgbWFwLnNldChuYW1lLCBwcm9wLmluaXRpYWxpemVyKTtcbiAgICB9IGVsc2UgaWYgKHRzLmlzU2hvcnRoYW5kUHJvcGVydHlBc3NpZ25tZW50KHByb3ApKSB7XG4gICAgICBtYXAuc2V0KHByb3AubmFtZS50ZXh0LCBwcm9wLm5hbWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIG1hcDtcbn1cblxuZnVuY3Rpb24gY2FzdERlY2xhcmF0aW9uVG9DbGFzc09yRGllKGRlY2xhcmF0aW9uOiBDbGFzc0RlY2xhcmF0aW9uKTpcbiAgICBDbGFzc0RlY2xhcmF0aW9uPHRzLkNsYXNzRGVjbGFyYXRpb24+IHtcbiAgaWYgKCF0cy5pc0NsYXNzRGVjbGFyYXRpb24oZGVjbGFyYXRpb24pKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBgUmVmbGVjdGluZyBvbiBhICR7dHMuU3ludGF4S2luZFtkZWNsYXJhdGlvbi5raW5kXX0gaW5zdGVhZCBvZiBhIENsYXNzRGVjbGFyYXRpb24uYCk7XG4gIH1cbiAgcmV0dXJuIGRlY2xhcmF0aW9uO1xufVxuXG5mdW5jdGlvbiBwYXJhbWV0ZXJOYW1lKG5hbWU6IHRzLkJpbmRpbmdOYW1lKTogc3RyaW5nfG51bGwge1xuICBpZiAodHMuaXNJZGVudGlmaWVyKG5hbWUpKSB7XG4gICAgcmV0dXJuIG5hbWUudGV4dDtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuXG5mdW5jdGlvbiBwcm9wZXJ0eU5hbWVUb1N0cmluZyhub2RlOiB0cy5Qcm9wZXJ0eU5hbWUpOiBzdHJpbmd8bnVsbCB7XG4gIGlmICh0cy5pc0lkZW50aWZpZXIobm9kZSkgfHwgdHMuaXNTdHJpbmdMaXRlcmFsKG5vZGUpIHx8IHRzLmlzTnVtZXJpY0xpdGVyYWwobm9kZSkpIHtcbiAgICByZXR1cm4gbm9kZS50ZXh0O1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBudWxsO1xuICB9XG59XG5cbi8qKlxuICogQ29tcHV0ZSB0aGUgbGVmdCBtb3N0IGlkZW50aWZpZXIgaW4gYSBxdWFsaWZpZWQgdHlwZSBjaGFpbi4gRS5nLiB0aGUgYGFgIG9mIGBhLmIuYy5Tb21lVHlwZWAuXG4gKiBAcGFyYW0gcXVhbGlmaWVkTmFtZSBUaGUgc3RhcnRpbmcgcHJvcGVydHkgYWNjZXNzIGV4cHJlc3Npb24gZnJvbSB3aGljaCB3ZSB3YW50IHRvIGNvbXB1dGVcbiAqIHRoZSBsZWZ0IG1vc3QgaWRlbnRpZmllci5cbiAqIEByZXR1cm5zIHRoZSBsZWZ0IG1vc3QgaWRlbnRpZmllciBpbiB0aGUgY2hhaW4gb3IgYG51bGxgIGlmIGl0IGlzIG5vdCBhbiBpZGVudGlmaWVyLlxuICovXG5mdW5jdGlvbiBnZXRRdWFsaWZpZWROYW1lUm9vdChxdWFsaWZpZWROYW1lOiB0cy5RdWFsaWZpZWROYW1lKTogdHMuSWRlbnRpZmllcnxudWxsIHtcbiAgd2hpbGUgKHRzLmlzUXVhbGlmaWVkTmFtZShxdWFsaWZpZWROYW1lLmxlZnQpKSB7XG4gICAgcXVhbGlmaWVkTmFtZSA9IHF1YWxpZmllZE5hbWUubGVmdDtcbiAgfVxuICByZXR1cm4gdHMuaXNJZGVudGlmaWVyKHF1YWxpZmllZE5hbWUubGVmdCkgPyBxdWFsaWZpZWROYW1lLmxlZnQgOiBudWxsO1xufVxuXG4vKipcbiAqIENvbXB1dGUgdGhlIGxlZnQgbW9zdCBpZGVudGlmaWVyIGluIGEgcHJvcGVydHkgYWNjZXNzIGNoYWluLiBFLmcuIHRoZSBgYWAgb2YgYGEuYi5jLmRgLlxuICogQHBhcmFtIHByb3BlcnR5QWNjZXNzIFRoZSBzdGFydGluZyBwcm9wZXJ0eSBhY2Nlc3MgZXhwcmVzc2lvbiBmcm9tIHdoaWNoIHdlIHdhbnQgdG8gY29tcHV0ZVxuICogdGhlIGxlZnQgbW9zdCBpZGVudGlmaWVyLlxuICogQHJldHVybnMgdGhlIGxlZnQgbW9zdCBpZGVudGlmaWVyIGluIHRoZSBjaGFpbiBvciBgbnVsbGAgaWYgaXQgaXMgbm90IGFuIGlkZW50aWZpZXIuXG4gKi9cbmZ1bmN0aW9uIGdldEZhckxlZnRJZGVudGlmaWVyKHByb3BlcnR5QWNjZXNzOiB0cy5Qcm9wZXJ0eUFjY2Vzc0V4cHJlc3Npb24pOiB0cy5JZGVudGlmaWVyfG51bGwge1xuICB3aGlsZSAodHMuaXNQcm9wZXJ0eUFjY2Vzc0V4cHJlc3Npb24ocHJvcGVydHlBY2Nlc3MuZXhwcmVzc2lvbikpIHtcbiAgICBwcm9wZXJ0eUFjY2VzcyA9IHByb3BlcnR5QWNjZXNzLmV4cHJlc3Npb247XG4gIH1cbiAgcmV0dXJuIHRzLmlzSWRlbnRpZmllcihwcm9wZXJ0eUFjY2Vzcy5leHByZXNzaW9uKSA/IHByb3BlcnR5QWNjZXNzLmV4cHJlc3Npb24gOiBudWxsO1xufVxuXG4vKipcbiAqIFJldHVybiB0aGUgSW1wb3J0RGVjbGFyYXRpb24gZm9yIHRoZSBnaXZlbiBgbm9kZWAgaWYgaXQgaXMgZWl0aGVyIGFuIGBJbXBvcnRTcGVjaWZpZXJgIG9yIGFcbiAqIGBOYW1lc3BhY2VJbXBvcnRgLiBJZiBub3QgcmV0dXJuIGBudWxsYC5cbiAqL1xuZnVuY3Rpb24gZ2V0Q29udGFpbmluZ0ltcG9ydERlY2xhcmF0aW9uKG5vZGU6IHRzLk5vZGUpOiB0cy5JbXBvcnREZWNsYXJhdGlvbnxudWxsIHtcbiAgcmV0dXJuIHRzLmlzSW1wb3J0U3BlY2lmaWVyKG5vZGUpID8gbm9kZS5wYXJlbnQhLnBhcmVudCEucGFyZW50ISA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRzLmlzTmFtZXNwYWNlSW1wb3J0KG5vZGUpID8gbm9kZS5wYXJlbnQucGFyZW50IDogbnVsbDtcbn1cblxuLyoqXG4gKiBDb21wdXRlIHRoZSBuYW1lIGJ5IHdoaWNoIHRoZSBgZGVjbGAgd2FzIGV4cG9ydGVkLCBub3QgaW1wb3J0ZWQuXG4gKiBJZiBubyBzdWNoIGRlY2xhcmF0aW9uIGNhbiBiZSBmb3VuZCAoZS5nLiBpdCBpcyBhIG5hbWVzcGFjZSBpbXBvcnQpXG4gKiB0aGVuIGZhbGxiYWNrIHRvIHRoZSBgb3JpZ2luYWxJZGAuXG4gKi9cbmZ1bmN0aW9uIGdldEV4cG9ydGVkTmFtZShkZWNsOiB0cy5EZWNsYXJhdGlvbiwgb3JpZ2luYWxJZDogdHMuSWRlbnRpZmllcik6IHN0cmluZyB7XG4gIHJldHVybiB0cy5pc0ltcG9ydFNwZWNpZmllcihkZWNsKSA/XG4gICAgICAoZGVjbC5wcm9wZXJ0eU5hbWUgIT09IHVuZGVmaW5lZCA/IGRlY2wucHJvcGVydHlOYW1lIDogZGVjbC5uYW1lKS50ZXh0IDpcbiAgICAgIG9yaWdpbmFsSWQudGV4dDtcbn1cbiJdfQ==