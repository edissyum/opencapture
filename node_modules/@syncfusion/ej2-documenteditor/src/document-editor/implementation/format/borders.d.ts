import { WBorder } from './border';
import { IWidget } from '../viewer/page';
/**
 * @private
 */
export declare class WBorders implements IWidget {
    private leftIn;
    private rightIn;
    private topIn;
    private bottomIn;
    private horizontalIn;
    private verticalIn;
    private diagonalUpIn;
    private diagonalDownIn;
    private lineWidthIn;
    private valueIn;
    ownerBase: Object;
    left: WBorder;
    right: WBorder;
    top: WBorder;
    bottom: WBorder;
    horizontal: WBorder;
    vertical: WBorder;
    diagonalUp: WBorder;
    diagonalDown: WBorder;
    constructor(node?: Object);
    destroy(): void;
    cloneFormat(): WBorders;
    copyFormat(borders: WBorders): void;
}
