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

import { CheckOverlay } from "../CheckOverlay";
import { applyTheme } from "../../services/theme";

interface ThemeSelectionProps {
    onThemeChange?: (lang: string) => void;
}

export function ThemeSelection({ onThemeChange }: ThemeSelectionProps) {
    const options = [
        {id: 'dark', label: t('ONBOARD.dark_mode')},
        {id: 'system', label: t('ONBOARD.system')},
        {id: 'light', label: t('ONBOARD.light_mode')}
    ];

    const [selectedTheme, setTheme] = useState<string>(() => {
        return localStorage.getItem("theme") || 'light';
    });

    useEffect(() => {
        if (selectedTheme) {
            localStorage.setItem('theme', selectedTheme);
            applyTheme();
            onThemeChange?.(selectedTheme);
        }
    }, [selectedTheme]);

    return (
        <div className="flex gap-4 mt-4 justify-center">
            { options.map((theme) => (
                <div key={ theme['id'] }>
                    <div
                        className={ `relative w-48 h-26 border-2 flex items-center bg-(--bg-primary) text-(--text-primary) rounded-lg cursor-pointer hover:opacity-80 p-8 justify-center transition-opacity
                            ${ theme['id'] === 'light' ? 'bg-white' : 'dark bg-(--bg-primary)' } 
                            ${ selectedTheme === theme['id'] ? 'border-(--border-primary)' : 'border-(--border-secondary)' }` }
                        onClick={ () => setTheme(theme['id']) }>
                        <CheckOverlay show={ selectedTheme === theme['id'] }/>
                        <div
                            className={ `absolute top-2.5 rounded-lg left-1.5 w-6 h-1.5 ${ theme['id'] === 'light' ? 'bg-gray-200' : 'bg-[#424E63]' }` }></div>
                        <div
                            className={ `absolute top-2.5 rounded-lg left-9 w-[110px] h-20 ${ theme['id'] === 'light' ? 'bg-gray-200' : 'bg-[#424E63]' }` }></div>
                        <div
                            className={ `absolute top-2.5 rounded-lg left-38 w-8 h-7 ${ theme['id'] === 'light' ? 'bg-gray-200' : 'bg-[#424E63]' }` }></div>

                        {
                            theme['id'] === 'system' &&
                            <div className="absolute inset-0 bg-white box-border rounded-md"
                                 style={ {clipPath: 'inset(0 0 0 50%)'} }>
                                <div
                                    className="absolute rounded-lg top-2.5 w-[110px] h-20 left-9 bg-gray-200"></div>
                                <div className="absolute rounded-lg top-2.5 w-8 h-7 left-38 bg-gray-200"></div>
                            </div>
                        }
                    </div>
                    <div
                        className={ `flex flex-col justify-center items-center ${ selectedTheme === theme['id'] ? 'text-(--color-primary)' : '' }` }>
                        <h2>
                            { theme['label'] }
                        </h2>
                    </div>
                </div>
            )) }
        </div>
    );
}