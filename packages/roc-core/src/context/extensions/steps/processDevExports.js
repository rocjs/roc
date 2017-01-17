import { initSetDependencies } from '../../../resolver/manageDependencies';

/*
 We want to make all of the dependencies that the development one has available to the non development one
 since the non development one might use some of the development dependencies when running in development "mode".
 An example of this is where a non development package includes some boilerplate code for creating an application
 and some of this code has a development purpose that might have a dependency on something that comes from the
 development extension. It might make sense to have the code in the non development package but keep the
 dependencies out of it since we want to only install what are actually used.
*/
export default function processDevExports(initialState) {
    let dependencyContext = { ...initialState.dependencyContext };
    initialState.context.usedExtensions.forEach(({ name, packageJSON }) => {
        if (initialState.temp.extensionsDevelopmentExports[`${name}-dev`]) {
            dependencyContext =
                initSetDependencies(dependencyContext)(
                    name,
                    {
                        ...dependencyContext.extensionsDependencies[name],
                        exports: {
                            // We add the development exports first since we do not want to overwrite something
                            // that comes from the non development ones because that could result in different
                            // dependencies in development and production
                            ...initialState.temp.extensionsDevelopmentExports[`${name}-dev`],
                            ...dependencyContext.extensionsDependencies[name].exports,
                        },
                    },
                    // Remove things that are defined in the package.json directly
                    // This will avoid that different dependencies are used in development and production
                    packageJSON,
                );
        }
    });

    return {
        ...initialState,
        dependencyContext,
    };
}
