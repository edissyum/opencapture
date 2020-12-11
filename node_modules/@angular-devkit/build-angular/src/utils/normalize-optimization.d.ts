/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { FontsClass, OptimizationClass, OptimizationUnion } from '../browser/schema';
export declare type NormalizeOptimizationOptions = Required<Omit<OptimizationClass, 'fonts'>> & {
    fonts: FontsClass;
};
export declare function normalizeOptimization(optimization?: OptimizationUnion): NormalizeOptimizationOptions;
