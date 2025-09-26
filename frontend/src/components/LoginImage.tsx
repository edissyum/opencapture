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

import { axiosApiCall } from "../services/hooks/axiosApiCall";

function b64toFile(b64Data: string, filename = "appImage") {
    const byteString = atob(b64Data.split(",")[1]);
    const mimeString = b64Data.split(",")[0].split(":")[1].split(";")[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: mimeString });
    return new File([blob], filename, { type: mimeString });
}

export function LoginImage({ className }: { className?: string }) {
    const { get } = axiosApiCall();
    const [image, setImage] = useState<string | undefined>(undefined);

    const loadImage = async () => {
        try {
            const stored = localStorage.getItem("appImage");
            if (stored) {
                setImage(stored);
                return;
            }

            const response = await get("config/getLoginImage");
            const file = b64toFile(response);
            const reader = new FileReader();
            reader.onload = () => {
                if (reader.result) {
                    localStorage.setItem("appImage", reader.result as string);
                    setImage(reader.result as string);
                }
            };
            reader.readAsDataURL(file);
        } catch (err) {
            console.error("❌ Impossible de charger l’image de login :", err);
        }
    };

    useEffect(() => {
        loadImage().then();
        const handleUpdate = () => {
            loadImage().then();
        };

        window.addEventListener("appImageChanged", handleUpdate);
        return () => window.removeEventListener("appImageChanged", handleUpdate);
    }, []);

    return <img src={image} alt="AppImage" className={className ?? "w-24 h-24 object-contain"} />;
}
