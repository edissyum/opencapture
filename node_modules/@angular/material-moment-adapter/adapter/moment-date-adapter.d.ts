/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { InjectionToken } from '@angular/core';
import { DateAdapter } from '@angular/material/core';
import { Moment } from 'moment';
/** Configurable options for {@see MomentDateAdapter}. */
import * as ɵngcc0 from '@angular/core';
export interface MatMomentDateAdapterOptions {
    /**
     * When enabled, the dates have to match the format exactly.
     * See https://momentjs.com/guides/#/parsing/strict-mode/.
     */
    strict?: boolean;
    /**
     * Turns the use of utc dates on or off.
     * Changing this will change how Angular Material components like DatePicker output dates.
     * {@default false}
     */
    useUtc?: boolean;
}
/** InjectionToken for moment date adapter to configure options. */
export declare const MAT_MOMENT_DATE_ADAPTER_OPTIONS: InjectionToken<MatMomentDateAdapterOptions>;
/** @docs-private */
export declare function MAT_MOMENT_DATE_ADAPTER_OPTIONS_FACTORY(): MatMomentDateAdapterOptions;
/** Adapts Moment.js Dates for use with Angular Material. */
export declare class MomentDateAdapter extends DateAdapter<Moment> {
    private _options?;
    private _localeData;
    constructor(dateLocale: string, _options?: MatMomentDateAdapterOptions | undefined);
    setLocale(locale: string): void;
    getYear(date: Moment): number;
    getMonth(date: Moment): number;
    getDate(date: Moment): number;
    getDayOfWeek(date: Moment): number;
    getMonthNames(style: 'long' | 'short' | 'narrow'): string[];
    getDateNames(): string[];
    getDayOfWeekNames(style: 'long' | 'short' | 'narrow'): string[];
    getYearName(date: Moment): string;
    getFirstDayOfWeek(): number;
    getNumDaysInMonth(date: Moment): number;
    clone(date: Moment): Moment;
    createDate(year: number, month: number, date: number): Moment;
    today(): Moment;
    parse(value: any, parseFormat: string | string[]): Moment | null;
    format(date: Moment, displayFormat: string): string;
    addCalendarYears(date: Moment, years: number): Moment;
    addCalendarMonths(date: Moment, months: number): Moment;
    addCalendarDays(date: Moment, days: number): Moment;
    toIso8601(date: Moment): string;
    /**
     * Returns the given value if given a valid Moment or null. Deserializes valid ISO 8601 strings
     * (https://www.ietf.org/rfc/rfc3339.txt) and valid Date objects into valid Moments and empty
     * string into null. Returns an invalid date for all other values.
     */
    deserialize(value: any): Moment | null;
    isDateInstance(obj: any): boolean;
    isValid(date: Moment): boolean;
    invalid(): Moment;
    /** Creates a Moment instance while respecting the current UTC settings. */
    private _createMoment;
    static ɵfac: ɵngcc0.ɵɵFactoryDef<MomentDateAdapter, [{ optional: true; }, { optional: true; }]>;
    static ɵprov: ɵngcc0.ɵɵInjectableDef<MomentDateAdapter>;
}

//# sourceMappingURL=moment-date-adapter.d.ts.map