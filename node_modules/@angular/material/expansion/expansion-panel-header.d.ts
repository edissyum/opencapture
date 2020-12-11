/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { FocusableOption, FocusMonitor, FocusOrigin } from '@angular/cdk/a11y';
import { AfterViewInit, ChangeDetectorRef, ElementRef, OnDestroy } from '@angular/core';
import { MatAccordionTogglePosition } from './accordion-base';
import { MatExpansionPanel, MatExpansionPanelDefaultOptions } from './expansion-panel';
/**
 * Header element of a `<mat-expansion-panel>`.
 */
import * as ɵngcc0 from '@angular/core';
export declare class MatExpansionPanelHeader implements AfterViewInit, OnDestroy, FocusableOption {
    panel: MatExpansionPanel;
    private _element;
    private _focusMonitor;
    private _changeDetectorRef;
    _animationMode?: string | undefined;
    private _parentChangeSubscription;
    constructor(panel: MatExpansionPanel, _element: ElementRef, _focusMonitor: FocusMonitor, _changeDetectorRef: ChangeDetectorRef, defaultOptions?: MatExpansionPanelDefaultOptions, _animationMode?: string | undefined);
    /** Height of the header while the panel is expanded. */
    expandedHeight: string;
    /** Height of the header while the panel is collapsed. */
    collapsedHeight: string;
    /**
     * Whether the associated panel is disabled. Implemented as a part of `FocusableOption`.
     * @docs-private
     */
    get disabled(): any;
    /** Toggles the expanded state of the panel. */
    _toggle(): void;
    /** Gets whether the panel is expanded. */
    _isExpanded(): boolean;
    /** Gets the expanded state string of the panel. */
    _getExpandedState(): string;
    /** Gets the panel id. */
    _getPanelId(): string;
    /** Gets the toggle position for the header. */
    _getTogglePosition(): MatAccordionTogglePosition;
    /** Gets whether the expand indicator should be shown. */
    _showToggle(): boolean;
    /**
     * Gets the current height of the header. Null if no custom height has been
     * specified, and if the default height from the stylesheet should be used.
     */
    _getHeaderHeight(): string | null;
    /** Handle keydown event calling to toggle() if appropriate. */
    _keydown(event: KeyboardEvent): void;
    /**
     * Focuses the panel header. Implemented as a part of `FocusableOption`.
     * @param origin Origin of the action that triggered the focus.
     * @docs-private
     */
    focus(origin?: FocusOrigin, options?: FocusOptions): void;
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    static ɵfac: ɵngcc0.ɵɵFactoryDef<MatExpansionPanelHeader, [{ host: true; }, null, null, null, { optional: true; }, { optional: true; }]>;
    static ɵcmp: ɵngcc0.ɵɵComponentDefWithMeta<MatExpansionPanelHeader, "mat-expansion-panel-header", never, { "expandedHeight": "expandedHeight"; "collapsedHeight": "collapsedHeight"; }, {}, never, ["mat-panel-title", "mat-panel-description", "*"]>;
}
/**
 * Description element of a `<mat-expansion-panel-header>`.
 */
export declare class MatExpansionPanelDescription {
    static ɵfac: ɵngcc0.ɵɵFactoryDef<MatExpansionPanelDescription, never>;
    static ɵdir: ɵngcc0.ɵɵDirectiveDefWithMeta<MatExpansionPanelDescription, "mat-panel-description", never, {}, {}, never>;
}
/**
 * Title element of a `<mat-expansion-panel-header>`.
 */
export declare class MatExpansionPanelTitle {
    static ɵfac: ɵngcc0.ɵɵFactoryDef<MatExpansionPanelTitle, never>;
    static ɵdir: ɵngcc0.ɵɵDirectiveDefWithMeta<MatExpansionPanelTitle, "mat-panel-title", never, {}, {}, never>;
}

//# sourceMappingURL=expansion-panel-header.d.ts.map