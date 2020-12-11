import { Compiler } from 'webpack';
import { CrossOriginValue } from '../../utils/index-file/augment-index-html';
import { IndexHtmlTransform } from '../../utils/index-file/write-index-html';
export interface IndexHtmlWebpackPluginOptions {
    input: string;
    output: string;
    baseHref?: string;
    entrypoints: string[];
    deployUrl?: string;
    sri: boolean;
    noModuleEntrypoints: string[];
    moduleEntrypoints: string[];
    postTransforms: IndexHtmlTransform[];
    crossOrigin?: CrossOriginValue;
    lang?: string;
}
export declare class IndexHtmlWebpackPlugin {
    private _options;
    constructor(options?: Partial<IndexHtmlWebpackPluginOptions>);
    apply(compiler: Compiler): void;
}
