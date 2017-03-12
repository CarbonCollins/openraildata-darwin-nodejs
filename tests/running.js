const Darwin = require('../index');

const test = new Darwin('D3ff6b456d-147d-4e22-89fb-d2680ed2afd9');
test.connect().then((client) => {
  console.log(client);
  client.on('message', (msg) => {
    if (msg.Pport.uR.schedule) {
      // console.log(JSON.stringify(msg, null, 2));
    }
  });
  client.on('trainStatus', (train) => {
    console.log(JSON.stringify(train, null, 2));
  });
  client.on('schedule', (schedule) => {
    console.log(JSON.stringify(schedule, null, 2));
  });
  client.on('error', (error, headers) => {
    console.error('client error');
  });
}).catch((err) => {
  console.error(err);
});
