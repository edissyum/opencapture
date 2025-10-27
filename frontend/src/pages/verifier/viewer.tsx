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

import { t } from "i18next";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Download, Eye, EyeOff } from "lucide-react";

import { ZoomControl } from "../../components/ZoomControl";
import { axiosApiCall } from "../../services/hooks/axiosApiCall";

export function VerifierViewerPage() {
    const { get, post } = axiosApiCall();
    const { documentId } = useParams<{ documentId: string }>();
    const [documentData, setDocumentData] = useState<any>(null);

    const [pagesList, setPagesList] = useState<number[]>([]);
    const totalPages = pagesList.length;

    const [zoom, setZoom] = useState(100);
    const [indicatorsVisible, setIndicatorsVisible] = useState<boolean>(true);

    const [currentPage, setCurrentPage] = useState<number>(1);
    const [currentFilename, setCurrentFilename] = useState<string>("");
    const [pagesImageB64, setPagesImageB64] = useState<{ [key: number]: string }>({});

    useEffect(() => {
        const fetchDocumentData = async () => {
            try {
                get(`verifier/documents/${documentId}`, {}).then((response) => {
                    setDocumentData(response);
                    setCurrentFilename(response.full_jpg_filename);
                    setPagesList([...Array(response.nb_pages).keys()].map(i => i + 1));
                });
            } catch (error) {
                console.error("Error fetching document data:", error);
            }
        };
        fetchDocumentData().then();
    }, [documentId]);

    useEffect(() => {
        if (!documentData) return;

        const fetchDocumentPages = async (page: number) => {
            try {
                const data = {
                    "type": 'full',
                    "documentId": documentId,
                    "filename": currentFilename,
                    "registerDate": documentData.register_date
                }
                post('verifier/getThumb', data).then((response) => {
                    setPagesImageB64(prev => ({ ...prev, [page]: 'data:image/jpeg;base64,' + response.file }));
                });
            } catch (error) {
                console.error(`Error fetching page ${ page } data:`, error);
            }
        };
        fetchDocumentPages(currentPage).then();;
    }, [documentData, currentFilename]);

    const handlePrev = () => {
        if (currentPage > 1) {
            changePage(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            changePage(currentPage + 1);
        }
    };

    const changePage = (page: number) => {
        if (pagesImageB64[page]) {
            setCurrentPage(page);
            return;
        }
        const extension = currentFilename.split('.').pop();
        const oldCpt = String(currentPage).padStart(3, '0');
        const newCpt = String(page).padStart(3, '0');
        const newFilename = currentFilename.replace(`-${ oldCpt }.${ extension }`, `-${ newCpt }.${ extension }`);
        setCurrentPage(page);
        setCurrentFilename(newFilename);
    }

    const handleDownload = () => {
        if (!documentData) return;

        const fetchAndDownload = async () => {
            try {
                post(`verifier/getOriginalFile/${ documentId }`, {}).then((response) => {
                    const link = document.createElement('a');
                    link.href = `data:${ response.mime };base64,` + response.file;
                    link.download = documentData.original_filename;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                });
            } catch (error) {
                console.error("Error downloading original file:", error);
            }
        };
        fetchAndDownload();
    };

    return (
        <div className='flex h-full overflow-hidden'>
            <div className='w-1/2 bg-(--bg-secondary) p-8 h-full flex flex-col'>
                <div className="border-2 border-(--border-secondary) rounded-md h-full overflow-auto">
                    <img
                        src={ pagesImageB64[currentPage] }
                        alt="Document"
                        className='h-auto max-w-none block'
                        style={ {
                            width: `${ zoom }%`
                        } }
                    />
                </div>
                <div className='flex gap-4 mt-2 items-center'>
                    <div className='w-[48px] flex items-center justify-center bg-(--bg-primary) p-3.5 rounded-full
                                    cursor-pointer border border-(--border-secondary) hover:border-(--border-primary) hover:text-(--color-primary) transition-colors'
                         onClick={ handleDownload } data-tooltip-id="tooltip"
                         data-tooltip-content={ t('VERIFIER.download_original_file') }>
                        <Download size={ 18 }/>
                    </div>
                    <div className='w-[40%] flex bg-(--bg-primary) p-3.5 rounded-full cursor-pointer border
                                    border-(--border-secondary)'>
                        <ZoomControl zoom={ zoom } setZoom={ setZoom }/>
                    </div>
                    <div className='flex justify-center gap-2 grow basis-0 bg-(--bg-primary) p-3 rounded-full
                                   cursor-pointer border border-(--border-secondary)'>
                        <button onClick={ handlePrev } disabled={ currentPage === 1 }
                                className={ `cursor-pointer rounded-full transition-colors ${
                                    currentPage === 1 ? "text-(--text-secondary) cursor-not-allowed"
                                        : "hover:bg-(--bg-secondary) text-(--text-primary)"
                                }` }
                        >
                            <ChevronLeft size={ 16 }/>
                        </button>

                        <span>
                            { t('VERIFIER.page') } { currentPage } / { totalPages || 1 }
                        </span>

                        <button
                            onClick={ handleNext }
                            disabled={ currentPage === totalPages }
                            className={ `p-1 cursor-pointer rounded-full transition-colors ${
                                currentPage === totalPages ? "text-(--text-secondary) cursor-not-allowed"
                                    : "hover:bg-(--bg-secondary) text-(--text-primary)"
                            }` }
                        >
                            <ChevronRight size={ 16 }/>
                        </button>
                    </div>
                    <div className='flex justify-center items-center select-none gap-4 grow basis-0 ml-auto
                                    hover:border-(--border-primary) hover:text-(--color-primary) bg-(--bg-primary) p-3
                                    rounded-full cursor-pointer border border-(--border-secondary) transition-colors'
                         onClick={ () => setIndicatorsVisible(!indicatorsVisible) }>
                        { indicatorsVisible ? <Eye size={ 18 }/> : <EyeOff size={ 18 }/> }
                        { t('VERIFIER.indicators') }
                    </div>
                </div>
            </div>
            <div className='w-1/2 bg-(--bg-primary) p-8 h-full border-l-2 border-(--border-secondary)'>

            </div>
        </div>
    );
}