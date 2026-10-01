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

# See LICENCE file at the root folder for more details.

# @dev : Nathan Cheval <nathan.cheval@edissyum.com>
# @dev: Serena tetart <serena.tetart@edissyum.com>

import os
import torch
import threading
from PIL import Image
import torch.nn as nn
import torch.nn.functional as functionnal


_MODEL = None
_MODEL_LOCK = threading.Lock()


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
    def __init__(self, model_dir, log, decision_threshold=None):
        from transformers import AutoImageProcessor, AutoModel

        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.dtype = torch.bfloat16 if self.device.type == 'cuda' else torch.float32

        checkpoint = torch.load(os.path.join(model_dir, 'best_pair_mlp.pt'), map_location=self.device, weights_only=False)
        self.mlp = PairMLP(checkpoint['pair_feature_dim'], checkpoint['hidden_dims'], checkpoint['dropout']).to(self.device)
        self.mlp.load_state_dict(checkpoint['mlp_state_dict'])
        self.mlp.eval()

        self.l2_normalize = checkpoint.get('l2_normalize_embeddings', True)
        self.relational = checkpoint.get('use_relational_features', True)
        if decision_threshold is not None:
            self.threshold = float(decision_threshold)
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

        log.info(f"DINOv3 continuity model loaded ({self.device}, threshold={self.threshold:.3f})")

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
            embedding = functionnal.normalize(embedding, p=2, dim=-1)
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
