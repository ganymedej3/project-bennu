/*async function globalSetup() {
    // Global setup code will go here
    // Examples:
    // - Setting up test data
    // - Starting Ollama service
    // - Environment configuration
  }
  
  export default globalSetup;*/
  import fs from 'fs';
import path from 'path';

async function globalSetup() {
    console.log('\n🚀 Global Setup - Directory check:');
    const resultsDir = path.join(process.cwd(), 'test-results');
    console.log(`\n📂 Checking contents of ${resultsDir}:`);
    if (fs.existsSync(resultsDir)) {
        const contents = fs.readdirSync(resultsDir);
        console.log(contents.length ? contents.join('\n') : '(empty directory)');
    } else {
        console.log('❌ Directory does not exist');
    }
}

export default globalSetup;