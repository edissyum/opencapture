import { ChildProperty } from '@syncfusion/ej2-base';
import { INumberIndex, IDataSet, IAxisSet, IPivotValues } from '../../base/engine';
import { AxisSetModel } from './pivotvalues-model';
/**
 * Configures the properties in pivotvalues fields.
 */
/** @hidden */
export declare class AxisSet extends ChildProperty<AxisSet> implements IAxisSet {
    /**
     * Specifies header name.
     */
    formattedText: string;
    /**
     * Specifies header type.
     */
    type: string;
    /**
     * Specifies the drilled state of the header.
     */
    isDrilled: boolean;
    /**
     * Specifies the field whether it has child or not.
     */
    hasChild: boolean;
    /**
     * Specifies its child members.
     */
    members: this[];
    /**
     * Specifies its position collections in data source.
     */
    index: number[];
    /**
     * Specifies its position collections in data source with indexed object.
     */
    indexObject: INumberIndex;
    /**
     * Specifies its position in its field.
     */
    ordinal: number;
    /**
     * Specifies its level.
     */
    level: number;
    /**
     * Specifies its axis where it is plotted.
     */
    axis: string;
    /**
     * Specifies its value.
     */
    value: number;
    /**
     * Specifies its column span.
     */
    colSpan: number;
    /**
     * Specifies its row span.
     */
    rowSpan: number;
    /**
     * Specifies the data collection which is to be framed for value sorted members.
     */
    valueSort: IDataSet;
    /**
     * Specifies whether the cell is summary or not.
     */
    isSum: boolean;
    /**
     * Specifies the column header of a value cell.
     */
    columnHeaders: string | number | Date;
    /**
     * Specifies the row header of a value cell.
     */
    rowHeaders: string | number | Date;
}
/**
 * @hidden
 */
export interface PivotValues extends IPivotValues {
    [key: number]: {
        [key: number]: number | string | Object | AxisSetModel;
        length: number;
    };
    length: number;
}
