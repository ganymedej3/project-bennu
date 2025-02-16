FROM ghcr.io/jmorganca/ollama/ollama:latest
# Pull your chosen model
RUN ollama pull mistral:7b-instruct
# Expose port if needed
EXPOSE 11411
CMD ["ollama", "serve"]