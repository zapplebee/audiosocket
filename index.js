"use strict"

var express = require('express');
var app = express();
var sassMiddleware = require('node-sass-middleware');
var path = require('path');
const fs = require('fs');
const spawn = require('child_process').spawn;
const _ = require('lodash');


const toBuffer = require('typedarray-to-buffer')
const soxPath = require('sox-bin');
const cp = require('child_process');
const stream = require('stream');

const ARGS = [
  '-r',
  44100,
  '-e',
  'floating-point',
  '-b',
  '32',
  '-c',
  '1',
  '-t',
  'raw',
  '-',
  '-t',
  'flac',
  '-'
];


const SpeechToTextV1 = require('watson-developer-cloud/speech-to-text/v1');



var server = require('http').Server(app);
var io = require('socket.io')(server);
server.listen(80);



//pug renderer, index
app.set('views', './views')
app.set('view engine', 'pug')
app.get('/', function (req, res) {
  res.render('index', {});
});


app.use('/script/angular.js', express.static(__dirname + '/node_modules/angular/angular.js'));
app.use('/script/socket.io.min.js', express.static(__dirname + '/node_modules/socket.io-client/dist/socket.io.min.js'));
app.use('/script', express.static(__dirname + '/script'));


//sass
app.use(sassMiddleware({
    src: path.join(__dirname, 'style'),
    dest: path.join(__dirname, 'style'),
    debug: true,
    outputStyle: 'extended',
    prefix: "/style"
}));
app.use("/style", express.static(path.join(__dirname, '/style')));


app.use("/images", express.static(path.join(__dirname, 'images')));

  
io.on('connection', function (socket) {

  var speech_to_text = new SpeechToTextV1({
    "password": "",
    "username": ""
      });
  
  const sox = spawn(soxPath, ARGS);
  var bufferStream = new stream.PassThrough();
  bufferStream.pipe(sox.stdio[0]);  
  sox.stdio[1].pipe(speech_to_text.createRecognizeStream({ content_type: 'audio/flac; rate=44100' }))
  .on('error',function(e){
    console.log(e);
    socket.emit('error',e);
  })
  .on('data',function(b){
    socket.emit('transcript',b.toString());
  })
  
  socket.on('audio', function (buffer) {
    bufferStream.write(buffer);
  });
});