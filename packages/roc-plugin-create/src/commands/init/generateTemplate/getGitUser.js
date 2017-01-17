import { execSync } from 'child_process';

export default function getGitUser() {
    try {
        const name = execSync('git config --get user.name');
        const email = execSync('git config --get user.email');

        return {
            name: name && name.toString().trim(),
            email: email && email.toString().trim(),
        };
    } catch (e) {
        // Do nothing
        return {};
    }
}
