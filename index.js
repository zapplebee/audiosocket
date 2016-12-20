'use strict';
const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const spawn = require('child_process').spawn;
const soxPath = require('sox-bin');
const stream = require('stream');
const server = require('http').Server(app);
const io = require('socket.io')(server);
server.listen(80);
function defined(arg) {
  return typeof arg !== 'undefined';
}
const catchSpeechError = function (socket, speech) {
  return function (e) {
    console.error('watson error', e.toString());
    socket.emit('err', e.toString());
    speech.kill();
  };
};
app.use('/script/angular.js', express.static(__dirname + '/node_modules/angular/angular.js'));
app.use('/script/socket.io.min.js', express.static(__dirname + '/node_modules/socket.io-client/dist/socket.io.min.js'));
app.use('/', express.static(path.join(__dirname, '/public')));
var sArgs = require('./sox-args.js');
io.on('connection', function (socket) {
  var sox;
  var speech;
  var bufferStream;
  socket.on('sampleRate', function (sampleRate) {
    if (!defined(bufferStream))
      bufferStream = new stream.PassThrough();
    if (!defined(sox))
      sox = spawn(soxPath, sArgs(sampleRate));
    if (!defined(speech))
      speech = spawn('node', [
        __dirname + '/watson_speech_to_text.js',
        sampleRate
      ]);
    bufferStream.on('close', function () {
      console.log('bufferStream closed', arguments);
      bufferStream = undefined;
    });
    bufferStream.pipe(sox.stdio[0]);
    sox.stdio[1].pipe(speech.stdio[0]);
    sox.stdio[1].on('close', function () {
      console.log('sox closed', arguments);
      sox = undefined;
    });
    speech.stdio[1].on('error', catchSpeechError(socket, speech)).on('close', function () {
      console.log('watson closed', arguments);
      speech = undefined;
    }).on('data', function (b) {
      socket.emit('transcript', b.toString());
      if (!defined(sox) || sox.killed) {
        if (defined(speech) && !speech.killed) {
          speech.kill();
        }
      }
    });
  });
  socket.on('closeListen', function () {
    if (defined(sox) && !sox.killed) {
      sox.kill();
    }
    console.log('audio from browser closed');
  });
  socket.on('audio', function (buffer) {
    if (defined(bufferStream))
      bufferStream.write(buffer);
  });
});