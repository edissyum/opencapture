"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebpackResourceLoader = exports.NoopResourceLoader = void 0;
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
// TODO: fix typings.
// tslint:disable-next-line:no-global-tslint-disable
// tslint:disable:no-any
const path = require("path");
const vm = require("vm");
const webpack_sources_1 = require("webpack-sources");
const paths_1 = require("./ivy/paths");
const NodeTemplatePlugin = require('webpack/lib/node/NodeTemplatePlugin');
const NodeTargetPlugin = require('webpack/lib/node/NodeTargetPlugin');
const LibraryTemplatePlugin = require('webpack/lib/LibraryTemplatePlugin');
const SingleEntryPlugin = require('webpack/lib/SingleEntryPlugin');
class NoopResourceLoader {
    async get() {
        return '';
    }
    getModifiedResourceFiles() {
        return new Set();
    }
    getResourceDependencies() {
        return [];
    }
    setAffectedResources() { }
    update() { }
}
exports.NoopResourceLoader = NoopResourceLoader;
class WebpackResourceLoader {
    constructor() {
        this._fileDependencies = new Map();
        this._reverseDependencies = new Map();
        this.cache = new Map();
        this.modifiedResources = new Set();
    }
    update(parentCompilation, changedFiles) {
        this._parentCompilation = parentCompilation;
        // Update resource cache and modified resources
        this.modifiedResources.clear();
        if (changedFiles) {
            for (const changedFile of changedFiles) {
                for (const affectedResource of this.getAffectedResources(changedFile)) {
                    this.cache.delete(paths_1.normalizePath(affectedResource));
                    this.modifiedResources.add(affectedResource);
                }
            }
        }
        else {
            this.cache.clear();
        }
    }
    getModifiedResourceFiles() {
        return this.modifiedResources;
    }
    getResourceDependencies(filePath) {
        return this._fileDependencies.get(filePath) || [];
    }
    getAffectedResources(file) {
        return this._reverseDependencies.get(file) || [];
    }
    setAffectedResources(file, resources) {
        this._reverseDependencies.set(file, new Set(resources));
    }
    async _compile(filePath) {
        var _a;
        if (!this._parentCompilation) {
            throw new Error('WebpackResourceLoader cannot be used without parentCompilation');
        }
        // Simple sanity check.
        if (filePath.match(/\.[jt]s$/)) {
            return Promise.reject(`Cannot use a JavaScript or TypeScript file (${filePath}) in a component's styleUrls or templateUrl.`);
        }
        const outputOptions = { filename: filePath };
        const context = this._parentCompilation.context;
        const relativePath = path.relative(context || '', filePath);
        const childCompiler = this._parentCompilation.createChildCompiler(relativePath, outputOptions);
        childCompiler.context = context;
        new NodeTemplatePlugin(outputOptions).apply(childCompiler);
        new NodeTargetPlugin().apply(childCompiler);
        new SingleEntryPlugin(context, filePath).apply(childCompiler);
        new LibraryTemplatePlugin('resource', 'var').apply(childCompiler);
        childCompiler.hooks.thisCompilation.tap('ngtools-webpack', (compilation) => {
            compilation.hooks.additionalAssets.tap('ngtools-webpack', () => {
                const asset = compilation.assets[filePath];
                if (!asset) {
                    return;
                }
                try {
                    const output = this._evaluate(filePath, asset.source());
                    if (typeof output === 'string') {
                        compilation.assets[filePath] = new webpack_sources_1.RawSource(output);
                    }
                }
                catch (error) {
                    // Use compilation errors, as otherwise webpack will choke
                    compilation.errors.push(error);
                }
            });
        });
        // Compile and return a promise
        const childCompilation = await new Promise((resolve, reject) => {
            childCompiler.compile((err, childCompilation) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(childCompilation);
                }
            });
        });
        // Propagate warnings to parent compilation.
        const { warnings, errors } = childCompilation;
        if (warnings && warnings.length) {
            this._parentCompilation.warnings.push(...warnings);
        }
        if (errors && errors.length) {
            this._parentCompilation.errors.push(...errors);
        }
        Object.keys(childCompilation.assets).forEach((assetName) => {
            // Add all new assets to the parent compilation, with the exception of
            // the file we're loading and its sourcemap.
            if (assetName !== filePath &&
                assetName !== `${filePath}.map` &&
                this._parentCompilation.assets[assetName] == undefined) {
                this._parentCompilation.assets[assetName] = childCompilation.assets[assetName];
            }
        });
        // Save the dependencies for this resource.
        this._fileDependencies.set(filePath, new Set(childCompilation.fileDependencies));
        for (const file of childCompilation.fileDependencies) {
            const resolvedFile = paths_1.normalizePath(file);
            const entry = this._reverseDependencies.get(resolvedFile);
            if (entry) {
                entry.add(filePath);
            }
            else {
                this._reverseDependencies.set(resolvedFile, new Set([filePath]));
            }
        }
        const finalOutput = (_a = childCompilation.assets[filePath]) === null || _a === void 0 ? void 0 : _a.source();
        return { outputName: filePath, source: finalOutput !== null && finalOutput !== void 0 ? finalOutput : '', success: !(errors === null || errors === void 0 ? void 0 : errors.length) };
    }
    _evaluate(filename, source) {
        var _a;
        // Evaluate code
        const context = {};
        try {
            vm.runInNewContext(source, context, { filename });
        }
        catch (_b) {
            // Error are propagated through the child compilation.
            return null;
        }
        if (typeof context.resource === 'string') {
            return context.resource;
        }
        else if (typeof ((_a = context.resource) === null || _a === void 0 ? void 0 : _a.default) === 'string') {
            return context.resource.default;
        }
        throw new Error(`The loader "${filename}" didn't return a string.`);
    }
    async get(filePath) {
        const normalizedFile = paths_1.normalizePath(filePath);
        let data = this.cache.get(normalizedFile);
        if (data === undefined) {
            // cache miss so compile resource
            const compilationResult = await this._compile(filePath);
            data = compilationResult.source;
            // Only cache if compilation was successful
            if (compilationResult.success) {
                this.cache.set(normalizedFile, data);
            }
        }
        return data;
    }
}
exports.WebpackResourceLoader = WebpackResourceLoader;
