/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { CompilerOptions } from '@angular/compiler-cli';
import { Compiler } from 'webpack';
export interface AngularPluginOptions {
    tsconfig: string;
    compilerOptions?: CompilerOptions;
    fileReplacements: Record<string, string>;
    substitutions: Record<string, string>;
    directTemplateLoading: boolean;
    emitClassMetadata: boolean;
    emitNgModuleScope: boolean;
    suppressZoneJsIncompatibilityWarning: boolean;
    jitMode: boolean;
}
export declare class AngularWebpackPlugin {
    private readonly pluginOptions;
    private watchMode?;
    private ngtscNextProgram?;
    private builder?;
    private sourceFileCache?;
    private buildTimestamp;
    private readonly lazyRouteMap;
    private readonly fileDependencies;
    private readonly requiredFilesToEmit;
    private readonly requiredFilesToEmitCache;
    private readonly fileEmitHistory;
    constructor(options?: Partial<AngularPluginOptions>);
    get options(): AngularPluginOptions;
    apply(compiler: Compiler & {
        watchMode?: boolean;
    }): void;
    private markResourceUsed;
    private rebuildRequiredFiles;
    private loadConfiguration;
    private updateAotProgram;
    private updateJitProgram;
    private createFileEmitter;
}
