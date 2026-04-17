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
import { Check, MousePointer, Search, SlidersHorizontal, Star } from "lucide-react";

import { Loader } from "../../components/loader/Loader";
import { useFavorites } from "../../services/hooks/useFavorite";
import { SettingsCard } from "../../components/settings/SettingsCard";

import { getSettingsGeneralOptions } from "./general";
import { getSettingsVerifierOptions } from "./verifier";
import { getSettingsSplitterOptions } from "./splitter";

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
        }
    ];

    const [loading, setLoading] = useState(true);

    const [favoriteOptions, setFavoriteOptions] = useState([]);
    const { ready, getFavorites, toggleFavorite } = useFavorites();

    useEffect(() => {
        if (!ready) return;
        const generalOptions = getSettingsGeneralOptions();
        const verifierOptions = getSettingsVerifierOptions();
        const splitterOptions = getSettingsSplitterOptions();

        const allOptions: any = [...generalOptions, ...verifierOptions, ...splitterOptions, ...options];

        (async () => {
            const favs = await getFavorites();
            if (favs) {
                const favoriteRoutes = favs.map((fav: any) => fav.route);
                setFavoriteOptions(allOptions.filter((option: any) => favoriteRoutes.includes(option.href)));
            }
            setLoading(false);
        })();
    }, [ready]);

    const handleUnpin = async (route: string) => {
        await toggleFavorite(route);
        setFavoriteOptions((prev: any) => prev.filter((option: any) => option.href !== route));
    };

    if (loading) {
        return <Loader/>;
    }

    return (
        <div className="p-6">
            <h3 className="text-xl font-bold flex items-center gap-1">
                { t('SETTINGS.favorites') }
            </h3>
            <p className="text-(--text-secondary)">
                { t('SETTINGS.favorites_subtitle') }
            </p>
            { favoriteOptions && favoriteOptions.length > 0 ? (
                <div className='grid grid-cols-3 gap-6 my-2'>
                    { favoriteOptions.map((option, index) => (
                        <SettingsCard key={ index } icon={ option['icon'] } title={ option['name'] }
                                      description={ option['description'] } to={ option['href'] }
                                      module={ option['module'] ?? false } unpinFav={ () => handleUnpin(option['href']) }/>
                    )) }
                </div>
            ) : (
                <div
                    className="mt-2 mb-4 w-full bg-(--bg-selected) p-4 rounded-lg flex flex-col gap-4 border border-(--border-primary)">
                    <div className='flex items-center gap-3'>
                        <div className='bg-(--color-primary) p-2 rounded-lg'>
                            <Star className="text-white" size={ 28 }/>
                        </div>
                        <div className='flex flex-col'>
                            <span className='text-(--color-primary) font-semibold'>{ t('SETTINGS.add_favorite') }</span>
                            <span className='text-(--text-secondary)'>{ t('SETTINGS.add_favorite_details') }</span>
                        </div>
                    </div>
                    <div className='flex gap-4'>
                        <div
                            className='bg-(--color-primary)/20 rounded-md px-2 py-1 flex items-center gap-1 text-(--color-primary)'>
                            <MousePointer size={ 16 } fill='var(--color-primary)' stroke='var(--color-primary)'/>
                            { t('SETTINGS.navigate_to_settings') }
                        </div>
                        <div
                            className='bg-(--color-primary)/20 rounded-md px-2 py-1 flex items-center gap-1 text-(--color-primary)'>
                            <Star size={ 16 } fill='var(--color-primary)' stroke='var(--color-primary)'/>
                            { t('SETTINGS.click_star') }
                        </div>
                        <div
                            className='bg-(--color-primary)/20 rounded-md px-2 py-1 flex items-center gap-1 text-(--color-primary)'>
                            <Check size={ 16 }/>
                            { t('SETTINGS.appear_here') }
                        </div>
                    </div>
                </div>
            ) }

            <h3 className="text-xl font-bold flex items-center gap-1">
                { t('SETTINGS.title') }
            </h3>
            <p className="text-(--text-secondary)">
                { t('SETTINGS.subtitle') }
            </p>
            <div className='grid grid-cols-3 gap-6 mt-2'>
                { options.map((option) => (
                    <SettingsCard key={ option['name'] } icon={ option['icon'] } title={ option['name'] }
                                  description={ option['description'] } to={ option['href'] }/>
                )) }
            </div>
        </div>
    );
}