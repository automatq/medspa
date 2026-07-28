#!/usr/bin/env python3
"""Create a metadata-free responsive WebP derivative."""

import sys
from pathlib import Path

from PIL import Image, ImageOps


source = Path(sys.argv[1])
destination = Path(sys.argv[2])
maximum_width = int(sys.argv[3])

with Image.open(source) as opened:
    image = ImageOps.exif_transpose(opened)
    image.thumbnail((maximum_width, 100_000), Image.Resampling.LANCZOS)
    if image.mode not in ("RGB", "RGBA"):
        image = image.convert("RGB")
    destination.parent.mkdir(parents=True, exist_ok=True)
    image.save(destination, "WEBP", quality=82, method=6)
