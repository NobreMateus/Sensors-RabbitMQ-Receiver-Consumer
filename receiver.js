var amqp = require('amqplib/callback_api');
const server = require('http').createServer();
const io = require('socket.io')(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

io.on('connection', client => {

    console.log("Socket Conectado")

    client.on('event', data => {

    });
    client.on('disconnect', () => {
        console.log("Eu Desconectei")
    });

    amqp.connect('amqp://localhost', function (error0, connection) {
        if (error0) {
            throw error0;
        }
        createQueueChannel(connection, "temperatura", client)
        createQueueChannel(connection, "umidade", client)
        createQueueChannel(connection, "velocidade", client)

    });


});


server.listen(4000);


function createQueueChannel(connection, queueName, socket) {
    connection.createChannel(function (error1, channel) {
        if (error1) {
            throw error1;
        }
        var queue = queueName;
        channel.assertQueue(queue, {
            durable: true
        });

        // socket.on(`get-${queueName}`, () => {
        //     console.log("ENTREI AQUI")
        //     console.log(queue)
        //     amqp.connect('amqp://localhost', function (error0, connection) {
        //         console.log("Entrei no connect")
        //         if (error0) {
        //             throw error0;
        //         }
        //         console.log("Entrei ")
        //         createNewQueueChannel(connection, queue, socket)
        //     });
        // })

        channel.consume(queue, function (msg) {
            dataObj = JSON.parse(msg.content.toString())
            console.log(dataObj)
            socket.emit(queueName, dataObj, (response) => {
                if (response.status === "ok"){
                    channel.ack(msg)
                    console.log(" [x] Received %s", msg.content.toString());
                }
            })
        }, {
            noAck: false
        });
    });
}

function createNewQueueChannel(connection, queueName, socket) {
    connection.createChannel(function (error1, channel) {
        if (error1) {
            throw error1;
        }
        var queue = queueName;
        channel.assertQueue(queue, {
            durable: true
        });

        channel.consume(queue, function (msg) {
            dataObj = JSON.parse(msg.content.toString())
            console.log(dataObj)
            socket.emit(queueName, dataObj, (response) => {
                if (response.status === "ok"){
                    channel.ack(msg)
                    console.log(" [x] Received %s", msg.content.toString());
                }
            })
        }, {
            noAck: false
        });
    });
}

