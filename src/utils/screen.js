const ansiEscapes = require('ansi-escapes')
const cliCursor = require('cli-cursor')
const wrapAnsi = require('wrap-ansi')

const createScreen = stream => {
  let prevLineCount = 0

  return {
    render: (...args) => {
      cliCursor.hide()

      const out = wrapAnsi(`${args.join(' ')}\n`, stream.columns || 80, { wordWrap: false })
      stream.write(ansiEscapes.eraseLines(prevLineCount) + out)

      prevLineCount = out.split('\n').length
    },

    clear: () => {
      stream.write(ansiEscapes.eraseLines(prevLineCount))
      prevLineCount = 0
    },

    done: () => {
      cliCursor.show()
      prevLineCount = 0
    },
  }
}

module.exports = createScreen
