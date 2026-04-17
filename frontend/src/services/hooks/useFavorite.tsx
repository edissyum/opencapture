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

import { useEffect, useState } from "react";

import { useUser } from "./useUser";
import { axiosApiCall } from "./axiosApiCall";

type Favorite = {
    id?: string;
    route: string;
    user_id: string;
};

export function useFavorites() {
    const { user, loadingUser } = useUser();
    const { get, post, del } = axiosApiCall();

    const [ready, setReady] = useState(false);
    const [loadingFavorites, setLoadingFavorites] = useState(false);

    useEffect(() => {
        if (!loadingUser && user?.id) {
            setReady(true);
        } else {
            setReady(false);
        }
    }, [loadingUser, user]);

    const addFavorite = async (route: string) => {
        if (!ready) return {};
        return await post("/config/favorites", { route: route, user_id: user.id });
    };

    const removeFavorite = async (favoriteId: string) => {
        if (!ready) return {};
        return await del(`/config/favorites/${ favoriteId }`);
    };

    const getFavorites = async () => {
        if (!ready) return {};
        return await get('/config/favorites', {
            params: { user_id: user.id }
        });
    };

    const toggleFavorite = async (route: string) => {
        if (!ready) return {};
        setLoadingFavorites(true);
        const favorites = await getFavorites();
        const existing = favorites.find((fav: Favorite) => JSON.stringify(fav.route) === JSON.stringify(route));

        if (existing) {
            await removeFavorite(existing.id!);
            setTimeout(() => setLoadingFavorites(false), 200);
        } else {
            await addFavorite(route);
            setTimeout(() => setLoadingFavorites(false), 200);
        }
    }

    return { ready, addFavorite, toggleFavorite, removeFavorite, getFavorites, loadingFavorites};
}
