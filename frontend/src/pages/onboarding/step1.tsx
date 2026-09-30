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

import { useUser } from "../../services/hooks/useUser";
import { useCustom } from "../../services/custom/customContext";

import { Loader } from "../../components/loader/Loader";
import { hasRequiredPermissions } from "../../components/auth/auth.tsx";

export function Step1() {
    const custom = useCustom();
    const { user, loadingUser } = useUser();

    const options = [
        {
            id: 'verifier',
            label: t('ONBOARD.verifier'),
            privileges: ['access_verifier'],
            img: '/imgs/Open-Capture_Verifier.svg'
        },
        {
            id: 'splitter',
            label: t('ONBOARD.splitter'),
            privileges: ['access_splitter'],
            img: '/imgs/Open-Capture_Splitter.svg'
        }
    ];
    t('ONBOARD.splitter_info');
    t('ONBOARD.verifier_info');

    const [selectedModule, setSelectedModule] = useState<string>(() => {
        return localStorage.getItem(`${custom}_selectedModule`) || 'verifier';
    });

    useEffect(() => {
        if (selectedModule) {
            localStorage.setItem(`${custom}_selectedModule`, selectedModule);
        }
    }, [selectedModule]);

    if (loadingUser) {
        return <Loader/>;
    }

    return (
        <div className='flex flex-col gap-4'>
            <div>
                <h1 className="text-4xl">{ t('ONBOARD.select_module') }</h1>
                <p className="text-(--text-secondary)">
                    { t('ONBOARD.select_module_info') }
                </p>
            </div>
            <div className="flex gap-4">
                { options.filter((module) => hasRequiredPermissions(user, module['privileges'])).map((module) => (
                    <div key={ module['id'] }
                        className={ `border flex bg-(--bg-primary) items-center rounded-md cursor-pointer p-6
                                      hover:border-gray-400 transition-colors
                                      ${ selectedModule === module['id'] ? 'border-(--border-primary) bg-(--bg-selected)' : 'border-(--border-secondary)' }` }
                        onClick={ () => setSelectedModule(module['id']) }>
                        <img src={ module['img'] } alt="" className="w-20 mr-4"/>
                        <div className="flex flex-col justify-center items-start">
                            <h2 className={ `${ selectedModule === module['id'] ? 'text-(--color-primary)' : '' }` }>{ t('ONBOARD.' + module['id']) }</h2>
                            <p className="text-(--text-secondary)">{ t('ONBOARD.' + module['id'] + '_info') }</p>
                        </div>
                    </div>
                )) }
            </div>
        </div>
    );
}
