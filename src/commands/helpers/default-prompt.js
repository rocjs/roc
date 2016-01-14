import 'source-map-support/register';

/**
 * The default prompt options.
 */
export const defaultPrompt = [{
    type: 'input',
    name: 'rocAppName',
    message: 'What\'s the name of your application?',
    default: 'my-roc-app',
    filter: (input) => input.toLowerCase().split(' ').join('-')
}, {
    type: 'input',
    name: 'rocAppDesc',
    message: 'What\'s the description for the application?',
    default: 'My Roc Application'
}, {
    type: 'input',
    name: 'rocAppAuthor',
    message: 'Who\'s the author of the application?',
    default: 'John Doe'
}, {
    type: 'input',
    name: 'rocAppLicense',
    message: 'What\'s the license for the application?',
    default: 'MIT'
}];
