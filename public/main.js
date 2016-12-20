console.log('main.js');

var app = angular.module('app', []);

app.controller('navctrl', function($scope,$timeout){
   
  
})

var socket = io.connect('http://localhost');
socket.on('data', function (data) {
  console.log(data);
});


var sampleRate = 44100;
var inputBufferLength =  8192;
function initializeRecorder(stream) {
  var context = new AudioContext();
  var audioInput = context.createMediaStreamSource(stream);
  var listener = context.createScriptProcessor(inputBufferLength, 1, 1);
  listener.onaudioprocess = function(e) {
    sampleRate = e.inputBuffer.sampleRate;
    socket.emit('audio',leftChannel.buffer);
  }
  audioInput.connect(listener);
  listener.connect(context.destination);
}

socket.on('transcript',function(e){console.log(e)});
socket.on('error',function(e){console.error(e)});

navigator.getUserMedia({audio: true,video: false}, initializeRecorder, function(e){console.log(e);});