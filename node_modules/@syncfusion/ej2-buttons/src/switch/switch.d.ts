import { Component, INotifyPropertyChanged } from '@syncfusion/ej2-base';
import { EmitType } from '@syncfusion/ej2-base';
import { SwitchModel } from './switch-model';
import { ChangeEventArgs } from './../common/common';
/**
 * The Switch is a graphical user interface element that allows you to toggle between checked and unchecked states.
 * ```html
 * <input type="checkbox" id="switch"/>
 * <script>
 * var switchObj = new Switch({});
 * switchObj.appendTo("#switch");
 * </script>
 * ```
 */
export declare class Switch extends Component<HTMLInputElement> implements INotifyPropertyChanged {
    private tagName;
    private isFocused;
    private isDrag;
    private delegateMouseUpHandler;
    private delegateKeyUpHandler;
    private formElement;
    private initialSwitchCheckedValue;
    /**
     * Triggers when Switch state has been changed by user interaction.
     * @event
     */
    change: EmitType<ChangeEventArgs>;
    /**
     * Triggers once the component rendering is completed.
     * @event
     */
    created: EmitType<Event>;
    /**
     * Specifies a value that indicates whether the Switch is `checked` or not.
     * When set to `true`, the Switch will be in `checked` state.
     * @default false
     */
    checked: boolean;
    /**
     * You can add custom styles to the Switch by using this property.
     * @default ''
     */
    cssClass: string;
    /**
     * Specifies a value that indicates whether the Switch is `disabled` or not.
     * When set to `true`, the Switch will be in `disabled` state.
     * @default false
     */
    disabled: boolean;
    /**
     * Defines `name` attribute for the Switch.
     * It is used to reference form data (Switch value) after a form is submitted.
     * @default ''
     */
    name: string;
    /**
     * Specifies a text that indicates the Switch is in checked state.
     * @default ''
     */
    onLabel: string;
    /**
     * Specifies a text that indicates the Switch is in unchecked state.
     * @default ''
     */
    offLabel: string;
    /**
     * Defines `value` attribute for the Switch.
     * It is a form data passed to the server when submitting the form.
     * @default ''
     */
    value: string;
    /**
     * Constructor for creating the widget.
     * @private
     */
    constructor(options?: SwitchModel, element?: string | HTMLInputElement);
    private changeState;
    private clickHandler;
    /**
     * Destroys the Switch widget.
     * @returns void
     */
    destroy(): void;
    private focusHandler;
    private focusOutHandler;
    /**
     * Gets the module name.
     * @private
     */
    protected getModuleName(): string;
    /**
     * Gets the properties to be maintained in the persistence state.
     * @private
     */
    getPersistData(): string;
    private getWrapper;
    private initialize;
    private initWrapper;
    /**
     * Called internally if any of the property value changes.
     * @private
     */
    onPropertyChanged(newProp: SwitchModel, oldProp: SwitchModel): void;
    /**
     * Initialize Angular, React and Unique ID support.
     * @private
     */
    protected preRender(): void;
    /**
     * Initialize control rendering.
     * @private
     */
    protected render(): void;
    private rippleHandler;
    private rippleTouchHandler;
    private setDisabled;
    private setLabel;
    private switchFocusHandler;
    private switchMouseUp;
    private formResetHandler;
    /**
     * Toggle the Switch component state into checked/unchecked.
     * @returns void
     */
    toggle(): void;
    private wireEvents;
    private unWireEvents;
    /**
     * Click the switch element
     * its native method
     * @public
     */
    click(): void;
    /**
     * Sets the focus to Switch
     * its native method
     * @public
     */
    focusIn(): void;
}
