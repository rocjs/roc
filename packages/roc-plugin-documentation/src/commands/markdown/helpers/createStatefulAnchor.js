import anchor from 'anchor-markdown-header';

export default function createStatefulAnchor(mode = 'github.com') {
    const titleCount = {};
    const getTitleCount = (title) => {
        if (titleCount[title] !== undefined) {
            return ++titleCount[title]; //eslint-disable-line
        }

        titleCount[title] = 0;
        return titleCount[title];
    };

    return (title) => anchor(title, mode, getTitleCount(title));
}
