import Noladius, { NoladiusOptions } from './Noladius'
import Task, { FunctionalTask } from './Task'
import TaskConstructor from './TaskConstructor'
import NoladiusConstructor from './NoladiusConstructor'
import { createParallel } from './Parallel'
import { StoreChanger } from './Store'

function runTask(Constructor: TaskConstructor, context: Noladius): Promise<void> {
  const task = new Constructor(context)

  return Promise
    .resolve(!task.shouldRun || task.shouldRun())
    .then(shouldRun => {
      if (shouldRun) {
        return Promise.resolve()
          .then(() => {
            if (task.willRun) {
              return task.willRun()
            }
          })
          .then(() => task.run())
          .then(value => {
            if (value && typeof value === 'function' && value.prototype) {
              const parent = Object.getPrototypeOf(value.prototype).constructor

              if (parent === Noladius) {
                return runCommand(value as NoladiusConstructor, context)
              }
            }
          })
          .then(() => {
            if (task.didRun) {
              return task.didRun()
            }
          })
      }
    })
    .catch(error => {
      if (task.didCatch) {
        task.didCatch(error)
      } else {
        throw error
      }
    })
}

function runFunctionalTask(task: FunctionalTask, context: Noladius): Promise<void> {
  const executeFunction = func => Promise
    .resolve(func(context.state, context.params, context.dispatch))
    .then(changer => {
      if (changer) {
        context.setState(changer)
      }
    })

  return Promise
    .resolve(!task.shouldRun || task.shouldRun(context.state, context.params))
    .then(shouldRun => {
      if (shouldRun) {
        return Promise.resolve()
          .then(() => task.willRun && executeFunction(task.willRun))
          .then(() => task(context.state, context.params, context.dispatch))
          .then(value => {
            if (value && !Array.isArray(value)) {
              if (typeof value === 'function') {
                if (value.prototype) {
                  const parent = Object.getPrototypeOf(value.prototype).constructor

                  if (parent === Noladius) {
                    return runCommand(value as NoladiusConstructor, context)
                  }
                }

                context.setState(value as StoreChanger)
              } else if (typeof value === 'object') {
                context.setState(value as StoreChanger)
              }
            }
          })
          .then(() => task.didRun && executeFunction(task.didRun))
      }
    })
    .catch(error => {
      if (task.didCatch) {
        task.didCatch(error, context.state, context.params, context.dispatch)
      } else {
        throw error
      }
    })
}

function runCommand(Constructor: NoladiusConstructor, context: Noladius): Promise<void> {
  const command = new Constructor(context)

  return Promise.resolve(!command.shouldRun || command.shouldRun())
    .then(shouldRun => {
      if (shouldRun) {
        return Promise.resolve()
          .then(() => {
            if (command.willRun) {
              return command.willRun()
            }
          })
          .then(() => command.run())
          .then(tasks => runTasks(tasks, context, command.options))
          .then(() => {
            if (command.didRun) {
              return command.didRun()
            }
          })
      }
    })
}

function runTasks(tasks: Array<FunctionalTask | TaskConstructor | NoladiusConstructor>, context: Noladius, options: NoladiusOptions): Promise<any> {
  return createParallel(tasks, options).map(task => {
    if (task.prototype) {
      const parent = Object.getPrototypeOf(task.prototype).constructor

      if (parent === Task) {
        return runTask(task as TaskConstructor, context)
      } else if (parent === Noladius) {
        return runCommand(task as NoladiusConstructor, context)
      }
    }

    return runFunctionalTask(task as FunctionalTask, context)
  })
}

function runner(Command: NoladiusConstructor, params?: object, initialState?: object): PromiseLike<any> {
  const context = new Command(null, null, params, initialState)

  return Promise.resolve(!context.shouldRun || context.shouldRun())
    .then(shouldRun => {
      if (shouldRun) {
        return Promise.resolve()
          .then(() => {
            if (context.willRun) {
              return context.willRun()
            }
          })
          .then(() => context.run())
          .then(tasks => runTasks(tasks, context, context.options))
          .then(() => {
            if (context.didRun) {
              return context.didRun()
            }
          })
      }
    })
}

export default runner
