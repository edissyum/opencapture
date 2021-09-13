import { ElementRef, OnDestroy, Renderer2, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { NgxUiLoaderService } from './ngx-ui-loader.service';
import * as ɵngcc0 from '@angular/core';
export declare class NgxUiLoaderBlurredDirective implements OnInit, OnDestroy {
    private elementRef;
    private renderer;
    private loader;
    blur: number;
    loaderId: string;
    showForegroundWatcher: Subscription;
    fastFadeOut: boolean;
    constructor(elementRef: ElementRef, renderer: Renderer2, loader: NgxUiLoaderService);
    /**
     * On Init event
     */
    ngOnInit(): void;
    /**
     * On destroy event
     */
    ngOnDestroy(): void;
    static ɵfac: ɵngcc0.ɵɵFactoryDef<NgxUiLoaderBlurredDirective, never>;
    static ɵdir: ɵngcc0.ɵɵDirectiveDefWithMeta<NgxUiLoaderBlurredDirective, "[ngxUiLoaderBlurred]", never, { "blur": "blur"; "loaderId": "loaderId"; }, {}, never>;
}

//# sourceMappingURL=ngx-ui-loader-blurred.directive.d.ts.map