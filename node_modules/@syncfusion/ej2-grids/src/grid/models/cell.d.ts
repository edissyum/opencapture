import { CellType } from '../base/enum';
import { CommandModel } from '../base/interface';
/**
 * Cell
 *
 * @hidden
 */
export declare class Cell<T> {
    colSpan: number;
    rowSpan: number;
    cellType: CellType;
    visible: boolean;
    isTemplate: boolean;
    isDataCell: boolean;
    isSelected: boolean;
    isColumnSelected: boolean;
    column: T;
    rowID: string;
    index: number;
    colIndex: number;
    className: string;
    attributes: {
        [a: string]: Object;
    };
    isSpanned: boolean;
    cellSpan: number;
    isRowSpanned: boolean;
    rowSpanRange: number;
    colSpanRange: number;
    spanText: string | number | boolean | Date;
    commands: CommandModel[];
    isForeignKey: boolean;
    foreignKeyData: Object;
    constructor(options: {
        [x: string]: Object;
    });
    clone(): Cell<T>;
}
