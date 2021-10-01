/** This file is part of Open-Capture for Invoices.

 Open-Capture for Invoices is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 Open-Capture is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with Open-Capture for Invoices. If not, see <https://www.gnu.org/licenses/gpl-3.0.html>.

 @dev : Nathan Cheval <nathan.cheval@outlook.fr> */

function patchPostCSS(webpackConfig, tailwindConfig, components = false) {
    if(!tailwindConfig) {
        console.error('Missing tailwind config :', tailwindConfig);
        return;
    }
    const pluginName = "autoprefixer";
    for (const rule of webpackConfig.module.rules) {
        if (!(rule.use && rule.use.length > 0) || (!components && rule.exclude)) {
            continue;
        }
        for (const useLoader of rule.use) {
            if (!(useLoader.options && useLoader.options.postcssOptions)) {
                continue;
            }
            const originPostcssOptions = useLoader.options.postcssOptions;
            useLoader.options.postcssOptions = (loader) => {
                const _postcssOptions = originPostcssOptions(loader);
                const insertIndex = _postcssOptions.plugins.findIndex(
                    ({ postcssPlugin }) => postcssPlugin && postcssPlugin.toLowerCase() === pluginName
                );
                if (insertIndex !== -1) {
                    _postcssOptions.plugins.splice(insertIndex, 0, ["tailwindcss", tailwindConfig]);
                } else {
                    console.error(`${pluginName} not found in postcss plugins`);
                }
                return _postcssOptions;
            };
        }
    }
}

module.exports = (config) => {
    const isProd = config.mode === "production";
    const tailwindConfig = require("./tailwind.config");
    patchPostCSS(config, tailwindConfig, true);
    return config;
};
