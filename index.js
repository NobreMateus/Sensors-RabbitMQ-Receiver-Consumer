var amqp = require('amqplib/callback_api');
var cors = require('cors')
const express = require('express')
const app = express()
const port = 3001

app.use(cors())

amqp.connect('amqp://localhost', function(error0, connection) {
  if (error0) {
    throw error0;
  }
  const sendMessage = (sensor, identifier, minValue, maxValue, value)=>{
    connection.createChannel(function(error1, channel) {
    if (error1) {
      throw error1;
    }
    var queue = sensor;
    // var msg = 'Tá funcionando, viu. E muito bem!!!';

    var msg = {
      identifier: identifier,
      minValue: minValue,
      maxValue: maxValue,
      value: value
    }

    channel.assertQueue(queue, {
      durable: true
    });

    channel.sendToQueue(queue, Buffer.from(JSON.stringify(msg)),  {persistent: true});
    console.log(" [x] Sent %s", msg);
  });
}
  // setTimeout(function() {
  //   connection.close();
  //   process.exit(0)
  //   }, 500);

  app.get('/', (req, res) => {
    sendMessage()
    res.send('Hello World!')
  })


  app.get('/:sensor/:identifier/:minValue/:maxValue/:value', (req, res) => {
  
    const sensor = req.params.sensor
    const identifier = req.params.identifier
    const minValue = req.params.minValue
    const maxValue = req.params.maxValue
    const value = req.params.value

    sendMessage(sensor, identifier, minValue, maxValue, value)

    // res.send(`
    //   <html>
    //     <div>Sensor: ${req.params.sensor}</div>
    //     <div>Identifier: ${req.params.identifier}</div>
    //     <div>Min Value: ${req.params.minValue}</div>
    //     <div>Max Value: ${req.params.maxValue}</div>
    //     <div>Value: ${req.params.value}</div>
    //   </html>
    // `)
    res.sendStatus(200)
  })

  app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
  })

});