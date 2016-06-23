import manageRocObject from '../helpers/processRocObject';

export default function runPostInits(initialState) {
    return initialState.temp.postInits.reduceRight(
        (state, { postInit, name }) =>
            manageRocObject(
                postInit({
                    verbose: state.settings.verbose,
                    config: state.context.config,
                    meta: state.context.meta,
                    extensions: state.context.usedExtensions,
                    actions: state.context.actions,
                    hooks: state.context.hooks,
                    currentDependencies: state.context.dependencies,
                    currentCommands: state.context.commands,
                    localDependencies: state.dependencyContext.extensionsDependencies[name]
                }), state, true
            ),
        initialState
    );
}
