const ChannelPicker = require('voice-engine-js').ChannelPicker
const KeywordSpotting = require('voice-engine-js').AutoKeywordSpotting
const PixelRing = require('..').ReSpeaker4MicPixelRing
const Recorder = require('voice-engine-js').Recorder
const Slice = require('voice-engine-js').Slice
const SpeechToText = require('voice-engine-js').AutoSpeechToText

let status = 'nothing'

const pixelRing = new PixelRing()

const recorder = new Recorder({
  channels: 4
})

const keywordSpotting = new KeywordSpotting()

keywordSpotting.on('speech-start', () => {
  console.log('speech-start')

  status = 'speech'
})

keywordSpotting.on('speech-end', () => {
  console.log('speech-end')

  status = 'nothing'
})

const slice = new Slice(keywordSpotting, {
  start: 'speech-start',
  end: 'speech-end'
})

const speechToText = new SpeechToText()

speechToText.on('data', json => {
  console.log('text: ' + JSON.stringify(json, null, ' '))
})

const channel0 = new ChannelPicker(0)

const recorder0 = recorder.pipe(channel0)

recorder0.pipe(keywordSpotting)
recorder0.pipe(slice).pipe(speechToText)

recorder.once('start', () => {
  console.log('Recording started...')
})

pixelRing.init().then(() => {
  const floatMod = (n, m) => {
    return n - Math.floor(n / m) * m
  }

  pixelRing.animate(12, 1000, (p) => {
    if (status === 'nothing') {
      for (let i = 0; i < 12; i++) {
        pixelRing.setColor(i, 0, 0, 0, 0)
      }
    } else if (status === 'speech') {
      for (let i = 0; i < 12; i++) {
        const c = floatMod(p - i + 12, 12) / 11

        pixelRing.setColor(i, 0, 0, c * 128 - 64, 10)
      }
    }
  })
}).catch(err => {
  console.error(err)
})

process.on('SIGINT', () => {
  pixelRing.stop()

  process.exit()
})

console.log('Waits for the keyword "' + keywordSpotting.keyword + '", turns on the LED ring while listening and shows the result of the speech to text engine.')
console.log('Exit the program with Ctrl-C.')
