import initContext from '../../../../src/context/initContext';

export default (projectPath, commands) => initContext({
    commands,
    directory: projectPath,
    runtime: false,
});
