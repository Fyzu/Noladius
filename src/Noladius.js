const Task = require('./Task')
const createStore = require('./store')
const ParallelMap = require('p-map')

class Noladius {
  constructor(options = {}) {
    this.store = null
    this.tasks = []
    this.concurrency = 1
    this.throws = true

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

  add(...taskArgs) {
    this.tasks = this.tasks.concat(taskArgs.reduce((result, arg) => {
      if (Array.isArray(arg)) {
        arg.forEach(task => result.push(Task.create(task)))
      } else {
        result.push(Task.create(arg))
      }
      return result
    }, []))
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
    this.throws = throws
  }

  run() {
    const { concurrency, tasks, store, throws } = this

    const stream = ParallelMap(
      tasks,
      task => {
        if (task.isEnabled()) {
          return task.run(store, throws)
        }
        return Promise.resolve()
      },
      {
        concurrency,
      }
    )

    return stream.then(results => {
      const errors = results.filter(result => result instanceof Error)
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
