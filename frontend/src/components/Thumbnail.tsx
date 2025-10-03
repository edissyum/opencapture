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
import { b64ToFile } from "../pages/settings/general/customization";

type TNLProps = {
    open: boolean;
    document_info: any;
};

export function Thumbnail({ document_info, open }: TNLProps) {
    const { post } = axiosApiCall();
    const [loading, setLoading] = useState(false);
    const [thumbCache, setThumbCache] = useState<Record<any, any>>({});
    useEffect(() => {
        if (!open || thumbCache[document_info.id] || loading) return;

        setLoading(true);
        post(`/verifier/getThumb`, {
            "type": 'full',
            "compress": true,
            "documentId": document_info.id,
            "filename": document_info.full_jpg_filename,
            "registerDate": document_info.register_date
        }).then((res) => {
            const thumb = b64ToFile('data:image/jpg;base64,' + res.file);
            setThumbCache((prev) => ({ ...prev, [document_info.id]: thumb || "Aucune donnée" }));
        }).catch(() => setThumbCache((prev) => ({
            ...prev,
            [document_info.id]: "Erreur lors du chargement de la miniature"
        }))).finally(() => setLoading(false));
    }, [open, document_info]);

    if (!open) return null;

    return (
        <div className="tnl absolute z-40 top-4 left-4 max-w-[30%] border border-gray-900">
            { loading && <p className="text-sm text-gray-500">Chargement…</p> }
            { thumbCache[document_info.id]?.error &&
                <p className="text-sm text-red-500">{ thumbCache[document_info.id].error }</p> }
            { thumbCache[document_info.id] && !thumbCache[document_info.id].error && (
                <div className="space-y-1">
                    <p className="font-semibold">TNL Document #{ document_info.id }</p>
                    { thumbCache[document_info.id] && (
                        <img className="h-full" src={ URL.createObjectURL(thumbCache[document_info.id]) }
                             alt={ thumbCache[document_info.id].name }/>
                    ) }
                </div>
            ) }
        </div>
    );
}
