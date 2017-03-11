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
      callback(new Error('STOMP client was already initialised'));
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
      if (typeof queueName === 'string' && queueName !== '') {
        const subHeaders = {
          destination: `/queue/${queueName}`,
          ack: 'auto'
        };
        this.client.subscribe(subHeaders, (err, message) => {
          message.on('readable', () => {
            let chunk;
            while (null !== (chunk = message.read())) {
              zlib.gunzip(chunk, (error, response) => {
                if (error) {
                  console.log(message.headers);
                  console.log(error);
                } else {
                  console.log(message.headers.FilterHeaderLevel);
                  console.log(response.toString());
                }
              });
            }
          });

          message.on('end', () => {
            this.client.ack(message);
          });

          // needs to support gzip data
          // message.readString('utf-8', (er, body) => {
          //   console.log(body);
          //   callback(er, JSON.parse(body));
          // });
        });
      } else {
        callback(new Error('Queue name must be a string and not empty'));
      }
    } else {
      callback(new Error('Unable to subscribe. Not connected to the DARWIN server.'));
    }
  }
}

module.exports = darwinClient;




/*
stompit.connect(connectOptions, function(error, client) {

    if(error){
        console.log('Unable to connect: ' + error.message);
        return;
    }

    const subscribeParams = {
        'destination': '/queue/QUEUE_NAME_HERE',
        'ack': 'client-individual'
    };


    client.subscribe(subscribeParams, function(error, message){

        const read = function(){
            let chunk;
            while(null !== (chunk = message.read())){
                zlib.gunzip(chunk, function (error, response) {

                    if (error) {
                        console.log(message.headers)
                        console.log(error)
                    } else {
                        console.log(message.headers.FilterHeaderLevel)
                        console.log(response.toString());
                    }
                });
            }
        };

        message.on('readable', read);

        message.on('end', function(){
            client.ack(message);
        });
    });
});

*/