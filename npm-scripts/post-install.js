const stat = require('fs').stat;

stat('lib', function(error, statResult) {
    if (error || !statResult.isDirectory()) {
        console.warn(
            '-'.repeat(85) + '\n' +
            'Built output not found. It looks like you might be attempting to install Roc\n' +
            'from GitHub. Roc sources need to be transpiled before use. We will now make a\n' +
            'best-efforts attempt to transpile the code. This will only work if your development\n' +
            'environment is set up appropriately, most importantly that babel is available.\n' +
            '-'.repeat(85)
        );

        try {
            var execSync = require('child_process').execSync;
            execSync('npm run build', { stdio: 'inherit' });
        } catch (e) {
            console.error(
                '-'.repeat(85) + '\n' +
                'Failed to build Roc automatically. Please install Roc from\n' +
                'npm, or clone the repo locally and build the library manually.\n' +
                '-'.repeat(85)
            );
            throw e;
        }
    }
});
