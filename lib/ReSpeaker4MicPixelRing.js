const wpi = require('node-wiring-pi')
const Apa102 = require('./Apa102')

class ReSpeaker4MicPixelRing {
  constructor () {
    this.driver = new Apa102(24, 32 * 1024)

    // turn the ring on and off via pin 5
    wpi.wiringPiSetupGpio()
    wpi.pinMode(5, wpi.OUTPUT)

    this.running = true
  }

  onOff (flag) {
    wpi.digitalWrite(5, flag ? wpi.HIGH : wpi.LOW)
  }

  init () {
    return this.driver.init()
  }

  stop () {
    this.running = false

    this.onOff(false)
  }

  setColor (index, red, green, blue, brightness) {
    this.driver.setColor(index, red, green, blue, brightness)
  }

  push () {
    return this.driver.push().then(() => {
      this.onOff(!this.isDark())
    })
  }

  isDark () {
    for (let i = 0; i < 12; i++) {
      const color = this.driver.colors.slice(i * 4 + 1, i * 4 + 4).toString('hex')

      if (color !== '000000') {
        return false
      }
    }

    return true
  }

  animate (max, time, callback) {
    if (!this.running) {
      return
    }

    const f = ((new Date()).valueOf() % time) / (time - 1) * max

    Promise.resolve().then(() => {
      return callback(f)
    }).then(() => {
      return this.push()
    }).then(() => {
      setTimeout(() => {
        this.animate(max, time, callback)
      }, 1000 / 25)
    })
  }
}

module.exports = ReSpeaker4MicPixelRing
