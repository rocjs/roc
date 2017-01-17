import { initSetDependencies } from '../../../resolver/manageDependencies';

/*
 We want to make all of the dependencies that the "normal" one has available to the development one
 since the development one might use some of the "normal" dependencies when running.
 An example of this is where a development extension includes some code that has a dependency on something that is
 provided from the "normal" extension. This could be code that wraps a dependency as an example.
*/
export default function processNormalExports(initialState) {
    let dependencyContext = { ...initialState.dependencyContext };
    initialState.context.usedExtensions.forEach(({ name, packageJSON }) => {
        // If the name ends in -dev we will remove the -dev part and use that to find dependencies
        const normalName = /-dev$/.test(name) && name.slice(0, -4);
        if (normalName && initialState.temp.extensionsNormalExports[normalName]) {
            dependencyContext =
                initSetDependencies(dependencyContext)(
                    name,
                    {
                        ...dependencyContext.extensionsDependencies[name],
                        exports: {
                            // We add the "normal" exports first since we do not want to overwrite something
                            // that comes from the development ones because that could result in different
                            // dependencies in development and production
                            ...initialState.temp.extensionsNormalExports[normalName],
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
