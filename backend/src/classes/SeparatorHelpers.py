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
import torch.nn.functional as functional


_MODEL = None
_MODEL_LOCK = threading.Lock()


class PairMLP(nn.Module):
    def __init__(self, input_dim, hidden_dims=(1024, 512), dropout=0.2):
        super().__init__()
        layers = [nn.LayerNorm(input_dim)]
        current_dim = input_dim
        for hidden_dim in hidden_dims:
            layers += [nn.Linear(current_dim, hidden_dim), nn.GELU(), nn.Dropout(dropout)]
            current_dim = hidden_dim
        layers.append(nn.Linear(current_dim, 1))
        self.net = nn.Sequential(*layers)

    @staticmethod
    def make_pair_features(emb_a, emb_b):
        emb_a = functional.normalize(emb_a, p=2, dim=-1)
        emb_b = functional.normalize(emb_b, p=2, dim=-1)
        difference = emb_b - emb_a
        product = emb_a * emb_b
        cosine = product.sum(dim=-1, keepdim=True)
        return torch.cat([emb_a, emb_b, difference, difference.abs(), product, cosine], dim=-1)

    def forward(self, x):
        return self.net(x).squeeze(-1)


class ContinuityModel:
    def __init__(self, model_dir, log, decision_threshold=None):
        from transformers import AutoImageProcessor, AutoModel

        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.inference_dtype = (
            torch.bfloat16 if torch.cuda.is_bf16_supported() else torch.float16
        ) if self.device.type == 'cuda' else torch.float32

        checkpoint = torch.load(
            os.path.join(model_dir, 'best_pair_mlp.pth'),
            map_location='cpu',
            weights_only=False
        )
        config = checkpoint['config']
        self.emb_dim = int(config['emb_dim'])
        pair_dim = 5 * self.emb_dim + 1
        if int(config.get('pair_feature_dim', pair_dim)) != pair_dim:
            raise ValueError(f'Invalid pair feature dimension: expected {pair_dim}')

        self.mlp = PairMLP(
            pair_dim,
            config.get('hidden_dims', (1024, 512)),
            float(config.get('dropout', 0.2))
        ).to(self.device)
        self.mlp.load_state_dict(checkpoint['state_dict'])
        self.mlp.eval()

        self.use_cls_token = bool(config.get('use_cls_token', True))
        if decision_threshold is not None:
            self.threshold = float(decision_threshold)
        else:
            self.threshold = float(config.get('threshold', 0.5))
        if not 0 <= self.threshold <= 1:
            raise ValueError(f'Invalid continuity threshold: {self.threshold}')

        self.processor = AutoImageProcessor.from_pretrained(model_dir, local_files_only=True)
        self.processor.do_resize = True
        self.processor.size = {'shortest_edge': int(config.get('processor_size', {}).get('shortest_edge', 672))}
        self.processor.do_center_crop = False
        self.processor.crop_size = None

        self.dino = AutoModel.from_pretrained(model_dir, local_files_only=True, torch_dtype=torch.float32)
        self.dino.to(self.device).eval()
        for param in self.dino.parameters():
            param.requires_grad = False

        log.info(
            f'DINOv3 continuity model loaded '
            f'({self.device}, dtype={self.inference_dtype}, threshold={self.threshold:.3f})'
        )

    @torch.inference_mode()
    def embed_many(self, image_paths, batch_size=8):
        if not image_paths:
            return torch.empty((0, self.emb_dim), dtype=torch.float32)
        if batch_size < 1:
            raise ValueError('batch_size must be positive')

        embeddings = []
        for start in range(0, len(image_paths), batch_size):
            pixel_values = []
            for image_path in image_paths[start:start + batch_size]:
                with Image.open(image_path) as image:
                    inputs = self.processor(
                        images=image.convert('RGB'),
                        return_tensors='pt',
                        do_center_crop=False
                    )
                pixel_values.append(inputs['pixel_values'].squeeze(0))

            max_height = (max(value.shape[-2] for value in pixel_values) + 15) // 16 * 16
            max_width = (max(value.shape[-1] for value in pixel_values) + 15) // 16 * 16
            batch = torch.stack([
                functional.pad(
                    value,
                    (0, max_width - value.shape[-1], 0, max_height - value.shape[-2]),
                    value=0.0
                )
                for value in pixel_values
            ]).to(self.device)

            if self.device.type == 'cuda':
                with torch.autocast(device_type='cuda', dtype=self.inference_dtype):
                    hidden_state = self.dino(pixel_values=batch).last_hidden_state
            else:
                hidden_state = self.dino(pixel_values=batch).last_hidden_state

            embedding = hidden_state[:, 0] if self.use_cls_token else hidden_state.mean(dim=1)
            if embedding.shape[-1] != self.emb_dim:
                raise ValueError(
                    f'DINOv3 embedding dimension mismatch: {embedding.shape[-1]} != {self.emb_dim}'
                )
            embeddings.append(embedding.float().cpu())

        return torch.cat(embeddings, dim=0)

    @torch.inference_mode()
    def embed(self, image_path):
        return self.embed_many([image_path])[0]

    @torch.inference_mode()
    def continuity(self, emb_a, emb_b):
        features = PairMLP.make_pair_features(
            emb_a.unsqueeze(0).to(self.device, dtype=torch.float32),
            emb_b.unsqueeze(0).to(self.device, dtype=torch.float32)
        )
        return float(torch.sigmoid(self.mlp(features)).item())


def get_model(model_dir, log):
    # Chargé une seule fois par worker Kuyruk
    global _MODEL
    if _MODEL is None:
        with _MODEL_LOCK:
            if _MODEL is None:
                _MODEL = ContinuityModel(model_dir, log)
    return _MODEL
