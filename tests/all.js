'use strict';

const expect = require('chai').expect;
const PushPort = require('../index');

require('dotenv').config();

describe('openraildata-pushport test suite', () => {
  before(() => {
    if (process.env.QUEUE && process.env.QUEUE === '') {
      throw new Error('QUEUE environment variable not present, or is empty');
    }
    const credentials = PushPort.credentials;
    if (!credentials || (typeof credentials !== 'object')) {
      throw new Error('PushPort credentials missing from module, or is not an object');
    }
    const StompClient = PushPort.StompClient;
    if (!StompClient || (typeof StompClient !== 'function')) {
      throw new Error('StompClient missing from module, or is not an object');
    }
  });

  describe('Credential check', () => {
    it('Expect correct credentials within module', () => {
      const credentials = PushPort.credentials;
      expect(credentials.host).to.be.equal('datafeeds.nationalrail.co.uk', 'instance host is incorrect');
      expect(credentials.port).to.be.equal(61613, 'instance port is incorrect');
      expect(credentials.connectHeaders.login).to.be.equal('d3user', 'instance has the incorrect username');
      expect(credentials.connectHeaders.passcode).to.be.equal('d3password', 'instance has the incorrect username');
    });
  });

  describe('Create a new instance of PushPort client', () => {
    it('Expect an invalid pushport instance', () => {
      const testPushPort = new PushPort();
      expect(testPushPort).to.be.an('object', 'Resultant should be an object');
      expect(testPushPort.queue).to.be.an('string', 'Resulting queue should be a string');
      expect(testPushPort.queue).to.be.equal('', 'Resulting queue string should be empty');
    });
    it('Expect an valid pushport instance', () => {
      const testPushPort = new PushPort('fakequeue');
      expect(testPushPort).to.be.an('object', 'Resultant should be an object');
      expect(testPushPort.queue).to.be.an('string', 'Resulting queue should be a string');
      expect(testPushPort.queue).to.be.equal('fakequeue', 'Resulting queue string should be empty');
    });
  });

  describe('StompClient Class tests', () => {
    const stompClient = new PushPort.StompClient();
    describe('Connect tests', () => {
      it('Expect a valid connection to PushPort server', (done) => {
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
      it('Expect disconnection from PushPort server', (done) => {
        expect(stompClient.stompClient).to.be.an('object', 'PushPort client should already be connected for this test');
        stompClient.disconnect().then((action) => {
          expect(action).to.be.equal(true, 'PushPort client was not already connected for test');
          expect(stompClient.stompClient).to.not.be.an('object', 'PushPort client should have been destroyed');
          done();
        }).catch((err) => {
          done(err);
        });
      }).timeout(10000);
      it('Expect disconnection from PushPort server (already disconnected)', (done) => {
        expect(stompClient.stompClient).to.not.be.an('object', 'PushPort client should not already be connected for this test');
        stompClient.disconnect().then((action) => {
          expect(action).to.be.equal(false, 'PushPort client was already connected for test');
          expect(stompClient.stompClient).to.not.be.an('object', 'PushPort client should have been destroyed');
          done();
        }).catch((err) => {
          done(err);
        });
      }).timeout(10000);
    });
  });

  describe('PushPort Class tests', () => {
    const pushPortConTest = new PushPort();
    const pushPortConTestinVal = new PushPort('fake'); // having trouble handling invalid destination error
    const pushPortConTestVal = new PushPort(process.env.QUEUE);
    describe('Connect to PushPort Server', () => {
      it('Expect an invalid pushPort connection (no queue)', (done) => {
        pushPortConTest.connect().then(() => {
          done(new Error('Connection should have failed and thrown an error'));
        }).catch((err) => {
          expect(err instanceof Error).to.be.equal(true, 'Promise should return an error on invalid PushPort instance');
          done();
        });
      }).timeout(10000);
      // it('Expect an invalid pushPort connection (fake queue)', (done) => {
      //   pushPortConTestinVal.connect().then(() => {
      //     done(new Error('Connection should have failed and thrown an error'));
      //   }).catch((err) => {
      //     expect(err instanceof Error).to.be.equal(true, 'Promise should return an error on invalid PushPort instance');
      //     done();
      //   });
      // }).timeout(10000);
      it('Expect a valid pushPort connection', (done) => {
        pushPortConTestVal.connect().then((client) => {
          expect(client instanceof PushPort.StompClient).to.be.equal(true, 'Promise should return an an instance of the stomp client');
          done();
        }).catch(() => {
          done(new Error('Connection should have failed and thrown an error'));
        });
      }).timeout(10000);
    });
    describe('Disconnect from PushPort server', () => {
      it('Expect server to disconnect from existing connection', (done) => {
        expect(pushPortConTestVal.client.stompClient).to.be.an('object', 'PushPort client should already be connected for this test');
        pushPortConTestVal.disconnect().then((action) => {
          expect(action).to.be.equal(true, 'PushPort client was not already connected for test');
          expect(pushPortConTestVal.client).to.be.equal(null, 'PushPort client should have been destroyed');
          done();
        }).catch((err) => {
          done(err);
        });
      }).timeout(10000);
      it('Expect server to disconnect from PushPort server (already disconnected)', (done) => {
        expect(pushPortConTestVal.client).to.be.equal(null, 'PushPort client should already be connected for this test');
        pushPortConTestVal.disconnect().then((action) => {
          expect(action).to.be.equal(false, 'PushPort client was already connected for test');
          expect(pushPortConTestVal.client).to.be.equal(null, 'PushPort client should have been destroyed');
          done();
        }).catch((err) => {
          done(err);
        });
      }).timeout(10000);
    });
  });
});
