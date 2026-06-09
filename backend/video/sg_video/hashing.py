"""
Perceptual hashing that mirrors backend/src/modules/phash.js exactly, so hashes
here are comparable with assets registered via the Node API.
"""
from PIL import Image


def dhash(img: "Image.Image", resample=Image.LANCZOS) -> str:
    """64-bit difference hash as a 16-char hex string (matches phash.js)."""
    small = img.convert("RGB").resize((9, 8), resample).convert("L")
    px = list(small.getdata())  # row-major, 9*8 = 72 values
    bits = 0
    for row in range(8):
        for col in range(8):
            left = px[row * 9 + col]
            right = px[row * 9 + col + 1]
            bits = (bits << 1) | (1 if left > right else 0)
    return format(bits, "016x")


def hamming_distance(a: str, b: str) -> int:
    return bin(int(a, 16) ^ int(b, 16)).count("1")


def similarity(a: str, b: str) -> int:
    return round((64 - hamming_distance(a, b)) / 64 * 100)
