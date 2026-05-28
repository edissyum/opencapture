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
import { FileText, Paperclip } from "lucide-react";

import { LazyBase64Image } from "../../components/list/LazyImage";

export function BatchCard({ row, navigate, onBatchDragStart, onBatchDragEnd }: any) {

    return (
        <div key={ row.id }
             draggable
             onDragStart={ (e) => {
                 e.dataTransfer.setData('batchId', String(row.id));
                 e.dataTransfer.effectAllowed = 'move';
                 onBatchDragStart?.(row.id);
             } }
             onDragEnd={ () => onBatchDragEnd?.() }
             onClick={ () => {
                 navigate(`/splitter/viewer/${ row.id }`);
                 setTimeout(() => {
                     window.location.reload();
                 }, 100);
             } }
             className={ `group rounded-md cursor-grab active:cursor-grabbing bg-(--bg-primary)` }
        >
            <div className="relative bg-[#D0DAD5] dark:bg-(--bg-secondary) rounded-b-none w-full p-6 pb-0 rounded-md flex
                            items-center justify-center text-(--text-secondary)
                            border border-b-0 border-(--border-secondary) group-hover:border-(--text-secondary) transition-colors">
                <LazyBase64Image
                    alt={ row.id }
                    module='splitter'
                    document_info={ row }
                    className="object-cover object-top rounded-t-lg pointer-events-none"
                />
            </div>
            <div className='px-6 py-3 border border-t-0 rounded-b-md border-(--border-secondary) group-hover:border-(--text-secondary) transition-colors'>
                <div className="flex gap-2 mb-1">
                    <div className='flex gap-1 justify-end'>
                        <div className='flex justify-center items-center text-(--color-primary) gap-0.5'
                             data-tooltip-id="tooltip" data-tooltip-content={ t('SPLITTER.nb_documents') }>
                            <span>{ row.documents_count }</span>
                            <FileText size={ 15 }/>
                        </div>
                        { row.attachments_count > 0 && (
                            <div className='flex justify-center items-center text-(--color-primary) gap-0.5'
                                 data-tooltip-id="tooltip"
                                 data-tooltip-content={ t('VERIFIER.nb_attachments') }>
                                <span>{ row.attachments_count }</span>
                                <Paperclip size={ 15 }/>
                            </div>
                        ) }
                    </div>
                    <div className='truncate'>
                        <span className="font-semibold" title={ row['subject'] ? row['subject'] : row['file_name'] }>
                            { row['subject'] ? row['subject'] : row['file_name'] }
                        </span>
                    </div>
                </div>
                <div className="text-sm mb-1 truncate">
                    <span className="text-(--text-secondary) mr-1">
                        { t('SPLITTER.id') } :
                    </span>
                    <span>
                        { row.id }
                    </span>
                </div>
                <div className="text-sm mb-1 truncate">
                    <span className="text-(--text-secondary) mr-1">
                        { t('VERIFIER.creation_date') } :
                    </span>
                    <span>
                        { row.batch_date }
                    </span>
                </div>
                <div className="text-sm mb-1 truncate">
                    <span className="text-(--text-secondary) mr-1">
                        { t('VERIFIER.form') } :
                    </span>
                    <span>
                        { row.form_label }
                    </span>
                </div>
            </div>
        </div>
    )
}