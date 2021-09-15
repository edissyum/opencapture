import { AggregateColumnModel } from '../models/models';
import { Cell } from '../models/cell';
import { ICellRenderer } from '../base/interface';
import { CellRenderer } from './cell-renderer';
/**
 * SummaryCellRenderer class which responsible for building summary cell content.
 *
 * @hidden
 */
export declare class SummaryCellRenderer extends CellRenderer implements ICellRenderer<AggregateColumnModel> {
    element: HTMLElement;
    getValue(field: string, data: Object, column: AggregateColumnModel): Object;
    evaluate(node: Element, cell: Cell<AggregateColumnModel>, data: Object, attributes?: Object): boolean;
    refreshWithAggregate(node: Element, cell: Cell<AggregateColumnModel>): Function;
}
