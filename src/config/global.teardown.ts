/*async function globalTeardown() {
    // Global teardown code will go here
    // Examples:
    // - Cleaning up test data
    // - Shutting down services
    // - Cleaning up temporary files
  }
  
  // export default globalTeardown;*/

  import fs from 'fs';
import path from 'path';

async function globalTeardown() {
    console.log('\n🏁 Global Teardown - Directory check:');
    const resultsDir = path.join(process.cwd(), 'test-results');
    console.log(`\n📂 Checking contents of ${resultsDir}:`);
    if (fs.existsSync(resultsDir)) {
        const contents = fs.readdirSync(resultsDir);
        console.log(contents.length ? contents.join('\n') : '(empty directory)');
    } else {
        console.log('❌ Directory does not exist');
    }
}

export default globalTeardown;
  