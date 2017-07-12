/**
 * Name:    openraildata-darwin
 * Author:  Steven Collins (https://github.com/CarbonCollins)
 * Date:    Sunday 12th March 2017
 *
 * Git:     https://github.com/CarbonCollins/openraildata-darwin
 * Desc:    Connects to National Rails DARWIN:PushPort data system to provide real-time
 *          information such as train prediction data within the UK.
 *
 */

'use strict';

const stompit = require('stompit');
const zlib = require('zlib');
const EventEmitter = require('events');
const parser = require('xml2json');

/**
 * @type {object} credentials The connection credentials used to connect to DARWIN:PushPort servers.
 */
const credentials = {
  host: 'datafeeds.nationalrail.co.uk',
  port: 61613,
  connectHeaders: {
    host: '/',
    login: 'd3user',
    passcode: 'd3password',
    'heart-beat': '5000,5000'
  }
};

/**
 * @method replaceKeys
 * @param {object} jsonObj
 * @return {object} An object with 'ns0:' tags removed from key names and some renamed.
 */
function replaceKeys(jsonObj) {
  let jsonString = JSON.stringify(jsonObj);
  jsonString = jsonString
      .replace(/"ns3:Location"/g, '"locations"')
      .replace(/"ns\d:/g, '"');
  return JSON.parse(jsonString);
}

/**
 * @method formatMessage
 * @param {object} Obj
 * @return {object} A message formatted into a common format and type determined
 */
function formatMessage(Obj) {
  if (Obj && Obj.Pport) {
    const formatedObj = {
      type: 'unknown',
      message: {},
      timestamp: Obj.Pport.ts || new Date().getTime()
    };

    if (Obj.Pport.uR.TS) {
      formatedObj.type = 'trainStatus';
      formatedObj.message = Obj.Pport.uR.TS || {};
    } else if (Obj.Pport.uR.schedule) {
      formatedObj.type = 'schedule';
      formatedObj.message = Obj.Pport.uR.schedule || {};
    }
    return formatedObj;
  }
  // If message is incorrect then return base JSON
  return {
    type: 'unknown',
    message: Obj
  };
}

/**
 * @class stompClient
 */
class StompClient extends EventEmitter {
  /**
   * @constructor
   */
  constructor() {
    super();
    this.stompClient = null;
  }

  /**
   * @method connect
   * @return {Promise} A promise with {@link StompClient} if resolved, otherwise {@link Error}
   */
  connect() {
    return new Promise((resolve, reject) => {
      stompit.connect(credentials, (err, stompClient) => {
        if (err) {
          reject(err);
        } else {
          this.stompClient = stompClient;
          this.stompClient.on('error', (err) => {
            console.error(err);
          });
          resolve();
        }
      });
    });
  }

  /**
   * @method disconnect
   * @return {Promise} A promise with {@link StompClient} when resolved
   */
  disconnect() {
    return new Promise((resolve) => {
      if (this.stompClient !== null) {
        this.stompClient.disconnect((err) => {
          if (err) {
            this.stompClient.destroy();
          }
          this.stompClient = null;
          resolve(true);
        });
      } else {
        resolve(false);
      }
    });
  }

  /**
   * Subscribes to a queue as long as the class is connected to the DARWIN server.
   *
   * @method subscribe
   * @param {string} queueName - The topic name to connect to (this is then prepended to /queue/).
   * @return undefined
   */
  subscribe(queueName) {
    return new Promise((resolve, reject) => {
      if (this.stompClient !== null) {
        if (typeof queueName === 'string' && queueName !== '') {
          const subHeaders = {
            destination: `/queue/${queueName}`,
            ack: 'auto' /* 'client-individual' */
          };
          this.stompClient.subscribe(subHeaders, (err, message) => {
            if (err) {
              reject(err);
            } else {
              message.on('readable', () => {
                const buffer = [];
                const messageStream = zlib.createGunzip();
                messageStream.setEncoding('utf8');

                messageStream.on('data', (data) => {
                  buffer.push(data);
                });

                messageStream.on('end', () => {
                  const messageXML = buffer.join('');
                  const messageJSON = formatMessage(replaceKeys(parser.toJson(messageXML, {
                    object: true,
                    coerce: true,
                    reversible: false
                  })));

                  this.emit('message', messageJSON);
                  this.emit(messageJSON.type, messageJSON);
                });

                messageStream.on('error', (error) => {
                  if (buffer.length > 0) { // check if empty message
                    this.emit('error', error, message.headers);
                  } else if (message.headers['content-length'] > 0) {
                    // this.stompClient.nack(message);
                    // not recived the data? need to look into this
                  }
                });

                message.pipe(messageStream);
              });
              resolve();
            }
          });
        } else {
          reject(new Error('Queue name must be a string and not empty'));
        }
      } else {
        reject(new Error('Unable to subscribe. Not connected to the DARWIN server.'));
      }
    });
  }
}

/**
 * @class PushPort
 */
class PushPort {
  /**
   * @constructor
   * @param {string} queue The queue in which the PushPort client will connect to
   */
  constructor(queue) {
    this.queue = queue || '';
    this.client = null;
  }

  /**
   * Connects to the National Rail DARWIN:PushPort server.
   *
   * @method connect
   * @return {Promise} A promise with {@link StompClient} if resolved, otherwise {@link Error}
   */
  connect() {
    return new Promise((resolve, reject) => {
      if (this.client === null) {
        if (this.queue && this.queue !== '') {
          this.client = new StompClient();
          this.client.connect().then(() => {
            return this.client.subscribe(this.queue);
          }).then(() => {
            resolve(this.client);
          }).catch((err) => {
            reject(err);
          });
        } else {
          reject(new Error('Queue is not a string or is empty'));
        }
      } else {
        reject(new Error('A STOMP client already exists'));
      }
    });
  }

  /**
   * Disconnects from the National Rail DARWIN:PushPort server.
   *
   * @method disconnect
   * @return {Promise} A promise with {@link StompClient}
   */
  disconnect() {
    return new Promise((resolve) => {
      if (this.client !== null) {
        this.client.disconnect().then(() => {
          this.client = null;
          resolve(true);
        });
      } else {
        resolve(false);
      }
    });
  }
}

module.exports = PushPort;
module.exports.PushPort = PushPort;
module.exports.credentials = credentials;
module.exports.StompClient = StompClient;
