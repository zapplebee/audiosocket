module.exports = function(sampleRate){

  return [
    '-r',
    sampleRate,
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

}