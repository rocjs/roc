import minimist from 'minimist';

export default function parseArguments(argv = process.argv) {
    /* eslint-disable object-property-newline */
    const {
        _,
        h, help,
        V, verbose,
        v, version,
        c, config,
        d, directory,
        b, 'better-feedback': betterFeedback,
        '--': extraArguments,
        ...extOptions
    } = minimist(argv.slice(2), { '--': true });

    // The first should be our command or commandgroup, if there is one
    const [groupOrCommand, ...argsWithoutOptions] = _;

    return {
        groupOrCommand, // commandgroup or command
        coreOptions: { // options managed and parsed by core
            h, help,
            V, verbose,
            v, version,
            c, config,
            d, directory,
            b, betterFeedback,
        },
        extOptions, // options that will be forwarded to commands from context
        argsWithoutOptions, // remaining arguments with no associated options
        extraArguments, // arguments after the ended argument list (--)
    };
    /* eslint-enable object-property-newline */
}
