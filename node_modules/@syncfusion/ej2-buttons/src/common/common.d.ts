import { BaseEventArgs } from '@syncfusion/ej2-base';
import { CheckBox } from '../check-box';
import { Switch } from '../switch';
/**
 * Initialize wrapper element for angular.
 * @private
 */
export declare function wrapperInitialize(createElement: CreateElementArgs, tag: string, type: string, element: HTMLInputElement, WRAPPER: string, role: string): HTMLInputElement;
export declare function getTextNode(element: HTMLElement): Node;
/**
 * Destroy the button components.
 * @private
 */
export declare function destroy(ejInst: Switch | CheckBox, wrapper: Element, tagName: string): void;
export declare function preRender(proxy: Switch | CheckBox, control: string, wrapper: string, element: HTMLInputElement, moduleName: string): void;
/**
 * Creates CheckBox component UI with theming and ripple support.
 * @private
 */
export declare function createCheckBox(createElement: CreateElementArgs, enableRipple?: boolean, options?: CheckBoxUtilModel): Element;
export declare function rippleMouseHandler(e: MouseEvent, rippleSpan: Element): void;
/**
 * Append hidden input to given element
 * @private
 */
export declare function setHiddenInput(proxy: Switch | CheckBox, wrap: Element): void;
export interface CheckBoxUtilModel {
    checked?: boolean;
    label?: string;
    enableRtl?: boolean;
    cssClass?: string;
}
/**
 * Interface for change event arguments.
 */
export interface ChangeEventArgs extends BaseEventArgs {
    /** Returns the event parameters of the CheckBox or Switch.
     * @blazorType MouseEventArgs
     */
    event?: Event;
    /** Returns the checked value of the CheckBox or Switch. */
    checked?: boolean;
}
export declare type CreateElementArgs = (tag: string, prop?: {
    id?: string;
    className?: string;
    innerHTML?: string;
    styles?: string;
    attrs?: {
        [key: string]: string;
    };
}) => HTMLElement;
