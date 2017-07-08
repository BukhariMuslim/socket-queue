var express = require('express')
var app = express()
var path = require('path')
var server = require('http').createServer(app)
var io = require('socket.io')(server)
var port = process.env.PORT || 5000;

app.use(express.static(__dirname + '/root'))

var counters = []
var maxCounter = 4
var queueNum = 0
var lastCounter = -1

for (var i = 0; i < maxCounter; i++) {
	counters.push(0)
}

io.on('connection', function(socket){
	// pada saat client emits 'antrian baru', command ini dijalankan
	socket.on('new queue', function (idx) {
		// memberitahu client untuk mengeksekusi 'new queue'
		if (idx !== null) {
			var temp = counters
			var queue = ++queueNum
			temp[idx] = queue
			lastCounter = idx
			counters = temp

			socket.emit('new queue', {
				isCounter: true,
				counters: counters,
				countersNum: counters.length,
				antrian: queue,
				lastCounter
			});

			socket.broadcast.emit('new queue', {
				counters: counters,
				countersNum: counters.length,
				antrian: queue,
				lastCounter
			});
		}
	});

	// pada saat client emits 'tambah counter', command ini dijalankan
	socket.on('add counter', function (asCounter) {
		if (!asCounter) {
			socket.emit('login', {
				isCounter: false,
				counters: counters,
				countersNum: counters.length,
				antrian: queueNum,
				lastCounter
			});
		}
		else {
			// simpan counter pada socket session untuk masing2 client
			addedCounter = true
			socket.emit('login', {
				isCounter: true,
				counters: counters,
				countersNum: counters.length,
				antrian: queueNum,
				lastCounter
			});
		}
		
	});

})

console.log("Running server on port \"" + port + "\"..");
server.listen(port)