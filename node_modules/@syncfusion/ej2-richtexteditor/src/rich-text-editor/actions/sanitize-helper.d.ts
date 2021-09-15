import { BeforeSanitizeHtmlArgs, SanitizeRemoveAttrs, IRichTextEditor } from '../base/interface';
export declare class SanitizeHtmlHelper {
    removeAttrs: SanitizeRemoveAttrs[];
    removeTags: string[];
    wrapElement: HTMLElement;
    initialize(value: string, parent?: IRichTextEditor): string;
    serializeValue(item: BeforeSanitizeHtmlArgs, value: string): string;
    private removeXssTags;
    private removeJsEvents;
    private removeXssAttrs;
}
