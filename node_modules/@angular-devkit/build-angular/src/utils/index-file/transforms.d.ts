/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { BuildBrowserFeatures } from '../build-browser-features';
import { NormalizeOptimizationOptions } from '../normalize-optimization';
import { IndexHtmlTransform } from './write-index-html';
export declare function getHtmlTransforms(optimization: NormalizeOptimizationOptions, buildBrowserFeatures: BuildBrowserFeatures, extraHtmlTransform?: IndexHtmlTransform): IndexHtmlTransform[];
