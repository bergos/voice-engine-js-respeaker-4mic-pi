const DirectionOfArrival = require('..').ReSpeaker4MicDirectionOfArrival
const Recorder = require('voice-engine-js').Recorder

const recorder = new Recorder({
  channels: 4,
  sampleRate: 32000
})

const directionOfArrival = new DirectionOfArrival({
  every: 1000
})

directionOfArrival.on('data', direction => {
  console.log('direction: ' + Math.round(direction))
})

recorder.pipe(directionOfArrival)
