const PixelRing = require('..').ReSpeaker4MicPixelRing

const pixelRing = new PixelRing()

pixelRing.init().then(() => {
  const floatMod = (n, m) => {
    return n - Math.floor(n / m) * m
  }

  pixelRing.animate(12, 4000, (f) => {
    const p0 = floatMod(120 - f * 4, 12)
    const p1 = floatMod(f, 12)

    for (let index = 0; index < 12; index++) {
      const value0 = floatMod(p0 - index + 12, 12) / 11
      const value1 = floatMod(p1 - index + 12, 12) / 11

      pixelRing.setColor(index, value0 * 255 - 128, 0, value1 * 255 - 128, 10)
    }
  })
}).catch(err => {
  console.error(err)
})

process.on('SIGINT', () => {
  pixelRing.stop()
  process.exit()
})

console.log('Shows a red and a blue colored rotating pattern on the LED ring.')
console.log('Exit the program with Ctrl-C.')
