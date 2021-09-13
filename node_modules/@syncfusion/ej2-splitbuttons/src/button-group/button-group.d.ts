import { ButtonModel } from '@syncfusion/ej2-buttons';
/**
 * Initialize ButtonGroup CSS component with specified properties.
 * ```html
 * <div id='buttongroup'>
 * <button></button>
 * <button></button>
 * <button></button>
 * </div>
 * ```
 * ```typescript
 * createButtonGroup('#buttongroup', {
 *   cssClass: 'e-outline',
 *   buttons: [
 *       { content: 'Day' },
 *       { content: 'Week' },
 *       { content: 'Work Week'}
 *   ]
 * });
 * ```
 * @param {string} selector
 * @param {CreateButtonGroupModel} options
 * @returns HTMLElement
 */
export declare function createButtonGroup(selector: string, options?: CreateButtonGroupModel, createElement?: Function): HTMLElement;
export interface CreateButtonGroupModel {
    cssClass?: string;
    buttons?: (ButtonModel | null)[];
}
