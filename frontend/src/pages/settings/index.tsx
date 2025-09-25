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
import { Check, Search, SlidersHorizontal } from "lucide-react";

import { SettingsCard } from "../../components/settings/SettingsCard";

export function SettingsIndex() {
    const options = [
        {
            name: t('SETTINGS.general'),
            description: t('SETTINGS.general_description'),
            icon: <SlidersHorizontal/>,
            href: '/settings/general'
        },
        {
            name: t('SETTINGS.verifier'),
            description: t('SETTINGS.verifier_description'),
            icon: <Check/>,
            href: '/settings/verifier'
        },
        {
            name: t('SETTINGS.splitter'),
            description: t('SETTINGS.splitter_description'),
            icon: <Search/>,
            href: '/settings/splitter'
        },
    ];

    return (
        <div>
            <h1 className="text-2xl font-bold">
                { t('SETTINGS.title') }
            </h1>
            <p className="text-(--text-secondary)">
                { t('SETTINGS.subtitle') }
            </p>
            <div className='flex flex-row gap-4 mt-6'>
                {
                    options.map((option) => (
                        <SettingsCard key={option['name']} icon={ option['icon'] } title={ option['name'] }
                                      description={ option['description'] } to={ option['href'] }></SettingsCard>
                    ))
                }
            </div>
        </div>
    );
}