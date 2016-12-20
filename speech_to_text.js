"use strict"
const sampleRate = process.argv[2];
const SpeechToTextV1 = require('watson-developer-cloud/speech-to-text/v1');
const apikeys = require('./apikeys.js');
const speech_to_text = new SpeechToTextV1(apikeys);
var recognizeStream = speech_to_text.createRecognizeStream({ content_type: 'audio/flac; rate=' + sampleRate });

process.stdin.pipe(recognizeStream)
recognizeStream.pipe(process.stdout);