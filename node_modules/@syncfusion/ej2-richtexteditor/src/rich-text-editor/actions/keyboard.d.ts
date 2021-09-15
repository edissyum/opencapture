import { INotifyPropertyChanged } from '@syncfusion/ej2-base';
import { Base, EmitType } from '@syncfusion/ej2-base';
import { KeyboardEventsModel } from '@syncfusion/ej2-base';
/**
 * KeyboardEvents
 */
export interface KeyboardEventArgs extends KeyboardEvent {
    /**
     * action of the KeyboardEvent
     */
    action: string;
}
/**
 * KeyboardEvents class enables you to bind key action desired key combinations for ex., Ctrl+A, Delete, Alt+Space etc.
 * ```html
 * <div id='testEle'>  </div>;
 * <script>
 *   let node: HTMLElement = document.querySelector('#testEle');
 *   let kbInstance = new KeyboardEvents({
 *       element: node,
 *       keyConfigs:{ selectAll : 'ctrl+a' },
 *       keyAction: function (e:KeyboardEvent, action:string) {
 *           // handler function code
 *       }
 *   });
 * </script>
 * ```
 *
 * @hidden

 */
export declare class KeyboardEvents extends Base<HTMLElement> implements INotifyPropertyChanged {
    /**
     * Specifies key combination and it respective action name.
     *
     * @default null
     */
    keyConfigs: {
        [key: string]: string;
    };
    /**
     * Specifies on which event keyboardEvents class should listen for key press. For ex., `keyup`, `keydown` or `keypress`
     *
     * @default 'keyup'
     */
    eventName: string;
    /**
     * Specifies the listener when keyboard actions is performed.
     *
     * @event 'keyAction'
     */
    keyAction: EmitType<KeyboardEventArgs>;
    /**
     * Initializes the KeyboardEvents
     *
     * @param {HTMLElement} element - specifies the elements.
     * @param {KeyboardEventsModel} options - specify the options
     */
    constructor(element: HTMLElement, options?: KeyboardEventsModel);
    /**
     * Unwire bound events and destroy the instance.
     *
     * @returns {void}
     */
    destroy(): void;
    /**
     * Function can be used to specify certain action if a property is changed
     *
     * @param {KeyboardEventsModel} newProp - specifies the keyboard event.
     * @param {KeyboardEventsModel} oldProp - specifies the old property.
     * @returns {void}
     * @private
     */
    onPropertyChanged(newProp: KeyboardEventsModel, oldProp?: KeyboardEventsModel): void;
    protected bind(): void;
    /**
     * To get the module name, returns 'keyboard'.
     *
     * @returns {void}
     */
    getModuleName(): string;
    /**
     * Wiring event handlers to events
     *
     * @returns {void}
     */
    private wireEvents;
    /**
     * Unwiring event handlers to events
     *
     * @returns {void}
     */
    private unwireEvents;
    /**
     * To handle a key press event returns null
     *
     * @param {KeyboardEventArgs} e - specifies the event arguments.
     * @returns {void}
     */
    private keyPressHandler;
    private static configCache;
    /**
     * To get the key configuration data
     *
     * @param {string} config - configuration data
     * @returns {KeyData} - specifies the key data
     */
    private static getKeyConfigData;
    private static getKeyCode;
}
