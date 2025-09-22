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

import { t } from "i18next";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export function Step2() {
    const { i18n } = useTranslation();

    const options = [
        { code: 'fra', label: 'Français' },
        { code: 'eng', label: 'English' },
        { code: 'spa', label: 'Español' }
    ];
    const [selectedLang, setSelectedlang] = useState<string>(() => {
            return localStorage.getItem('selectedLang') || 'fra';
    });

    useEffect(() => {
        if (selectedLang) {
            localStorage.setItem('selectedLang', selectedLang);
            window.dispatchEvent(new Event("local-storage"));
            i18n.changeLanguage(selectedLang).then();
        }
    }, [selectedLang, i18n]);

    return (
        <><h1 className="text-4xl text-(--text-primary)">{t('ONBOARD.select_frontend_lang')}</h1>
            <p className="text-(--text-secondary)">
                { t('ONBOARD.select_frontend_lang_info') }
            </p>
            <div className="flex gap-4 mt-4 justify-center">
                {options.map((lang) => (
                    <div
                        className={`border-2 flex items-center bg-(--bg-primary) rounded-md cursor-pointer hover:shadow-lg p-8 ${selectedLang === lang['code'] ? 'border-(--border-primary)' : 'border-(--border-secondary)'}`}
                        onClick={() => setSelectedlang(lang['code'])}>
                        <img src={`/src/assets/imgs/i18n/${lang['code']}.svg`} alt="" className="w-20 mr-4 rounded-lg"/>
                        <div className="flex flex-col justify-center items-start">
                            <h2 className={`text-xl font-semibold mb-2`}>
                                { lang['label'] }
                            </h2>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}
