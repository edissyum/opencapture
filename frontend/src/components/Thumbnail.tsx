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

import { AxiosApiCall } from "../services/hooks/AxiosApiCall";

type TNLProps = {
    open: boolean;
    module: string;
    documentInfo: any;
};

const thumbCache: any = {
    verifier: new Map<string, string>(),
    splitter: new Map<string, string>(),
};

export function Thumbnail({ documentInfo, open, module }: TNLProps) {
    const { get, post } = AxiosApiCall();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!open || thumbCache[module].has(documentInfo.id) || loading) return;

        setLoading(true);
        if (module == 'verifier') {
            post(`/verifier/getThumb`, {
                "type": 'full',
                "compress": true,
                "documentId": documentInfo.id,
                "filename": documentInfo.full_jpg_filename,
                "registerDate": documentInfo.register_date
            }).then((res) => {
                thumbCache[module].set(
                    documentInfo.id,
                    'data:image/jpg;base64,' + res.file
                );
            }).catch(() => {
                thumbCache[module].set(documentInfo.id, { error: "Erreur lors du chargement de la vignette" });
            }).finally(() => setLoading(false));
        } else if (module == 'splitter') {
            get(`/splitter/batches/${documentInfo.id}/getThumb`, {}).then((res) => {
                thumbCache[module].set(
                    documentInfo.id,
                    'data:image/jpg;base64,' + res.thumbnail
                );
            }).finally(() => setLoading(false));
        }
    }, [open, documentInfo]);

    if (!open) return null;

    const cached = thumbCache[module].get(documentInfo.id);

    return (
        <div className="absolute z-20 top-4 left-4 max-w-[30%] bg-(--bg-primary) border border-(--border-secondary) p-2
                        rounded-lg overflow-hidden">
            { loading && <Loader/> }

            { cached?.error && <p className="text-sm text-(--text-error)">{ cached.error }</p> }

            { cached && !cached.error && <img className="h-full" src={ cached } alt="thumbnail"/> }
        </div>
    );
}
