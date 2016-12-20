var speech = require('@google-cloud/speech')(require('./googleapikeys.js'));
var request = {
  config: { encoding: 'FLAC' },
  singleUtterance: false,
  interimResults: true
};
var speechRecog = speech.createRecognizeStream(request);
process.stdin.pipe(speechRecog);
speechRecog.pipe(process.stdout);