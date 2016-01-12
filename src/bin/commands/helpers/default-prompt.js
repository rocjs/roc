import 'source-map-support/register';

/**
 * The default prompot options.
 */
export const prompt = [{
    type: 'input',
    name: 'appName',
    message: 'What\'s the name of your application?',
    default: 'my-roc-app',
    filter: (input) => input.toLowerCase().split(' ').join('-')
}, {
    type: 'input',
    name: 'appDesc',
    message: 'What\'s the description for the application?',
    default: 'My Roc Application'
}, {
    type: 'input',
    name: 'appAuthor',
    message: 'Who\'s the author of the application?',
    default: 'John Doe'
}, {
    type: 'input',
    name: 'appLicense',
    message: 'What\'s the license for the application?',
    default: 'MIT'
}];
