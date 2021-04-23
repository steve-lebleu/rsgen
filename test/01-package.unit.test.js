const fs = require('fs');

const { expect } = require('chai');

describe('Package', () => {

  before(() => {});

  after(() => {});

  describe('Package composition', () => {

    it('should expose a command rsgen', () => {
      expect(fs.existsSync(`${process.cwd()}/bin/rsgen.js`)).to.be.true;
    });

    ['controller', 'model', 'repository', 'route', 'test', 'validation', 'business.service', 'data-layer.service', 'query-string.interface', 'request.interface', 'subscriber'].forEach(pattern => {
      it(`should expose a template ${pattern}`, () => {
        expect(fs.existsSync(`${process.cwd()}/templates/${pattern}.txt`)).to.be.true;
      });
    });

  });

});