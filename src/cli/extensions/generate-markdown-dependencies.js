export default function generateMarkdownDependencies(name, dependencies) {
    return JSON.stringify(dependencies, null, 2);
}
