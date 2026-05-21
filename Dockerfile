FROM node:20-bookworm-slim

# Install Ollama
RUN apt-get update && apt-get install -y curl zstd
RUN curl -fsSL https://ollama.com/install.sh | sh

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install

# Copy app source
COPY . .
RUN npm run build

EXPOSE 3001

COPY start.sh /start.sh
RUN chmod +x /start.sh
CMD ["/start.sh"]
