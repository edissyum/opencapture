import { ChildProperty, BaseEventArgs } from '@syncfusion/ej2-base';
import { Diagram } from '../diagram';
import { Position } from '@syncfusion/ej2-popups';
import { Effect } from '@syncfusion/ej2-base';
/**
 * Applicable tip positions attached to the Tooltip.
 *
 * @private
 */
export declare type TipPointerPosition = 'Auto' | 'Start' | 'Middle' | 'End';
/**
 * Animation options that are common for both open and close actions of the Tooltip
 *
 *  @private
 */
export declare class BlazorAnimation extends ChildProperty<BlazorAnimation> {
    /**
     * Animation settings to be applied on the Tooltip, while it is being shown over the target.
     *
     * @ignoreapilink
     */
    open: TooltipAnimationSettings;
    /**
     * Animation settings to be applied on the Tooltip, when it is closed.
     *
     * @ignoreapilink
     */
    close: TooltipAnimationSettings;
}
/**
 * Interface for Tooltip event arguments.
 *
 * @private
 */
export interface TooltipEventArgs extends BaseEventArgs {
    /**
     * It is used to denote the type of the triggered event.
     */
    type: String;
    /**
     * It illustrates whether the current action needs to be prevented or not.
     */
    cancel: boolean;
    /**
     * It is used to specify the current event object.
     */
    event: Event;
    /**
     * It is used to denote the current target element where the Tooltip is to be displayed.
     */
    target: HTMLElement;
    /**
     * It is used to denote the Tooltip element
     */
    element: HTMLElement;
    /**
     * It is used to denote the Collided Tooltip position
     *
     */
    collidedPosition?: string;
    /**
     * If the event is triggered by interaction, it returns true. Otherwise, it returns false.
     *
     */
    isInteracted?: boolean;
}
/**
 * Animation options that are common for both open and close actions of the Tooltip.
 *
 * @private
 */
export interface TooltipAnimationSettings {
    /**
     * It is used to apply the Animation effect on the Tooltip, during open and close actions.
     */
    effect?: Effect;
    /**
     * It is used to denote the duration of the animation that is completed per animation cycle.
     */
    duration?: number;
    /**
     * It is used to denote the delay value in milliseconds and indicating the waiting time before animation begins.
     */
    delay?: number;
}
/**
 *  @private
 */
export declare class BlazorTooltip {
    private tooltipEle;
    private ctrlId;
    private tipClass;
    private tooltipPositionX;
    private tooltipPositionY;
    private tooltipEventArgs;
    private isHidden;
    private showTimer;
    private hideTimer;
    private tipWidth;
    private touchModule;
    private tipHeight;
    private isBlazorTemplate;
    private isBlazorTooltip;
    private contentEvent;
    /** @private */
    width: string | number;
    /** @private */
    height: string | number;
    /** @private */
    content: string | HTMLElement;
    /** @private */
    target: string;
    /** @private */
    position: Position;
    /** @private */
    offsetX: number;
    /** @private */
    offsetY: number;
    /** @private */
    tipPointerPosition: TipPointerPosition;
    /** @private */
    openDelay: number;
    /** @private */
    closeDelay: number;
    /** @private */
    cssClass: string;
    /** @private */
    element: Diagram;
    /** @private */
    animation: BlazorAnimation;
    /** @private */
    showTipPointer: boolean;
    constructor(diagram: Diagram);
    /**
     *  @private
     */
    open(target: HTMLElement, showAnimation: TooltipAnimationSettings, e?: Event): void;
    /**
     *  @private
     */
    updateTooltip(target: HTMLElement): void;
    private formatPosition;
    /**
     *  @private
     */
    destroy(): void;
    /**
     *  @private
     */
    close(): void;
    /**
     *  @private
     */
    showTooltip(target: HTMLElement, showAnimation: TooltipAnimationSettings, e?: Event): void;
    private beforeRenderCallback;
    private afterRenderBlazor;
    private setTipClass;
    private renderArrow;
    private getTooltipPosition;
    private checkCollision;
    private collisionFlipFit;
    private calculateTooltipOffset;
    private reposition;
    private beforeRenderBlazor;
    private addDescribedBy;
    private renderContent;
    private updateTipPosition;
    private adjustArrow;
    /**
     * Returns the module name of the blazor tooltip
     *
     * @returns {string}  Returns the module name of the blazor tooltip
     */
    getModuleName(): string;
}
