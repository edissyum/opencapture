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
import torch
import threading
from PIL import Image
import torch.nn as nn
import torch.nn.functional as F

CHECKPOINT_NAME = 'best_pair_mlp.pt'
DECISION_THRESHOLD = None

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
            page = pages[kept[i + 1]][0]
            if probability < model.threshold:
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


class PairMLP(nn.Module):
    def __init__(self, input_dim, hidden_dims=(1024, 256), dropout=0.2):
        super().__init__()
        layers = [nn.LayerNorm(input_dim)]
        current_dim = input_dim
        for hidden_dim in hidden_dims:
            layers += [nn.Linear(current_dim, hidden_dim), nn.GELU(), nn.Dropout(dropout)]
            current_dim = hidden_dim
        layers.append(nn.Linear(current_dim, 1))
        self.net = nn.Sequential(*layers)

    def forward(self, x):
        return self.net(x).squeeze(-1)


class ContinuityModel:
    def __init__(self, model_dir, log):
        from transformers import AutoImageProcessor, AutoModel

        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.dtype = torch.bfloat16 if self.device.type == 'cuda' else torch.float32

        checkpoint = torch.load(os.path.join(model_dir, CHECKPOINT_NAME), map_location=self.device, weights_only=False)
        self.mlp = PairMLP(checkpoint['pair_feature_dim'], checkpoint['hidden_dims'], checkpoint['dropout']).to(self.device)
        self.mlp.load_state_dict(checkpoint['mlp_state_dict'])
        self.mlp.eval()

        self.l2_normalize = checkpoint.get('l2_normalize_embeddings', True)
        self.relational = checkpoint.get('use_relational_features', True)
        if DECISION_THRESHOLD is not None:
            self.threshold = float(DECISION_THRESHOLD)
        else:
            self.threshold = float(checkpoint.get('best_threshold', checkpoint.get('default_threshold', 0.5)))

        self.processor = AutoImageProcessor.from_pretrained(model_dir, local_files_only=True)
        self.processor.do_resize = True
        self.processor.size = {'shortest_edge': checkpoint.get('image_shortest_edge', 672)}
        self.processor.do_center_crop = False
        self.processor.crop_size = None

        self.dino = AutoModel.from_pretrained(model_dir, local_files_only=True, dtype=self.dtype)
        self.dino.to(self.device).eval()
        for param in self.dino.parameters():
            param.requires_grad = False

        log.info(f"AI Separation model loaded (device : {self.device}, threshold : {self.threshold:.3f})")

    @torch.inference_mode()
    def embed(self, image_path):
        with Image.open(image_path) as image:
            inputs = self.processor(images=image.convert('RGB'), return_tensors='pt')
        inputs = {
            key: value.to(self.device, dtype=self.dtype) if key == 'pixel_values' else value.to(self.device)
            for key, value in inputs.items() if isinstance(value, torch.Tensor)
        }
        embedding = self.dino(**inputs).last_hidden_state[:, 0].float()
        if self.l2_normalize:
            embedding = F.normalize(embedding, p=2, dim=-1)
        return embedding.squeeze(0).cpu()

    @torch.inference_mode()
    def continuity(self, emb_a, emb_b):
        parts = [emb_a, emb_b, emb_b - emb_a, emb_a * emb_b] if self.relational else [emb_a, emb_b]
        features = torch.cat(parts, dim=0).unsqueeze(0).to(self.device)
        return float(torch.sigmoid(self.mlp(features)).item())


def get_model(model_dir, log):
    # Chargé une seule fois par worker Kuyruk
    global _MODEL
    if _MODEL is None:
        with _MODEL_LOCK:
            if _MODEL is None:
                _MODEL = ContinuityModel(model_dir, log)
    return _MODEL