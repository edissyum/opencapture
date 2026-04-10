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

import { showToast } from "../ToastProvider";
import { getUserFromStorage } from "../../services/hooks/useUser";

export function isAuthenticated(): boolean {
    return !!sessionStorage.getItem("accessToken");
}

export const hasRequiredPermissions = (user: any, requiredPermissions: string[] = []) => {
    if (!user) return false;

    const userPrivileges = user.privileges || [];
    return requiredPermissions.every((perm) => {
        return userPrivileges.includes(perm) || userPrivileges === "*";
    });
}

export function protectedLoader(requiredPermissions: string[] = []) {
    return async () => {
        if (!isAuthenticated()) {
            throw new Response("Login required", { status: 401 });
        }

        const user = getUserFromStorage();
        if (!user) {
            throw new Response("Login required", { status: 401 });
        }

        if (requiredPermissions && requiredPermissions.length > 0) {
            const res = hasRequiredPermissions(user, requiredPermissions);

            if (!res) {
                showToast("Unauthorized", "error");
                throw new Response("Forbidden", { status: 403 });
            }
        }
        return null;
    };
}
