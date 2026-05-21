#!/bin/bash
ollama serve &
sleep 3
ollama pull llama3.2:1b 2>/dev/null
npx next start -p ${PORT:-3001}