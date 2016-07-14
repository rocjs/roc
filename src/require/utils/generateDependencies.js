export default function generateDependencies(packageJSON, toExport) {
    let dependencies = {};
    Object.keys(packageJSON.dependencies).forEach((dependency) => {
        if (toExport.indexOf(dependency) > -1) {
            dependencies = {
                ...dependencies,
                [dependency]: packageJSON.dependencies[dependency]
            };
        }
    });

    return dependencies;
}
