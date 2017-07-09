const TaskWrapper = require('./TaskWrapper')
const { createStore } = require('./store')
const ParallelMap = require('p-map')

const findErrors = array => array.reduce((errors, element) => {
  if (element instanceof Error) {
    errors.push(element)
  } else if (Array.isArray(element)) {
    element.forEach(part => {
      if (part instanceof Error) {
        errors.push(part)
      }
    })
  }
  return errors
}, [])

class Noladius {
  constructor(options = {}) {
    this.store = null
    this.tasks = []
    this.concurrency = 1

    this.options = {
      throws: true,
    }

    this.callIfAvailable(this.setThrows, 'throws', options)
    this.callIfAvailable(this.setConcurrency, 'concurrency', options)
    this.callIfAvailable(this.add, 'tasks', options)

    if ('store' in options) {
      this.setStore(options.store)
    } else {
      this.setStore(createStore(options.initialState))
    }
  }

  callIfAvailable(fn, propertyName, properties) {
    if (propertyName in properties) {
      fn.call(this, properties[propertyName])
    }
  }

  add(...tasks) {
    this.tasks = tasks.reduce((result, task) => result.concat(task), this.tasks)
  }

  setStore(store) {
    if (typeof store.getState !== 'function' || typeof store.setState !== 'function') {
      throw new TypeError('Invalid store')
    }

    this.store = store
  }

  setConcurrency(concurrency) {
    if (concurrency === true) {
      this.concurrency = Infinity
    } else if (typeof concurrency === 'number') {
      this.concurrency = concurrency
    } else {
      throw new TypeError('Expected `concurrency` to be a number from 1 and up')
    }
  }

  setThrows(throws) {
    this.options.throws = throws
  }

  run() {
    const { concurrency, store, options } = this

    const tasks = this.tasks.map(TaskWrapper.of)

    const stream = ParallelMap(
      tasks,
      task => task.run(store, options),
      {
        concurrency,
      }
    )

    return stream.then(results => {
      const errors = findErrors(results)
      if (errors.length > 0) {
        const error = new Error('An error has occurred')
        error.errors = errors
        throw error
      }
      return store.getState()
    }).catch(error => {
      error.state = store.getState()
      throw error
    })
  }
}

module.exports = Noladius
