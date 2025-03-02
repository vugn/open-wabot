FROM node:18-alpine

# Install required dependencies
RUN apk add --no-cache \
    ffmpeg \
    webp \
    python3 \
    make \
    g++

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN yarn install

# Copy source code
COPY . .

# Build TypeScript
RUN yarn build

# Create temp directory for stickers
RUN mkdir -p temp

# Start the bot
CMD ["yarn", "start"]