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

import { Loader } from "./loader/Loader";

import { axiosApiCall } from "../services/hooks/axiosApiCall";

import { b64ToFile } from "../pages/settings/general/customization";

type TNLProps = {
    open: boolean;
    module: string;
    document_info: any;
};

const thumbCache: any = {
    verifier: new Map<string, string>(),
    splitter: new Map<string, string>(),
};

export function Thumbnail({ document_info, open, module }: TNLProps) {
    const { get, post } = axiosApiCall();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!open || thumbCache[module].has(document_info.id) || loading) return;

        setLoading(true);
        if (module == 'verifier') {
            post(`/verifier/getThumb`, {
                "type": 'full',
                "compress": true,
                "documentId": document_info.id,
                "filename": document_info.full_jpg_filename,
                "registerDate": document_info.register_date
            }).then((res) => {
                thumbCache[module].set(
                    document_info.id,
                    b64ToFile('data:image/jpg;base64,' + res.file)
                );
            }).catch(() => {
                thumbCache[module].set(document_info.id, { error: "Erreur lors du chargement de la vignette" });
            }).finally(() => setLoading(false));
        } else if (module == 'splitter') {
            get(`/splitter/batches/${document_info.id}/getThumb`, {}).then((res) => {
                thumbCache[module].set(
                    document_info.id,
                    b64ToFile('data:image/jpg;base64,' + res.thumbnail)
                );
            }).catch(() => {
                thumbCache[module].set(document_info.id, { error: "Erreur lors du chargement de la vignette" });
            }).finally(() => setLoading(false));
        }
    }, [open, document_info]);

    if (!open) return null;

    const cached = thumbCache[module].get(document_info.id);

    return (
        <div className="tnl absolute z-20 top-4 left-4 max-w-[30%] bg-(--bg-primary) border-2 border-(--border-secondary) rounded-lg overflow-hidden">
            { loading && <Loader/> }

            { cached?.error && <p className="text-sm text-(--text-error)">{ cached.error }</p> }

            { cached && !cached.error && (
                <img className="h-full" src={ URL.createObjectURL(cached) }
                     alt={ cached.name }/>
            ) }
        </div>
    );
}
