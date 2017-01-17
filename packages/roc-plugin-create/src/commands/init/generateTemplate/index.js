import path from 'path';

import Metalsmith from 'metalsmith';
import Handlebars from 'handlebars';
import async from 'async';
import log from 'roc-logger/default/small';

import getOptions from './options';
import ask from './ask';
import filter from './filter';

const render = require('consolidate').handlebars.render;

// Register default handlebars helper
Handlebars.registerHelper('if_eq', (a, b, opts) => (
    a === b
    ? opts.fn(this)
    : opts.inverse(this)
));

Handlebars.registerHelper('unless_eq', (a, b, opts) => (
    a === b
    ? opts.inverse(this)
    : opts.fn(this)
));

export default function generateTemplate(name, src, dest, done) {
    const opts = getOptions(name, src);
    const metalsmith = new Metalsmith(path.join(src, 'template'));
    const data = {
        ...metalsmith.metadata(),
        destDirName: path.relative(process.cwd(), dest),
        inPlace: dest === process.cwd(),
        noEscape: true,
    };

    if (opts.helpers) {
        Object.keys(opts.helpers).forEach((key) => {
            Handlebars.registerHelper(key, opts.helpers[key]);
        });
    }

    metalsmith
        .use(askQuestions(opts.prompts))
        .use(filterFiles(opts.filters))
        .use(renderTemplateFiles)
        .clean(false)
        .source('.') // start from template root instead of `./src` which is Metalsmith's default for `source`
        .destination(dest)
        .build((error) => {
            if (error) {
                log.error('An error happened when creating the template', error);
            }
            log.success('Project created');
            done();
            logMessage(opts.completionMessage, data);
        });
}

function askQuestions(prompts) {
    return (files, metalsmith, done) => ask(prompts, metalsmith.metadata(), done);
}

function filterFiles(filters) {
    return (files, metalsmith, done) => filter(files, filters, metalsmith.metadata(), done);
}

function renderTemplateFiles(files, metalsmith, done) {
    const filenames = Object.keys(files);
    const metalsmithMetadata = metalsmith.metadata();
    async.each(filenames, (filename, next) => {  // eslint-disable-line
        // Rename files that that might use mustaches
        render(filename, metalsmithMetadata, (renameError, newFilename) => {
            if (renameError) return next(renameError);

            // If we got a new filename we replace the old file with the new
            if (newFilename !== filename) {
                files[newFilename] = files[filename]; // eslint-disable-line
                delete files[filename]; // eslint-disable-line
            }

            const str = files[newFilename].contents.toString();
            // do not attempt to render files that do not have mustaches
            if (!/{{([^{}]+)}}/g.test(str)) {
                return next();
            }

            return render(str, metalsmithMetadata, (contentError, res) => {
                if (contentError) return next(contentError);

                files[newFilename].contents = new Buffer(res); // eslint-disable-line
                return next();
            });
        });
    }, done);
}

function logMessage(message, data) {
    if (!message) {
        return;
    }

    render(message, data, (err, res) => {
        if (err) {
            log.warn('\n   Error when rendering template complete message: ' + err.message.trim());
        } else {
            log.log('\n' + res.split(/\r?\n/g).map((line) => '  ' + line).join('\n'));
        }
    });
}
