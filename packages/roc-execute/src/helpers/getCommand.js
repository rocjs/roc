import shellEscape from 'shell-escape';

export default function getCommand(command, args = []) {
    return args.length > 0 ? `${command} ${shellEscape(args)}` : command;
}
