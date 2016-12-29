console.log('main.js');
var app = angular.module('app', []);
app.controller('navctrl', function ($scope) {
});
var socket = io.connect('http://localhost');
socket.on('data', function (data) {
  console.log(data);
});
function defined(arg) {
  return typeof arg !== 'undefined';
}
var sampleRate;
var inputBufferLength = 8192;
function initializeEmitter(stream) {
  var context = new AudioContext();
  var audioInput = context.createMediaStreamSource(stream);
  var trailing = 0;
  var emitter = context.createScriptProcessor(inputBufferLength, 1, 1);
  emitter.onaudioprocess = function (e) {
    var leftChannel = e.inputBuffer.getChannelData(0);
    if (leftChannel.reduce(function (a, b) {
        return Math.abs(a) + Math.abs(b);
      }, 0) > 100) {
      if (!defined(sampleRate)) {
        socket.emit('sampleRate', e.inputBuffer.sampleRate);
        sampleRate = e.inputBuffer.sampleRate;
      }
      console.log('above threshold');
      socket.emit('audio', leftChannel.buffer);
      trailing = 20;
    } else {
      if (--trailing > 0) {
        console.log('trailing quiet audio');
        socket.emit('audio', leftChannel.buffer);
      } else if (trailing === 0) {
        sampleRate = undefined;
        socket.emit('closeListen', 1);
        console.log('below threshold');
      }
    }
  };
  audioInput.connect(emitter);
  emitter.connect(context.destination);
}

var $results = document.querySelector('.results');

socket.on('transcript', function (e) {
  var p = document.createElement('p');
  p.innerHTML = e;
  $results.appendChild(p);
  console.log(e);
  setTimeout(function(){p.classList.add('close')},5000)
});
socket.on('err', function (e) {
  console.error(e);
  sampleRate = undefined;
});
navigator.getUserMedia({
  audio: true,
  video: false
}, initializeEmitter, function (e) {
  console.log(e);
});