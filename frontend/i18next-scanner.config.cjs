/** This file is part of Open-Capture.

 Open-Capture is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 Open-Capture is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with Open-Capture. If not, see <https://www.gnu.org/licenses/gpl-3.0.html>.

 @dev : Nathan CHEVAL <nathan.cheval@edissyum.com> */

module.exports = {
    input: ['src/**/*.{js,jsx,ts,tsx}'], // où chercher les traductions
    output: './src/assets/i18n/to_merge/', // où stocker les JSON
    options: {
        removeUnusedKeys: false,
        debug: true,
        sort: true,
        func: {
            list: ['t'],
            extensions: ['.ts', '.tsx'],
        },
        lngs: ['eng', 'fra', 'spa'],
        defaultLng: 'fra',
        resource: {
            jsonIndent: 4,
            loadPath: '{{lng}}.json',
            savePath: '{{lng}}.json'
        }
    }
};
