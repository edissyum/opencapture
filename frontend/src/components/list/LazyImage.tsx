import { useEffect, useState } from "react";
import { Skeleton } from "primereact/skeleton";

import { axiosApiCall } from "../../services/hooks/axiosApiCall";

type LazyBase64ImageProps = {
    document_info: any;
    alt?: string;
    className?: string;
};

export function LazyBase64Image({ document_info, alt, className }: LazyBase64ImageProps) {
    const [src, setSrc] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const { post } = axiosApiCall();

    useEffect(() => {
        let active = true;

        const fetchImage = async () => {
            post(`/verifier/getThumb`, {
                "type": 'full',
                "compress": true,
                "documentId": document_info.id,
                "filename": document_info.full_jpg_filename,
                "registerDate": document_info.register_date
            }).then((res) => {
                if (!active) return;
                setSrc('data:image/jpg;base64,' + res.file);
            }).catch(() => setSrc(null))
            .finally(() => setLoading(false));
        };

        fetchImage().then();

        return () => {
            active = false;
        };
    }, [document_info]);

    return (
        <div className="w-full h-40 relative">
            { loading && <Skeleton className="w-full h-full absolute top-0 left-0 rounded-t-lg"/> }
            { src && (
                <img
                    src={ src }
                    alt={ alt }
                    loading="lazy"
                    className={ `${ className } w-full h-full object-cover rounded-t-lg` }
                />
            ) }
        </div>
    );
}
