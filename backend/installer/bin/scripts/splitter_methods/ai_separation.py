# This file is part of Open-Capture.
# Copyright Edissyum Consulting since 2020 under licence GPLv3

# Open-Capture is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# Open-Capture is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.

# You should have received a copy of the GNU General Public License
# along with Open-Capture. If not, see <https://www.gnu.org/licenses/>.

# @dev : Serena Tetart <serena.tetart@edissyum.com>

import os
import threading
from src.classes.SeparatorHelpers import get_model


_MODEL = None
_MODEL_LOCK = threading.Lock()


def process(args):
    args['log'].info('Processing file for separation : ' + args['file'])
    batch_folder_path = f"{args['docservers']['SPLITTER_BATCHES']}/{args['batch_folder']}/"
    batch_thumbs_path = f"{args['docservers']['SPLITTER_THUMB']}/{args['batch_folder']}/"
    args['files'].save_img_with_pdf2image(args['file'], batch_folder_path + "page")
    args['files'].save_img_with_pdf2image_min(args['file'], batch_thumbs_path + "page", single_file=False, module='splitter')

    list_files = args['files'].sorted_file(batch_folder_path, 'jpg')
    blank_pages = []

    if args['splitter'].separator_qr.remove_blank_pages:
        for cpt, (_, page_path) in enumerate(list_files):
            if args['files'].is_blank_page(page_path):
                blank_pages.append(cpt)

    from flask import current_app
    model_dir = os.path.join(current_app.config['INSTANCE_PATH'], 'artificial_intelligence/splitter_separation/')
    split(args['splitter'], list_files, blank_pages, model_dir)

    args['splitter'].get_result_documents(blank_pages)
    original_file = args['file']
    file = args['files'].move_to_docservers(args['docservers'], args['file'], 'splitter')
    if args['ocrise']:
        args['files'].ocrise_pdf(file, args['log'])

    process_res = args['splitter'].create_batches(args, file, original_file)
    return process_res


def split(splitter, pages, blank_pages, model_dir):
    # Les pages blanches restent dans qr_pages (blank_pages contient des positions),
    # elles sont seulement exclues des paires évaluées par le modèle.
    kept = [pos for pos in range(len(pages)) if pos not in set(blank_pages)]
    document_starts = set(kept[:1])

    try:
        model = get_model(model_dir, splitter.log)
        embeddings = [model.embed(pages[pos][1]) for pos in kept]
        for i in range(len(kept) - 1):
            probability = model.continuity(embeddings[i], embeddings[i + 1])
            if probability < model.threshold:
                page = pages[kept[i + 1]][0]
                document_starts.add(kept[i + 1])
                splitter.log.info(f"Page {page} detected as new document (confidence {1 - probability:.0%})")
    except (Exception,) as error:
        splitter.log.error('AI Separation failed, single document fallback : ' + str(error))
        document_starts = set(kept[:1])

    for pos, (index, path) in enumerate(pages):
        is_start = pos in document_starts
        splitter.qr_pages.append({
            'source_page': index,
            'separator_type': splitter.doc_start if is_start else None,
            'add_page': is_start,
            'doctype_value': None,
            'mem_value': None,
            'metadata_1': None,
            'metadata_2': None,
            'metadata_3': None,
            'path': path
        })
