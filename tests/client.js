'use strict';

const expect = require('chai').expect;
const Darwin = require('../darwin');

describe('openraildata-darwin tests', () => {
  describe('Environment check', () => {
    it('Expect a valid "QUEUE" enviroment variable', () => {
      expect(process.env.QUEUE).to.be.an('string', 'QUEUE env should be an string');
      expect(process.env.QUEUE).to.not.be.equal('', 'QUEUE env should not be an empty string');
    });
  });

  describe('Create a new instance of darwin client', () => {
    it('Expect a valid darwin instance', () => {
      const testDarwin = new Darwin();
      expect(testDarwin).to.be.an('object', 'Resultant should be an object');
      expect(testDarwin.stompCredentials.host).to.be.equal('datafeeds.nationalrail.co.uk', 'instance host is incorrect');
      expect(testDarwin.stompCredentials.port).to.be.equal(61613, 'instance port is incorrect');
      expect(testDarwin.stompCredentials.connectHeaders.login).to.be.equal('d3user', 'instance has the incorrect username');
      expect(testDarwin.stompCredentials.connectHeaders.passcode).to.be.equal('d3password', 'instance has the incorrect username');
    });
  });

  describe('Darwin Class tests', () => {
    const darwinConTest = new Darwin();
    describe('Connect to Darwin Server', () => {
      it('Expect a valid darwin connection', (done) => {
        expect(darwinConTest).to.be.an('object', 'Resultant should be an object');
        darwinConTest.connect((err, client) => {
          expect(err).to.be.equal(null, 'No error should be returned on connection');
          expect(client).to.not.be.equal(null, 'Resulting cliuent should not be null');
          expect(client).to.be.an('object', 'resulting client should be an object');
          expect(darwinConTest.stompClient).to.not.be.equal(null, 'Client should not be null');
          done();
        });
      }).timeout(10000);
      it('Expect an invalid darwin connection', (done) => {
        expect(darwinConTest).to.be.an('object', 'Resultant should be an object');
        expect(darwinConTest.stompClient).to.not.be.equal(null, 'Client should not be null');
        darwinConTest.connect((err, client) => {
          expect(err instanceof Error).to.be.equal(true, 'An Error object should be returned');
          expect(client).to.be.equal(null, 'Resulting client should be null');
          expect(darwinConTest.stompClient).to.not.be.equal(null, 'Client should not be null');
          done();
        });
      }).timeout(10000);
    });
    describe('Subscribe to queue', () => {
      const darwinnonConTest = new Darwin();
      it('Expect an invalid subscription attempt (invalid client)', (done) => {
        darwinnonConTest.subscribe(process.env.QUEUE, (err) => {
          expect(err instanceof Error).to.be.equal(true, 'An Error object should be returned');
          done();
        });
      }).timeout(10000);
      it('Expect an invalid subscription attempt (empty queue name)', (done) => {
        darwinConTest.subscribe('', (err) => {
          expect(err instanceof Error).to.be.equal(true, 'An Error object should be returned');
          done();
        });
      }).timeout(10000);
      it('Expect a valid subscription attempt', (done) => {
        darwinConTest.subscribe(process.env.QUEUE, (err) => {
          expect(err instanceof Error).to.be.equal(true, 'An Error object should be returned');
          done();
        });
      }).timeout(10000);
    });
  });
});
