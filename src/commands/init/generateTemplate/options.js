import path from 'path';

import validateName from 'validate-npm-package-name';

import fileExists from '../../../helpers/fileExists';
import log from '../../../log/default/small';

import getGitUser from './getGitUser';

export default function options(name, dir) {
    const opts = getSetupData(dir);

    setDefault(opts, 'name', name);
    setValidateName(opts);

    const { name: author } = getGitUser();
    if (author) {
        setDefault(opts, 'author', author);
    }

    return opts;
}

function getSetupData(dir) {
    const json = path.join(dir, 'roc.setup.json');
    const js = path.join(dir, 'roc.setup.js');

    let opts = {};

    if (fileExists(json)) {
        opts = require(json); // eslint-disable-line
    } else if (fileExists(js)) {
        const req = require(path.resolve(js)); // eslint-disable-line
        if (req !== Object(req)) {
            log.error('roc.setup.js needs to export an object');
        }

        opts = req;
    }

    return opts;
}

/**
* Set the default value for a prompt question
*/
function setDefault(opts, key, val) {
    const prompts = opts.prompts || (opts.prompts = {}); // eslint-disable-line
    if (prompts[key]) {
        prompts[key].default = val;
    } else if (prompts[key] && typeof prompts[key] !== 'object') {
        prompts[key] = {
            type: 'string',
            default: val,
        };
    }
}

function setValidateName(opts) {
    if (opts.prompts.name) {
        // eslint-disable-next-line
        opts.prompts.name.validate = (name) => {
            const its = validateName(name);

            if (!its.validForNewPackages) {
                const errors = (its.errors || []).concat(its.warnings || []);
                return `Sorry, ${errors.join(' and ')}.`;
            }

            return true;
        };
    }
}
