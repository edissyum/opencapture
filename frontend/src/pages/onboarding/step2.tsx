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

import { useTranslation } from "react-i18next";

import { LangSelection } from "../../components/onboarding/LangSelection";

export function Step2() {
    const { t } = useTranslation();

    return (
        <>
            <h1 className="text-4xl">{ t('ONBOARD.select_frontend_lang') }</h1>
            <p className="text-(--text-secondary)">
                { t('ONBOARD.select_frontend_lang_info') }
            </p>
            <div className='h-full flex items-center justify-center'>
                <LangSelection i18n={ useTranslation().i18n } refresh={ false }/>
            </div>
        </>
    );
}
