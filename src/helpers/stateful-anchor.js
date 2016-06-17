import anchor from 'anchor-markdown-header';

export default function statefulAnchor(mode = 'github.com') {
    const titleCount = {};
    const getTitleCount = (title) => {
        if (titleCount[title] !== undefined) {
            return ++titleCount[title];
        }

        titleCount[title] = 0;
        return titleCount[title];
    };

    return (title) => {
        return anchor(title, mode, getTitleCount(title));
    };
}
