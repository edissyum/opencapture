import { SentinelInfo } from '../base/type';
import { InterSection } from '../base/interface';
export declare type ScrollDirection = 'up' | 'down' | 'right' | 'left';
/**
 * InterSectionObserver - class watch whether it enters the viewport.
 *
 * @hidden
 */
export declare class InterSectionObserver {
    private containerRect;
    private movableContainerRect;
    private element;
    private movableEle;
    private fromWheel;
    private touchMove;
    private options;
    sentinelInfo: SentinelInfo;
    constructor(element: HTMLElement, options: InterSection, movableEle?: HTMLElement);
    observe(callback: Function, onEnterCallback: Function): void;
    check(direction: ScrollDirection): boolean;
    private virtualScrollHandler;
    setPageHeight(value: number): void;
}
