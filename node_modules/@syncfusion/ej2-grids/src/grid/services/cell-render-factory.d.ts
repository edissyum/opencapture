import { ICellRenderer } from '../base/interface';
import { CellType } from '../base/enum';
/**
 * CellRendererFactory
 *
 * @hidden
 */
export declare class CellRendererFactory {
    cellRenderMap: {
        [c: string]: ICellRenderer<{}>;
    };
    addCellRenderer(name: string | CellType, type: ICellRenderer<{}>): void;
    getCellRenderer(name: string | CellType): ICellRenderer<{}>;
}
