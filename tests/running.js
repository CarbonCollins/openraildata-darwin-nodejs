const Darwin = require('../index');

const darwin = new Darwin();

darwin.connect((err, client) => {
  if (!err) {
    console.log('connected to stomp server');
    client.on('message', (msg) => {
      if (msg.Pport.uR.schedule) {
        // console.log(JSON.stringify(msg, null, 2));
      }
    });
    client.on('status', (train) => {
      //console.log(JSON.stringify(train, null, 2));
    });
    client.on('schedule', (schedule) => {
      console.log(JSON.stringify(schedule, null, 2));
    });
    client.on('error', (error, headers) => {
      console.error('client error');
    });

    darwin.subscribe(process.env.QUEUE);
  } else {
    console.log(err);
  }
});
