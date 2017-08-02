import inquirer from 'inquirer';

import evaluate from './evaluate';

export default async function ask(prompts, data, done) {
    const keys = Object.getOwnPropertyNames(prompts);

    // Ask each question on order and wait for the response
    for (const key of keys) {
        await askQuestion(data, key, prompts[key]);
    }

    done();
}

async function askQuestion(data, key, prompt) {
    // Skip prompts whose when condition is not met, will bind the current context into the evaluation
    if (prompt.when && !evaluate(prompt.when, data)) {
        return;
    }

    function withAnswers(entry) {
        if (typeof entry === 'function') {
            return entry(data);
        }
        return entry;
    }

    const answers = await inquirer.prompt([{
        type: prompt.type,
        name: key,
        message: withAnswers(prompt.message) || key,
        default: withAnswers(prompt.default),
        choices: withAnswers(prompt.choices) || [],
        validate: prompt.validate || (() => true),
        filter: prompt.filter,
    }]);

    /* eslint-disable no-param-reassign */
    if (Array.isArray(answers[key])) {
        data[key] = {};
        answers[key].forEach((multiChoiceAnswer) => { data[key][multiChoiceAnswer] = true; });
    } else {
        data[key] = answers[key];
    }
    /* eslint-enable */
}

