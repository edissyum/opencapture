import { TranslationCollection } from '../utils/translation.collection';
import { PostProcessorInterface } from './post-processor.interface';
export declare class SortByKeyPostProcessor implements PostProcessorInterface {
    name: string;
    process(draft: TranslationCollection, extracted: TranslationCollection, existing: TranslationCollection): TranslationCollection;
}
