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
import { ChevronRight, Star } from "lucide-react";
import { NavLink, useLocation, useMatches } from "react-router-dom";

import { useFavorites } from "../../services/hooks/useFavorite";

export default function BreadCrumbTopbar() {
    const location = useLocation();
    const matches = useMatches();
    const breadcrumbs = matches.filter((m: any) => m.handle && m.handle?.breadcrumb);

    const [isFav, setIsFav] = useState(false);
    const [refresh, setRefresh] = useState(false);
    const { ready, loadingFavorites, toggleFavorite, getFavorites } = useFavorites();

    useEffect(() => {
        if (!ready || !location.pathname.includes('/settings')) return;

        (async () => {
            const favs = await getFavorites();
            if (location.pathname && favs) {
                const currentFav = favs.find((fav: any) => fav.route === location.pathname);
                setIsFav(currentFav !== undefined);
                setRefresh(false);
            }
        })();
    }, [ready, location.pathname, refresh]);

    return (
        <header
            className="w-full flex shrink-0 items-center justify-between px-6 py-4 border-b border-(--border-secondary) text-(--text-secondary)">
            <div className="w-full flex items-center gap-4">
                { breadcrumbs.map((match: any, idx) => {
                    const isLast = idx === breadcrumbs.length - 1;
                    return (
                        <span key={ match.pathname } className="flex items-center gap-2">
                            { !isLast ? (
                                <NavLink to={ match.pathname } className="text-(--text-primary)!">
                                    { t(match.handle?.breadcrumb) }
                                </NavLink>
                            ) : (
                                <span className="text-(--text-secondary)">
                                    { t(match.handle?.breadcrumb) }
                                </span>
                            ) }
                            { !isLast && <span><ChevronRight size={ 18 }/></span> }
                        </span>
                    );
                }) }
                { !['/settings', '/settings/general', '/settings/verifier', '/settings/splitter'].includes(location.pathname)
                    && !location.pathname.includes('edit/') && location.pathname.includes('/settings') && (
                        <div data-tooltip-id="tooltip"
                             className={ `ml-auto cursor-pointer ${ loadingFavorites ? 'pointer-events-none' : '' }` }
                             data-tooltip-content={ isFav ? t('SETTINGS.remove_favorites') : t('SETTINGS.add_favorites') }
                             onClick={ () => {
                                 toggleFavorite(location.pathname).then(() => setRefresh(true))
                             } }
                        >
                            { loadingFavorites ? (
                                <div
                                    className="size-6 border-2 border-(--color-primary) border-t-transparent rounded-full animate-spin"/>
                            ) : (
                                <Star size={ 26 }
                                      className={ `${ isFav ? 'fill-(--color-primary) text-(--color-primary)' : '' }` }/>
                            ) }
                        </div>
                    ) }
            </div>
        </header>
    );
}
