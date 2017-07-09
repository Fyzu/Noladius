const Task = require('./Task')
const { isPromise } = require('./utils/promise')

const wrapResultInPromise = result => {
  if (result instanceof Task) {
    return new Promise((resolve, reject) => {
      try {
        result.fork(reject, resolve)
      } catch (error) {
        reject(error)
      }
    })
  } else if (isPromise(result)) {
    return result
  }

  return Promise.resolve(result)
}

class TaskWrapper {
  constructor({ title, execute, enabled, skip }) {
    this.title = title
    this.execute = execute
    this.enabled = enabled
    this.skip = skip
    this.state = TaskWrapper.State.INIT
    this.message = false
  }

  setState(state, message = false) {
    this.state = state
    this.message = message
  }

  isEnabled(state) {
    return !this.enabled || this.enabled(state)
  }

  isSkipped(state) {
    const skipped = this.skip && this.skip(state)
    if (skipped) {
      this.setState(TaskWrapper.State.SKIPPED, skipped)
    }

    return skipped
  }

  run(store, { throws }) {
    if (!this.isEnabled(store.getState()) || this.isSkipped(store.getState())) {
      return Promise.resolve()
    }

    this.setState(TaskWrapper.State.START)

    return Promise.resolve()
      .then(() => {
        const result = this.execute(store.getState())
        return wrapResultInPromise(result)
      })
      .then(([payload, actions]) => {
        store.setState(actions)

        this.setState(TaskWrapper.State.COMPLETE)

        return Promise.resolve(payload)
      })
      .catch(error => {
        if (throws) {
          throw error
        }

        return error
      })
  }
}

TaskWrapper.State = {
  SKIPPED: 'SKIPPED',
  INIT: 'INIT',
  START: 'START',
  FAILED: 'FAILED',
  COMPLETE: 'COMPLETE',
}

TaskWrapper.of = options => new TaskWrapper(options)

module.exports = TaskWrapper
