import { IGrid } from '../base/interface';
import { ServiceLocator } from '../services/service-locator';
/**
 * Edit render module is used to render grid edit row.
 *
 * @hidden
 */
export declare class EditRender {
    private editType;
    protected parent: IGrid;
    private renderer;
    protected serviceLocator: ServiceLocator;
    private focus;
    /**
     * Constructor for render module
     *
     * @param {IGrid} parent -specifies the IGrid
     * @param {ServiceLocator} serviceLocator - specifies the serviceLocator
     */
    constructor(parent?: IGrid, serviceLocator?: ServiceLocator);
    addNew(args: Object): void;
    update(args: Object): void;
    private convertWidget;
    private focusElement;
    getEditElements(args: {
        rowData?: Object;
        columnName?: string;
        requestType?: string;
        row?: Element;
        rowIndex?: number;
        isScroll?: boolean;
        isCustomFormValidation?: boolean;
    }): Object;
    destroy(): void;
}
