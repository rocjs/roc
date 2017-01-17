import processArguments from 'roc-core/lib/cli/processArguments';
import { getAbsolutePath } from 'roc-utils';

export default function getDirectory() {
    const args = processArguments();
    return getAbsolutePath(args.coreOptions.directory || args.coreOptions.d || process.cwd());
}
