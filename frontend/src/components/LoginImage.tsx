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

import { useCustom } from "../services/custom/customContext";
import { AxiosApiCall } from "../services/hooks/AxiosApiCall";

import { b64ToFile } from "../pages/settings/general/customization";

export function LoginImage({ className }: { className?: string }) {
    const { get } = AxiosApiCall();
    const custom = useCustom();
    const [image, setImage] = useState<string | undefined>(undefined);

    useEffect(() => {
        loadImage().then();
        const handleUpdate = () => {
            loadImage().then();
        };

        window.addEventListener("appImageChanged", handleUpdate);
        return () => window.removeEventListener("appImageChanged", handleUpdate);
    }, []);

    const loadImage = async () => {
        if (!custom) return;

        try {
            const stored = localStorage.getItem(`${ custom }_appImage`);
            if (stored) {
                setImage(stored);
                return;
            }

            const response = await get("config/getLoginImage");
            const file = b64ToFile(response);
            const reader = new FileReader();
            reader.onload = () => {
                if (reader.result) {
                    localStorage.setItem(`${ custom }_appImage`, reader.result as string);
                    setImage(reader.result as string);
                }
            };
            reader.readAsDataURL(file);
        } catch (err) {
            console.error("Error while loading login image :", err);
        }
    };

    if (!custom) return null;

    return <img src={ image } alt="AppImage" className={ className ?? "w-24 h-24 object-contain" }/>;
}
