import { PivotView } from '../../pivotview/base/pivotview';
import { IAxisSet } from '../../base/engine';
import { IAction } from '../../common/base/interface';
/**
 * `Grouping` module to create grouping option for date, number and custom in popup.
 */
/** @hidden */
export declare class Grouping implements IAction {
    private parent;
    private parentElement;
    private groupDialog;
    private selectedCellsInfo;
    private isUpdate;
    private dateGroup;
    private handlers;
    /**
     * Constructor for the group UI rendering.
     * @hidden
     */
    constructor(parent?: PivotView);
    /**
     * For internal use only - Get the module name.
     * @returns {string} - string
     * @private
     */
    protected getModuleName(): string;
    private render;
    /**
     * Returns the selected members/headers by checing the valid members from the pivot table.
     * @function getSelectedOptions
     * @param  {SelectedCellsInfo[]} selectedCellsInfo - Get the members name from the given selected cells information
     * @returns {string[]} - string
     * @hidden
     */
    getSelectedOptions(selectedCellsInfo: SelectedCellsInfo[]): string[];
    private createGroupSettings;
    private updateUnGroupSettings;
    private updateDateSource;
    private removeGroupSettings;
    private getGroupSettings;
    private isDateType;
    /**
     * Returns the selected members/headers by checing the valid members from the pivot table.
     * @function getSelectedCells
     * @param  {string} axis - Spicifies the axis name for the given field.
     * @param  {string} fieldName - Gets selected members for the given field name.
     * @param  {string} name - specifies the selected member name for the given field.
     * @returns {SelectedCellsInfo[]} - return type
     * @hidden
     */
    getSelectedCells(axis: string, fieldName: string, name: string): SelectedCellsInfo[];
    private createGroupDialog;
    private createGroupOptions;
    private updateGroupSettings;
    private getGroupBasedSettings;
    private getGroupByName;
    private validateSettings;
    private reOrderSettings;
    private modifyParentGroupItems;
    private mergeArray;
    private removeDialog;
    /**
     * @hidden
     */
    addEventListener(): void;
    /**
     * @hidden
     */
    removeEventListener(): void;
    /**
     * To destroy the pivot button event listener
     * @returns {void}
     * @hidden
     */
    destroy(): void;
}
/**
 * @hidden
 */
export interface SelectedCellsInfo {
    axis: string;
    fieldName: string;
    cellInfo: IAxisSet;
    name: string;
}
