import { OnInit, OnChanges, SimpleChanges, OnDestroy, ChangeDetectorRef, TemplateRef } from '@angular/core';
import { DomSanitizer, SafeResourceUrl, SafeStyle } from '@angular/platform-browser';
import { NgxUiLoaderService } from './ngx-ui-loader.service';
import { Subscription } from 'rxjs';
import { NgxUiLoaderConfig } from '../utils/interfaces';
import { DirectionType, PositionType, SpinnerType } from '../utils/types';
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
}
