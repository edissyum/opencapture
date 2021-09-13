import { Configuration } from "./configuration";
export declare class Theme {
    constructor(configuration: Configuration);
    successful(str: string): string;
    failed(str: string): string;
    pending(str: string): string;
    prettyStacktraceFilename(str: string): string;
    prettyStacktraceLineNumber(str: string): string;
    prettyStacktraceColumnNumber(str: string): string;
    prettyStacktraceError(str: string): string;
}
