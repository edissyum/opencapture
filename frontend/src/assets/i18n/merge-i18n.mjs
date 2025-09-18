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

import fs from 'fs-extra';
import path from 'path';

const localesDir = path.resolve('./src/assets/i18n/');
const languages = ['fra', 'eng', 'spa'];

languages.forEach((lng) => {
    const filePath = path.join(localesDir, `${lng}.json`);
    const tempPath = path.join(localesDir + '/to_merge/', `${lng}.json`);

    if (!fs.existsSync(filePath)) {
        console.log(`⚠️ Fichier original introuvable pour ${lng}, copie du nouveau fichier.`);
        fs.copySync(tempPath, filePath);
        return;
    }

    if (!fs.existsSync(tempPath)) {
        console.log(`⚠️ Fichier extrait introuvable pour ${lng}, rien à merger.`);
        return;
    }

    const existing = fs.readJsonSync(filePath);
    const extracted = fs.readJsonSync(tempPath);

    const merged = { ...existing };
    for (const key in extracted) {
        if (!(key in merged)) {
            merged[key] = extracted[key];
        }
        for (const childKey in extracted[key]) {
            if (!(childKey in merged[key])) {
                merged[key][childKey] = extracted[key][childKey];
            }
        }
    }

    for (const key in merged) {
        if (!(key in extracted)) {
            delete merged[key];
        } else {
            for (const childKey in merged[key]) {
                if (!(childKey in extracted[key])) {
                    delete merged[key][childKey];
                }
            }
        }
    }


    fs.writeJsonSync(filePath, merged, { spaces: 4 });
    console.log(`✅ Merged translations for ${lng}`);

});
