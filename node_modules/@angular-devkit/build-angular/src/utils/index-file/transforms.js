"use strict";
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHtmlTransforms = void 0;
const inline_fonts_1 = require("./inline-fonts");
function getHtmlTransforms(optimization, buildBrowserFeatures, extraHtmlTransform) {
    const indexTransforms = [];
    const { fonts, styles } = optimization;
    // Inline fonts
    if (fonts.inline) {
        const inlineFontsProcessor = new inline_fonts_1.InlineFontsProcessor({
            minifyInlinedCSS: styles,
            WOFFSupportNeeded: !buildBrowserFeatures.isFeatureSupported('woff2'),
        });
        indexTransforms.push(content => inlineFontsProcessor.process(content));
    }
    if (extraHtmlTransform) {
        indexTransforms.push(extraHtmlTransform);
    }
    return indexTransforms;
}
exports.getHtmlTransforms = getHtmlTransforms;
