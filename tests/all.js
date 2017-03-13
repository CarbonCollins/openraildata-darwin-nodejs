'use strict';

const expect = require('chai').expect;
const Darwin = require('../index');

require('dotenv').config();

describe('openraildata-darwin test suite', () => {
  before(() => {
    if (process.env.QUEUE && process.env.QUEUE === '') {
      throw new Error('QUEUE environment variable not present, or is empty');
    }
    const credentials = Darwin.credentials;
    if (!credentials || (typeof credentials !== 'object')) {
      throw new Error('Darwin credentials missing from module, or is not an object');
    }
    const StompClient = Darwin.StompClient;
    if (!StompClient || (typeof StompClient !== 'function')) {
      throw new Error('StompClient missing from module, or is not an object');
    }
  });

  describe('Credential check', () => {
    it('Expect correct credentials within module', () => {
      const credentials = Darwin.credentials;
      expect(credentials.host).to.be.equal('datafeeds.nationalrail.co.uk', 'instance host is incorrect');
      expect(credentials.port).to.be.equal(61613, 'instance port is incorrect');
      expect(credentials.connectHeaders.login).to.be.equal('d3user', 'instance has the incorrect username');
      expect(credentials.connectHeaders.passcode).to.be.equal('d3password', 'instance has the incorrect username');
    });
  });

  describe('Create a new instance of Darwin client', () => {
    it('Expect an invalid darwin instance', () => {
      const testDarwin = new Darwin();
      expect(testDarwin).to.be.an('object', 'Resultant should be an object');
      expect(testDarwin.queue).to.be.an('string', 'Resulting queue should be a string');
      expect(testDarwin.queue).to.be.equal('', 'Resulting queue string should be empty');
    });
    it('Expect an valid darwin instance', () => {
      const testDarwin = new Darwin('fakequeue');
      expect(testDarwin).to.be.an('object', 'Resultant should be an object');
      expect(testDarwin.queue).to.be.an('string', 'Resulting queue should be a string');
      expect(testDarwin.queue).to.be.equal('fakequeue', 'Resulting queue string should be empty');
    });
  });

  describe('StompClient Class tests', () => {
    const stompClient = new Darwin.StompClient();
    describe('Connect tests', () => {
      it('Expect a valid connection to Darwin server', (done) => {
        stompClient.connect().then(() => {
          expect(stompClient.stompClient).to.be.an('object', 'Expected a client object to be generated');
          done();
        }).catch((err) => {
          done(err);
        });
      }).timeout(10000);
    });
    describe('Subscribe tests', () => {
    //   it('Expect an error when subscribing to invalid queue', (done) => {
    //     stompClient.subscribe('fake').then(() => {
    //       done();
    //     }).catch((err) => {
    //       done(err);
    //     });
    //   });
      it('Expect subscription to valid queue', (done) => {
        stompClient.subscribe(process.env.QUEUE).then(() => {
          done();
        }).catch((err) => {
          done(err);
        });
      }).timeout(10000);
    });
    describe('Disconnect tests', () => {
      it('Expect disconnection from Darwin server', (done) => {
        expect(stompClient.stompClient).to.be.an('object', 'Darwin client should already be connected for this test');
        stompClient.disconnect().then((action) => {
          expect(action).to.be.equal(true, 'Darwin client was not already connected for test');
          expect(stompClient.stompClient).to.not.be.an('object', 'Darwin client should have been destroyed');
          done();
        }).catch((err) => {
          done(err);
        });
      }).timeout(10000);
      it('Expect disconnection from Darwin server (already disconnected)', (done) => {
        expect(stompClient.stompClient).to.not.be.an('object', 'Darwin client should not already be connected for this test');
        stompClient.disconnect().then((action) => {
          expect(action).to.be.equal(false, 'Darwin client was already connected for test');
          expect(stompClient.stompClient).to.not.be.an('object', 'Darwin client should have been destroyed');
          done();
        }).catch((err) => {
          done(err);
        });
      }).timeout(10000);
    });
  });

  describe('Darwin Class tests', () => {
    const darwinConTest = new Darwin();
    const darwinConTestinVal = new Darwin('fake'); // having trouble handling invalid destination error
    const darwinConTestVal = new Darwin(process.env.QUEUE);
    describe('Connect to Darwin Server', () => {
      it('Expect an invalid darwin connection (no queue)', (done) => {
        darwinConTest.connect().then(() => {
          done(new Error('Connection should have failed and thrown an error'));
        }).catch((err) => {
          expect(err instanceof Error).to.be.equal(true, 'Promise should return an error on invalid Darwin instance');
          done();
        });
      }).timeout(10000);
      // it('Expect an invalid darwin connection (fake queue)', (done) => {
      //   darwinConTestinVal.connect().then(() => {
      //     done(new Error('Connection should have failed and thrown an error'));
      //   }).catch((err) => {
      //     expect(err instanceof Error).to.be.equal(true, 'Promise should return an error on invalid Darwin instance');
      //     done();
      //   });
      // }).timeout(10000);
      it('Expect a valid darwin connection', (done) => {
        darwinConTestVal.connect().then((client) => {
          expect(client instanceof Darwin.StompClient).to.be.equal(true, 'Promise should return an an instance of the stomp client');
          done();
        }).catch(() => {
          done(new Error('Connection should have failed and thrown an error'));
        });
      }).timeout(10000);
    });
    describe('Disconnect from Darwin server', () => {
      it('Expect server to disconnect from existing connection', (done) => {
        expect(darwinConTestVal.client.stompClient).to.be.an('object', 'Darwin client should already be connected for this test');
        darwinConTestVal.disconnect().then((action) => {
          expect(action).to.be.equal(true, 'Darwin client was not already connected for test');
          expect(darwinConTestVal.client).to.be.equal(null, 'Darwin client should have been destroyed');
          done();
        }).catch((err) => {
          done(err);
        });
      }).timeout(10000);
      it('Expect server to disconnect from Darwin server (already disconnected)', (done) => {
        expect(darwinConTestVal.client).to.be.equal(null, 'Darwin client should already be connected for this test');
        darwinConTestVal.disconnect().then((action) => {
          expect(action).to.be.equal(false, 'Darwin client was already connected for test');
          expect(darwinConTestVal.client).to.be.equal(null, 'Darwin client should have been destroyed');
          done();
        }).catch((err) => {
          done(err);
        });
      }).timeout(10000);
    });
  });
});
