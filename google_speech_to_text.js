const keys = require('./googleapikeys.js')
const speech = require('@google-cloud/speech')(keys);
const fs = require('fs');
const request = {
  config: { encoding: 'FLAC' },
  singleUtterance: true,
  interimResults: false
};
var speechRecog = speech.createRecognizeStream(request);
process.stdin.pipe(speechRecog);
speechRecog.pipe(process.stdout);