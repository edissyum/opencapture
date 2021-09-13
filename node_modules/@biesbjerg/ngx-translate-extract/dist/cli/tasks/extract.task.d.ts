import { TranslationCollection } from '../../utils/translation.collection';
import { TaskInterface } from './task.interface';
import { ParserInterface } from '../../parsers/parser.interface';
import { PostProcessorInterface } from '../../post-processors/post-processor.interface';
import { CompilerInterface } from '../../compilers/compiler.interface';
export interface ExtractTaskOptionsInterface {
    replace?: boolean;
}
export declare class ExtractTask implements TaskInterface {
    protected inputs: string[];
    protected outputs: string[];
    protected options: ExtractTaskOptionsInterface;
    protected parsers: ParserInterface[];
    protected postProcessors: PostProcessorInterface[];
    protected compiler: CompilerInterface;
    constructor(inputs: string[], outputs: string[], options?: ExtractTaskOptionsInterface);
    execute(): void;
    setParsers(parsers: ParserInterface[]): this;
    setPostProcessors(postProcessors: PostProcessorInterface[]): this;
    setCompiler(compiler: CompilerInterface): this;
    protected extract(): TranslationCollection;
    protected process(draft: TranslationCollection, extracted: TranslationCollection, existing: TranslationCollection): TranslationCollection;
    protected save(output: string, collection: TranslationCollection): void;
    protected getFiles(pattern: string): string[];
    protected out(...args: any[]): void;
    protected printEnabledParsers(): void;
    protected printEnabledPostProcessors(): void;
    protected printEnabledCompiler(): void;
}
