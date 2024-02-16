const fs = require('fs');

const { expect } = require('chai');

describe('Package', () => {

  before(() => {});

  after(() => {});

  describe('Package composition', () => {

    it('should expose a command rsgen', () => {
      expect(fs.existsSync(`${process.cwd()}/bin/rsgen.js`)).to.be.true;
    });

  });

});