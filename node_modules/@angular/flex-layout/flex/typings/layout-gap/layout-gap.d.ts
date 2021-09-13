/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ElementRef, OnDestroy, NgZone, AfterContentInit } from '@angular/core';
import { Directionality } from '@angular/cdk/bidi';
import { BaseDirective2, StyleBuilder, StyleDefinition, StyleUtils, MediaMarshaller, ElementMatcher } from '@angular/flex-layout/core';
import { Subject } from 'rxjs';
import * as ɵngcc0 from '@angular/core';
export interface LayoutGapParent {
    directionality: string;
    items: HTMLElement[];
    layout: string;
}
export declare class LayoutGapStyleBuilder extends StyleBuilder {
    private _styler;
    constructor(_styler: StyleUtils);
    buildStyles(gapValue: string, parent: LayoutGapParent): StyleDefinition;
    sideEffect(gapValue: string, _styles: StyleDefinition, parent: LayoutGapParent): void;
    static ɵfac: ɵngcc0.ɵɵFactoryDef<LayoutGapStyleBuilder, never>;
}
/**
 * 'layout-padding' styling directive
 *  Defines padding of child elements in a layout container
 */
export declare class LayoutGapDirective extends BaseDirective2 implements AfterContentInit, OnDestroy {
    protected zone: NgZone;
    protected directionality: Directionality;
    protected styleUtils: StyleUtils;
    protected layout: string;
    protected DIRECTIVE_KEY: string;
    protected observerSubject: Subject<void>;
    /** Special accessor to query for all child 'element' nodes regardless of type, class, etc */
    protected get childrenNodes(): HTMLElement[];
    constructor(elRef: ElementRef, zone: NgZone, directionality: Directionality, styleUtils: StyleUtils, styleBuilder: LayoutGapStyleBuilder, marshal: MediaMarshaller);
    ngAfterContentInit(): void;
    ngOnDestroy(): void;
    /**
     * Cache the parent container 'flex-direction' and update the 'margin' styles
     */
    protected onLayoutChange(matcher: ElementMatcher): void;
    /**
     *
     */
    protected updateWithValue(value: string): void;
    /** We need to override clearStyles because in most cases mru isn't populated */
    protected clearStyles(): void;
    /** Determine if an element will show or hide based on current activation */
    protected willDisplay(source: HTMLElement): boolean;
    protected buildChildObservable(): void;
    protected observer?: MutationObserver;
    static ɵfac: ɵngcc0.ɵɵFactoryDef<LayoutGapDirective, never>;
    static ɵdir: ɵngcc0.ɵɵDirectiveDefWithMeta<LayoutGapDirective, never, never, {}, {}, never>;
}
export declare class DefaultLayoutGapDirective extends LayoutGapDirective {
    protected inputs: string[];
    static ɵfac: ɵngcc0.ɵɵFactoryDef<DefaultLayoutGapDirective, never>;
    static ɵdir: ɵngcc0.ɵɵDirectiveDefWithMeta<DefaultLayoutGapDirective, "  [fxLayoutGap], [fxLayoutGap.xs], [fxLayoutGap.sm], [fxLayoutGap.md],  [fxLayoutGap.lg], [fxLayoutGap.xl], [fxLayoutGap.lt-sm], [fxLayoutGap.lt-md],  [fxLayoutGap.lt-lg], [fxLayoutGap.lt-xl], [fxLayoutGap.gt-xs], [fxLayoutGap.gt-sm],  [fxLayoutGap.gt-md], [fxLayoutGap.gt-lg]", never, { "fxLayoutGap": "fxLayoutGap"; "fxLayoutGap.xs": "fxLayoutGap.xs"; "fxLayoutGap.sm": "fxLayoutGap.sm"; "fxLayoutGap.md": "fxLayoutGap.md"; "fxLayoutGap.lg": "fxLayoutGap.lg"; "fxLayoutGap.xl": "fxLayoutGap.xl"; "fxLayoutGap.lt-sm": "fxLayoutGap.lt-sm"; "fxLayoutGap.lt-md": "fxLayoutGap.lt-md"; "fxLayoutGap.lt-lg": "fxLayoutGap.lt-lg"; "fxLayoutGap.lt-xl": "fxLayoutGap.lt-xl"; "fxLayoutGap.gt-xs": "fxLayoutGap.gt-xs"; "fxLayoutGap.gt-sm": "fxLayoutGap.gt-sm"; "fxLayoutGap.gt-md": "fxLayoutGap.gt-md"; "fxLayoutGap.gt-lg": "fxLayoutGap.gt-lg"; }, {}, never>;
}

//# sourceMappingURL=layout-gap.d.ts.map