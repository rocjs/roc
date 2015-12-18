import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
const expect = chai.expect;
chai.use(sinonChai);

import { execute, __RewireAPI__ as rewireAPI } from '../src/cli/execute';

describe('execute', () => {
    let mockSpawn;

    beforeEach(() => {
        mockSpawn = sinon.stub();
        mockSpawn.returns({
            on: (name, cb) => cb()
        });
        rewireAPI.__Rewire__('spawn', mockSpawn);
    });

    afterEach(() => {
        rewireAPI.__ResetDependency__('spawn');
    });

    it('test', () => {
        execute('roc -h');
        expect(mockSpawn).to.have.been.calledWith('roc', ['-h']);
    });
});
