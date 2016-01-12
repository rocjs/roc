import {
    isPath,
    isArray,
    isString,
    isBoolean,
    isInteger,
    isObject,
    required
} from '../../../src/validation/validators';

export const validDocumentObject = [{
    name: 'runtime',
    level: 0,
    description: 'Runtime configuration',
    objects: [{
        cli: '--option1',
        defaultValue: 'value1',
        description: 'description1',
        name: 'option1',
        path: 'runtime.option1',
        required: false,
        type: 'String',
        validator: isString
    }],
    children: []
}, {
    name: 'dev',
    level: 0,
    description: undefined,
    objects: [{
        cli: '--dev-option2',
        defaultValue: '',
        description: 'description2',
        name: 'option2',
        path: 'dev.option2',
        required: true,
        type: 'String',
        validator: required(isString)
    }],
    children: []
}];

export const complexDocumentObject = [{
    name: 'build',
    level: 0,
    objects: [
        {
            name: 'obj',
            description: 'The obj for the application',
            type: 'Object',
            required: true,
            path: 'build.obj',
            cli: '--build-obj',
            defaultValue: {},
            validator: isObject
        },
        {
            name: 'port',
            description: 'The port for the application',
            type: 'Integer',
            required: true,
            path: 'build.port',
            cli: '--build-port',
            defaultValue: 80,
            validator: isInteger
        },
        {
            name: 'path',
            description: 'The basepath for the application',
            type: 'Filepath',
            required: true,
            path: 'build.path',
            cli: '--build-path',
            defaultValue: '/',
            validator: isPath
        },
        {
            name: 'assets',
            description: 'An array of files to include into the build process',
            type: '[ Filepath ]',
            required: false,
            path: 'build.assets',
            cli: '--build-assets',
            defaultValue: [
                'roc-web-react/styles/base.scss'
            ],
            validator: isArray(isPath)
        },
        {
            name: 'mode',
            description: 'What mode the application should be built for.',
            type: '/^dev|dist|test$/i',
            required: false,
            path: 'build.mode',
            cli: '--build-mode',
            defaultValue: 'dist',
            validator: /^dev|dist|test$/i
        },
        {
            name: 'target',
            description: 'For what target the application should be built for.',
            type: '[ /^client|server$/i ]',
            required: false,
            path: 'build.target',
            cli: '--build-target',
            defaultValue: [
                'client',
                'server'
            ],
            validator: isArray(/^client|server$/i)
        },
        {
            name: 'disableProgressbar',
            description: 'Should the progress bar be disabled for builds',
            type: 'Boolean',
            required: false,
            path: 'build.disableProgressbar',
            cli: '--build-disableProgressbar',
            defaultValue: false,
            validator: isBoolean
        },
        {
            name: 'outputName',
            description: 'The name of the generated application bundle, will be appended \'roc.js\'',
            type: 'String',
            required: false,
            path: 'build.outputName',
            cli: '--build-outputName',
            defaultValue: 'app',
            validator: isString
        },
        {
            name: 'moduleBuild',
            description: 'NOT IMPLEMENTED YET',
            type: 'Unknown',
            required: false,
            path: 'build.moduleBuild',
            cli: '--build-moduleBuild',
            defaultValue: false,
            validator: (input, info) => info ? {type: 'Unknown'} : true
        },
        {
            name: 'moduleStyle',
            description: 'NOT IMPLEMENTED YET',
            type: 'Unknown',
            required: false,
            path: 'build.moduleStyle',
            cli: '--build-moduleStyle',
            defaultValue: '',
            validator: (input, info) => info ? {type: 'Unknown'} : true
        },
        {
            name: 'koaMiddlewares',
            description: 'The koa middlewares to add to the server instance.',
            type: 'Filepath',
            required: false,
            path: 'build.koaMiddlewares',
            cli: '--build-koaMiddlewares',
            defaultValue: 'koa-middlewares.js',
            validator: isPath
        },
        {
            name: 'useDefaultKoaMiddlewares',
            description: 'If Roc should use internally defined koa middlewares.',
            type: 'Boolean',
            required: false,
            path: 'build.useDefaultKoaMiddlewares',
            cli: '--build-useDefaultKoaMiddlewares',
            defaultValue: true,
            validator: isBoolean
        },
        {
            name: 'reducers',
            description: 'The reducers to use if no entry file is given, will use default entry files internally',
            type: 'Filepath',
            required: false,
            path: 'build.reducers',
            cli: '--build-reducers',
            defaultValue: 'reducers.js',
            validator: isPath
        },
        {
            name: 'useDefaultReducers',
            description: 'If Roc should use internally defined reducers.',
            type: 'Boolean',
            required: false,
            path: 'build.useDefaultReducers',
            cli: '--build-useDefaultReducers',
            defaultValue: true,
            validator: isBoolean
        },
        {
            name: 'routes',
            description: 'The routes to use if no entry file is given, will use default entry files internally',
            type: 'Filepath',
            required: false,
            path: 'build.routes',
            cli: '--build-routes',
            defaultValue: 'routes.js',
            validator: isPath
        },
        {
            name: 'useDefaultRoutes',
            description: 'If Roc should use an internal wrapper around the routes',
            type: 'Boolean',
            required: false,
            path: 'build.useDefaultRoutes',
            cli: '--build-useDefaultRoutes',
            defaultValue: true,
            validator: isBoolean
        },
        {
            name: 'reduxMiddlewares',
            description: 'The middlewares to use if no entry file is given',
            type: 'Filepath',
            required: false,
            path: 'build.reduxMiddlewares',
            cli: '--build-reduxMiddlewares',
            defaultValue: 'redux-middlewares.js',
            validator: isPath
        },
        {
            name: 'useDefaultReduxMiddlewares',
            description: 'If Roc should use internally defined middlewares',
            type: 'Boolean',
            required: false,
            path: 'build.useDefaultReduxMiddlewares',
            cli: '--build-useDefaultReduxMiddlewares',
            defaultValue: true,
            validator: isBoolean
        },
        {
            name: 'clientLoading',
            description: 'The React component to use on the first client load while fetching data',
            type: 'Filepath',
            required: false,
            path: 'build.clientLoading',
            cli: '--build-clientLoading',
            defaultValue: '',
            validator: isPath
        }
    ],
    children: [
        {
            name: 'entry',
            level: 1,
            objects: [
                {
                    name: 'client',
                    description: 'The client entry point file',
                    type: 'Filepath',
                    required: false,
                    path: 'build.entry.client',
                    cli: '--build-entry-client',
                    defaultValue: '',
                    validator: isPath
                },
                {
                    name: 'server',
                    description: 'The server entry point file',
                    type: 'Filepath',
                    required: false,
                    path: 'build.entry.server',
                    cli: '--build-entry-server',
                    defaultValue: '',
                    validator: isPath
                }
            ],
            children: []
        },
        {
            name: 'outputPath',
            level: 1,
            objects: [
                {
                    name: 'client',
                    description: 'The output directory for the client build',
                    type: 'Filepath',
                    required: false,
                    path: 'build.outputPath.client',
                    cli: '--build-outputPath-client',
                    defaultValue: 'build/client',
                    validator: isPath
                },
                {
                    name: 'server',
                    description: 'The output directory for the server build',
                    type: 'Filepath',
                    required: false,
                    path: 'build.outputPath.server',
                    cli: '--build-outputPath-server',
                    defaultValue: 'build/server',
                    validator: isPath
                }
            ],
            children: []
        }
    ]
}];
