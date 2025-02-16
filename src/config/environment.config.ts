export const ENV = {
    // UI Testing Configuration
    UI: {
      baseUrl: 'https://www.saucedemo.com',
      credentials: {
        standardUser: {
          username: 'standard_user',
          password: 'secret_sauce'
        },
        lockedUser: {
          username: 'locked_out_user',
          password: 'secret_sauce'
        }
      }
    },
  
    // API Testing Configuration
    API: {
      baseUrl: 'https://jsonplaceholder.typicode.com',
      endpoints: {
        posts: '/posts',
        comments: '/comments',
        users: '/users'
      }
    },
  
    // Ollama Configuration
    OLLAMA: {
      baseUrl: process.env.OLLAMA_URL || 'http://localhost:11434',
      model: process.env.OLLAMA_MODEL || 'codellama:13b',   // change this to whichever model you would like to try this project with
      //maxTokens: parseInt(process.env.OLLAMA_MAX_TOKENS || '4096'),
      timeout: parseInt(process.env.OLLAMA_TIMEOUT || '60000'),
      retries: parseInt(process.env.OLLAMA_RETRIES || '3')
    },
  
    // Test Configuration
    TEST: {
      timeout: parseInt(process.env.TEST_TIMEOUT || '60000'),
      retries: parseInt(process.env.TEST_RETRIES || '2'),
      workers: parseInt(process.env.TEST_WORKERS || '1')
    }
  };
  
  // Type definitions for environment configuration
  export type Environment = typeof ENV;