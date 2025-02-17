# Prerequisites and Setup Guide

## System Requirements

### Hardware Requirements
- Minimum 8GB RAM (16GB recommended)
- At least 10GB free disk space (for models and project)
- CPU with AVX2 support (for optimal LLM performance)

### Software Requirements
1. Node.js
   - Version: Latest LTS (18.x or higher)
   - Installation: https://nodejs.org/

2. Git
   - Latest version
   - Installation: https://git-scm.com/downloads

3. Visual Studio Code (Recommended IDE)
   - Download: https://code.visualstudio.com/
   - Recommended Extensions:
     - TypeScript and JavaScript Language Features
     - Playwright Test for VSCode
     - ESLint
     - Prettier

## LLM Setup

### Installing Ollama
Choose your operating system:

#### Linux
```bash
curl https://ollama.ai/install.sh | sh
```

#### MacOS
```bash
brew install ollama
```

#### Windows
1. Visit https://ollama.ai/download
2. Download and run the Windows installer
3. Follow the installation prompts

### Setting up mistral-7b-instruct
1. Start Ollama server:
```bash
ollama serve
```

2. Pull the mistral model:
```bash
ollama pull mistral:7b-instruct
```
Note: This is a large download (approximately 8GB) and may take several minutes depending on your internet connection.

3. Verify the installation:
```bash
ollama list
ollama run mistral:7b-instruct 'Hello'
```
You should see 'mistral:7b-instruct' in the list of available models. You can test the model works by saying hello to it using ollama run.

## Project Setup

1. Clone the repository:
```bash
git clone [https://github.com/ganymedej3/project-bennu]
cd bennu
```

2. Install dependencies:
```bash
npm install
```

3. Install Playwright browsers:
```bash
npx playwright install
```

## Environment Setup

1. Configure environment variables (if needed):
   - OLLAMA_URL (defaults to http://localhost:11434)
   - OLLAMA_MODEL (defaults to mistral:7b-instruct)

## Verification Steps

1. Verify Ollama is running:
```bash
curl http://localhost:11434/api/tags
```
Should return a list of installed models.

2. Verify project setup:
```bash
npm run test
```
This should run the test suite without errors.

## Troubleshooting

### Common Issues

1. Ollama Connection Issues
   - Ensure Ollama service is running (`ollama serve`)
   - Check if the port 11434 is not blocked
   - Verify model is downloaded (`ollama list`)

2. Memory Issues
   - If Ollama fails to load, check system memory usage
   - Close unnecessary applications
   - Consider reducing model size if needed

3. Model Download Issues
   - Verify internet connection
   - Check disk space
   - Try downloading with `--insecure` flag if behind corporate proxy

### Getting Help
- File an issue on the project repository
- Check Ollama documentation: https://github.com/ollama/ollama
- Review Mistral documentation on huggingface: https://huggingface.co/docs/transformers/en/model_doc/mistral

## Next Steps
After completing the setup:
1. Review the project documentation
2. Try running example tests
3. Start building your own test cases

## Updating

### Updating Ollama
```bash
# Linux/MacOS
curl https://ollama.ai/install.sh | sh