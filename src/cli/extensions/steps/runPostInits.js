import { getDependencies } from '../../../dependencies/manageDependencies';
import manageRocObject from '../helpers/processRocObject';

export default function runPostInits(initialState) {
    return initialState.postInits.reduceRight(
        (state, { postInit, name }) =>
            manageRocObject(
                postInit({
                    config: state.config,
                    meta: state.meta,
                    extensions: state.usedExtensions,
                    actions: state.actions,
                    hooks: state.hooks,
                    currentDependencies: state.dependencies,
                    currentCommands: state.commands,
                    localDependencies: getDependencies(name)
                }), state, true
            ),
        initialState
    );
}
