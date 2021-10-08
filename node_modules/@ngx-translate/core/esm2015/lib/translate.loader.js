/**
 * @fileoverview added by tsickle
 * Generated from: lib/translate.loader.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { Injectable } from "@angular/core";
import { of } from "rxjs";
/**
 * @abstract
 */
export class TranslateLoader {
}
if (false) {
    /**
     * @abstract
     * @param {?} lang
     * @return {?}
     */
    TranslateLoader.prototype.getTranslation = function (lang) { };
}
/**
 * This loader is just a placeholder that does nothing, in case you don't need a loader at all
 */
export class TranslateFakeLoader extends TranslateLoader {
    /**
     * @param {?} lang
     * @return {?}
     */
    getTranslation(lang) {
        return of({});
    }
}
TranslateFakeLoader.decorators = [
    { type: Injectable }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNsYXRlLmxvYWRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL25neC10cmFuc2xhdGUvY29yZS9zcmMvbGliL3RyYW5zbGF0ZS5sb2FkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ3pDLE9BQU8sRUFBYSxFQUFFLEVBQUMsTUFBTSxNQUFNLENBQUM7Ozs7QUFFcEMsTUFBTSxPQUFnQixlQUFlO0NBRXBDOzs7Ozs7O0lBREMsK0RBQXVEOzs7OztBQU96RCxNQUFNLE9BQU8sbUJBQW9CLFNBQVEsZUFBZTs7Ozs7SUFDdEQsY0FBYyxDQUFDLElBQVk7UUFDekIsT0FBTyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDaEIsQ0FBQzs7O1lBSkYsVUFBVSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcbmltcG9ydCB7T2JzZXJ2YWJsZSwgb2Z9IGZyb20gXCJyeGpzXCI7XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBUcmFuc2xhdGVMb2FkZXIge1xuICBhYnN0cmFjdCBnZXRUcmFuc2xhdGlvbihsYW5nOiBzdHJpbmcpOiBPYnNlcnZhYmxlPGFueT47XG59XG5cbi8qKlxuICogVGhpcyBsb2FkZXIgaXMganVzdCBhIHBsYWNlaG9sZGVyIHRoYXQgZG9lcyBub3RoaW5nLCBpbiBjYXNlIHlvdSBkb24ndCBuZWVkIGEgbG9hZGVyIGF0IGFsbFxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgVHJhbnNsYXRlRmFrZUxvYWRlciBleHRlbmRzIFRyYW5zbGF0ZUxvYWRlciB7XG4gIGdldFRyYW5zbGF0aW9uKGxhbmc6IHN0cmluZyk6IE9ic2VydmFibGU8YW55PiB7XG4gICAgcmV0dXJuIG9mKHt9KTtcbiAgfVxufVxuIl19