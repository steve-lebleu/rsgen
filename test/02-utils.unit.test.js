const fs = require('fs');
const sinon = require('sinon');

const { toPermissions, toHyphen, toUnderscore } = require(`${process.cwd()}/bin/utils/string.util`);
const { write, remove, getSegment } = require(`${process.cwd()}/bin/utils/file.util`);
const { isValidEntityName, isValidTarget, isValidPathDestination, areValidRoles, validate } = require(`${process.cwd()}/bin/utils/validation.util`);

const { expect } = require('chai');

describe('Utils', () => {

  let stubExists, stubReaddir;

  beforeEach(() => {
    stubExists = sinon.stub(fs, 'existsSync');
    stubReaddir = sinon.stub(fs, 'readdirSync');
  });

  afterEach(() => {
    stubExists.restore();
    stubReaddir.restore();
  });

  describe('File', () => {

    describe('write()', () => {

      
      it('should write files', async () => {

        const stubReadFile = sinon.stub(fs, 'readFileSync');
        const stubWriteFile = sinon.stub(fs, 'writeFile');
        const stubChmod = sinon.stub(fs, 'chmodSync');

        stubReadFile.callsFake((path) => "data is {{YODA}}");
        stubWriteFile.callsFake((target, output, options, callback) => {
          expect(target).to.be.eqls(process.cwd() + '/src/api/core/models/bird.model.ts');
          expect(output).to.be.eqls('data is DARK_VADOR');
          callback()
        });
        stubChmod.callsFake((path, value) => true);
        stubExists.callsFake((path) => false);
        
        await write({ isModule: false, template: { name: 'model', ext: 'ts', dest: 'models' }, patterns: [ { regex: /{{YODA}}/ig, value: 'DARK_VADOR' } ], lowerCase: 'bird' });

        expect(stubReadFile.called).to.be.true;
        expect(stubWriteFile.called).to.be.true;
        expect(stubChmod.called).to.be.true;

        stubReadFile.restore();
        stubWriteFile.restore();
        stubChmod.restore();
      });

    });

    describe('remove()', () => {

      it('should remove core files', async () => {
        const stubRemove = sinon.stub(fs, 'unlink');
        stubRemove.callsFake((path) => true);
        stubReaddir.callsFake((path) => ['01-cat-routes.e2e.test.js', '02-dog-routes.e2e.test.js']);
        await remove(false, [{ name: 'test', ext: 'ts', dest: 'tests' }, { name: 'model', ext: 'ts', dest: 'models' }], 'bird');
        expect(stubRemove.called).to.be.true;
        expect(stubRemove.callCount).to.be.eqls(4);
        expect(stubReaddir.called).to.be.true;
        expect(stubReaddir.callCount).to.be.eqls(1);
        stubRemove.restore();
      });

      it('should remove resource files', async () => {
        const stubRemove = sinon.stub(fs, 'unlink');
        stubRemove.callsFake((path) => true);
        stubReaddir.callsFake((path) => ['01-cat-routes.e2e.test.js', '02-dog-routes.e2e.test.js']);
        await remove(true, [{ name: 'test', ext: 'ts', dest: 'tests' }, { name: 'model', ext: 'ts', dest: 'models' }], 'bird');
        expect(stubRemove.called).to.be.true;
        expect(stubRemove.callCount).to.be.eqls(4);
        expect(stubReaddir.called).to.be.true;
        expect(stubReaddir.callCount).to.be.eqls(1);
        stubRemove.restore();
      });

    });

    describe('getSegment()', () => {

      it('should get good segment for resources path', () => {
        const segment = getSegment(true, { name: 'model' }, 'bird');
        expect(segment).to.be.eqls('src/api/resources/bird/bird');
      });

      it('should get good segment for core path', () => {
        const segment = getSegment(false, { name: 'model', dest: 'models' }, 'bird');
        expect(segment).to.be.eqls('src/api/core/models/bird');
      });

      it('should get good segment for test template', (done) => {
        stubExists.callsFake((path) => true);
        stubReaddir.callsFake((path) => ['01-cat-routes.e2e.test.js', '02-dog-routes.e2e.test.js']);
        const segment = getSegment(true, { name: 'test' }, 'bird');
        expect(segment).to.be.eqls('test/e2e/03-bird-routes.e2e');
        expect(stubExists.called).to.be.true;
        expect(stubReaddir.called).to.be.true;
        done();
      });

    });

  });

  describe('String', () => {

    describe('toPermissions()', () => {

      it('should throws type error', () => {
        try {
          toPermissions(5);
        } catch(e) {
          expect(e).to.be.instanceOf(Error);
        }
      });

      it('should throws bad request error', () => {
        try {
          toPermissions('fdshffhjkds');
        } catch(e) {
          expect(e).to.be.instanceOf(Error);
        }
      });

      it('should returns array of 2 permissions from short parameter', () => {
        const result = toPermissions('-p=a,u');
        expect(result).to.be.an('array');
        expect(result.length).to.be.eqls(2);
        expect(result.includes('admin')).to.be.true;
        expect(result.includes('user')).to.be.true;
      });

      it('should returns array of 3 permissions from long parameter', () => {
        const result = toPermissions('-p=admin,user,ghost');
        expect(result).to.be.an('array');
        expect(result.length).to.be.eqls(3);
        expect(result.includes('admin')).to.be.true;
        expect(result.includes('user')).to.be.true;
        expect(result.includes('ghost')).to.be.true;
      });

    });

    describe('toHyphen()', () => {

      it('should throws error', () => {
        try {
          toHyphen(5);
        } catch(e) {
          expect(e).to.be.instanceOf(Error);
        }
      });

      it('should returns hyphenized string', () => {
        expect(toHyphen('This is a string')).to.be.eqls('this-is-a-string');
      });

    });

    describe('toUnderscore()', () => {

      it('should throws error', () => {
        try {
          toUnderscore(5);
        } catch(e) {
          expect(e).to.be.instanceOf(Error);
        }
      });

      it('should returns underscored string', () => {
        expect(toUnderscore('This is a string')).to.be.eqls('this_is_a_string');
      });

    });

  });

  describe('Validation', () => {

    describe('isValidEntityName()', () => {

      it('should be in error (content)', () => {
        expect(isValidEntityName('3dsf').error).to.be.a('string');
      });

      it('should be in error (length)', () => {
        expect(isValidEntityName('sf').error).to.be.a('string');
      });

      it('should be valid', () => {
        expect(isValidEntityName('dsf').error).to.be.null;
      });

    });

    describe('isValidTarget()', () => {

      it('should be in error', () => {
        expect(isValidTarget('-m').error).to.be.a('string');
      });
      
      it('should be valid', () => {
        expect(isValidTarget('--core').error).to.be.null;
      });

    });

    describe('isValidPathDestination()', () => {

      it('should be in error', (done) => {
        stubExists.callsFake( (path) => true);
        expect(isValidPathDestination({ name: 'cat', target: '-r'}).error).to.be.a('string');
        expect(stubExists.called).to.be.true;
        done();
      });
      
      it('should be valid', () => {
        expect(isValidPathDestination({ name: 'cat', target: '-r'}).error).to.be.null;
        expect(isValidPathDestination({ name: 'cat', target: '--resources'}).error).to.be.null;
        expect(isValidPathDestination({ name: 'cat', target: '-c'}).error).to.be.null;
      });

    });

    describe('areValidRoles()', () => {

      it('should throws type error', () => {
        try {
          areValidRoles(5);
        } catch(e) {
          expect(e).to.be.instanceOf(Error);
        }
      });

      it('should throws bad request error', () => {
        try {
          areValidRoles('p');
        } catch(e) {
          expect(e).to.be.instanceOf(Error);
        }
      });

      it('should be in error', () => {
        expect(areValidRoles('p=yoda').error).to.be.a('string');
      });
      
      it('should be in error', () => {
        expect(areValidRoles('-p=yoda').error).to.be.a('string');
      });

      it('should be valid', () => {
        expect(areValidRoles('-p=a').error).to.be.null;
      });

    });

    describe('validate()', () => {

      it('should be in error', () => {
        expect(validate({ name: '3s', target: 'p', permissions: '-m=s' }).length).to.be.gt(0);
      });

      it('should be valid', () => {
        expect(validate({ name: 'cat', target: '-r', permissions: '-p=a'}).length).to.be.eqls(0);
      });

    });

  });

});


