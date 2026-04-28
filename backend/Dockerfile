FROM node:20-slim

# sharp requires these system libs
RUN apt-get update && apt-get install -y \
    libvips-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src

# Cloud Run expects PORT env var
ENV PORT=8080
EXPOSE 8080

CMD ["node", "src/index.js"]
