import { Spreadsheet } from '../index';
import { Selection, Edit, KeyboardNavigation, KeyboardShortcut, Clipboard, WrapText, Insert, Delete, ProtectSheet } from '../actions/index';
import { CellFormat, CollaborativeEditing, UndoRedo, Resize, SpreadsheetHyperlink, FindAndReplace, Merge } from '../actions/index';
import { Formula, Sort, Filter, SpreadsheetImage, SpreadsheetChart } from '../integrations/index';
import { Ribbon, FormulaBar, SheetTabs, Open, ContextMenu, Save, NumberFormat } from '../integrations/index';
import { DataBind } from '../../workbook/index';
import { DataValidation } from '../actions/data-validation';
import { ConditionalFormatting } from '../actions/conditional-formatting';
/**
 * Spreadsheet basic module.
 *
 * @private
 */
var BasicModule = /** @class */ (function () {
    /**
     * Constructor for Spreadsheet basic module.
     *
     * @private
     */
    function BasicModule() {
        Spreadsheet.Inject(Ribbon, FormulaBar, SheetTabs, Selection, Edit, KeyboardNavigation, KeyboardShortcut, Clipboard, DataBind, Open, ContextMenu, Save, NumberFormat, CellFormat, Formula, Sort, CollaborativeEditing, UndoRedo, Resize, Filter, SpreadsheetHyperlink, WrapText, Insert, Delete, ProtectSheet, DataValidation, FindAndReplace, Merge, ConditionalFormatting, SpreadsheetImage, SpreadsheetChart);
    }
    /**
     * For internal use only - Get the module name.
     *
     * @returns {string} - Get the module name.
     * @private
     */
    BasicModule.prototype.getModuleName = function () {
        return 'basic';
    };
    /**
     * Destroys the Spreadsheet basic module.
     *
     * @returns {void} - Destroys the Spreadsheet basic module.
     */
    BasicModule.prototype.destroy = function () {
        /* code snippet */
    };
    return BasicModule;
}());
export { BasicModule };
