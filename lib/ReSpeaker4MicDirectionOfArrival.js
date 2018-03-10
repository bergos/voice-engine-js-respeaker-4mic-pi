const gccPhat = require('voice-engine-js').gccPhat
const ToArray = require('voice-engine-js').ToArray
const Transform = require('stream').Transform

const SOUND_SPEED = 340.0

const MIC_DISTANCE_4 = 0.081
const MAX_TDOA_4 = MIC_DISTANCE_4 / SOUND_SPEED

const pairs = [{
  a: 0,
  b: 2
}, {
  a: 1,
  b: 3
}]

class DirectionOfArrival extends Transform {
  constructor (options) {
    options = options || {}

    super({
      objectMode: true
    })

    this.every = options.every || 2000
    this.length = options.length || 20

    this.separator = new ToArray()

    this.separator.on('format', format => {
      this.separator.samplesPerChunk = format.sampleRate * this.every / 1000
    })

    this.separator.on('data', this.processChunk.bind(this))
  }

  _transform (chunk, encoding, callback) {
    this.separator.write(chunk, encoding, callback)
  }

  processChunk (chunks) {
    const length = this.separator.format.sampleRate * this.length / 1000
    const channels = chunks.map(chunk => chunk.slice(0, length))

    const tau = [0, 0]
    const theta = [0, 0]

    pairs.forEach((pair, index) => {
      tau[index] = gccPhat(channels[pair.a], channels[pair.b], this.separator.format.sampleRate, MAX_TDOA_4, 1)
      theta[index] = Math.asin(tau[index] / MAX_TDOA_4) * 180 / Math.PI + 90
    })

    const directions = [
      ((theta[1] < 90 ? 180 - theta[0] : 180 + theta[0]) + 45 + 360) % 360,
      ((theta[0] < 90 ? 180 + theta[1] : 180 - theta[1]) - 45 + 360) % 360
    ]

    let delta = directions[0] - directions[1]

    if (delta < -180) {
      delta = delta + 360
    } else if (delta > 180) {
      delta = delta - 360
    }

    const avg = (directions[0] - delta / 2 + 360) % 360

    this.push(avg)
  }
}

module.exports = DirectionOfArrival
