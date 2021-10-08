import { Config, Exclude } from './interfaces';
export declare function getExcludeObj(config: Config): Exclude;
export declare function isIgnored(url: string, excludeStrings: string[], excludeRegexps: RegExp[]): boolean;
