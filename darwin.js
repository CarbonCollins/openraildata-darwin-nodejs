/**
 * openraildata-darwin - Connects to National Rails DARWIN system to provide real-time
 * information such as train prediction data within the UK.
 *
 * Author: Steven Collins (https://github.com/divergentlepton)
 *
 */

'use strict';

const stompit = require('stompit');


class darwinClient {
  constructor() {
    this.credentials = {
      host: 'datafeeds.nationalrail.co.uk',
      port: 61613,
      connectHeaders: {
        host: '/',
        login: 'd3user',
        passcode: 'd3password',
        'heart-beat': '5000,5000'
      }
    };
    this.client = null;
  }

  /**
   * Connects to the DARWIN server
   * @callback(err) - callback returns one parameter, intended for
   * error returns (Not implemented yet)
   */
  connect(callback) {
    if (this.client === null) {
      stompit.connect(this.credentials, (err, client) => {
        if (err) {
          callback(err);
          return;
        }
        this.client = client;
        callback(null);
      });
    } else {
      callback({ error: 'STOMP client was already initialised' });
    }
  }

  /**
   * Discnnects from DARWIN server.
   *
   * @timeout - used to specify an amount of time in ms before disconnecting.
   * @callback(err) - callback returns one parameter, intended for
   * error returns (Not implemented yet)
   */
  disconnect(timeout, callback) {
    const time = timeout || 0;
    if (this.client !== null) {
      setTimeout(() => {
        this.client.disconnect((err) => {
          if (err) {
            this.client.destroy();
          }
          this.client = null;
          if (typeof callback === 'function') {
            callback(err);
          } else if (typeof timeout === 'function') {
            timeout(err);
          }
        });
      }, ((typeof timeout === 'function') ? 0 : time));
    } else if (typeof callback === 'function') {
      callback(null);
    } else if (typeof timeout === 'function') {
      timeout(null);
    }
  }

  /**
   * Subscribes to a queue as long as the class is connected to the DARWIN server.
   *
   * @queueName - The topic name to connect to (this is then prepended to /queue/).
   * @callback(err, message) - Callback returns two parameters, an error and a message body.
   */
  subscribe(queueName, callback) {
    if (this.client !== null) {
      const subHeaders = {
        destination: `/queue/${queueName}`,
        ack: 'auto'
      };
      this.client.subscribe(subHeaders, (err, message) => {
        // needs to support gzip data
        message.readString('utf-8', (er, body) => {
          callback(er, JSON.parse(body));
        });
      });
    } else {
      callback({ error: 'Unable to subscribe. Not connected to the DARWIN server.' });
    }
  }
}

module.exports = darwinClient;
