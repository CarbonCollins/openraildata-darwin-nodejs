'use strict';

const expect = require('chai').expect;
const Darwin = require('../darwin');

require('dotenv').config();

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
});
