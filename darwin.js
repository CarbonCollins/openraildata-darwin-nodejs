/**
 * openraildata-darwin - Connects to National Rails DARWIN system to provide real-time
 * information such as train prediction data within the UK.
 *
 * Author: Steven Collins (https://github.com/CarbonCollins)
 *
 */

'use strict';

const stompit = require('stompit');
const zlib = require('zlib');
const EventEmitter = require('events');
const parser = require('xml2json');

/**
 * @method replaceKeys
 * @param {object} jsonObj
 */
function replaceKeys(jsonObj) {
  let jsonString = JSON.stringify(jsonObj);
  jsonString = jsonString
      .replace(/"ns3:Location"/g, '"locations"')
      .replace(/"ns\d:/g, '"');
  return JSON.parse(jsonString);
}
/**
 * @class stompClient
 */
class StompClient extends EventEmitter {
  constructor() {
    this.
  }
}

const darwinEvents = new DarwinEvents();

/**
 * @class darwinClient
 * @param {string} something
 */
class darwinClient {
  /**
   * @constructor
   * @param {boolean} [convertToJSON=true] - convery xml messages into JSON on 'message' events
   */
  constructor(convertToJSON) {
    this.convertToJson = convertToJSON || true;
    this.stompClient = null;
    this.stompCredentials = {
      host: 'datafeeds.nationalrail.co.uk',
      port: 61613,
      connectHeaders: {
        host: '/',
        login: 'd3user',
        passcode: 'd3password',
        'heart-beat': '5000,5000'
      }
    };
  }

  /**
   * Connects to the DARWIN server.
   *
   * @method connect
   * @param {connectCallback} callback - The callback that handles the response.
   * @return undefined
   */
  connect(callback) {
    const cb = (typeof callback === 'function') ? callback : (() => {});
    if (this.stompClient === null) {
      stompit.connect(this.stompCredentials, (err, stompClient) => {
        if (err) {
          cb(err, null);
          return;
        }
        this.stompClient = stompClient;
        cb(null, darwinEvents);
      });
    } else {
      cb(new Error('STOMP client was already initialised'), null);
    }
  }

  /**
   * Discnnects from DARWIN server.
   *
   * @method disconnect
   * @param {number} [timeout=0] - used to specify an amount of time in ms before disconnecting.
   * @param {disconnectCallback} callback - The callback that handles the response.
   * @return undefined
   */
  disconnect(timeout, callback) {
    const cb = ((typeof timeout === 'function') ? timeout : callback) || (() => {});
    const time = ((typeof timeout === 'function') ? 0 : timeout) || 0;
    if (this.stompClient !== null) {
      setTimeout(() => {
        this.stompClient.disconnect((err) => {
          if (err) {
            this.stompClient.destroy();
          }
          this.stompClient = null;
          cb(err);
        });
      }, time);
    } else {
      cb(null);
    }
  }


  /**
   * Subscribes to a queue as long as the class is connected to the DARWIN server.
   *
   * @method subscribe
   * @param {string} queueName - The topic name to connect to (this is then prepended to /queue/).
   * @return undefined
   */
  subscribe(queueName) {
    if (this.stompClient !== null) {
      if (typeof queueName === 'string' && queueName !== '') {
        const subHeaders = {
          destination: `/queue/${queueName}`,
          ack: 'auto'
        };
        const convertToJSON = this.convertToJson;
        this.stompClient.subscribe(subHeaders, (err, message) => {
          message.on('readable', () => {
            const buffer = [];
            const messageStream = zlib.createGunzip();
            messageStream.setEncoding('utf8');

            messageStream.on('data', (data) => {
              buffer.push(data);
            });

            messageStream.on('end', () => {
              const messageXML = buffer.join('');
              const messageJSON = replaceKeys(parser.toJson(messageXML, {
                object: true,
                coerce: true,
                reversible: false
              }));
              darwinEvents.emit('message', (convertToJSON) ? messageJSON : messageXML);

              if (messageJSON.Pport.uR.TS) {
                darwinEvents.emit('status', {
                  status: messageJSON.Pport.uR.TS,
                  timestamp: messageJSON.Pport.ts
                });
              } else if (messageJSON.Pport.uR.schedule) {
                darwinEvents.emit('schedule', {
                  schedule: messageJSON.Pport.uR.schedule,
                  timestamp: messageJSON.Pport.ts
                });
              }
            });

            messageStream.on('error', (error) => {
              if (buffer.length > 0) { // check if empty message
                darwinEvents.emit('error', error, message.headers);
              }
            });

            message.pipe(messageStream);
          });

          /* Currently having issues with sending ACK */
          // message.on('end', () => {
          //   this.stompClient.ack(message);
          // });
        });
      } else {
        darwinEvents.emit('error', new Error('Queue name must be a string and not empty'));
      }
    } else {
      darwinEvents.emit('error', new Error('Unable to subscribe. Not connected to the DARWIN server.'));
    }
  }
}

module.exports = darwinClient;

/**
 * This callback is displayed as part of the connect function.
 * @callback connectCallback
 * @param {object} error
 * @param {object} client - An event object required to listen to incomming events after connection
 * @return undefined
 */

/**
 * This callback is displayed as part of the disconnect function.
 * @callback disconnectCallback
 * @param {object} error
 * @return undefined
 */
