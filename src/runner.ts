import Noladius, { NoladiusOptions } from './Noladius'
import Task, { FunctionalTask } from './Task'
import TaskConstructor from './TaskConstructor'
import NoladiusConstructor from './NoladiusConstructor'
import Parallel from './Parallel'
import { StoreChanger } from './Store'

function runTask(Constructor: TaskConstructor, context: Noladius): Promise<void> {
  const task = new Constructor(context)

  return Promise
    .resolve(!task.shouldRun || task.shouldRun())
    .then(shouldRun => {
      if (shouldRun) {
        return Promise.resolve()
          .then(() => task.willRun && task.willRun())
          .then(() => task.run())
          .then(value => {
            if (value && typeof value === 'function' && value.prototype) {
              const parent = Object.getPrototypeOf(value.prototype).constructor

              if (parent === Noladius) {
                return runCommand(value as NoladiusConstructor, context)
              }
            }
          })
          .then(() => task.didRun && task.didRun())
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
    .resolve(func(context.state, context.params))
    .then(changer => {
      if (changer) {
        context.setState(changer)
      }
    })

  console.log(task)

  return Promise
    .resolve(!task.shouldRun || task.shouldRun(context.state, context.params))
    .then(shouldRun => {
      if (shouldRun) {
        return Promise.resolve()
          .then(() => task.willRun && executeFunction(task.willRun))
          .then(() => task(context.state, context.params))
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
        task.didCatch(error, context.state, context.params)
      } else {
        throw error
      }
    })
}

function runCommand(Constructor: NoladiusConstructor, context: Noladius): Promise<void> {
  const command = new Constructor(context)
  const tasks = command.run()

  return runTasks(tasks, context, command.options)
}

function runTasks(tasks: Array<FunctionalTask | TaskConstructor | NoladiusConstructor>, context: Noladius, options: NoladiusOptions): Promise<any> {
  return new Parallel(tasks, options).map(task => {
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

function runner(Command: NoladiusConstructor, params?: object, initialState?: object) {
  const context = new Command(null, null, params, initialState)

  const tasks = context.run()

  return runTasks(tasks, context, context.options)
}

export default runner
