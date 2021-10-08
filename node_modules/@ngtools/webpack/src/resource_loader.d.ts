export interface ResourceLoader {
    get(file: string): Promise<string>;
    getModifiedResourceFiles(): Set<string>;
    getResourceDependencies(file: string): Iterable<string>;
    setAffectedResources(file: string, resources: Iterable<string>): void;
    update(parentCompilation: import('webpack').compilation.Compilation, changedFiles?: Iterable<string>): void;
}
export declare class NoopResourceLoader implements ResourceLoader {
    get(): Promise<string>;
    getModifiedResourceFiles(): Set<string>;
    getResourceDependencies(): Iterable<string>;
    setAffectedResources(): void;
    update(): void;
}
export declare class WebpackResourceLoader {
    private _parentCompilation;
    private _fileDependencies;
    private _reverseDependencies;
    private cache;
    private modifiedResources;
    update(parentCompilation: import('webpack').compilation.Compilation, changedFiles?: Iterable<string>): void;
    getModifiedResourceFiles(): Set<string>;
    getResourceDependencies(filePath: string): never[] | Set<string>;
    getAffectedResources(file: string): never[] | Set<string>;
    setAffectedResources(file: string, resources: Iterable<string>): void;
    private _compile;
    private _evaluate;
    get(filePath: string): Promise<string>;
}
