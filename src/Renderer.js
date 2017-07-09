const createScreen = require('screen-render')
const Task = require('./Task')
const indentString = require('indent-string')
const chalk = require('chalk')
const { error: errorSymbol, success: successSymbol } = require('log-symbols')
const elegantSpinner = require('elegant-spinner')()

const renderTaskState = task => {
  if (task.state === Task.State.START) {
    return ` ${chalk.yellow(elegantSpinner())} ${task.title}`
  } else if (task.state === Task.State.COMPLETE) {
    return ` ${successSymbol} ${task.title}`
  } else if (task.state === Task.State.FAILED) {
    return ` ${errorSymbol} ${chalk.red(task.title)}`
  }

  return task.title
}

class Renderer {
  constructor(ref) {
    this.ref = ref
    this.screen = createScreen(process.stdout)
    this.intervalId = false
  }

  render(tasks, level = 1) {
    const output = tasks
      .filter(task => task.isEnabled())
      .reduce((rows, task) => {
        rows.push(indentString(renderTaskState(task), level, '  '))

        return rows
      }, [])
      .join('\n')

    return output
  }

  run() {
    if (!this.intervalId) {
      this.intervalId = setInterval(() => {
        this.screen.render(this.render(this.ref.tasks))
      }, 100)
    }
  }

  end() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = false
    }

    this.screen.render(this.render(this.ref.tasks))

    this.screen.done()
  }
}

module.exports = Renderer
