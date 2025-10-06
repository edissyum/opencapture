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
import { Skeleton } from "primereact/skeleton";

import { axiosApiCall } from "../../services/hooks/axiosApiCall";

const imageCache: any = {
    verifier: new Map<string, string>(),
    splitter: new Map<string, string>(),
};

type LazyBase64ImageProps = {
    alt?: string;
    module: string;
    document_info: any;
    className?: string;
};

export function LazyBase64Image({ document_info, alt, className, module }: LazyBase64ImageProps) {
    const [src, setSrc] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const { post } = axiosApiCall();

    useEffect(() => {
        let active = true;
        if (imageCache[module].has(document_info.id)) {
            setSrc(imageCache[module].get(document_info.id)!);
            setLoading(false);
            return;
        }

        const fetchImage = async () => {
            post(`/verifier/getThumb`, {
                "type": 'full',
                "compress": true,
                "documentId": document_info.id,
                "filename": document_info.full_jpg_filename,
                "registerDate": document_info.register_date
            }).then((res) => {
                if (!active) return;
                const base64 = 'data:image/jpg;base64,' + res.file;

                imageCache[module].set(document_info.id, base64);
                setSrc(base64);
            }).catch(() => setSrc(null)).finally(() => setLoading(false));
        };

        fetchImage().then();

        return () => {
            active = false;
        };
    }, [document_info]);

    return (
        <div className="w-full h-40 relative">
            { (loading || !src ) && <Skeleton className="w-full h-full absolute top-0 left-0 rounded-t-lg"/> }
            { src && (
                <img
                    src={ src }
                    alt={ alt }
                    loading="lazy"
                    className={ `${ className } w-full h-full` }
                />
            ) }
        </div>
    );
}
