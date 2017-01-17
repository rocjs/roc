import isCommandGroup from 'roc-utils/lib/isCommandGroup';

import generateCommandsDocumentation from '../documentation/generateCommandsDocumentation';

export default function extractCommand(commands = {}, potentialGroup, args, name, parents = []) {
    if (isCommandGroup(commands)(potentialGroup)) {
        const newGroupOrCommand = args.shift();

        // return documentation string if neither group or command
        if (!newGroupOrCommand) {
            return generateCommandsDocumentation(
                commands[potentialGroup],
                name,
                parents.concat(potentialGroup),
            );
        }

        // proceed extraction, register parent
        return extractCommand(
            commands[potentialGroup],
            newGroupOrCommand,
            args,
            name,
            parents.concat(potentialGroup),
        );
    }

    return {
        commands,
        commandName: potentialGroup,
        parents,
    };
}
