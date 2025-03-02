FROM node:18-alpine

# Install required dependencies
RUN apk add --no-cache \
    ffmpeg \
    libwebp-tools \
    python3 \
    make \
    g++ \
    gcc \
    libc-dev \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN yarn install --network-timeout 1000000

# Copy source code
COPY . .

# Build TypeScript
RUN yarn build

# Create temp directory for stickers
RUN mkdir -p temp

# Set environment variables
ENV NODE_ENV=production
ENV CHROME_BIN=/usr/bin/chromium-browser
ENV CHROME_PATH=/usr/lib/chromium/

# Start the bot
CMD ["yarn", "start"]