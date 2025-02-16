import { AllureReporterOptions } from 'allure-playwright';

export const allureConfig: AllureReporterOptions = {
    detail: true,
    outputFolder: "test-results/allure-results",
    suiteTitle: false,
    categories: [
        {
            name: 'API Tests',
            messageRegex: '.*api.*'
        },
        {
            name: 'UI Tests',
            messageRegex: '.*ui.*'
        },
        {
            name: 'Failed Tests',
            messageRegex: '.*'
        },
        {
            name: 'Intentionally Failed Tests',
            messageRegex: '.*intentionally failing.*'
        },
        {
            name: 'AI Enhanced Tests',
            messageRegex: '.*AI.*|.*visual verification.*|.*dynamic selector.*'
        }
    ]
};