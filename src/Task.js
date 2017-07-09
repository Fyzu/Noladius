const R = require('ramda')
const { isPromise } = require('./utils/promise')

class Task {
  constructor(computation, cleanup) {
    this.fork = computation

    this.cleanup = cleanup
  }

  map(f) {
    const computation = (reject, resolve) => this.fork(
      reject,
      ([payload1, actions1]) => {
        resolve([f(payload1), actions1])
      }
    )

    return new Task(computation, this.cleanup)
  }

  chain(f) {
    const computation = (reject, resolve) => this.fork(
      reject,
      ([payload1, actions1]) => {
        f(payload1).fork(
          reject,
          ([payload2, actions2]) => {
            resolve([payload2, actions1.concat(actions2)])
          }
        )
      }
    )

    return new Task(computation, this.cleanup)
  }

  ap(b) {
    return this.chain(a => b.map(a))
  }

  tell(action2) {
    const computation = (reject, resolve) => this.fork(
      reject,
      ([payload1, action1]) => {
        resolve([payload1, action1.concat(action2)])
      }
    )

    return new Task(computation, this.cleanup)
  }

  concat(that) {
    const cleanupBoth = () => {
      if (this.cleanup) {
        this.cleanup()
      }
      if (that.cleanup) {
        that.cleanup()
      }
    }

    const computation = (reject, resolve) => {
      let resolved = false
      let resolvedResult
      let rejected = false
      let rejectedError

      const rejectWrapper = error => {
        if (rejected) {
          reject([error, rejectedError])
        } else if (resolved) {
          reject(error)
        } else {
          rejectedError = error
          rejected = true
        }
      }

      const resultMapper = ([payload1, actions1], [payload2, actions2]) => ([
        [payload1, payload2], actions1.concat(actions2),
      ])

      const createResolveWrapper = mapper => result => {
        if (rejected) {
          reject(rejectedError)
        } else if (resolved) {
          resolve(mapper(result, resolvedResult))
        } else {
          resolved = true
          resolvedResult = result
        }
      }

      this.fork(
        rejectWrapper,
        createResolveWrapper(resultMapper)
      )

      that.fork(
        rejectWrapper,
        createResolveWrapper(R.flip(resultMapper))
      )
    }

    return new Task(computation, cleanupBoth)
  }

  orElse(f) {
    const computation = (reject, resolve) => this.fork(
      error => f(error).fork(reject, resolve),
      resolve
    )

    return new Task(computation, this.cleanup)
  }

  fold(f, g) {
    const computation = (reject, resolve) => this.fork(
      error => resolve(g(error)),
      result => resolve(f(result))
    )

    return new Task(computation, this.cleanup)
  }

  bimap(f, g) {
    const computation = (reject, resolve) => this.fork(
      error => reject(g(error)),
      result => resolve(f(result))
    )

    return new Task(computation, this.cleanup)
  }

  rejectedMap(f) {
    const computation = (reject, resolve) => this.fork(
      error => reject(f(error)),
      resolve
    )

    return new Task(computation, this.cleanup)
  }
}

Task.result = (payload, actions = []) => ([payload, actions])

Task.actions = (actions = []) => new Task((reject, resolve) => {
  resolve([null, [].concat(actions)])
})

Task.of = (value, actions) => new Task((reject, resolve) => {
  if (isPromise(value)) {
    value.then(R.compose(resolve, Task.result), reject)
  } else {
    resolve(Task.result(value, actions))
  }
})

Task.reject = error => new Task(reject => {
  reject(error)
})

Task.empty = () => new Task(() => false)

Task.trace = R.curry((tag, x) => {
  console.log(tag, x)
  return x
})

Task.prototype.toString = () => 'Task'

module.exports = Task
