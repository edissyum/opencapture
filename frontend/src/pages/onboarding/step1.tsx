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
import { CheckOverlay } from "../../components/CheckOverlay.tsx";

export function Step1() {
    const options = [
        {
            id: 'verifier',
            label: t('ONBOARD.verifier'),
            img: '/src/assets/imgs/Open-Capture_Verifier.svg'
        },
        {
            id: 'splitter',
            label: t('ONBOARD.splitter'),
            img: '/src/assets/imgs/Open-Capture_Splitter.svg'
        }
    ];
    t('ONBOARD.splitter_info');
    t('ONBOARD.verifier_info');

    const [selectedModule, setSelectedModule] = useState<string>(() => {
        return localStorage.getItem('selectedModule') || 'verifier';
    });

    useEffect(() => {
        if (selectedModule) {
            localStorage.setItem('selectedModule', selectedModule);
            window.dispatchEvent(new Event("local-storage"));
        }
    }, [selectedModule]);

    return (
        <><h1 className="text-4xl">{ t('ONBOARD.select_module') }</h1>
            <p className="text-(--text-secondary)">
                { t('ONBOARD.select_module_info') }
            </p>
            <div className="flex gap-4">
                { options.map((module) => (
                    <div
                        className={ `relative border-2 flex items-center bg-(--bg-primary) rounded-md cursor-pointer hover:shadow-lg p-6 ${ selectedModule === module['id'] ? 'border-(--border-primary)' : 'border-(--border-secondary)' }` }
                        onClick={ () => setSelectedModule(module['id']) }>
                        <CheckOverlay show={ selectedModule === module['id'] }/>
                        <img src={ module['img'] } alt="" className="w-20 mr-4"/>
                        <div className="flex flex-col justify-center items-start">
                            <h2 className={ `text-xl font-semibold mb-2 ${ selectedModule === module['id'] ? 'text-(--color-primary)' : '' }` }>{ t('ONBOARD.' + module['id']) }</h2>
                            <p className="text-(--text-secondary)">{ t('ONBOARD.' + module['id'] + '_info') }</p>
                        </div>
                    </div>
                )) }
            </div>
        </>
    );
}
