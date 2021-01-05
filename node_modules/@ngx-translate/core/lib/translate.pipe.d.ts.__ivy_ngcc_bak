import { ChangeDetectorRef, OnDestroy, PipeTransform } from '@angular/core';
import { TranslateService } from './translate.service';
import { Subscription } from 'rxjs';
export declare class TranslatePipe implements PipeTransform, OnDestroy {
    private translate;
    private _ref;
    value: string;
    lastKey: string;
    lastParams: any[];
    onTranslationChange: Subscription;
    onLangChange: Subscription;
    onDefaultLangChange: Subscription;
    constructor(translate: TranslateService, _ref: ChangeDetectorRef);
    updateValue(key: string, interpolateParams?: Object, translations?: any): void;
    transform(query: string, ...args: any[]): any;
    /**
     * Clean any existing subscription to change events
     */
    private _dispose;
    ngOnDestroy(): void;
}
