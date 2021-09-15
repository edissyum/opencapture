import { ServiceLocator } from '../services/service-locator';
import { IGrid } from '../base/interface';
/**
 * `CommandColumn` used to handle the command column actions.
 *
 * @hidden
 */
export declare class CommandColumn {
    private parent;
    private locator;
    constructor(parent: IGrid, locator?: ServiceLocator);
    private initiateRender;
    private commandClickHandler;
    /**
     * For internal use only - Get the module name.
     *
     * @returns {string} returns the module name
     */
    private getModuleName;
    /**
     * To destroy CommandColumn.
     *
     * @function destroy
     * @returns {void}
     */
    private destroy;
    private removeEventListener;
    private addEventListener;
    private keyPressHandler;
    private load;
}
