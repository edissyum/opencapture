import { Column } from '../models/column';
import { FilterSettings } from '../base/grid';
import { IGrid } from '../base/interface';
import { ServiceLocator } from '../services/service-locator';
import { Dialog } from '@syncfusion/ej2-popups';
/**
 * `filter operators` render boolean column.
 *
 * @hidden
 */
export declare class FlMenuOptrUI {
    private parent;
    private customFilterOperators;
    private serviceLocator;
    private filterSettings;
    private dropOptr;
    private customOptr;
    private optrData;
    private dialogObj;
    private ddOpen;
    constructor(parent?: IGrid, customFltrOperators?: Object, serviceLocator?: ServiceLocator, filterSettings?: FilterSettings);
    /**
     * @param {Element} dlgConetntEle - specifies the content element
     * @param {Element} target - specifies the target
     * @param {Column} column - specifies the column
     * @param {Dialog} dlgObj - specifies the dialog
     * @param {Object[]} operator - specifies the operator list
     * @returns {void}
     * @hidden
     */
    renderOperatorUI(dlgConetntEle: Element, target: Element, column: Column, dlgObj: Dialog, operator?: {
        [key: string]: Object;
    }[]): void;
    private renderResponsiveDropDownList;
    private dropDownOpen;
    private dropSelectedVal;
    /**
     * @returns {string} returns the operator
     * @hidden
     */
    getFlOperator(): string;
    private destroyDropDownList;
}
