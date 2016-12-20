const keys = require('./googleapikeys.js')
const speech = require('@google-cloud/speech')(keys);
const fs = require('fs');
const sampleRate = process.argv[2];
const request = {
  config: { encoding: 'flac', sampleRate: sampleRate}
};
var s = fs.createWriteStream('s.log');
process.stdout.pipe(s);
//https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/master/speech/recognize.js
var speechRecog = speech.streamingMicRecognize(request);
process.stdin.pipe(speechRecog);
speechRecog.on('error',console.error);
speechRecog.on('data',console.log);
//speechRecog.pipe(process.stdout);