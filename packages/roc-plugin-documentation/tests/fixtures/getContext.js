import initContext from 'roc-core/lib/context/initContext';

export default (projectPath) => initContext({
    directory: projectPath,
    runtime: false,
    defaultPlugins: [
        require.resolve('roc-plugin-create'),
        require.resolve('../../lib'),
    ],
});
