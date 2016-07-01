/**
 * The default prompt options.
 */
export default [{
    type: 'input',
    name: 'rocName',
    message: 'What\'s the name of your project?',
    default: 'my-roc-project',
    filter: (input) => input.toLowerCase().split(' ').join('-')
}, {
    type: 'input',
    name: 'rocDescription',
    message: 'What\'s the description for the project?',
    default: 'My Roc Project'
}, {
    type: 'input',
    name: 'rocAuthor',
    message: 'Who\'s the author of the project?',
    default: 'John Doe'
}, {
    type: 'input',
    name: 'rocLicense',
    message: 'What\'s the license for the project?',
    default: 'MIT'
}];
