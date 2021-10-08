import { NumberFormatOptions, DateFormatOptions } from '@syncfusion/ej2-base';
import { IValueFormatter } from '../base/interface';
/**
 * ValueFormatter class to globalize the value.
 *
 * @hidden
 */
export declare class ValueFormatter implements IValueFormatter {
    private intl;
    constructor(cultureName?: string);
    getFormatFunction(format: NumberFormatOptions | DateFormatOptions): Function;
    getParserFunction(format: NumberFormatOptions | DateFormatOptions): Function;
    fromView(value: string, format: Function, type?: string): string | number | Date;
    toView(value: number | Date, format: Function): string | Object;
    setCulture(cultureName: string): void;
}
