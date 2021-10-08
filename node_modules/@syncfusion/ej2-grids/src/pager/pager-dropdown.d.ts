import { Pager } from './pager';
/**
 * IPager interface
 *
 * @hidden
 */
export interface IPager {
    newProp: {
        value: number | string | boolean;
    };
}
/**
 * `PagerDropDown` module handles selected pageSize from DropDownList.
 */
export declare class PagerDropDown {
    private pagerCons;
    private dropDownListObject;
    private pagerDropDownDiv;
    private pagerModule;
    /**
     * Constructor for pager module
     *
     * @param {Pager} pagerModule - specifies the pagermodule
     * @hidden
     */
    constructor(pagerModule?: Pager);
    /**
     * For internal use only - Get the module name.
     *
     * @returns {string} returns the module name
     * @private
     * @hidden
     */
    protected getModuleName(): string;
    /**
     * The function is used to render pager dropdown
     *
     * @returns {void}
     * @hidden
     */
    render(): void;
    /**
     * For internal use only - Get the pagesize.
     *
     * @param {ChangeEventArgs} e - specifies the changeeventargs
     * @returns {void}
     * @private
     * @hidden
     */
    private onChange;
    refresh(): void;
    private beforeValueChange;
    private convertValue;
    setDropDownValue(prop: string, value: string | number | Object | boolean): void;
    addEventListener(): void;
    removeEventListener(): void;
    /**
     * To destroy the Pagerdropdown
     *
     * @param {string} args - specifies the arguments
     * @param {string} args.requestType - specfies the request type
     * @returns {void}
     * @hidden
     */
    destroy(args?: {
        requestType: string;
    }): void;
}
