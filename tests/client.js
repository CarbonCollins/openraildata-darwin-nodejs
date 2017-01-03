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
      expect(testDarwin.credentials.host).to.be.equal('datafeeds.nationalrail.co.uk', 'instance host is incorrect');
      expect(testDarwin.credentials.port).to.be.equal(61613, 'instance port is incorrect');
      expect(testDarwin.credentials.connectHeaders.login).to.be.equal('d3user', 'instance has the incorrect username');
      expect(testDarwin.credentials.connectHeaders.passcode).to.be.equal('d3password', 'instance has the incorrect username');
    });
  });

  describe('Connect to Darwin Server', () => {
    const testDarwin = new Darwin();
    it('Expect a valid darwin connection', (done) => {
      expect(testDarwin).to.be.an('object', 'Resultant should be an object');
      testDarwin.connect((err) => {
        expect(err).to.be.equal(null, 'No error should be returned on connection');
        expect(testDarwin.client).to.not.be.equal(null, 'Client should not be null');
        done();
      });
    });
    it('Expect an invalid darwin connection', (done) => {
      expect(testDarwin).to.be.an('object', 'Resultant should be an object');
      expect(testDarwin.client).to.not.be.equal(null, 'Client should not be null');
      testDarwin.connect((err) => {
        expect(err instanceof Error).to.be.equal(true, 'An Error object should be returned');
        expect(testDarwin.client).to.not.be.equal(null, 'Client should not be null');
        done();
      });
    });
  });
});
