# Bennu
Project Bennu is an AI Enhanced UI Automation framework developed with Playwright.

# Architecture
![Architecture Diagram](arch.png)

# Project Structure
```
ai-enhanced-testing-framework/
├── README.md
├── package.json
├── tsconfig.json
├── docker/
│   ├── framework/
│   │   └── Dockerfile
│   └── ollama/
│       └── Dockerfile
├── src/
│   ├── config/
│   │   ├── playwright.config.ts       # Playwright configuration
│   │   ├── ai.config.ts               # AI/LLM configuration (prompt templates, model params)
│   │   └── environment.config.ts      # Environment variables and endpoints
│   ├── core/
│   │   ├── types/
│   │   │   ├── api.types.ts          # JSONPlaceholder API types
│   │   │   └── index.ts              # Common type definitions
│   │   └── utils/
│   │       ├── api.utils.ts          # API testing utilities
│   │       └── test.utils.ts         # Common test utilities
│   ├── ai/
│   │   ├── llm_response_parser.ts     # Central module for cleaning & parsing LLM outputs
│   │   ├── manager.ts                 # UI AI Manager (fallback locators, chunk-based analysis)
│   │   ├── api_ai_manager.ts          # API AI Manager (test data generation, negative scenarios)
│   │   ├── selector-engine.ts         # Dynamic selector generation
│   │   └── visual-verifier.ts         # Visual state verification
│   ├── tests/
│   │   ├── api/
│   │   │   ├── specs/
│   │   │   │   ├── posts.spec.ts      # JSONPlaceholder posts tests
│   │   │   │   ├── error.spec.ts      # Error scenario tests
│   │   │   │   └── ai_posts.spec.ts   # AI-based API tests (data gen & negative scenarios)
│   │   │   └── helpers/
│   │   │       └── api.helper.ts      # API test helpers
│   │   └── ui/
│   │       ├── pages/
│   │       │   ├── login.page.ts      # Sauce Demo login page
│   │       │   └── inventory.page.ts  # Sauce Demo inventory page
│   │       └── specs/
│   │           ├── login.spec.ts      # Login test cases
│   │           ├── inventory.spec.ts  # Inventory test cases
│   │           ├── ai_inventory.spec.ts # AI-Enhanced Inventory tests
│   │           └── ...
│   └── reporters/
│       └── allure-config.ts           # Allure configuration
├── test-results/                      
│   └── allure-results/                # Test execution outputs
└── docs/
    ├── setup.md                       # Setup instructions
    ├── api-tests.md                   # API testing documentation
    ├── ui-tests.md                    # UI testing documentation
    └── future-enhancements.md         # Future improvement ideas
```

