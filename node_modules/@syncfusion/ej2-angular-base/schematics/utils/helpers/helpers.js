"use strict";
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@angular-devkit/core");
const schematics_1 = require("@angular-devkit/schematics");
const ts = require("typescript");
const path_1 = require("path");
const MODULE_EXT = '.module.ts';
const ROUTING_MODULE_EXT = '-routing.module.ts';
/**
 * Find the module referred by a set of options passed to the schematics.
 */
function findModuleFromOptions(host, options) {
    if (options.hasOwnProperty('skipImport') && options.skipImport) {
        return undefined;
    }
    const moduleExt = options.moduleExt || MODULE_EXT;
    const routingModuleExt = options.routingModuleExt || ROUTING_MODULE_EXT;
    if (!options.module) {
        const pathToCheck = (options.path || '')
            + (options.flat ? '' : '/' + core_1.strings.dasherize(options.name));
        return core_1.normalize(findModule(host, pathToCheck, moduleExt, routingModuleExt));
    }
    else {
        const modulePath = core_1.normalize(`/${options.path}/${options.module}`);
        const componentPath = core_1.normalize(`/${options.path}/${options.name}`);
        const moduleBaseName = core_1.normalize(modulePath).split('/').pop();
        const candidateSet = new Set([
            core_1.normalize(options.path || '/'),
        ]);
        for (let dir = modulePath; dir != core_1.NormalizedRoot; dir = core_1.dirname(dir)) {
            candidateSet.add(dir);
        }
        for (let dir = componentPath; dir != core_1.NormalizedRoot; dir = core_1.dirname(dir)) {
            candidateSet.add(dir);
        }
        const candidatesDirs = [...candidateSet].sort((a, b) => b.length - a.length);
        for (const c of candidatesDirs) {
            const candidateFiles = [
                '',
                `${moduleBaseName}.ts`,
                `${moduleBaseName}${moduleExt}`,
            ].map(x => core_1.join(c, x));
            for (const sc of candidateFiles) {
                if (host.exists(sc)) {
                    return core_1.normalize(sc);
                }
            }
        }
        throw new Error(`Specified module '${options.module}' does not exist.\n`
            + `Looked in the following directories:\n    ${candidatesDirs.join('\n    ')}`);
    }
}
exports.findModuleFromOptions = findModuleFromOptions;
/**
 * Function to find the "closest" module to a generated file's path.
 */
function findModule(host, generateDir, moduleExt = MODULE_EXT, routingModuleExt = ROUTING_MODULE_EXT) {
    let dir = host.getDir('/' + generateDir);
    let foundRoutingModule = false;
    while (dir) {
        const allMatches = dir.subfiles.filter(p => p.endsWith(moduleExt));
        const filteredMatches = allMatches.filter(p => !p.endsWith(routingModuleExt));
        foundRoutingModule = foundRoutingModule || allMatches.length !== filteredMatches.length;
        if (filteredMatches.length == 1) {
            return core_1.join(dir.path, filteredMatches[0]);
        }
        else if (filteredMatches.length > 1) {
            throw new Error('More than one module matches. Use skip-import option to skip importing '
                + 'the component into the closest module.');
        }
        dir = dir.parent;
    }
    const errorMsg = foundRoutingModule ? 'Could not find a non Routing NgModule.'
        + `\nModules with suffix '${routingModuleExt}' are strictly reserved for routing.`
        + '\nUse the skip-import option to skip importing in NgModule.'
        : 'Could not find an NgModule. Use the skip-import option to skip importing in NgModule.';
    throw new Error(errorMsg);
}
exports.findModule = findModule;
/**
 * Build a relative path from one file path to another file path.
 */
function buildRelativePath(from, to) {
    from = core_1.normalize(from);
    to = core_1.normalize(to);
    // Convert to arrays.
    const fromParts = from.split('/');
    const toParts = to.split('/');
    // Remove file names (preserving destination)
    fromParts.pop();
    const toFileName = toParts.pop();
    const relativePath = core_1.relative(core_1.normalize(fromParts.join('/')), core_1.normalize(toParts.join('/')));
    let pathPrefix = '';
    // Set the path prefix for same dir or child dir, parent dir starts with `..`
    if (!relativePath) {
        pathPrefix = '.';
    }
    else if (!relativePath.startsWith('.')) {
        pathPrefix = `./`;
    }
    if (pathPrefix && !pathPrefix.endsWith('/')) {
        pathPrefix += '/';
    }
    return pathPrefix + (relativePath ? relativePath + '/' : '') + toFileName;
}
exports.buildRelativePath = buildRelativePath;
exports.ANGULAR_CLI_WORKSPACE_PATH = '/angular.json';
/** Gets the Angular CLI workspace config (angular.json) */
function getWorkspace(host) {
    const configBuffer = host.read(exports.ANGULAR_CLI_WORKSPACE_PATH);
    if (configBuffer === null) {
        throw new schematics_1.SchematicsException('Could not find angular.json');
    }
    return JSON.parse(configBuffer.toString());
}
exports.getWorkspace = getWorkspace;
/**
 * Gets a project from the Angular CLI workspace. If no project name is given, the first project
 * will be retrieved.
 */
function getProjectFromWorkspace(config, projectName) {
    if (config.projects) {
        if (projectName) {
            const project = config.projects[projectName];
            if (!project) {
                throw new schematics_1.SchematicsException(`No project named "${projectName}" exists.`);
            }
            Object.defineProperty(project, 'name', { enumerable: false, value: projectName });
            return project;
        }
        // If there is exactly one non-e2e project, use that. Otherwise, require that a specific
        // project be specified.
        const allProjectNames = Object.keys(config.projects).filter(p => !p.includes('e2e'));
        if (allProjectNames.length === 1) {
            const project = config.projects[allProjectNames[0]];
            // Set a non-enumerable project name to the project. We need the name for schematics
            // later on, but don't want to write it back out to the config file.
            Object.defineProperty(project, 'name', { enumerable: false, value: projectName });
            return project;
        }
        else {
            throw new schematics_1.SchematicsException('Multiple projects are defined; please specify a project name');
        }
    }
    throw new schematics_1.SchematicsException('No projects are defined');
}
exports.getProjectFromWorkspace = getProjectFromWorkspace;
/**
 * An operation that does nothing.
 */
class NoopChange {
    constructor() {
        this.description = 'No operation.';
        this.order = Infinity;
        this.path = null;
    }
    apply() { return Promise.resolve(); }
}
exports.NoopChange = NoopChange;
/**
 * Will add text to the source code.
 */
class InsertChange {
    constructor(path, pos, toAdd) {
        this.path = path;
        this.pos = pos;
        this.toAdd = toAdd;
        if (pos < 0) {
            throw new Error('Negative positions are invalid');
        }
        this.description = `Inserted ${toAdd} into position ${pos} of ${path}`;
        this.order = pos;
    }
    /**
     * This method does not insert spaces if there is none in the original string.
     */
    apply(host) {
        return host.read(this.path).then(content => {
            const prefix = content.substring(0, this.pos);
            const suffix = content.substring(this.pos);
            return host.write(this.path, `${prefix}${this.toAdd}${suffix}`);
        });
    }
}
exports.InsertChange = InsertChange;
/**
 * Will remove text from the source code.
 */
class RemoveChange {
    constructor(path, pos, toRemove) {
        this.path = path;
        this.pos = pos;
        this.toRemove = toRemove;
        if (pos < 0) {
            throw new Error('Negative positions are invalid');
        }
        this.description = `Removed ${toRemove} into position ${pos} of ${path}`;
        this.order = pos;
    }
    apply(host) {
        return host.read(this.path).then(content => {
            const prefix = content.substring(0, this.pos);
            const suffix = content.substring(this.pos + this.toRemove.length);
            // TODO: throw error if toRemove doesn't match removed string.
            return host.write(this.path, `${prefix}${suffix}`);
        });
    }
}
exports.RemoveChange = RemoveChange;
/**
 * Will replace text from the source code.
 */
class ReplaceChange {
    constructor(path, pos, oldText, newText) {
        this.path = path;
        this.pos = pos;
        this.oldText = oldText;
        this.newText = newText;
        if (pos < 0) {
            throw new Error('Negative positions are invalid');
        }
        this.description = `Replaced ${oldText} into position ${pos} of ${path} with ${newText}`;
        this.order = pos;
    }
    apply(host) {
        return host.read(this.path).then(content => {
            const prefix = content.substring(0, this.pos);
            const suffix = content.substring(this.pos + this.oldText.length);
            const text = content.substring(this.pos, this.pos + this.oldText.length);
            if (text !== this.oldText) {
                return Promise.reject(new Error(`Invalid replace: "${text}" != "${this.oldText}".`));
            }
            // TODO: throw error if oldText doesn't match removed string.
            return host.write(this.path, `${prefix}${this.newText}${suffix}`);
        });
    }
}
exports.ReplaceChange = ReplaceChange;
/**
 * Find all nodes from the AST in the subtree of node of SyntaxKind kind.
 * @param node
 * @param kind
 * @param max The maximum number of items to return.
 * @return all nodes of kind, or [] if none is found
 */
function findNodes(node, kind, max = Infinity) {
    if (!node || max == 0) {
        return [];
    }
    const arr = [];
    if (node.kind === kind) {
        arr.push(node);
        max--;
    }
    if (max > 0) {
        for (const child of node.getChildren()) {
            findNodes(child, kind, max).forEach(node => {
                if (max > 0) {
                    arr.push(node);
                }
                max--;
            });
            if (max <= 0) {
                break;
            }
        }
    }
    return arr;
}
exports.findNodes = findNodes;
/**
 * Get all the nodes from a source.
 * @param sourceFile The source file object.
 * @returns {Observable<ts.Node>} An observable of all the nodes in the source.
 */
function getSourceNodes(sourceFile) {
    const nodes = [sourceFile];
    const result = [];
    while (nodes.length > 0) {
        const node = nodes.shift();
        if (node) {
            result.push(node);
            if (node.getChildCount(sourceFile) >= 0) {
                nodes.unshift(...node.getChildren());
            }
        }
    }
    return result;
}
exports.getSourceNodes = getSourceNodes;
function findNode(node, kind, text) {
    if (node.kind === kind && node.getText() === text) {
        // throw new Error(node.getText());
        return node;
    }
    let foundNode = null;
    ts.forEachChild(node, childNode => {
        foundNode = foundNode || findNode(childNode, kind, text);
    });
    return foundNode;
}
exports.findNode = findNode;
/**
 * Helper for sorting nodes.
 * @return function to sort nodes in increasing order of position in sourceFile
 */
function nodesByPosition(first, second) {
    return first.getStart() - second.getStart();
}
/**
 * Insert `toInsert` after the last occurence of `ts.SyntaxKind[nodes[i].kind]`
 * or after the last of occurence of `syntaxKind` if the last occurence is a sub child
 * of ts.SyntaxKind[nodes[i].kind] and save the changes in file.
 *
 * @param nodes insert after the last occurence of nodes
 * @param toInsert string to insert
 * @param file file to insert changes into
 * @param fallbackPos position to insert if toInsert happens to be the first occurence
 * @param syntaxKind the ts.SyntaxKind of the subchildren to insert after
 * @return Change instance
 * @throw Error if toInsert is first occurence but fall back is not set
 */
function insertAfterLastOccurrence(nodes, toInsert, file, fallbackPos, syntaxKind) {
    let lastItem = nodes.sort(nodesByPosition).pop();
    if (!lastItem) {
        throw new Error();
    }
    if (syntaxKind) {
        lastItem = findNodes(lastItem, syntaxKind).sort(nodesByPosition).pop();
    }
    if (!lastItem && fallbackPos == undefined) {
        throw new Error(`tried to insert ${toInsert} as first occurence with no fallback position`);
    }
    const lastItemPosition = lastItem ? lastItem.getEnd() : fallbackPos;
    return new InsertChange(file, lastItemPosition, toInsert);
}
exports.insertAfterLastOccurrence = insertAfterLastOccurrence;
function getContentOfKeyLiteral(_source, node) {
    if (node.kind == ts.SyntaxKind.Identifier) {
        return node.text;
    }
    else if (node.kind == ts.SyntaxKind.StringLiteral) {
        return node.text;
    }
    else {
        return null;
    }
}
exports.getContentOfKeyLiteral = getContentOfKeyLiteral;
function _angularImportsFromNode(node, _sourceFile) {
    const ms = node.moduleSpecifier;
    let modulePath;
    switch (ms.kind) {
        case ts.SyntaxKind.StringLiteral:
            modulePath = ms.text;
            break;
        default:
            return {};
    }
    if (!modulePath.startsWith('@angular/')) {
        return {};
    }
    if (node.importClause) {
        if (node.importClause.name) {
            // This is of the form `import Name from 'path'`. Ignore.
            return {};
        }
        else if (node.importClause.namedBindings) {
            const nb = node.importClause.namedBindings;
            if (nb.kind == ts.SyntaxKind.NamespaceImport) {
                // This is of the form `import * as name from 'path'`. Return `name.`.
                return {
                    [nb.name.text + '.']: modulePath,
                };
            }
            else {
                // This is of the form `import {a,b,c} from 'path'`
                const namedImports = nb;
                return namedImports.elements
                    .map((is) => is.propertyName ? is.propertyName.text : is.name.text)
                    .reduce((acc, curr) => {
                    acc[curr] = modulePath;
                    return acc;
                }, {});
            }
        }
        return {};
    }
    else {
        // This is of the form `import 'path';`. Nothing to do.
        return {};
    }
}
function getDecoratorMetadata(source, identifier, module) {
    const angularImports = findNodes(source, ts.SyntaxKind.ImportDeclaration)
        .map((node) => _angularImportsFromNode(node, source))
        .reduce((acc, current) => {
        for (const key of Object.keys(current)) {
            acc[key] = current[key];
        }
        return acc;
    }, {});
    return getSourceNodes(source)
        .filter(node => {
        return node.kind == ts.SyntaxKind.Decorator
            && node.expression.kind == ts.SyntaxKind.CallExpression;
    })
        .map(node => node.expression)
        .filter(expr => {
        if (expr.expression.kind == ts.SyntaxKind.Identifier) {
            const id = expr.expression;
            return id.getFullText(source) == identifier
                && angularImports[id.getFullText(source)] === module;
        }
        else if (expr.expression.kind == ts.SyntaxKind.PropertyAccessExpression) {
            // This covers foo.NgModule when importing * as foo.
            const paExpr = expr.expression;
            // If the left expression is not an identifier, just give up at that point.
            if (paExpr.expression.kind !== ts.SyntaxKind.Identifier) {
                return false;
            }
            const id = paExpr.name.text;
            const moduleId = paExpr.expression.getText(source);
            return id === identifier && (angularImports[moduleId + '.'] === module);
        }
        return false;
    })
        .filter(expr => expr.arguments[0]
        && expr.arguments[0].kind == ts.SyntaxKind.ObjectLiteralExpression)
        .map(expr => expr.arguments[0]);
}
exports.getDecoratorMetadata = getDecoratorMetadata;
function findClassDeclarationParent(node) {
    if (ts.isClassDeclaration(node)) {
        return node;
    }
    return node.parent && findClassDeclarationParent(node.parent);
}
/**
 * Given a source file with @NgModule class(es), find the name of the first @NgModule class.
 *
 * @param source source file containing one or more @NgModule
 * @returns the name of the first @NgModule, or `undefined` if none is found
 */
function getFirstNgModuleName(source) {
    // First, find the @NgModule decorators.
    const ngModulesMetadata = getDecoratorMetadata(source, 'NgModule', '@angular/core');
    if (ngModulesMetadata.length === 0) {
        return undefined;
    }
    // Then walk parent pointers up the AST, looking for the ClassDeclaration parent of the NgModule
    // metadata.
    const moduleClass = findClassDeclarationParent(ngModulesMetadata[0]);
    if (!moduleClass || !moduleClass.name) {
        return undefined;
    }
    // Get the class name of the module ClassDeclaration.
    return moduleClass.name.text;
}
exports.getFirstNgModuleName = getFirstNgModuleName;
function addSymbolToNgModuleMetadata(source, ngModulePath, metadataField, symbolName, importPath = null) {
    const nodes = getDecoratorMetadata(source, 'NgModule', '@angular/core');
    let node = nodes[0]; // tslint:disable-line:no-any
    // Find the decorator declaration.
    if (!node) {
        return [];
    }
    // Get all the children property assignment of object literals.
    const matchingProperties = node.properties
        .filter(prop => prop.kind == ts.SyntaxKind.PropertyAssignment)
        // Filter out every fields that's not "metadataField". Also handles string literals
        // (but not expressions).
        .filter((prop) => {
        const name = prop.name;
        switch (name.kind) {
            case ts.SyntaxKind.Identifier:
                return name.getText(source) == metadataField;
            case ts.SyntaxKind.StringLiteral:
                return name.text == metadataField;
        }
        return false;
    });
    // Get the last node of the array literal.
    if (!matchingProperties) {
        return [];
    }
    if (matchingProperties.length == 0) {
        // We haven't found the field in the metadata declaration. Insert a new field.
        const expr = node;
        let position;
        let toInsert;
        if (expr.properties.length == 0) {
            position = expr.getEnd() - 1;
            toInsert = `  ${metadataField}: [${symbolName}]\n`;
        }
        else {
            node = expr.properties[expr.properties.length - 1];
            position = node.getEnd();
            // Get the indentation of the last element, if any.
            const text = node.getFullText(source);
            const matches = text.match(/^\r?\n\s*/);
            if (matches.length > 0) {
                toInsert = `,${matches[0]}${metadataField}: [${symbolName}]`;
            }
            else {
                toInsert = `, ${metadataField}: [${symbolName}]`;
            }
        }
        if (importPath !== null) {
            return [
                new InsertChange(ngModulePath, position, toInsert),
                insertImport(source, ngModulePath, symbolName.replace(/\..*$/, ''), importPath),
            ];
        }
        else {
            return [new InsertChange(ngModulePath, position, toInsert)];
        }
    }
    const assignment = matchingProperties[0];
    // If it's not an array, nothing we can do really.
    if (assignment.initializer.kind !== ts.SyntaxKind.ArrayLiteralExpression) {
        return [];
    }
    const arrLiteral = assignment.initializer;
    if (arrLiteral.elements.length == 0) {
        // Forward the property.
        node = arrLiteral;
    }
    else {
        node = arrLiteral.elements;
    }
    if (!node) {
        console.error('No app module found. Please add your new class to your component.');
        return [];
    }
    if (Array.isArray(node)) {
        const nodeArray = node;
        const symbolsArray = nodeArray.map(node => node.getText());
        if (symbolsArray.includes(symbolName)) {
            return [];
        }
        node = node[node.length - 1];
    }
    let toInsert;
    let position = node.getEnd();
    if (node.kind == ts.SyntaxKind.ObjectLiteralExpression) {
        // We haven't found the field in the metadata declaration. Insert a new
        // field.
        const expr = node;
        if (expr.properties.length == 0) {
            position = expr.getEnd() - 1;
            toInsert = `  ${metadataField}: [${symbolName}]\n`;
        }
        else {
            node = expr.properties[expr.properties.length - 1];
            position = node.getEnd();
            // Get the indentation of the last element, if any.
            const text = node.getFullText(source);
            if (text.match('^\r?\r?\n')) {
                toInsert = `,${text.match(/^\r?\n\s+/)[0]}${metadataField}: [${symbolName}]`;
            }
            else {
                toInsert = `, ${metadataField}: [${symbolName}]`;
            }
        }
    }
    else if (node.kind == ts.SyntaxKind.ArrayLiteralExpression) {
        // We found the field but it's empty. Insert it just before the `]`.
        position--;
        toInsert = `${symbolName}`;
    }
    else {
        // Get the indentation of the last element, if any.
        const text = node.getFullText(source);
        if (text.match(/^\r?\n/)) {
            toInsert = `,${text.match(/^\r?\n(\r?)\s+/)[0]}${symbolName}`;
        }
        else {
            toInsert = `, ${symbolName}`;
        }
    }
    if (importPath !== null) {
        return [
            new InsertChange(ngModulePath, position, toInsert),
            insertImport(source, ngModulePath, symbolName.replace(/\..*$/, ''), importPath),
        ];
    }
    return [new InsertChange(ngModulePath, position, toInsert)];
}
exports.addSymbolToNgModuleMetadata = addSymbolToNgModuleMetadata;
/**
 * Custom function to insert a declaration (component, pipe, directive)
 * into NgModule declarations. It also imports the component.
 */
function addDeclarationToModule(source, modulePath, classifiedName, importPath) {
    return addSymbolToNgModuleMetadata(source, modulePath, 'declarations', classifiedName, importPath);
}
exports.addDeclarationToModule = addDeclarationToModule;
/**
 * Custom function to insert an NgModule into NgModule imports. It also imports the module.
 */
function addImportToModule(source, modulePath, classifiedName, importPath) {
    return addSymbolToNgModuleMetadata(source, modulePath, 'imports', classifiedName, importPath);
}
exports.addImportToModule = addImportToModule;
/**
 * Custom function to insert a provider into NgModule. It also imports it.
 */
function addProviderToModule(source, modulePath, classifiedName, importPath) {
    return addSymbolToNgModuleMetadata(source, modulePath, 'providers', classifiedName, importPath);
}
exports.addProviderToModule = addProviderToModule;
/**
 * Custom function to insert an export into NgModule. It also imports it.
 */
function addExportToModule(source, modulePath, classifiedName, importPath) {
    return addSymbolToNgModuleMetadata(source, modulePath, 'exports', classifiedName, importPath);
}
exports.addExportToModule = addExportToModule;
/**
 * Custom function to insert an export into NgModule. It also imports it.
 */
function addBootstrapToModule(source, modulePath, classifiedName, importPath) {
    return addSymbolToNgModuleMetadata(source, modulePath, 'bootstrap', classifiedName, importPath);
}
exports.addBootstrapToModule = addBootstrapToModule;
/**
 * Determine if an import already exists.
 */
function isImported(source, classifiedName, importPath) {
    const allNodes = getSourceNodes(source);
    const matchingNodes = allNodes
        .filter(node => node.kind === ts.SyntaxKind.ImportDeclaration)
        .filter((imp) => imp.moduleSpecifier.kind === ts.SyntaxKind.StringLiteral)
        .filter((imp) => {
        return imp.moduleSpecifier.text === importPath;
    })
        .filter((imp) => {
        if (!imp.importClause) {
            return false;
        }
        const nodes = findNodes(imp.importClause, ts.SyntaxKind.ImportSpecifier)
            .filter(n => n.getText() === classifiedName);
        return nodes.length > 0;
    });
    return matchingNodes.length > 0;
}
exports.isImported = isImported;
function findBootstrapModuleCall(host, mainPath) {
    const mainBuffer = host.read(mainPath);
    if (!mainBuffer) {
        throw new schematics_1.SchematicsException(`Main file (${mainPath}) not found`);
    }
    const mainText = mainBuffer.toString('utf-8');
    const source = ts.createSourceFile(mainPath, mainText, ts.ScriptTarget.Latest, true);
    const allNodes = getSourceNodes(source);
    let bootstrapCall = null;
    for (const node of allNodes) {
        let bootstrapCallNode = null;
        bootstrapCallNode = findNode(node, ts.SyntaxKind.Identifier, 'bootstrapModule');
        // Walk up the parent until CallExpression is found.
        while (bootstrapCallNode && bootstrapCallNode.parent
            && bootstrapCallNode.parent.kind !== ts.SyntaxKind.CallExpression) {
            bootstrapCallNode = bootstrapCallNode.parent;
        }
        if (bootstrapCallNode !== null &&
            bootstrapCallNode.parent !== undefined &&
            bootstrapCallNode.parent.kind === ts.SyntaxKind.CallExpression) {
            bootstrapCall = bootstrapCallNode.parent;
            break;
        }
    }
    return bootstrapCall;
}
exports.findBootstrapModuleCall = findBootstrapModuleCall;
function findBootstrapModulePath(host, mainPath) {
    const bootstrapCall = findBootstrapModuleCall(host, mainPath);
    if (!bootstrapCall) {
        throw new schematics_1.SchematicsException('Bootstrap call not found');
    }
    const bootstrapModule = bootstrapCall.arguments[0];
    const mainBuffer = host.read(mainPath);
    if (!mainBuffer) {
        throw new schematics_1.SchematicsException(`Client app main file (${mainPath}) not found`);
    }
    const mainText = mainBuffer.toString('utf-8');
    const source = ts.createSourceFile(mainPath, mainText, ts.ScriptTarget.Latest, true);
    const allNodes = getSourceNodes(source);
    const bootstrapModuleRelativePath = allNodes
        .filter(node => node.kind === ts.SyntaxKind.ImportDeclaration)
        .filter(imp => {
        return findNode(imp, ts.SyntaxKind.Identifier, bootstrapModule.getText());
    })
        .map((imp) => {
        const modulePathStringLiteral = imp.moduleSpecifier;
        return modulePathStringLiteral.text;
    })[0];
    return bootstrapModuleRelativePath;
}
exports.findBootstrapModulePath = findBootstrapModulePath;
function getAppModulePath(host, mainPath) {
    const moduleRelativePath = findBootstrapModulePath(host, mainPath);
    const mainDir = path_1.dirname(mainPath);
    const modulePath = core_1.normalize(`/${mainDir}/${moduleRelativePath}.ts`);
    return modulePath;
}
exports.getAppModulePath = getAppModulePath;
function parseName(path, name) {
    const nameWithoutPath = core_1.basename(name);
    const namePath = core_1.dirname((path + '/' + name));
    return {
        name: nameWithoutPath,
        path: core_1.normalize('/' + namePath),
    };
}
exports.parseName = parseName;
/**
* Add Import `import { symbolName } from fileName` if the import doesn't exit
* already. Assumes fileToEdit can be resolved and accessed.
* @param fileToEdit (file we want to add import to)
* @param symbolName (item to import)
* @param fileName (path to the file)
* @param isDefault (if true, import follows style for importing default exports)
* @return Change
*/
function insertImport(source, fileToEdit, symbolName, fileName, isDefault = false) {
    const rootNode = source;
    const allImports = findNodes(rootNode, ts.SyntaxKind.ImportDeclaration);
    // get nodes that map to import statements from the file fileName
    const relevantImports = allImports.filter(node => {
        // StringLiteral of the ImportDeclaration is the import file (fileName in this case).
        const importFiles = node.getChildren()
            .filter(child => child.kind === ts.SyntaxKind.StringLiteral)
            .map(n => n.text);
        return importFiles.filter(file => file === fileName).length === 1;
    });
    if (relevantImports.length > 0) {
        let importsAsterisk = false;
        // imports from import file
        const imports = [];
        relevantImports.forEach(n => {
            Array.prototype.push.apply(imports, findNodes(n, ts.SyntaxKind.Identifier));
            if (findNodes(n, ts.SyntaxKind.AsteriskToken).length > 0) {
                importsAsterisk = true;
            }
        });
        // if imports * from fileName, don't add symbolName
        if (importsAsterisk) {
            return new NoopChange();
        }
        const importTextNodes = imports.filter(n => n.text === symbolName);
        // insert import if it's not there
        if (importTextNodes.length === 0) {
            const fallbackPos = findNodes(relevantImports[0], ts.SyntaxKind.CloseBraceToken)[0].getStart() ||
                findNodes(relevantImports[0], ts.SyntaxKind.FromKeyword)[0].getStart();
            return insertAfterLastOccurrence(imports, `, ${symbolName}`, fileToEdit, fallbackPos);
        }
        return new NoopChange();
    }
    // no such import declaration exists
    const useStrict = findNodes(rootNode, ts.SyntaxKind.StringLiteral)
        .filter((n) => n.text === 'use strict');
    let fallbackPos = 0;
    if (useStrict.length > 0) {
        fallbackPos = useStrict[0].end;
    }
    const open = isDefault ? '' : '{ ';
    const close = isDefault ? '' : ' }';
    // if there are no imports or 'use strict' statement, insert import at beginning of file
    const insertAtBeginning = allImports.length === 0 && useStrict.length === 0;
    const separator = insertAtBeginning ? '' : ';\n';
    const toInsert = `${separator}import ${open}${symbolName}${close}` +
        ` from '${fileName}'${insertAtBeginning ? ';\n' : ''}`;
    return insertAfterLastOccurrence(allImports, toInsert, fileToEdit, fallbackPos, ts.SyntaxKind.StringLiteral);
}
exports.insertImport = insertImport;
function validateName(name) {
    if (name && /^\d/.test(name)) {
        throw new schematics_1.SchematicsException(core_1.tags.oneLine `name (${name})
        can not start with a digit.`);
    }
}
exports.validateName = validateName;
// Must start with a letter, and must contain only alphanumeric characters or dashes.
// When adding a dash the segment after the dash must also start with a letter.
exports.htmlSelectorRe = /^[a-zA-Z][.0-9a-zA-Z]*(:?-[a-zA-Z][.0-9a-zA-Z]*)*$/;
function validateHtmlSelector(selector) {
    if (selector && !exports.htmlSelectorRe.test(selector)) {
        throw new schematics_1.SchematicsException(core_1.tags.oneLine `Selector (${selector})
        is invalid.`);
    }
}
exports.validateHtmlSelector = validateHtmlSelector;
