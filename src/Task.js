const { isPromise } = require('./utils/promise')

const runAction = (action, store) => {
  if (action) {
    const result = action(store.getState())
    if (isPromise(result)) {
      return result
    }
    return Promise.resolve(result)
  }

  return Promise.resolve()
}

class Task {
  constructor(options) {
    if (typeof options !== 'object') {
      throw new TypeError('Options must be a `object`')
    }

    this.title = options.title
    this.execute = options.execute
    this.before = options.before
    this.after = options.after
    this.enabled = options.enabled

    this.state = Task.State.INIT
  }

  setState(state) {
    console.log(`${this.title} [${state}]`)

    this.state = state
  }

  isEnabled() {
    return !this.enabled || this.enabled()
  }

  run(store, throws) {
    this.setState(Task.State.START)

    return runAction(this.before, store)
      .then(result => {
        store.setState(result)

        return runAction(this.execute, store)
      })
      .then(result => {
        store.setState(result)

        return runAction(this.after, store)
      })
      .then(result => {
        store.setState(result)

        this.setState(Task.State.COMPLETE)
      })
      .catch(error => {
        this.setState(Task.State.FAILED)
        console.log(` - ${error.message}`)

        if (throws) {
          throw error
        }
        return error
      })
  }
}

Task.State = {
  INIT: 'INIT',
  START: 'START',
  FAILED: 'FAILED',
  COMPLETE: 'COMPLETE',
}

Task.create = task => task instanceof Task ? task : new Task(task)

module.exports = Task
