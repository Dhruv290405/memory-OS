FROM node:20-bookworm

# Install dependencies for Ollama
RUN apt-get update && apt-get install -y curl

# Download Ollama binary directly
RUN curl -L https://github.com/ollama/ollama/releases/download/v0.24.0/ollama-linux-amd64.tgz -o ollama.tgz && \
    tar -xzf ollama.tgz -C /usr/local/bin && \
    rm ollama.tgz

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
