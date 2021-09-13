import { VScroll } from './v-scroll';
import { HScroll } from './h-scroll';
/**
 * Used to add scroll in menu.
 * @hidden
 */
export declare function addScrolling(createElement: createElementType, container: HTMLElement, content: HTMLElement, scrollType: string, enableRtl: boolean, offset?: number): HTMLElement;
/**
 * Used to destroy the scroll option.
 * @hidden
 */
export declare function destroyScroll(scrollObj: VScroll | HScroll, element: Element, skipEle?: HTMLElement): void;
declare type createElementType = (tag: string, prop?: {
    className?: string;
}) => HTMLElement;
export {};
