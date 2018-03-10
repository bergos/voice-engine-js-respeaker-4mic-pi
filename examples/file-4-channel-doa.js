const fs = require('fs')
const DirectionOfArrival = require('..').ReSpeaker4MicDirectionOfArrival

const program = require('commander')

program
  .description('Calculates the direction of arrival for a 4 channel recording from a ReSpeaker 4-Mic Array')
  .arguments('<input-file>')
  .action((inputFile) => {
    const input = fs.createReadStream(inputFile)

    const directionOfArrival = new DirectionOfArrival({
      every: 100
    })

    directionOfArrival.on('data', direction => {
      console.log('direction: ' + Math.round(direction))
    })

    input.pipe(directionOfArrival)
  })

program.parse(process.argv)
