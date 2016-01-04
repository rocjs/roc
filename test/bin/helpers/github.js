import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
chai.should();
chai.use(sinonChai);

describe('helpers', () => {
    describe('github', () => {
        const github = require('../../../src/bin/commands/helpers/github');
        let get, mkdir;

        beforeEach(() => {
            get = sinon.stub(require('request'), 'get');
            mkdir = sinon.stub(require('temp'), 'mkdir');
        });

        afterEach(() => {
            get.restore();
            mkdir.restore();
        });

        describe('getVersions', () => {
            it('must return promise', () => {
                const result = github.getVersions();
                result.should.be.a('Promise');
            });

            it('must reject promise upon request error', (done) => {
                const requestError = new Error('Request failed');
                // force get to call callback with error
                get.callsArgWith(1, requestError);

                github
                    .getVersions('roc')
                    .catch((err) => {
                        err.should.be.equal(requestError);
                        done();
                    });
            });
        });

        describe('get', () => {
            it('must return promise', () => {
                const result = github.get();
                result.should.be.a('Promise');
            });

            it('must make temporary directory "roc"', () => {
                github.get();
                mkdir.should.have.been.calledWith('roc');
            });
        });
    });
});
