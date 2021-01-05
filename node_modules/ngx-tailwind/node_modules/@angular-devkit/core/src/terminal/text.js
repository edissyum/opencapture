"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bgWhite = exports.bgCyan = exports.bgMagenta = exports.bgBlue = exports.bgYellow = exports.bgGreen = exports.bgRed = exports.bgBlack = exports.gray = exports.grey = exports.white = exports.cyan = exports.magenta = exports.blue = exports.yellow = exports.green = exports.red = exports.black = exports.strikethrough = exports.hidden = exports.inverse = exports.underline = exports.italic = exports.dim = exports.bold = exports.reset = void 0;
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const caps = require("./caps");
const colors_1 = require("./colors");
const supportColors = typeof process === 'object' ? caps.getCapabilities(process.stdout).colors : false;
const identityFn = (x) => x;
exports.reset = supportColors ? colors_1.colors.reset : identityFn;
exports.bold = supportColors ? colors_1.colors.bold : identityFn;
exports.dim = supportColors ? colors_1.colors.dim : identityFn;
exports.italic = supportColors ? colors_1.colors.italic : identityFn;
exports.underline = supportColors ? colors_1.colors.underline : identityFn;
exports.inverse = supportColors ? colors_1.colors.inverse : identityFn;
exports.hidden = supportColors ? colors_1.colors.hidden : identityFn;
exports.strikethrough = supportColors ? colors_1.colors.strikethrough : identityFn;
exports.black = supportColors ? colors_1.colors.black : identityFn;
exports.red = supportColors ? colors_1.colors.red : identityFn;
exports.green = supportColors ? colors_1.colors.green : identityFn;
exports.yellow = supportColors ? colors_1.colors.yellow : identityFn;
exports.blue = supportColors ? colors_1.colors.blue : identityFn;
exports.magenta = supportColors ? colors_1.colors.magenta : identityFn;
exports.cyan = supportColors ? colors_1.colors.cyan : identityFn;
exports.white = supportColors ? colors_1.colors.white : identityFn;
exports.grey = supportColors ? colors_1.colors.gray : identityFn;
exports.gray = supportColors ? colors_1.colors.gray : identityFn;
exports.bgBlack = supportColors ? colors_1.colors.bgBlack : identityFn;
exports.bgRed = supportColors ? colors_1.colors.bgRed : identityFn;
exports.bgGreen = supportColors ? colors_1.colors.bgGreen : identityFn;
exports.bgYellow = supportColors ? colors_1.colors.bgYellow : identityFn;
exports.bgBlue = supportColors ? colors_1.colors.bgBlue : identityFn;
exports.bgMagenta = supportColors ? colors_1.colors.bgMagenta : identityFn;
exports.bgCyan = supportColors ? colors_1.colors.bgCyan : identityFn;
exports.bgWhite = supportColors ? colors_1.colors.bgWhite : identityFn;
