const keys = require('./googleapikeys.js')
const speech = require('@google-cloud/speech')(keys);
const fs = require('fs');
const sampleRate = process.argv[2];
const request = {
  config: { content-type: 'audio/FLAC; rate=' + sampleRate},
  singleUtterance: true,
  interimResults: false
};
var speechRecog = speech.createRecognizeStream(request);
process.stdin.pipe(speechRecog);


speechRecog.pipe(process.stdout);