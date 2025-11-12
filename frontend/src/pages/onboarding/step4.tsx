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

import { CheckOverlay } from "../../components/CheckOverlay";


export function Step4() {
    const [selectedView, setSelectedView] = useState<string>(() => {
        return localStorage.getItem('selectedView') || 'grid';
    });

    useEffect(() => {
        if (selectedView) {
            localStorage.setItem('selectedView', selectedView);
        }
    }, [selectedView]);

    return (
        <>
            <h1 className="text-4xl text-(--text-primary)">{ t('ONBOARD.select_view') }</h1>
            <p className="text-(--text-secondary)">
                { t('ONBOARD.select_view_info') }
            </p>

            <div className="flex gap-4 justify-center mt-4">
                <div className={ `cursor-pointer relative w-48 h-26 bg-(--bg-primary) border-2 
                        border-(--border-primary) rounded-lg transition-border-color duration-200
                        ${ selectedView === 'grid' ? 'border-(--border-primary)' : 'border-(--border-secondary) hover:border-gray-400' } ` }
                     onClick={ () => setSelectedView('grid') }>
                    <CheckOverlay show={ selectedView === 'grid' }/>

                    <div className='p-2'>
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="grid grid-cols-4 gap-3 mt-2">
                            { Array.from({ length: 8 }).map((_, cpt) => (
                                <div key={ cpt } className="h-6 bg-gray-200 rounded w-full"/>
                            )) }
                        </div>
                    </div>
                </div>
                <div className={ `cursor-pointer relative w-48 h-26 bg-(--bg-primary) border-2 
                        border-(--border-primary) rounded-lg transition-border-color duration-200
                        ${ selectedView === 'list' ? 'border-(--border-primary)' : 'border-(--border-secondary) hover:border-gray-400' } ` }
                     onClick={ () => setSelectedView('list') }>
                    <CheckOverlay show={ selectedView === 'list' }/>

                    <div className='p-2'>
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="flex flex-col gap-1 mt-2">
                            { Array.from({ length: 4 }).map((_, cpt) => (
                                <div key={ cpt } className="h-3 bg-gray-200 rounded w-full"/>
                            )) }
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
