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

export function Step3() {
    const options = [
        { id: 'dark', label: t('ONBOARD.dark_mode') },
        { id: 'light', label: t('ONBOARD.light_mode') }
    ];
    const [theme, setTheme] = useState<string>(() => {
        return localStorage.getItem("theme") || 'light';
    });

    useEffect(() => {
        if (theme) {
            if (theme === 'dark') {
                document.documentElement.classList.add("dark");
            } else {
                document.documentElement.classList.remove("dark");
            }
            localStorage.setItem('theme', theme);
            window.dispatchEvent(new Event("local-storage"));
        }
    }, [theme]);

    return (
        <><h1 className="text-4xl text-(--text-primary)">{ t('ONBOARD.select_frontend_lang') }</h1>
            <p className="text-(--text-secondary)">
                { t('ONBOARD.select_frontend_lang_info') }
            </p>
            <div className="flex gap-4 mt-4 justify-center">
                {options.map((theme_opt) => (
                    <div
                        className={
                            `${theme_opt['id'] === 'dark' ? 'dark bg-(--bg-primary)' : 'bg-white text-gray-900'} border-2 flex items-center
                             text-(--text-primary) rounded-md cursor-pointer hover:shadow-lg p-8 min-w-3/12 justify-center
                            ${theme === theme_opt['id'] ? 'border-(--border-primary)' : 'border-(--border-secondary)'}`
                        }
                        onClick={() => setTheme(theme_opt['id'])}>
                        <div className="flex flex-col justify-center items-start">
                            <h2 className={`text-xl font-semibold mb-2`}>
                                { theme_opt['label'] }
                            </h2>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}
