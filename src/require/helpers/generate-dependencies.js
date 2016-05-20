export default function generateDependencies(packageJson, toExport) {
    let dependencies = {};
    Object.keys(packageJson.dependencies).forEach((dependency) => {
        if (toExport.indexOf(dependency) > -1) {
            dependencies = {
                ...dependencies,
                [dependency]: packageJson.dependencies[dependency]
            };
        }
    });

    return dependencies;
}
