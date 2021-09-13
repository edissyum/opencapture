import { OnInit, OnChanges, SimpleChanges, OnDestroy, ChangeDetectorRef, TemplateRef } from '@angular/core';
import { DomSanitizer, SafeResourceUrl, SafeStyle } from '@angular/platform-browser';
import { NgxUiLoaderService } from './ngx-ui-loader.service';
import { Subscription } from 'rxjs';
import { NgxUiLoaderConfig } from '../utils/interfaces';
import { DirectionType, PositionType, SpinnerType } from '../utils/types';
import * as ɵngcc0 from '@angular/core';
export declare class NgxUiLoaderComponent implements OnChanges, OnDestroy, OnInit {
    private domSanitizer;
    private changeDetectorRef;
    private ngxService;
    bgsColor: string;
    bgsOpacity: number;
    bgsPosition: PositionType;
    bgsSize: number;
    bgsTemplate: TemplateRef<any>;
    bgsType: SpinnerType;
    fgsColor: string;
    fgsPosition: PositionType;
    fgsSize: number;
    fgsTemplate: TemplateRef<any>;
    fgsType: SpinnerType;
    gap: number;
    loaderId: string;
    logoPosition: PositionType;
    logoSize: number;
    logoUrl: string;
    overlayBorderRadius: string;
    overlayColor: string;
    pbColor: string;
    pbDirection: DirectionType;
    pbThickness: number;
    hasProgressBar: boolean;
    text: string;
    textColor: string;
    textPosition: PositionType;
    fastFadeOut: boolean;
    fgDivs: number[];
    fgSpinnerClass: string;
    bgDivs: number[];
    bgSpinnerClass: string;
    showForeground: boolean;
    showBackground: boolean;
    foregroundClosing: boolean;
    backgroundClosing: boolean;
    trustedLogoUrl: SafeResourceUrl;
    logoTop: SafeStyle;
    spinnerTop: SafeStyle;
    textTop: SafeStyle;
    showForegroundWatcher: Subscription;
    showBackgroundWatcher: Subscription;
    foregroundClosingWatcher: Subscription;
    backgroundClosingWatcher: Subscription;
    defaultConfig: NgxUiLoaderConfig;
    initialized: boolean;
    /**
     * Constructor
     */
    constructor(domSanitizer: DomSanitizer, changeDetectorRef: ChangeDetectorRef, ngxService: NgxUiLoaderService);
    /**
     * On init event
     */
    ngOnInit(): void;
    /**
     * On changes event
     */
    ngOnChanges(changes: SimpleChanges): void;
    /**
     * On destroy event
     */
    ngOnDestroy(): void;
    /**
     * Initialize spinners
     */
    private initializeSpinners;
    /**
     * Determine the positions of spinner, logo and text
     */
    private determinePositions;
    static ɵfac: ɵngcc0.ɵɵFactoryDef<NgxUiLoaderComponent, never>;
    static ɵcmp: ɵngcc0.ɵɵComponentDefWithMeta<NgxUiLoaderComponent, "ngx-ui-loader", never, { "bgsColor": "bgsColor"; "bgsOpacity": "bgsOpacity"; "bgsPosition": "bgsPosition"; "bgsSize": "bgsSize"; "bgsType": "bgsType"; "fgsColor": "fgsColor"; "fgsPosition": "fgsPosition"; "fgsSize": "fgsSize"; "fgsType": "fgsType"; "gap": "gap"; "loaderId": "loaderId"; "logoPosition": "logoPosition"; "logoSize": "logoSize"; "logoUrl": "logoUrl"; "overlayBorderRadius": "overlayBorderRadius"; "overlayColor": "overlayColor"; "pbColor": "pbColor"; "pbDirection": "pbDirection"; "pbThickness": "pbThickness"; "hasProgressBar": "hasProgressBar"; "text": "text"; "textColor": "textColor"; "textPosition": "textPosition"; "bgsTemplate": "bgsTemplate"; "fgsTemplate": "fgsTemplate"; }, {}, never, never>;
}

//# sourceMappingURL=ngx-ui-loader.component.d.ts.map