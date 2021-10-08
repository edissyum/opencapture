import { ParserInterface } from './parser.interface';
import { TranslationCollection } from '../utils/translation.collection';
export declare class MarkerParser implements ParserInterface {
    extract(source: string, filePath: string): TranslationCollection | null;
}
