import path from 'path';

import expect from 'expect';

import initContext from '../../src/context/initContext';

describe('initContext', () => {
    it('should register init and run correctly in project', () => {
        const projectPath = path.join(__dirname, 'fixtures', 'projects', 'init');
        const initSpy = expect.spyOn(require(path.join(projectPath, 'roc.config.js')).project, 'init')
            .andReturn({
                roc: {
                    meta: { a: 1 },
                },
            });
        const context = initContext({
            directory: projectPath,
        });

        expect(initSpy).toHaveBeenCalled();
        expect(context.meta).toEqual({ a: 1 });
    });

    it('should register actions in project, if array', () => {
        const multipleActions = [
            () => {},
            {
                hook: 'a',
                action: () => {},
            },
        ];

        const projectPath = path.join(__dirname, 'fixtures', 'projects', 'actions');
        require(path.join(projectPath, 'roc.config.js')).project.actions = multipleActions;

        const context = initContext({
            directory: projectPath,
        });

        expect(context.actions[0].actions[0].action).toBe(multipleActions[0]);
        expect(context.actions[0].actions[1].action).toBe(multipleActions[1].action);
        expect(context.actions[0].actions[1].hook).toBe(multipleActions[1].hook);
    });

    it('should register actions in project, if function', () => {
        const singleAction = () => {};

        const projectPath = path.join(__dirname, 'fixtures', 'projects', 'actions');
        require(path.join(projectPath, 'roc.config.js')).project.actions = singleAction;

        const context = initContext({
            directory: projectPath,
        });

        expect(context.actions[0].actions[0].action).toBe(singleAction);
    });
});
