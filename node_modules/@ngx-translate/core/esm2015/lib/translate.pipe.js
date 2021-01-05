/**
 * @fileoverview added by tsickle
 * Generated from: lib/translate.pipe.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { ChangeDetectorRef, Injectable, Pipe } from '@angular/core';
import { isObservable } from 'rxjs';
import { TranslateService } from './translate.service';
import { equals, isDefined } from './util';
export class TranslatePipe {
    /**
     * @param {?} translate
     * @param {?} _ref
     */
    constructor(translate, _ref) {
        this.translate = translate;
        this._ref = _ref;
        this.value = '';
    }
    /**
     * @param {?} key
     * @param {?=} interpolateParams
     * @param {?=} translations
     * @return {?}
     */
    updateValue(key, interpolateParams, translations) {
        /** @type {?} */
        let onTranslation = (/**
         * @param {?} res
         * @return {?}
         */
        (res) => {
            this.value = res !== undefined ? res : key;
            this.lastKey = key;
            this._ref.markForCheck();
        });
        if (translations) {
            /** @type {?} */
            let res = this.translate.getParsedResult(translations, key, interpolateParams);
            if (isObservable(res.subscribe)) {
                res.subscribe(onTranslation);
            }
            else {
                onTranslation(res);
            }
        }
        this.translate.get(key, interpolateParams).subscribe(onTranslation);
    }
    /**
     * @param {?} query
     * @param {...?} args
     * @return {?}
     */
    transform(query, ...args) {
        if (!query || !query.length) {
            return query;
        }
        // if we ask another time for the same key, return the last value
        if (equals(query, this.lastKey) && equals(args, this.lastParams)) {
            return this.value;
        }
        /** @type {?} */
        let interpolateParams;
        if (isDefined(args[0]) && args.length) {
            if (typeof args[0] === 'string' && args[0].length) {
                // we accept objects written in the template such as {n:1}, {'n':1}, {n:'v'}
                // which is why we might need to change it to real JSON objects such as {"n":1} or {"n":"v"}
                /** @type {?} */
                let validArgs = args[0]
                    .replace(/(\')?([a-zA-Z0-9_]+)(\')?(\s)?:/g, '"$2":')
                    .replace(/:(\s)?(\')(.*?)(\')/g, ':"$3"');
                try {
                    interpolateParams = JSON.parse(validArgs);
                }
                catch (e) {
                    throw new SyntaxError(`Wrong parameter in TranslatePipe. Expected a valid Object, received: ${args[0]}`);
                }
            }
            else if (typeof args[0] === 'object' && !Array.isArray(args[0])) {
                interpolateParams = args[0];
            }
        }
        // store the query, in case it changes
        this.lastKey = query;
        // store the params, in case they change
        this.lastParams = args;
        // set the value
        this.updateValue(query, interpolateParams);
        // if there is a subscription to onLangChange, clean it
        this._dispose();
        // subscribe to onTranslationChange event, in case the translations change
        if (!this.onTranslationChange) {
            this.onTranslationChange = this.translate.onTranslationChange.subscribe((/**
             * @param {?} event
             * @return {?}
             */
            (event) => {
                if (this.lastKey && event.lang === this.translate.currentLang) {
                    this.lastKey = null;
                    this.updateValue(query, interpolateParams, event.translations);
                }
            }));
        }
        // subscribe to onLangChange event, in case the language changes
        if (!this.onLangChange) {
            this.onLangChange = this.translate.onLangChange.subscribe((/**
             * @param {?} event
             * @return {?}
             */
            (event) => {
                if (this.lastKey) {
                    this.lastKey = null; // we want to make sure it doesn't return the same value until it's been updated
                    this.updateValue(query, interpolateParams, event.translations);
                }
            }));
        }
        // subscribe to onDefaultLangChange event, in case the default language changes
        if (!this.onDefaultLangChange) {
            this.onDefaultLangChange = this.translate.onDefaultLangChange.subscribe((/**
             * @return {?}
             */
            () => {
                if (this.lastKey) {
                    this.lastKey = null; // we want to make sure it doesn't return the same value until it's been updated
                    this.updateValue(query, interpolateParams);
                }
            }));
        }
        return this.value;
    }
    /**
     * Clean any existing subscription to change events
     * @private
     * @return {?}
     */
    _dispose() {
        if (typeof this.onTranslationChange !== 'undefined') {
            this.onTranslationChange.unsubscribe();
            this.onTranslationChange = undefined;
        }
        if (typeof this.onLangChange !== 'undefined') {
            this.onLangChange.unsubscribe();
            this.onLangChange = undefined;
        }
        if (typeof this.onDefaultLangChange !== 'undefined') {
            this.onDefaultLangChange.unsubscribe();
            this.onDefaultLangChange = undefined;
        }
    }
    /**
     * @return {?}
     */
    ngOnDestroy() {
        this._dispose();
    }
}
TranslatePipe.decorators = [
    { type: Injectable },
    { type: Pipe, args: [{
                name: 'translate',
                pure: false // required to update the value when the promise is resolved
            },] }
];
/** @nocollapse */
TranslatePipe.ctorParameters = () => [
    { type: TranslateService },
    { type: ChangeDetectorRef }
];
if (false) {
    /** @type {?} */
    TranslatePipe.prototype.value;
    /** @type {?} */
    TranslatePipe.prototype.lastKey;
    /** @type {?} */
    TranslatePipe.prototype.lastParams;
    /** @type {?} */
    TranslatePipe.prototype.onTranslationChange;
    /** @type {?} */
    TranslatePipe.prototype.onLangChange;
    /** @type {?} */
    TranslatePipe.prototype.onDefaultLangChange;
    /**
     * @type {?}
     * @private
     */
    TranslatePipe.prototype.translate;
    /**
     * @type {?}
     * @private
     */
    TranslatePipe.prototype._ref;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNsYXRlLnBpcGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9uZ3gtdHJhbnNsYXRlL2NvcmUvc3JjL2xpYi90cmFuc2xhdGUucGlwZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLE9BQU8sRUFBQyxpQkFBaUIsRUFBZ0IsVUFBVSxFQUFhLElBQUksRUFBZ0IsTUFBTSxlQUFlLENBQUM7QUFDMUcsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUNsQyxPQUFPLEVBQTBDLGdCQUFnQixFQUF5QixNQUFNLHFCQUFxQixDQUFDO0FBQ3RILE9BQU8sRUFBQyxNQUFNLEVBQUUsU0FBUyxFQUFDLE1BQU0sUUFBUSxDQUFDO0FBUXpDLE1BQU0sT0FBTyxhQUFhOzs7OztJQVF4QixZQUFvQixTQUEyQixFQUFVLElBQXVCO1FBQTVELGNBQVMsR0FBVCxTQUFTLENBQWtCO1FBQVUsU0FBSSxHQUFKLElBQUksQ0FBbUI7UUFQaEYsVUFBSyxHQUFXLEVBQUUsQ0FBQztJQVFuQixDQUFDOzs7Ozs7O0lBRUQsV0FBVyxDQUFDLEdBQVcsRUFBRSxpQkFBMEIsRUFBRSxZQUFrQjs7WUFDakUsYUFBYTs7OztRQUFHLENBQUMsR0FBVyxFQUFFLEVBQUU7WUFDbEMsSUFBSSxDQUFDLEtBQUssR0FBRyxHQUFHLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztZQUMzQyxJQUFJLENBQUMsT0FBTyxHQUFHLEdBQUcsQ0FBQztZQUNuQixJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQzNCLENBQUMsQ0FBQTtRQUNELElBQUksWUFBWSxFQUFFOztnQkFDWixHQUFHLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsWUFBWSxFQUFFLEdBQUcsRUFBRSxpQkFBaUIsQ0FBQztZQUM5RSxJQUFJLFlBQVksQ0FB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QUFDLFdBQVcsRUFBRSxDQUFDO1lBQ3ZDLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxTQUFTLENBQUM7U0FDdEM7SUFDSCxDQUFDOzs7O0lBRUQsV0FBVztRQUNULElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUNsQixDQUFDOzs7WUE5SEYsVUFBVTtZQUNWLElBQUksU0FBQztnQkFDSixJQUFJLEVBQUUsV0FBVztnQkFDakIsSUFBSSxFQUFFLEtBQUssQ0FBQyw0REFBNEQ7YUFDekU7Ozs7WUFSZ0QsZ0JBQWdCO1lBRnpELGlCQUFpQjs7OztJQVl2Qiw4QkFBbUI7O0lBQ25CLGdDQUFnQjs7SUFDaEIsbUNBQWtCOztJQUNsQiw0Q0FBa0M7O0lBQ2xDLHFDQUEyQjs7SUFDM0IsNENBQWtDOzs7OztJQUV0QixrQ0FBbUM7Ozs7O0lBQUUsNkJBQStCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtDaGFuZ2VEZXRlY3RvclJlZiwgRXZlbnRFbWl0dGVyLCBJbmplY3RhYmxlLCBPbkRlc3Ryb3ksIFBpcGUsIFBpcGVUcmFuc2Zvcm19IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtpc09ic2VydmFibGV9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHtEZWZhdWx0TGFuZ0NoYW5nZUV2ZW50LCBMYW5nQ2hhbmdlRXZlbnQsIFRyYW5zbGF0ZVNlcnZpY2UsIFRyYW5zbGF0aW9uQ2hhbmdlRXZlbnR9IGZyb20gJy4vdHJhbnNsYXRlLnNlcnZpY2UnO1xuaW1wb3J0IHtlcXVhbHMsIGlzRGVmaW5lZH0gZnJvbSAnLi91dGlsJztcbmltcG9ydCB7IFN1YnNjcmlwdGlvbiB9IGZyb20gJ3J4anMnO1xuXG5ASW5qZWN0YWJsZSgpXG5AUGlwZSh7XG4gIG5hbWU6ICd0cmFuc2xhdGUnLFxuICBwdXJlOiBmYWxzZSAvLyByZXF1aXJlZCB0byB1cGRhdGUgdGhlIHZhbHVlIHdoZW4gdGhlIHByb21pc2UgaXMgcmVzb2x2ZWRcbn0pXG5leHBvcnQgY2xhc3MgVHJhbnNsYXRlUGlwZSBpbXBsZW1lbnRzIFBpcGVUcmFuc2Zvcm0sIE9uRGVzdHJveSB7XG4gIHZhbHVlOiBzdHJpbmcgPSAnJztcbiAgbGFzdEtleTogc3RyaW5nO1xuICBsYXN0UGFyYW1zOiBhbnlbXTtcbiAgb25UcmFuc2xhdGlvbkNoYW5nZTogU3Vic2NyaXB0aW9uO1xuICBvbkxhbmdDaGFuZ2U6IFN1YnNjcmlwdGlvbjtcbiAgb25EZWZhdWx0TGFuZ0NoYW5nZTogU3Vic2NyaXB0aW9uO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgdHJhbnNsYXRlOiBUcmFuc2xhdGVTZXJ2aWNlLCBwcml2YXRlIF9yZWY6IENoYW5nZURldGVjdG9yUmVmKSB7XG4gIH1cblxuICB1cGRhdGVWYWx1ZShrZXk6IHN0cmluZywgaW50ZXJwb2xhdGVQYXJhbXM/OiBPYmplY3QsIHRyYW5zbGF0aW9ucz86IGFueSk6IHZvaWQge1xuICAgIGxldCBvblRyYW5zbGF0aW9uID0gKHJlczogc3RyaW5nKSA9PiB7XG4gICAgICB0aGlzLnZhbHVlID0gcmVzICE9PSB1bmRlZmluZWQgPyByZXMgOiBrZXk7XG4gICAgICB0aGlzLmxhc3RLZXkgPSBrZXk7XG4gICAgICB0aGlzLl9yZWYubWFya0ZvckNoZWNrKCk7XG4gICAgfTtcbiAgICBpZiAodHJhbnNsYXRpb25zKSB7XG4gICAgICBsZXQgcmVzID0gdGhpcy50cmFuc2xhdGUuZ2V0UGFyc2VkUmVzdWx0KHRyYW5zbGF0aW9ucywga2V5LCBpbnRlcnBvbGF0ZVBhcmFtcyk7XG4gICAgICBpZiAoaXNPYnNlcnZhYmxlKHJlcy5zdWJzY3JpYmUpKSB7XG4gICAgICAgIHJlcy5zdWJzY3JpYmUob25UcmFuc2xhdGlvbik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBvblRyYW5zbGF0aW9uKHJlcyk7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMudHJhbnNsYXRlLmdldChrZXksIGludGVycG9sYXRlUGFyYW1zKS5zdWJzY3JpYmUob25UcmFuc2xhdGlvbik7XG4gIH1cblxuICB0cmFuc2Zvcm0ocXVlcnk6IHN0cmluZywgLi4uYXJnczogYW55W10pOiBhbnkge1xuICAgIGlmICghcXVlcnkgfHwgIXF1ZXJ5Lmxlbmd0aCkge1xuICAgICAgcmV0dXJuIHF1ZXJ5O1xuICAgIH1cblxuICAgIC8vIGlmIHdlIGFzayBhbm90aGVyIHRpbWUgZm9yIHRoZSBzYW1lIGtleSwgcmV0dXJuIHRoZSBsYXN0IHZhbHVlXG4gICAgaWYgKGVxdWFscyhxdWVyeSwgdGhpcy5sYXN0S2V5KSAmJiBlcXVhbHMoYXJncywgdGhpcy5sYXN0UGFyYW1zKSkge1xuICAgICAgcmV0dXJuIHRoaXMudmFsdWU7XG4gICAgfVxuXG4gICAgbGV0IGludGVycG9sYXRlUGFyYW1zOiBPYmplY3Q7XG4gICAgaWYgKGlzRGVmaW5lZChhcmdzWzBdKSAmJiBhcmdzLmxlbmd0aCkge1xuICAgICAgaWYgKHR5cGVvZiBhcmdzWzBdID09PSAnc3RyaW5nJyAmJiBhcmdzWzBdLmxlbmd0aCkge1xuICAgICAgICAvLyB3ZSBhY2NlcHQgb2JqZWN0cyB3cml0dGVuIGluIHRoZSB0ZW1wbGF0ZSBzdWNoIGFzIHtuOjF9LCB7J24nOjF9LCB7bjondid9XG4gICAgICAgIC8vIHdoaWNoIGlzIHdoeSB3ZSBtaWdodCBuZWVkIHRvIGNoYW5nZSBpdCB0byByZWFsIEpTT04gb2JqZWN0cyBzdWNoIGFzIHtcIm5cIjoxfSBvciB7XCJuXCI6XCJ2XCJ9XG4gICAgICAgIGxldCB2YWxpZEFyZ3M6IHN0cmluZyA9IGFyZ3NbMF1cbiAgICAgICAgICAucmVwbGFjZSgvKFxcJyk/KFthLXpBLVowLTlfXSspKFxcJyk/KFxccyk/Oi9nLCAnXCIkMlwiOicpXG4gICAgICAgICAgLnJlcGxhY2UoLzooXFxzKT8oXFwnKSguKj8pKFxcJykvZywgJzpcIiQzXCInKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBpbnRlcnBvbGF0ZVBhcmFtcyA9IEpTT04ucGFyc2UodmFsaWRBcmdzKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIHRocm93IG5ldyBTeW50YXhFcnJvcihgV3JvbmcgcGFyYW1ldGVyIGluIFRyYW5zbGF0ZVBpcGUuIEV4cGVjdGVkIGEgdmFsaWQgT2JqZWN0LCByZWNlaXZlZDogJHthcmdzWzBdfWApO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiBhcmdzWzBdID09PSAnb2JqZWN0JyAmJiAhQXJyYXkuaXNBcnJheShhcmdzWzBdKSkge1xuICAgICAgICBpbnRlcnBvbGF0ZVBhcmFtcyA9IGFyZ3NbMF07XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gc3RvcmUgdGhlIHF1ZXJ5LCBpbiBjYXNlIGl0IGNoYW5nZXNcbiAgICB0aGlzLmxhc3RLZXkgPSBxdWVyeTtcblxuICAgIC8vIHN0b3JlIHRoZSBwYXJhbXMsIGluIGNhc2UgdGhleSBjaGFuZ2VcbiAgICB0aGlzLmxhc3RQYXJhbXMgPSBhcmdzO1xuXG4gICAgLy8gc2V0IHRoZSB2YWx1ZVxuICAgIHRoaXMudXBkYXRlVmFsdWUocXVlcnksIGludGVycG9sYXRlUGFyYW1zKTtcblxuICAgIC8vIGlmIHRoZXJlIGlzIGEgc3Vic2NyaXB0aW9uIHRvIG9uTGFuZ0NoYW5nZSwgY2xlYW4gaXRcbiAgICB0aGlzLl9kaXNwb3NlKCk7XG5cbiAgICAvLyBzdWJzY3JpYmUgdG8gb25UcmFuc2xhdGlvbkNoYW5nZSBldmVudCwgaW4gY2FzZSB0aGUgdHJhbnNsYXRpb25zIGNoYW5nZVxuICAgIGlmICghdGhpcy5vblRyYW5zbGF0aW9uQ2hhbmdlKSB7XG4gICAgICB0aGlzLm9uVHJhbnNsYXRpb25DaGFuZ2UgPSB0aGlzLnRyYW5zbGF0ZS5vblRyYW5zbGF0aW9uQ2hhbmdlLnN1YnNjcmliZSgoZXZlbnQ6IFRyYW5zbGF0aW9uQ2hhbmdlRXZlbnQpID0+IHtcbiAgICAgICAgaWYgKHRoaXMubGFzdEtleSAmJiBldmVudC5sYW5nID09PSB0aGlzLnRyYW5zbGF0ZS5jdXJyZW50TGFuZykge1xuICAgICAgICAgIHRoaXMubGFzdEtleSA9IG51bGw7XG4gICAgICAgICAgdGhpcy51cGRhdGVWYWx1ZShxdWVyeSwgaW50ZXJwb2xhdGVQYXJhbXMsIGV2ZW50LnRyYW5zbGF0aW9ucyk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIHN1YnNjcmliZSB0byBvbkxhbmdDaGFuZ2UgZXZlbnQsIGluIGNhc2UgdGhlIGxhbmd1YWdlIGNoYW5nZXNcbiAgICBpZiAoIXRoaXMub25MYW5nQ2hhbmdlKSB7XG4gICAgICB0aGlzLm9uTGFuZ0NoYW5nZSA9IHRoaXMudHJhbnNsYXRlLm9uTGFuZ0NoYW5nZS5zdWJzY3JpYmUoKGV2ZW50OiBMYW5nQ2hhbmdlRXZlbnQpID0+IHtcbiAgICAgICAgaWYgKHRoaXMubGFzdEtleSkge1xuICAgICAgICAgIHRoaXMubGFzdEtleSA9IG51bGw7IC8vIHdlIHdhbnQgdG8gbWFrZSBzdXJlIGl0IGRvZXNuJ3QgcmV0dXJuIHRoZSBzYW1lIHZhbHVlIHVudGlsIGl0J3MgYmVlbiB1cGRhdGVkXG4gICAgICAgICAgdGhpcy51cGRhdGVWYWx1ZShxdWVyeSwgaW50ZXJwb2xhdGVQYXJhbXMsIGV2ZW50LnRyYW5zbGF0aW9ucyk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIHN1YnNjcmliZSB0byBvbkRlZmF1bHRMYW5nQ2hhbmdlIGV2ZW50LCBpbiBjYXNlIHRoZSBkZWZhdWx0IGxhbmd1YWdlIGNoYW5nZXNcbiAgICBpZiAoIXRoaXMub25EZWZhdWx0TGFuZ0NoYW5nZSkge1xuICAgICAgdGhpcy5vbkRlZmF1bHRMYW5nQ2hhbmdlID0gdGhpcy50cmFuc2xhdGUub25EZWZhdWx0TGFuZ0NoYW5nZS5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5sYXN0S2V5KSB7XG4gICAgICAgICAgdGhpcy5sYXN0S2V5ID0gbnVsbDsgLy8gd2Ugd2FudCB0byBtYWtlIHN1cmUgaXQgZG9lc24ndCByZXR1cm4gdGhlIHNhbWUgdmFsdWUgdW50aWwgaXQncyBiZWVuIHVwZGF0ZWRcbiAgICAgICAgICB0aGlzLnVwZGF0ZVZhbHVlKHF1ZXJ5LCBpbnRlcnBvbGF0ZVBhcmFtcyk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLnZhbHVlO1xuICB9XG5cbiAgLyoqXG4gICAqIENsZWFuIGFueSBleGlzdGluZyBzdWJzY3JpcHRpb24gdG8gY2hhbmdlIGV2ZW50c1xuICAgKi9cbiAgcHJpdmF0ZSBfZGlzcG9zZSgpOiB2b2lkIHtcbiAgICBpZiAodHlwZW9mIHRoaXMub25UcmFuc2xhdGlvbkNoYW5nZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRoaXMub25UcmFuc2xhdGlvbkNoYW5nZS51bnN1YnNjcmliZSgpO1xuICAgICAgdGhpcy5vblRyYW5zbGF0aW9uQ2hhbmdlID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIHRoaXMub25MYW5nQ2hhbmdlICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgdGhpcy5vbkxhbmdDaGFuZ2UudW5zdWJzY3JpYmUoKTtcbiAgICAgIHRoaXMub25MYW5nQ2hhbmdlID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIHRoaXMub25EZWZhdWx0TGFuZ0NoYW5nZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRoaXMub25EZWZhdWx0TGFuZ0NoYW5nZS51bnN1YnNjcmliZSgpO1xuICAgICAgdGhpcy5vbkRlZmF1bHRMYW5nQ2hhbmdlID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgfVxuXG4gIG5nT25EZXN0cm95KCk6IHZvaWQge1xuICAgIHRoaXMuX2Rpc3Bvc2UoKTtcbiAgfVxufVxuIl19