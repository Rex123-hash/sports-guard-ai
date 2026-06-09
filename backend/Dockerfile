FROM node:20-slim

# System deps: libvips (sharp) + python3 (embedded video keyframe/hash pipeline)
RUN apt-get update && apt-get install -y \
    libvips-dev \
    python3 \
    python3-venv \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src
COPY video ./video

# Isolated Python env for the video pipeline (free libs; imageio-ffmpeg ships ffmpeg)
RUN python3 -m venv /app/video/.venv \
    && /app/video/.venv/bin/pip install --no-cache-dir -r /app/video/requirements.txt

# Cloud Run expects PORT; PYTHON_BIN points Node's subprocess at the venv interpreter
ENV PORT=8080
ENV PYTHON_BIN=/app/video/.venv/bin/python

EXPOSE 8080

CMD ["node", "src/index.js"]
