import generateCommandsDocumentation from '../documentation/generateCommandsDocumentation';

import isCommandGroup from './isCommandGroup';

export default function checkGroup(commands = {}, potentialGroup, args, name, parents = []) {
    if (isCommandGroup(commands)(potentialGroup)) {
        const newGroupOrCommand = args.shift();

        if (!newGroupOrCommand) {
            return console.log(generateCommandsDocumentation(
                commands[potentialGroup],
                name,
                parents.concat(potentialGroup)
            ));
        }

        return checkGroup(
            commands[potentialGroup],
            newGroupOrCommand,
            args,
            name,
            parents.concat(potentialGroup)
        );
    }
    return {
        commands,
        command: potentialGroup,
        parents
    };
}
