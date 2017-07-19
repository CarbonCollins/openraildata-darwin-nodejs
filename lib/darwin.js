'use strict';

/** 
 * @external Schedule
 * @desc Schedule data class
 * @see {@link https://github.com/CarbonCollins/openraildata-common-nodejs/blob/HEAD/docs/schedule.md|Schedule}
 */
/**
 * @external Association
 * @desc Association data class
 * @see {@link https://github.com/CarbonCollins/openraildata-common-nodejs/blob/HEAD/docs/association.md|Association}
 */
/**
 * @external TrainOrder
 * @desc TrainOrder data class
 * @see {@link https://github.com/CarbonCollins/openraildata-common-nodejs/blob/HEAD/docs/trainOrder.md|TrainOrder}
 */
/**
 * @external StationMessage
 * @desc StationMessage data class
 * @see {@link https://github.com/CarbonCollins/openraildata-common-nodejs/blob/HEAD/docs/stationMessage.md|StationMessage}
 */
/**
 * @external TrainStatus
 * @desc TrainStatus data class
 * @see {@link https://github.com/CarbonCollins/openraildata-common-nodejs/blob/HEAD/docs/trainStatus.md|TrainStatus}
 */

const common = require('openraildata-common');

const stompit = require('stompit');
const zlib = require('zlib');
const xml2json = require('xml2json');
const EventEmitter = require('events');

const server1 = {
  host: 'datafeeds.nationalrail.co.uk',
  port: 61613,
  connectHeaders: {
    host: '/',
    login: 'd3user',
    passcode: 'd3password',
    'heart-beat': '5000,5000'
  }
};

function replaceKeys(jsonObj) {
  let jsonString = JSON.stringify(jsonObj);
  jsonString = jsonString.replace(/"ns3:Location"/g, '"locations"').replace(/"ns\d:/g, '"');
  return JSON.parse(jsonString);
}

/**
 * @class
 * @classdesc a service for connecting and communicating with the National Rail Darwin PushPort server
 */
class Darwin extends EventEmitter {
  /**
   * @constructor
   */
  constructor() {
    super();
    this._channel = null;
  }

  /**
   * @method Darwin~connect
   * @desc connects to the Darwin server and subscribes to a specified queue
   * @param {string} queue the queue to subscribe to
   * @fires Darwin#trainStatus 
   * @fires Darwin#schedule
   * @fires Darwin#association
   * @fires Darwin#trainOrder
   * @fires Darwin#stationMessage
   */
  connect(queue) {
    const servers = new stompit.ConnectFailover([server1]);
    this._channel = new stompit.Channel(servers, { alwaysConnected: true });

    this._channel.subscribe(queue, (err, message) => {
      const type = message.headers.FilterHeaderLevel;

      message.on('readable', () => {
        const buffer = [];
        const messageStream = zlib.createGunzip();
        messageStream.setEncoding('utf8');

        messageStream.on('error', (error) => { if (buffer.length > 0) { this.emit('error', error, message.headers); }});
        messageStream.on('data', (data) => { buffer.push(data); });

        messageStream.on('end', () => {
          const messageXML = buffer.join('');
          const messageJSON = replaceKeys(xml2json.toJson(messageXML, { object: true, coerce: true, reversible: false }));
          switch(type) {
            case 'TRAINSTATUS,':
              /**
               * @event Darwin#trainStatus
               * @type {object}
               * @property {string} ts a timestamp of when the event was issued
               * @property {TrainStatus} trainStatus a train status class
               * @property {string} origin where the event originated from 
               */
              this.emit('trainStatus', {
                ts: messageJSON.Pport.ts,
                trainStatus: new common.TrainStatus(messageJSON.Pport.uR.TS),
                origin: messageJSON.Pport.uR.updateOrigin
              });
              break;
            case 'SCHEDULE,':
              /**
               * @event Darwin#schedule
               * @type {object}
               * @property {string} id an id for the event
               * @property {string} ts a timestamp of when the event was issued
               * @property {Schedule} schedule a schedule class
               * @property {string} origin where the event originated from 
               * @property {string} source which source did the vent originate from
               */
              this.emit('schedule', {
                id: messageJSON.Pport.uR.requestID,
                ts: messageJSON.Pport.ts,
                schedule: new common.Schedule(messageJSON.Pport.uR.schedule),
                origin: messageJSON.Pport.uR.updateOrigin,
                source: messageJSON.Pport.uR.requestSource
              });
              break;
            case 'ASSOCIATION,':
              /**
               * @event Darwin#association
               * @type {object}
               * @property {string} id an id for the event
               * @property {string} ts a timestamp of when the event was issued
               * @property {Association} association a association class
               * @property {string} origin where the event originated from 
               * @property {string} source which source did the vent originate from
               */
              this.emit('association', {
                id: messageJSON.Pport.uR.requestID,
                ts: messageJSON.Pport.ts,
                association: new common.Association(messageJSON.Pport.uR.association),
                origin: messageJSON.Pport.uR.updateOrigin,
                source: messageJSON.Pport.uR.requestSource
              });
              break;
            case 'TRAINORDER,':
              /**
               * @event Darwin#trainOrder
               * @type {object}
               * @property {string} id an id for the event
               * @property {string} ts a timestamp of when the event was issued
               * @property {TrainOrder} trainOrder a TrainOrder class
               * @property {string} origin where the event originated from 
               * @property {string} source which source did the vent originate from
               */
              this.emit('trainOrder', {
                id: messageJSON.Pport.uR.requestID,
                ts: messageJSON.Pport.ts,
                trainOrder: new common.TrainOrder(messageJSON.Pport.uR.trainOrder),
                origin: messageJSON.Pport.uR.updateOrigin,
                source: messageJSON.Pport.uR.requestSource
              });
              break;
            case 'STATIONMESSAGE,':
              /**
               * @event Darwin#stationMessage
               * @type {object}
               * @property {string} ts a timestamp of when the event was issued
               * @property {StationMessage} stationMessage a StationMessage class
               * @property {string} origin where the event originated from
               */
              this.emit('stationMessage', {
                ts: messageJSON.Pport.ts,
                stationMessage: new common.StationMessage(messageJSON.Pport.uR.OW),
                origin: messageJSON.Pport.uR.updateOrigin
              });
              break;
            default: 
              this.emit('unhandledMessage', messageJSON);
              break;
          }
        });

        message.pipe(messageStream);
      });
    });
  }
}

module.exports = Darwin;
