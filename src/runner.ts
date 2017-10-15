import Noladius, { NoladiusOptions } from './Noladius'
import Task, { FunctionalTask, ObjectTask } from './Task'
import TaskConstructor from './TaskConstructor'
import NoladiusConstructor from './NoladiusConstructor'
import pMap = require('p-map')

function runTask(Constructor: TaskConstructor, context: Noladius): Promise<void> {
  const task = new Constructor(context)

  return Promise
    .resolve(!task.shouldRun || task.shouldRun())
    .then(shouldRun => {
      if (shouldRun) {
        return Promise.resolve()
          .then(() => task.willRun && task.willRun())
          .then(() => task.run())
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

function runObjectTask(task: ObjectTask, context: Noladius): Promise<void> {
  const executeFunction = func => Promise
    .resolve(func(context.state, context.params))
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
          .then(() => executeFunction(task.run))
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

function runFunctionalTask(task: FunctionalTask, context: Noladius): Promise<void> {
  const executeFunction = func => Promise
    .resolve(func(context.state, context.params))
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
          .then(() => executeFunction(task))
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
  return pMap(
    tasks,
    task => {
      if (typeof task === 'object') {
        return runObjectTask(task as ObjectTask, context)
      } else if (task.prototype) {
        const parent = Object.getPrototypeOf(task.prototype).constructor

        if (parent === Task) {
          return runTask(task as TaskConstructor, context)
        } else if (parent === Noladius) {
          return runCommand(task as NoladiusConstructor, context)
        }
      }

      return runFunctionalTask(task as FunctionalTask, context)
    },
    { concurrency: options.concurrency },
  ).catch(errors => {
    if (options.throwErrors) {
      throw errors
    }

    return errors
  })
}

function runner(Command: NoladiusConstructor, params?: object, initialState?: object) {
  const context = new Command(null, params, initialState)

  const tasks = context.run()

  return runTasks(tasks, context, context.options)
}

export default runner
