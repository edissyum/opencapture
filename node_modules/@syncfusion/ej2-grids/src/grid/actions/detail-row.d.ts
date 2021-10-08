import { IGrid } from '../base/interface';
import { ServiceLocator } from '../services/service-locator';
import { Row } from '../models/row';
import { Column } from '../models/column';
/**
 * The `DetailRow` module is used to handle detail template and hierarchy Grid operations.
 */
export declare class DetailRow {
    private aria;
    private parent;
    private focus;
    private lastrowcell;
    private childRefs;
    /**
     * Constructor for the Grid detail template module
     *
     * @param {IGrid} parent - specifies the IGrid
     * @param {ServiceLocator} locator - specifes the serviceLocator
     * @hidden
     */
    constructor(parent?: IGrid, locator?: ServiceLocator);
    private clickHandler;
    private toogleExpandcollapse;
    /**
     * @hidden
     * @param {IGrid} gObj - specifies the grid Object
     * @param {Row<Column>}rowObj - specifies the row object
     * @param {string} printMode - specifies the printmode
     * @returns {Object} returns the object
     */
    getGridModel(gObj: IGrid, rowObj: Row<Column>, printMode: string): Object;
    private promiseResolve;
    private isDetailRow;
    private destroy;
    private getTDfromIndex;
    /**
     * Expands a detail row with the given target.
     *
     * @param  {Element} target - Defines the collapsed element to expand.
     * @returns {void}
     */
    expand(target: number | Element): void;
    /**
     * Collapses a detail row with the given target.
     *
     * @param  {Element} target - Defines the expanded element to collapse.
     * @returns {void}
     */
    collapse(target: number | Element): void;
    /**
     * Expands all the detail rows of the Grid.
     *
     * @returns {void}
     */
    expandAll(): void;
    /**
     * Collapses all the detail rows of the Grid.
     *
     * @returns {void}
     */
    collapseAll(): void;
    private expandCollapse;
    private keyPressHandler;
    private refreshColSpan;
    private destroyChildGrids;
    /**
     * For internal use only - Get the module name.
     *
     * @returns {string} returns the module name
     * @private
     */
    protected getModuleName(): string;
}
