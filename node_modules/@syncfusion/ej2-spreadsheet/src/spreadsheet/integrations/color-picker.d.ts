import { Spreadsheet } from '../base/index';
/**
 * `Color Picker` module is used to handle ColorPicker functionality.
 *
 * @hidden
 */
export declare class ColorPicker {
    private parent;
    private fontColorPicker;
    private filColorPicker;
    constructor(parent: Spreadsheet);
    private render;
    private updateSelectedColor;
    private wireFocusEvent;
    private openHandler;
    private beforeCloseHandler;
    private beforeModeSwitch;
    private destroy;
    private addEventListener;
    private removeEventListener;
}
