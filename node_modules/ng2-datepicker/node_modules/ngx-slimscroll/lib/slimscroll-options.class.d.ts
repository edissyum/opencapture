import { InjectionToken } from '@angular/core';
export interface ISlimScrollOptions {
    position?: 'left' | 'right';
    barBackground?: string;
    barOpacity?: string;
    barWidth?: string;
    barBorderRadius?: string;
    barMargin?: string;
    gridBackground?: string;
    gridOpacity?: string;
    gridWidth?: string;
    gridBorderRadius?: string;
    gridMargin?: string;
    alwaysVisible?: boolean;
    visibleTimeout?: number;
    alwaysPreventDefaultScroll?: boolean;
}
export declare const SLIMSCROLL_DEFAULTS: InjectionToken<ISlimScrollOptions>;
export declare class SlimScrollOptions implements ISlimScrollOptions {
    position?: 'left' | 'right';
    barBackground?: string;
    barOpacity?: string;
    barWidth?: string;
    barBorderRadius?: string;
    barMargin?: string;
    gridBackground?: string;
    gridOpacity?: string;
    gridWidth?: string;
    gridBorderRadius?: string;
    gridMargin?: string;
    alwaysVisible?: boolean;
    visibleTimeout?: number;
    alwaysPreventDefaultScroll?: boolean;
    constructor(obj?: ISlimScrollOptions);
    merge(obj?: ISlimScrollOptions): SlimScrollOptions;
}
