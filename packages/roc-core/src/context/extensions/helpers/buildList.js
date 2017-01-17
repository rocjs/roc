export default function buildList(elements) {
    return elements.map(
        (element) => ` - ${element}`,
    ).join('\n') + '\n\n';
}
