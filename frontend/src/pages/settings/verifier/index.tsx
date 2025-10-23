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
import { LayoutTemplate } from "lucide-react";

import { SettingsCard } from "../../../components/settings/SettingsCard";

export const getSettingsVerifierOptions = () => [
    {
        name: t('SETTINGS.forms'),
        description: t('SETTINGS.forms_description'),
        icon: <LayoutTemplate/>,
        href: '/settings/verifier/forms'
    }
];

export function SettingsVerifierIndex() {
    const options = getSettingsVerifierOptions();

    return (
        <div className='grid grid-cols-3 gap-8 p-8'>
            {
                options.map((option) => (
                    <SettingsCard key={ option['name'] } icon={ option['icon'] } title={ option['name'] }
                                  description={ option['description'] } to={ option['href'] }></SettingsCard>
                ))
            }
        </div>
    );
}