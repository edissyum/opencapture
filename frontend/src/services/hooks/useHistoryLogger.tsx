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

import { useEffect, useRef } from "react";

import { useUser } from "./useUser";
import { axiosApiCall } from "./axiosApiCall";

interface HistoryPayload {
    desc: string;
    module: string;
    user_id?: number;
    submodule: string;
    user_info?: string;
}

export function useHistoryLogger() {
    const { post } = axiosApiCall();
    const { user, loadingUser } = useUser();

    const userRef = useRef(user);
    const loadingRef = useRef(loadingUser);

    useEffect(() => {
        userRef.current = user;
        loadingRef.current = loadingUser;
    }, [user, loadingUser]);

    const logHistory = (payload: HistoryPayload) => {
        const finalPayload = {
            ...payload,
            user_id: userRef.current.id,
            user_info: userRef.current ? `${userRef.current.lastname} ${userRef.current.firstname} (${userRef.current.username})` : "Unknown User"
        };

        try {
            post("history/add", finalPayload);
        } catch (err) {
            console.error("Failed to log history:", err);
        }
    };

    return { logHistory };
}
