FROM node:18-alpine

# Install required dependencies
RUN apk add --no-cache \
    ffmpeg \
    libwebp-tools \
    python3 \
    make \
    g++ \
    gcc \
    git \
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
COPY yarn.lock ./

# Install dependencies with frozen lockfile for better reliability
RUN yarn install --frozen-lockfile --network-timeout 1000000

# Copy source code
COPY . .

# Create temp directory for stickers
RUN mkdir -p temp

# Set environment variables
ENV NODE_ENV=production
ENV CHROME_BIN=/usr/bin/chromium-browser
ENV CHROME_PATH=/usr/lib/chromium/

# Start the bot
CMD ["yarn", "start"]