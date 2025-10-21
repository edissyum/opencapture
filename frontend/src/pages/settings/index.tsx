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
import { Check, Search, Settings, SlidersHorizontal, Star } from "lucide-react";

import { useFavorites } from "../../services/hooks/useFavorite";
import { SettingsCard } from "../../components/settings/SettingsCard";

import { getSettingsGeneralOptions } from "./general";
import { getSettingsVerifierOptions } from "./verifier";

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

    const { ready, getFavorites } = useFavorites();
    const [favoriteOptions, setFavoriteOptions] = useState([]);

    useEffect(() => {
        if (!ready) return;
        const generalOptions = getSettingsGeneralOptions();
        const verifierOptions = getSettingsVerifierOptions();

        const allOptions: any = [...generalOptions, ...verifierOptions, ...options];

        (async () => {
            const favs = await getFavorites();
            if (favs) {
                const favoriteRoutes = favs.map((fav: any) => fav.route);
                setFavoriteOptions(allOptions.filter((option: any) => favoriteRoutes.includes(option.href)));
            }
        })();
    }, [ready]);

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold flex items-center gap-1">
                <Star/>
                { t('SETTINGS.favorites') }
            </h1>
            <p className="text-(--text-secondary)">
                { t('SETTINGS.favorites_subtitle') }
            </p>
            <div className='flex flex-row flex-wrap gap-4 my-6'>
                { favoriteOptions &&
                    favoriteOptions.map((option) => (
                        <SettingsCard key={ option['name'] } icon={ option['icon'] } title={ option['name'] }
                                      description={ option['description'] } to={ option['href'] }></SettingsCard>
                    ))
                }
            </div>

            <h1 className="text-2xl font-bold flex items-center gap-1">
                <Settings />
                { t('SETTINGS.title') }
            </h1>
            <p className="text-(--text-secondary)">
                { t('SETTINGS.subtitle') }
            </p>
            <div className='flex flex-row flex-wrap gap-4 mt-6'>
                {
                    options.map((option) => (
                        <SettingsCard key={ option['name'] } icon={ option['icon'] } title={ option['name'] }
                                      description={ option['description'] } to={ option['href'] }></SettingsCard>
                    ))
                }
            </div>
        </div>
    );
}