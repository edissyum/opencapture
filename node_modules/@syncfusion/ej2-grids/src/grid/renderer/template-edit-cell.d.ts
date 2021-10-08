import { IEditCell, IGrid } from '../base/interface';
/**
 * `TemplateEditCell` is used to handle template cell.
 *
 * @hidden
 */
export declare class TemplateEditCell implements IEditCell {
    private parent;
    constructor(parent?: IGrid);
    read(element: Element, value: string): string;
    write(): void;
    destroy(): void;
}
