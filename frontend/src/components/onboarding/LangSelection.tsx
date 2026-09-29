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

import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { CheckOverlay } from "../CheckOverlay";
import { usePersistentState } from "../../services/hooks/usePersistentState";

interface LangSelectionProps {
    i18n: ReturnType<typeof useTranslation>['i18n'];
    refresh?: boolean;
}

export function LangSelection({ i18n, refresh = true }: LangSelectionProps) {
    const options = [
        { code: 'fra', label: 'Français' },
        { code: 'eng', label: 'English' },
        { code: 'spa', label: 'Español' }
    ];
    const [selectedLang, setSelectedlang] = usePersistentState<string>('selectedLang', 'fra', false);

    useEffect(() => {
        if (selectedLang) {
            setSelectedlang(selectedLang);
            i18n.changeLanguage(selectedLang).then();
        }
    }, [selectedLang, i18n]);

    return (
        <div className="flex gap-4 mt-4">
            { options.map((lang) => (
                <div key={ lang['code'] }
                    className={ `relative border flex bg-(--bg-primary) items-center rounded-md cursor-pointer px-4 py-2 transition-colors
                     ${ selectedLang === lang['code'] ? 'border-(--border-primary)! bg-(--bg-selected)' : 'border-(--border-secondary) hover:border-gray-400' }` }
                    onClick={ () => {
                        setSelectedlang(lang['code']);
                        setTimeout(() => {
                            if (selectedLang !== lang['code'] && refresh) {
                                window.dispatchEvent(new Event('forceAppReload'))
                            }
                        });
                    } }>
                    <CheckOverlay show={ selectedLang === lang['code'] }/>
                    <img src={ `/imgs/i18n/${ lang['code'] }.svg` } alt=""
                        className="w-8 mr-4 rounded-sm"/>
                    <div className="flex flex-col justify-center items-start">
                        <span className='text-lg font-semibold'>
                            { lang['label'] }
                        </span>
                    </div>
                </div>
            )) }
        </div>
    );
}