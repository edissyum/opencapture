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
import { useState } from "react";
import { CloudUpload, Package } from "lucide-react";

import { Select } from "./Select";
import { Button } from "./Button";
import { hasRequiredPermissions } from "./auth/auth";

import { useUser } from "../services/hooks/useUser";

export default function TopBar() {
    const options = [
        {
            id: 'verifier',
            privilege: 'access_verifier',
            label: t('ONBOARD.verifier'),
            img: '/imgs/Open-Capture_Verifier.svg'
        },
        {
            id: 'splitter',
            privilege: 'access_splitter',
            label: t('ONBOARD.splitter'),
            img: '/imgs/Open-Capture_Splitter.svg'
        }
    ];

    const { user, loadingUser } = useUser();
    const [selected, setSelected] = useState<string | null>(null);

    const handleSelect = (option: string) => {
        setSelected(option);
        localStorage.setItem('selectedModule', option);
        window.dispatchEvent(new Event("updateModule"));
    };

    const storedModule = localStorage.getItem('selectedModule');
    if (storedModule && !selected) {
        handleSelect(storedModule)
    }

    if (loadingUser) return;

    const selectedOption = options.find(o => o.id === selected);
    const moduleOptions = options.map((option) => ({
        img: option.img,
        value: option.id,
        label: option.label,
        disabled: !hasRequiredPermissions(user, [option.privilege])
    }));

    return (
        <header
            className="w-full flex shrink-0 items-center justify-between px-6 py-4 bg-(--bg-primary) border-b border-(--border-secondary)">
            <div className="flex items-center gap-4">
                <Select
                    id="module-TopBar"
                    searchable={ false }
                    value={ selected || '' }
                    className="module-TopBar"
                    options={ moduleOptions }
                    onChange={ (value) => value && handleSelect(value) }
                    leftSection={ selectedOption && (
                        <img src={ selectedOption.img } alt="" className="object-contain select-none"/>
                    ) }
                    renderOption={ ({ option }: { option: any }) => (
                        <div className="flex items-center gap-2">
                            <img src={ option.img } alt={ option.label } className="size-8 object-contain select-none"/>
                            <span>{ option.label }</span>
                        </div>
                    ) }
                />
                <Button to="/home" icon={ <Package size={ 24 }/> } className="font-semibold p-2.5!" size='md'>
                    { storedModule === 'verifier' ? t('VERIFIER.documents') : t('GLOBAL.batches') }
                </Button>

                { hasRequiredPermissions(user, ['upload']) && (
                    <Button to="/upload" icon={ <CloudUpload size={ 24 }/> } className="font-semibold p-2.5!" size='md' variant='no_bg'>
                        { t('GLOBAL.upload') }
                    </Button>
                ) }
            </div>
        </header>
    );
}
