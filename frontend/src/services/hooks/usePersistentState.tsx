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

// If prefixKey is true, the key will be prefixed with "OpenCapture_" and be deleted on logout, otherwise it will be stored as is and not deleted on logout
export function usePersistentState<T>(key: string, defaultValue: any, prefixKey = true) {
    if (prefixKey) {
        const prefix = 'OpenCapture_';
        if (!key.startsWith(prefix)) {
            key = prefix + key;
        }
    }

    const [state, setState] = useState<T>(() => {
        const stored = localStorage.getItem(key);
        if (stored === null) {
            return defaultValue;
        }

        if (typeof defaultValue === 'string') {
            return stored as unknown as T;
        }

        try {
            return JSON.parse(stored) as T;
        } catch {
            return defaultValue;
        }
    });

    useEffect(() => {
        if (typeof state === 'string') {
            localStorage.setItem(key, state);
        } else {
            localStorage.setItem(key, JSON.stringify(state));
        }
    }, [key, state]);

    return [state, setState] as const;
}

export function clearPersistentState(key: string) {
    localStorage.removeItem(key);
}

