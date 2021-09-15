import { IMDFormats } from './../base/interface';
/**
 * MDFormats internal plugin
 *
 * @hidden

 */
export declare class MDFormats {
    private parent;
    private selection;
    syntax: {
        [key: string]: string;
    };
    /**
     * Constructor for creating the Formats plugin
     *
     * @param {IMDFormats} options - specifies the formats
     * @hidden

     */
    constructor(options: IMDFormats);
    private addEventListener;
    private applyFormats;
    private clearRegex;
    private cleanFormat;
    private applyCodeBlock;
    private replaceAt;
    private restore;
    private isAppliedFormat;
}
