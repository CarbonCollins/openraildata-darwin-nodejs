/**
 * Name:    openraildata-darwin example useage
 * Author:  Steven Collins (https://github.com/CarbonCollins)
 * Date:    Sunday 12th March 2017
 *
 * Desc:    Example use of the openraildata-darwin package.
 *          This package uses promises and events to pass data.
 */

'use strict';

const Darwin = require('../index');

// recomended to put queue name into environment file
require('dotenv').config();

// Initialise the client by passing the queue name into a new instance.
const darwin = new Darwin(process.env.QUEUE);

// Connect to DARWIN:PushPort server which will return a client object on success and an error on failure
darwin.connect().then((client) => {

  // 'message' event will receive all incomming messages converted into JSON
  client.on('message', (message) => {
    // do something with the message JSON obj
  });

  // 'trainStatus' event will receive all trainstatus messages
  client.on('trainStatus', (message) => {
    console.log(JSON.stringify(message, null, 2));
  });

  // 'schedule' event will receive all schedule messages
  client.on('schedule', (schedule) => {
    console.log(JSON.stringify(schedule, null, 2));
  });

  // 'error' will return any unexpected errors during message retreival
  client.on('error', (error, headers) => {
    console.error('client error');
  });

  // No other events have been programmed yet so the ones listed here are the only valid ones.
}).catch((err) => {
  // In the event that it was unable to connect to the pushport server then display an error message
  console.error(err);
});
